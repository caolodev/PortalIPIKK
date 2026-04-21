import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { getActiveAcademicYear } from "./academicYear";
import { getAssignmentsByProfessor as getTeacherAssignments } from "./teacherAssignmentService";
import { getActiveAcademicQuarter } from "./academicQuarter";

const assessmentCollection = collection(db, "assessments");
const studentRecordsCollection = collection(db, "studentsRecords");
const teacherAssignmentsCollection = collection(db, "teacherAssignments");
const subjectsCollection = collection(db, "subjects");
const usersCollection = collection(db, "Users");

/**
 * BUSCA ALUNOS DA TURMA (Para o Passo 3 do Vídeo)
 * Inclui dados do Users para nome do aluno
 */
export async function getStudentsByClass(turmaId) {
  try {
    const q = query(studentRecordsCollection, where("turmaId", "==", turmaId));
    const snap = await getDocs(q);

    // Buscar dados dos Users em paralelo
    const studentData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Se não houver alunos, retorna array vazio
    if (studentData.length === 0) {
      return [];
    }

    // Buscar dados dos Users para cada aluno
    const usersData = await Promise.all(
      studentData.map(async (student) => {
        const userRef = doc(db, "Users", student.userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};

        return {
          id: student.id,
          userId: student.userId,
          name: userData.nomeCompleto || userData.name || "N/A",
          numero: student.processo, // Campo "numero" é na verdade "processo"
          processo: student.processo,
          turmaId: student.turmaId,
          anoLectivoId: student.anoLectivoId,
          cursoId: student.cursoId,
          classe: student.classe,
          estadoFinal: student.estadoFinal,
          createdAt: student.createdAt,
        };
      }),
    );

    return usersData;
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    return [];
  }
}

/**
 * BUSCA DISCIPLINAS ATIVAS DO PROFESSOR PARA UMA TURMA
 * Filtra teacher assignments ativos (endDate = null) e busca os subjects
 */
export async function getDisciplinesByTeacherAndClass(
  teacherId,
  classId,
  anoLectivoId,
) {
  try {
    // Buscar teacher assignments ativos para esta turma
    const q = query(
      teacherAssignmentsCollection,
      where("teacherId", "==", teacherId),
      where("classId", "==", classId),
      where("anoLectivoId", "==", anoLectivoId),
      where("endDate", "==", null),
    );

    const snapshot = await getDocs(q);
    const assignments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Para cada assignment, buscar o subject correspondente
    const disciplines = await Promise.all(
      assignments.map(async (assignment) => {
        const subjectRef = doc(db, "subjects", assignment.subjectId);
        const subjectSnap = await getDoc(subjectRef);
        const subjectData = subjectSnap.exists() ? subjectSnap.data() : null;

        return {
          id: assignment.id,
          assignmentId: assignment.id,
          subjectId: assignment.subjectId,
          classId: assignment.classId,
          subject: subjectData
            ? {
                id: subjectSnap.id,
                ...subjectData,
                name:
                  subjectData.nome ||
                  subjectData.name ||
                  "Disciplina desconhecida",
                sigla: subjectData.sigla || "N/A",
              }
            : {
                id: assignment.subjectId,
                name: "Disciplina desconhecida",
                sigla: "N/A",
              },
        };
      }),
    );

    return { success: true, data: disciplines };
  } catch (error) {
    console.error("Erro ao buscar disciplinas:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * BUSCA NOTAS EXISTENTES
 */
export async function getGradesByContext(classId, subjectId, quarterId) {
  try {
    const q = query(
      assessmentCollection,
      where("classId", "==", classId),
      where("subjectId", "==", subjectId),
      where("quarterId", "==", quarterId),
    );

    const querySnapshot = await getDocs(q);
    const gradesMap = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Indexamos por studentId para facilitar o preenchimento da tabela
      gradesMap[data.studentId] = data.grades;
    });

    return { success: true, data: gradesMap };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * SALVA NOTA COM CÁLCULO DE MÉDIA
 */
export async function saveStudentGrades({
  studentId,
  classId,
  subjectId,
  quarterId,
  yearId,
  teacherId,
  assignmentId,
  grades,
}) {
  try {
    // ID Determinístico para evitar duplicados
    const assessmentId = `${studentId}_${classId}_${subjectId}_${quarterId}`;
    const docRef = doc(db, "assessments", assessmentId);

    // Extrai as notas (pp: Prova Prática, pt: Prova Teórica, mac: Mini avaliação contínua)
    const { pp, pt, mac } = grades;

    // Garantir que são números ou null
    const npProva = pp !== "" && pp !== null ? Number(pp) : null;
    const ntProva = pt !== "" && pt !== null ? Number(pt) : null;
    const nMAC = mac !== "" && mac !== null ? Number(mac) : null;

    // Calcula a média apenas com notas válidas
    const validNotes = [npProva, ntProva, nMAC].filter(
      (v) => v !== null && !isNaN(v),
    );
    const mt =
      validNotes.length > 0
        ? (
            validNotes.reduce((acc, curr) => acc + curr, 0) / validNotes.length
          ).toFixed(1)
        : null;

    const payload = {
      studentId,
      classId,
      subjectId,
      quarterId,
      anoLectivoId: yearId,
      teacherId,
      assignmentId,
      grades: {
        pp: npProva,
        pt: ntProva,
        mac: nMAC,
        mt: mt ? Number(mt) : null,
      },
      status: "OPEN",
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, payload, { merge: true });
    return { success: true, mt: mt ? Number(mt) : null };
  } catch (error) {
    return { success: false, error: error.message };
  }
}