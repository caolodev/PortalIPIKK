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
import { calculateQuarterStatus } from "./academicQuarter";

const assessmentCollection = collection(db, "assessments");
const studentRecordsCollection = collection(db, "studentsRecords");
const teacherAssignmentsCollection = collection(db, "teacherAssignments");

/**
 * BUSCA ALUNOS DA TURMA
 * Otimizado com Promise.all para performance
 */
export async function getStudentsByClass(turmaId) {
  try {
    const q = query(studentRecordsCollection, where("turmaId", "==", turmaId));
    const snap = await getDocs(q);
    const studentRecords = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (studentRecords.length === 0) return [];

    // Busca os dados de perfil (Users) em paralelo
    return await Promise.all(
      studentRecords.map(async (student) => {
        const userSnap = await getDoc(doc(db, "Users", student.userId));
        const userData = userSnap.exists() ? userSnap.data() : {};

        return {
          id: student.id,
          userId: student.userId,
          name: userData.nomeCompleto || userData.name || "N/A",
          numero: student.processo,
          processo: student.processo,
          turmaId: student.turmaId,
          anoLectivoId: student.anoLectivoId,
          cursoId: student.cursoId,
          classe: student.classe,
          estadoFinal: student.estadoFinal,
        };
      }),
    );
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    return [];
  }
}

/**
 * BUSCA DISCIPLINAS DO PROFESSOR NA TURMA
 */
export async function getDisciplinesByTeacherAndClass(
  teacherId,
  classId,
  anoLectivoId,
) {
  try {
    const q = query(
      teacherAssignmentsCollection,
      where("teacherId", "==", teacherId),
      where("classId", "==", classId),
      where("anoLectivoId", "==", anoLectivoId),
      where("endDate", "==", null),
    );

    const snapshot = await getDocs(q);
    const assignments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    const disciplines = await Promise.all(
      assignments.map(async (assignment) => {
        const subjectSnap = await getDoc(
          doc(db, "subjects", assignment.subjectId),
        );
        const subjectData = subjectSnap.exists() ? subjectSnap.data() : null;

        return {
          id: assignment.id,
          assignmentId: assignment.id,
          subjectId: assignment.subjectId,
          classId: assignment.classId,
          subject: {
            id: assignment.subjectId,
            name:
              subjectData?.name ||
              subjectData?.nome ||
              "Disciplina desconhecida",
            sigla: subjectData?.sigla || "N/A",
          },
        };
      }),
    );

    return { success: true, data: disciplines };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * BUSCA NOTAS EXISTENTES (MAPA)
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
      gradesMap[data.studentId] = data.grades;
    });

    return { success: true, data: gradesMap };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * BUSCA TODAS AS AVALIAÇÕES DE UM ALUNO (Para o Portal do Aluno)
 */
export async function getAssessmentsByStudent(studentId, anoLectivoId) {
  try {
    const q = query(
      assessmentCollection,
      where("studentId", "==", studentId),
      where("anoLectivoId", "==", anoLectivoId),
    );
    const snapshot = await getDocs(q);
    const assessments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { success: true, data: assessments };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * SALVA NOTA (COM TRAVA DE SEGURANÇA DE TRIMESTRE ATIVO)
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
    if (!quarterId || !yearId) {
      return {
        success: false,
        error:
          "Não há trimestre activo ou ano lectivo válido. Lançamento bloqueado.",
      };
    }

    // --- 1. VALIDAÇÃO DE PERÍODO (SECURITY CHECK) ---
    const [quarterSnap, yearSnap] = await Promise.all([
      getDoc(doc(db, "academicQuarters", quarterId)),
      getDoc(doc(db, "academicYears", yearId)),
    ]);

    if (!quarterSnap.exists() || !yearSnap.exists()) {
      throw new Error("Dados de calendário não encontrados.");
    }

    const quarterData = quarterSnap.data();
    const yearData = yearSnap.data();

    // Cálculo dinâmico do status
    const currentStatus = calculateQuarterStatus(
      quarterData.startDate,
      quarterData.endDate,
      yearData.status,
    );

    if (currentStatus !== "ACTIVE") {
      return {
        success: false,
        error: `Lançamento negado: Este trimestre está ${currentStatus}.`,
      };
    }
    // --- 2. PROCESSAMENTO DAS NOTAS ---
    const assessmentId = `${studentId}_${classId}_${subjectId}_${quarterId}`;
    const docRef = doc(db, "assessments", assessmentId);

    const { pp, pt, mac } = grades;

    const npProva = pp !== "" && pp != null ? Number(pp) : null;
    const ntProva = pt !== "" && pt != null ? Number(pt) : null;
    const nMAC = mac !== "" && mac != null ? Number(mac) : null;

    // Cálculo da Média Trimestral (MT)
    const validNotes = [npProva, ntProva, nMAC].filter(
      (v) => v !== null && !isNaN(v),
    );
    const mt =
      validNotes.length > 0
        ? Number(
            (
              validNotes.reduce((acc, curr) => acc + curr, 0) /
              validNotes.length
            ).toFixed(1),
          )
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
        mt: mt,
      },
      status: "OPEN",
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, payload, { merge: true });
    return { success: true, mt };
  } catch (error) {
    console.error("Erro ao salvar avaliações:", error);
    return { success: false, error: error.message };
  }
}
