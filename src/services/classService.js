import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getActiveAcademicYear } from "./academicYear";

const classCollection = collection(db, "class");
const templateCollection = collection(db, "classTemplates");
const studentRecordsCollection = collection(db, "studentsRecords");

// --- FUNÇÕES DE AUXILIARES (Mantidas e Reforçadas) ---

export async function hasStudentsInClass(turmaId) {
  try {
    const q = query(
      studentRecordsCollection,
      where("turmaId", "==", turmaId),
      limit(1),
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Erro ao verificar alunos:", error);
    return true; // Por segurança, bloqueia se houver erro
  }
}

export async function getStudentCountByClassId(turmaId) {
  try {
    const q = query(studentRecordsCollection, where("turmaId", "==", turmaId));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Erro ao contar alunos da turma:", error);
    return 0;
  }
}

export async function getStudentCountsByClassIds(turmaIds) {
  try {
    const counts = {};
    await Promise.all(
      turmaIds.map(async (turmaId) => {
        counts[turmaId] = await getStudentCountByClassId(turmaId);
      }),
    );
    return { success: true, data: counts };
  } catch (error) {
    console.error("Erro ao buscar contagem de alunos:", error);
    return { success: false, error: error.message };
  }
}

export async function getNextClassSigla(cursoId, classe) {
  const q = query(
    templateCollection,
    where("cursoId", "==", cursoId),
    where("classe", "==", classe),
  );
  const snapshot = await getDocs(q);
  const siglas = snapshot.docs
    .map((d) => d.data().sigla)
    .filter(Boolean)
    .sort();

  const lastSigla = siglas[siglas.length - 1];
  return lastSigla ? String.fromCharCode(lastSigla.charCodeAt(0) + 1) : "A";
}

async function getActiveClassDirectors() {
  const q = query(
    collection(db, "classRoles"),
    where("role", "==", "DIRECTOR_TURMA"),
    where("endDate", "==", null),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// --- FUNÇÕES PRINCIPAIS ---

export async function getClassesByCourse(cursoId, anoLectivoId) {
  try {
    const [classSnap, templateSnap, directors, usersSnap, activeYearResult] =
      await Promise.all([
        getDocs(
          query(
            classCollection,
            where("cursoId", "==", cursoId),
            where("anoLectivoId", "==", anoLectivoId),
            where("isDeleted", "==", false),
          ),
        ),
        getDocs(query(templateCollection, where("cursoId", "==", cursoId))),
        getActiveClassDirectors(),
        getDocs(collection(db, "Users")),
        getActiveAcademicYear(),
      ]);

    const anoLectivoNome = activeYearResult.data?.name || "Ano Indefinido";
    const isYearActive = !!activeYearResult.data;

    const templates = templateSnap.docs.reduce(
      (acc, d) => ({ ...acc, [d.id]: d.data() }),
      {},
    );
    const users = usersSnap.docs.reduce(
      (acc, d) => ({
        ...acc,
        [d.id]: d.data().nomeCompleto || d.data().name || "Sem Nome",
      }),
      {},
    );

    const directorMap = directors.reduce(
      (acc, r) => ({
        ...acc,
        [r.turmaId]: {
          name: users[r.userId],
          userId: r.userId,
          startDate: r.startDate,
        },
      }),
      {},
    );

    const initialData = classSnap.docs.map((d) => {
      const turma = d.data();
      const temp = templates[turma.templateId] || {};
      return {
        id: d.id,
        ...turma,
        nomeBase: temp.nomeBase || "N/A",
        classe: temp.classe || "N/A",
        turno: temp.turno || "N/A",
        nomeExibicao: `${anoLectivoNome}_${temp.nomeBase || "N/A"}`,
        director: directorMap[d.id] || null,
        academicYearActive: isYearActive,
      };
    });

    const data = await Promise.all(
      initialData.map(async (turma) => ({
        ...turma,
        hasStudents: await hasStudentsInClass(turma.id),
      })),
    );

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createClass({
  cursoId,
  cursoCode,
  classe,
  turno,
  anoLectivo,
  sigla: providedSigla,
  nomeBase: providedNomeBase,
  nomeExibicao: providedNomeExibicao,
}) {
  try {
    const sigla = providedSigla || (await getNextClassSigla(cursoId, classe));
    const nomeBase =
      providedNomeBase ||
      `${cursoCode}${classe}${sigla}${turno[0]}`.toUpperCase();
    const nomeExibicao =
      providedNomeExibicao || `${anoLectivo.name}_${nomeBase}`;

    const qTemp = query(
      templateCollection,
      where("nomeBase", "==", nomeBase),
      where("cursoId", "==", cursoId),
    );
    const tempSnap = await getDocs(qTemp);
    let templateId;

    if (tempSnap.empty) {
      const tempRef = await addDoc(templateCollection, {
        nomeBase,
        cursoId,
        classe,
        turno,
        sigla,
        createdAt: new Date().toISOString(),
      });
      templateId = tempRef.id;
    } else {
      templateId = tempSnap.docs[0].id;
    }

    const docRef = await addDoc(classCollection, {
      templateId,
      cursoId,
      anoLectivoId: anoLectivo.id,
      nomeExibicao,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id, nomeBase };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// --- NOVAS FUNÇÕES DE EDIÇÃO E ELIMINAÇÃO ---

export async function updateClass(id, academicYearActive, newData) {
  try {
    if (!academicYearActive)
      throw new Error("Operação negada: O ano lectivo não está activo.");

    const hasStudents = await hasStudentsInClass(id);
    if (hasStudents)
      throw new Error(
        "Esta turma já possui alunos e não pode ser editada estruturalmente.",
      );

    await updateDoc(doc(db, "class", id), {
      ...newData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteClass(id, academicYearActive) {
  try {
    if (academicYearActive)
      throw new Error("Operação negada: O ano lectivo não está activo.");

    const hasStudents = await hasStudentsInClass(id);
    if (hasStudents)
      throw new Error(
        "Não é possível eliminar uma turma com alunos Vinculados a ela.",
      );

    // Soft Delete
    await updateDoc(doc(db, "class", id), {
      isDeleted: true,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getClassTemplatesByCourse(cursoId) {
  try {
    const q = query(templateCollection, where("cursoId", "==", cursoId));
    const snapshot = await getDocs(q);
    const templates = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { success: true, data: templates };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getClassById(id) {
  try {
    const docRef = doc(db, "class", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Turma não encontrada.");

    const turma = { id: docSnap.id, ...docSnap.data() };
    if (turma.templateId) {
      const templateSnap = await getDoc(
        doc(templateCollection, turma.templateId),
      );
      if (templateSnap.exists()) {
        const temp = templateSnap.data();
        turma.nomeBase = temp.nomeBase || turma.nomeBase;
        turma.classe = temp.classe || turma.classe;
        turma.turno = temp.turno || turma.turno;
        turma.sigla = temp.sigla || turma.sigla;
      }
    }

    // Buscar ano lectivo ativo para nomeExibicao
    const activeYearResult = await getActiveAcademicYear();
    const anoLectivoNome = activeYearResult.data?.name || "Ano Indefinido";
    turma.nomeExibicao = `${anoLectivoNome}_${turma.nomeBase || "N/A"}`;

    return { success: true, data: turma };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
