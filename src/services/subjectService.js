import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const subjectCollection = collection(db, "subjects");
const matrixCollection = collection(db, "courseMatrix");

/**
 * Busca a Matriz Curricular (Apenas as Ativas por padrão)
 */
export async function getCourseMatrix(
  courseId,
  classe,
  includeInactive = false,
) {
  try {
    // Filtro base: Curso e Classe
    let q = query(
      matrixCollection,
      where("courseId", "==", courseId),
      where("classe", "==", Number(classe)),
    );

    // Regra: Por padrão, trazemos apenas isActive == true
    if (!includeInactive) {
      q = query(q, where("isActive", "==", true));
    }

    const snapshot = await getDocs(q);

    const entries = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const subjectRef = doc(db, "subjects", data.subjectId);
        const subjectSnap = await getDoc(subjectRef);
        const subjectData = subjectSnap.exists() ? subjectSnap.data() : null;

        return {
          id: docSnap.id,
          classe: data.classe,
          subjectId: data.subjectId,
          isActive: data.isActive, // Importante para o front saber o estado
          subject: subjectData
            ? {
                id: subjectSnap.id,
                ...subjectData,
                name:
                  subjectData.name ||
                  subjectData.nome ||
                  "Disciplina desconhecida",
              }
            : null,
        };
      }),
    );

    return { success: true, data: entries };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Vincula Disciplina à Matriz (Define isActive: true na criação)
 */
export async function bindSubjectToCourseMatrix({
  courseId,
  subjectId,
  classe,
}) {
  try {
    const q = query(
      matrixCollection,
      where("courseId", "==", courseId),
      where("subjectId", "==", subjectId),
      where("classe", "==", Number(classe)),
    );

    const snapshot = await getDocs(q);

    // Se já existia (mesmo inativa), podemos reativá-la em vez de criar duplicado
    if (!snapshot.empty) {
      const existingDoc = snapshot.docs[0];
      if (!existingDoc.data().isActive) {
        await updateDoc(doc(db, "courseMatrix", existingDoc.id), {
          isActive: true,
          updatedAt: new Date().toISOString(),
        });
        return {
          success: true,
          id: existingDoc.id,
          message: "Disciplina reativada.",
        };
      }
      return {
        success: false,
        error: "Esta disciplina já está ativa nesta classe.",
      };
    }

    const docRef = await addDoc(matrixCollection, {
      courseId,
      subjectId,
      classe: Number(classe),
      isActive: true, // Sempre ativa por padrão na criação
      createdAt: new Date().toISOString(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Soft Delete: Altera isActive para false
 */
export async function removeSubjectFromMatrix(matrixId) {
  try {
    const matrixRef = doc(db, "courseMatrix", matrixId);
    const matrixSnap = await getDoc(matrixRef);

    if (!matrixSnap.exists())
      return { success: false, error: "Registro não encontrado." };

    const { subjectId, courseId, classe } = matrixSnap.data();

    // Verificações de segurança (TeacherAssignments e Assessments)
    const qAssign = query(
      collection(db, "teacherAssignments"),
      where("subjectId", "==", subjectId),
      limit(1),
    );
    const qAssess = query(
      collection(db, "assessments"),
      where("subjectId", "==", subjectId),
      limit(1),
    );

    const [snapA, snapB] = await Promise.all([
      getDocs(qAssign),
      getDocs(qAssess),
    ]);

    // Se houver vínculos, podemos optar por não permitir a remoção ou apenas marcar como inativa
    if (!snapA.empty || !snapB.empty) {
      return {
        success: false,
        error:
          "Não é possível remover esta disciplina da matriz ativa, pois existem vínculos de professores ou avaliações associadas a ela.",
      };
    }

    await updateDoc(matrixRef, {
      isActive: false,
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Disciplina removida da matriz ativa com sucesso.",
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getFilteredSubjects(courseCode, searchTerm) {
  try {
    // Busca todas as disciplinas disponíveis
    const q = query(subjectCollection);
    const snapshot = await getDocs(q);

    // Filtrar no cliente para:
    // 1. Disciplinas gerais (cursos vazio)
    // 2. Disciplinas relacionadas ao curso (courseCode no array cursos)
    const subjects = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((subject) => {
        const cursos = Array.isArray(subject.cursos) ? subject.cursos : [];
        const isGeneral = cursos.length === 0;
        const isRelatedToCourse = cursos.includes(courseCode);
        return isGeneral || isRelatedToCourse;
      })
      // Filtro de busca adicional se houver searchTerm
      .filter((subject) => {
        if (!searchTerm || searchTerm.trim() === "") return true;
        const term = searchTerm.toLowerCase();
        const nome = (subject.nome || subject.name || "").toLowerCase();
        const sigla = (subject.sigla || "").toLowerCase();
        return nome.includes(term) || sigla.includes(term);
      });

    return { success: true, data: subjects };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getSubjectById(subjectId) {
  try {
    const docRef = doc(db, "subjects", subjectId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Disciplina não encontrada.");

    return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
