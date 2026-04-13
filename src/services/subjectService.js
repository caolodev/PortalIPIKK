import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const subjectCollection = collection(db, "subjects");
const matrixCollection = collection(db, "courseMatrix");

/**
 * Busca disciplinas permitidas para o curso.
 * Melhoria: Agora usa filtros do Firebase para evitar baixar dados desnecessários.
 */
export async function getFilteredSubjects(courseCode) {
  try {
    const code = courseCode.toUpperCase();

    // Buscamos em paralelo: as gerais e as específicas do curso
    const qGerais = query(subjectCollection, where("cursos", "==", []));
    const qEspecificas = query(
      subjectCollection,
      where("cursos", "array-contains", code),
    );

    const [snapGerais, snapEspecificas] = await Promise.all([
      getDocs(qGerais),
      getDocs(qEspecificas),
    ]);

    const data = [
      ...snapGerais.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ...snapEspecificas.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    ];

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Vincular disciplina à Matriz.
 * Alteração: Removida a carga horária conforme solicitado.
 */
export async function getCourseMatrix(courseId, classe) {
  try {
    const q = query(
      matrixCollection,
      where("courseId", "==", courseId),
      where("classe", "==", Number(classe)),
    );
    const snapshot = await getDocs(q);

    const entries = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const subjectRef = doc(db, "subjects", data.subjectId);
        const subjectSnap = await getDoc(subjectRef);
        const subjectData = subjectSnap.exists() ? subjectSnap.data() : null;
        const isGeneral =
          !subjectData?.cursos ||
          (Array.isArray(subjectData.cursos) &&
            subjectData.cursos.length === 0);
        return {
          id: docSnap.id,
          classe: data.classe,
          subjectId: data.subjectId,
          createdAt: data.createdAt,
          subject: subjectData
            ? {
                id: subjectSnap.id,
                ...subjectData,
                name:
                  subjectData.name ||
                  subjectData.nome ||
                  subjectData.titulo ||
                  subjectData.sigla ||
                  "Disciplina desconhecida",
                isGeneral,
                type: isGeneral ? "Geral" : "Específica",
              }
            : {
                id: data.subjectId,
                name:
                  data.subjectName ||
                  data.subjectId ||
                  "Disciplina desconhecida",
                sigla: data.subjectSigla || "N/A",
                isGeneral: false,
                type: "Específica",
              },
        };
      }),
    );

    return { success: true, data: entries };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function bindSubjectToCourseMatrix({
  courseId,
  subjectId,
  classe,
}) {
  try {
    // 1. Verificar duplicata (Evita que a mesma disciplina apareça 2x na mesma classe)
    const q = query(
      matrixCollection,
      where("courseId", "==", courseId),
      where("subjectId", "==", subjectId),
      where("classe", "==", Number(classe)),
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty)
      return {
        success: false,
        error: "Esta disciplina já existe nesta classe.",
      };

    // 2. Salvar apenas o essencial
    const docRef = await addDoc(matrixCollection, {
      courseId,
      subjectId,
      classe: Number(classe),
      createdAt: new Date().toISOString(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
