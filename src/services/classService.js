import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getActiveAcademicYear } from "./academicYear";
const classCollection = collection(db, "class");
const templateCollection = collection(db, "classTemplates");

function getCodeFromNomeExibicao(nomeExibicao) {
  return nomeExibicao?.split("_")[1] || null;
}
function parseClasseFromCode(code) {
  const match = code?.match(/(\d{2})/);
  return match ? match[1] : null;
}

function parseTurnoFromCode(code) {
  if (!code) return null;
  if (code.endsWith("M")) return "Manhã";
  if (code.endsWith("T")) return "Tarde";
  return null;
}

async function getNextClassSigla(cursoId, classe) {
  const q = query(templateCollection, where("cursoId", "==", cursoId));
  const snapshot = await getDocs(q);
  const siglas = snapshot.docs
    .map((doc) => doc.data())
    .filter((item) => item.classe === classe)
    .map((item) => item.sigla || item.letra)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const lastSigla = siglas[siglas.length - 1];
  return lastSigla ? String.fromCharCode(lastSigla.charCodeAt(0) + 1) : "A";
}

async function getActiveClassDirectors() {
  try {
    const q = query(
      collection(db, "classRoles"),
      where("role", "==", "DIRECTOR_TURMA"),
    );
    const snapshot = await getDocs(q);
    const directors = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((item) => item.endDate === null);

    return { success: true, data: directors };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getClassesByCourse(cursoId, anoLectivoId) {
  try {
    // 1. Buscar todas as turmas do curso e filtrar localmente por ano lectivo
    const q = query(classCollection, where("cursoId", "==", cursoId));
    const classSnapshot = await getDocs(q);
    const classes = classSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((turma) => turma.anoLectivoId === anoLectivoId);

    const templateSnapshot = await getDocs(
      query(templateCollection, where("cursoId", "==", cursoId)),
    );
    const templateMap = templateSnapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data();
      return acc;
    }, {});

    // 2. Buscar todos os diretores ativos e todos os usuários (para pegar nomes)
    const [directorsResult, usersSnapshot] = await Promise.all([
      getActiveClassDirectors(),
      getDocs(collection(db, "Users")),
    ]);

    // 3. Mapear usuários para busca rápida por ID
    const usersMap = usersSnapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data().nomeCompleto || doc.data().name || "Sem Nome";
      return acc;
    }, {});

    // 4. Mapear diretores para as turmas
    const directorMap = directorsResult.success
      ? directorsResult.data.reduce((acc, role) => {
          acc[role.turmaId] = {
            name: usersMap[role.userId] || "Sem Nome",
            since: new Date(role.startDate).getFullYear(),
            userId: role.userId,
          };
          return acc;
        }, {})
      : {};

    const activeYearResult = await getActiveAcademicYear();
    const academicYearActive =
      activeYearResult.success && !!activeYearResult.data;

    // 5. Unir as peças: Turma + director + status
    const completeData = classes.map((turma) => {
      const template = templateMap[turma.templateId] || {};
      const code =
        turma.nomeBase ||
        template.nomeBase ||
        getCodeFromNomeExibicao(turma.nomeExibicao);
      const director = directorMap[turma.id] || null;
      return {
        ...turma,
        nomeBase: turma.nomeBase || template.nomeBase || code || "-",
        classe:
          turma.classe || template.classe || parseClasseFromCode(code) || "-",
        turno: turma.turno || template.turno || parseTurnoFromCode(code) || "-",
        director,
        academicYearActive,
        active: academicYearActive && !!director,
      };
    });

    return { success: true, data: completeData };
  } catch (error) {
    console.error("Erro ao listar turmas:", error);
    return { success: false, error: error.message };
  }
}

export async function getClassTemplatesByCourse(cursoId) {
  try {
    const q = query(templateCollection, where("cursoId", "==", cursoId));
    const snapshot = await getDocs(q);
    const templates = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, data: templates };
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
}) {
  try {
    const sigla = await getNextClassSigla(cursoId, classe, turno);
    const nomeBase = `${cursoCode}${classe}${sigla}${turno[0]}`.toUpperCase();
    const anoExibicao =
      anoLectivo?.name ||
      generateAcademicYearName(anoLectivo?.startDate, anoLectivo?.endDate);
    const nomeExibicao = `${anoExibicao}_${nomeBase}`;

    // 1. Garantir Template
    const qTemp = query(templateCollection, where("nomeBase", "==", nomeBase));
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

    // 2. Criar Instância
    const docRef = await addDoc(classCollection, {
      templateId,
      cursoId,
      anoLectivoId: anoLectivo.id,
      nomeBase,
      classe,
      turno,
      nomeExibicao,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { success: true, id: docRef.id, nome: nomeExibicao, nomeBase };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
