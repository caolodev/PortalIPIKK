import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const assignmentCollection = collection(db, "teacherAssignments");
const usersCollection = collection(db, "Users");

/**
 * Atribui um professor a uma disciplina dentro de uma turma.
 * Se já houver um professor ativo, encerra o vínculo anterior.
 */
export async function assignTeacherToClassSubject({
  teacherId,
  classId,
  subjectId,
  anoLectivoId,
}) {
  try {
    const now = new Date().toISOString();

    // 1. Procurar se já existe um vínculo ativo para esta disciplina nesta turma
    const q = query(
      assignmentCollection,
      where("classId", "==", classId),
      where("subjectId", "==", subjectId),
      where("anoLectivoId", "==", anoLectivoId),
      where("endDate", "==", null),
    );

    const snapshot = await getDocs(q);

    // 2. Se houver um professor ativo, encerramos o vínculo dele
    if (!snapshot.empty) {
      const activeAssignment = snapshot.docs[0];

      // Se for o mesmo professor, não fazemos nada
      if (activeAssignment.data().teacherId === teacherId) {
        return { success: true, message: "Professor já está atribuído." };
      }

      await updateDoc(doc(db, "teacherAssignments", activeAssignment.id), {
        endDate: now,
      });
    }

    // 3. Criar o novo vínculo
    const docRef = await addDoc(assignmentCollection, {
      teacherId,
      classId,
      subjectId,
      anoLectivoId,
      startDate: now,
      endDate: null,
      createdAt: now,
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Erro ao atribuir professor:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Lista todos os vínculos (ativos e histórico) de uma turma específica.
 */
export async function getAssignmentsByClass(classId, anoLectivoId) {
  try {
    const q = query(
      assignmentCollection,
      where("classId", "==", classId),
      where("anoLectivoId", "==", anoLectivoId),
    );

    const snapshot = await getDocs(q);

    // Mapear os dados e buscar nomes dos professores em paralelo para performance
    const assignments = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    // Buscar todos os usuários para fazer o "Join" manual (pode ser otimizado com cache)
    const usersSnap = await getDocs(
      query(usersCollection, where("role", "==", "PROFESSOR")),
    );
    const professorsMap = usersSnap.docs.reduce((acc, d) => {
      acc[d.id] = d.data().nomeCompleto || d.data().name || "Sem Nome";
      return acc;
    }, {});

    const completeData = assignments.map((as) => ({
      ...as,
      teacherName: professorsMap[as.teacherId] || "Professor não encontrado",
    }));

    return { success: true, data: completeData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Retorna a lista de todos os usuários com papel de PROFESSOR.
 */
export async function getAllProfessors() {
  try {
    const q = query(usersCollection, where("role", "==", "PROFESSOR"));
    const snapshot = await getDocs(q);
    const professors = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { success: true, data: professors };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
