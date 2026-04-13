import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getActiveProfessorsByTurma } from "./classSubjectsService";

const classRoleCollection = collection(db, "classRoles");

export async function bindClassDirector(turmaId, userId) {
  try {
    // Validação Académica: O DT tem de ser professor na turma
    const professorsResult = await getActiveProfessorsByTurma(turmaId);
    if (!professorsResult.data.includes(userId)) {
      return {
        success: false,
        error:
          "Apenas professores que lecionam nesta turma podem ser Diretores.",
      };
    }

    const now = new Date().toISOString();
    const q = query(classRoleCollection, where("turmaId", "==", turmaId));
    const snapshot = await getDocs(q);

    // Encerrar DT atual se houver troca
    const terminations = snapshot.docs
      .map((d) => ({ id: d.id, data: d.data() }))
      .filter(
        (item) =>
          item.data.role === "DIRECTOR_TURMA" && item.data.endDate === null,
      )
      .map((item) =>
        updateDoc(doc(db, "classRoles", item.id), { endDate: now }),
      );
    await Promise.all(terminations);

    const roleRef = await addDoc(classRoleCollection, {
      turmaId,
      userId,
      role: "DIRECTOR_TURMA",
      startDate: now,
      endDate: null,
    });

    return { success: true, id: roleRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
export async function unbindClassDirector(turmaId) {
  try {
    const now = new Date().toISOString();
    const q = query(classRoleCollection, where("turmaId", "==", turmaId));
    const snapshot = await getDocs(q);

    const activeDoc = snapshot.docs
      .map((d) => ({ id: d.id, data: d.data() }))
      .find(
        (item) =>
          item.data.role === "DIRECTOR_TURMA" && item.data.endDate === null,
      );

    if (!activeDoc) {
      return {
        success: false,
        error: "Esta turma não possui diretor de turma ativo.",
      };
    }

    await updateDoc(doc(db, "classRoles", activeDoc.id), { endDate: now });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getClassDirectorHistory(turmaId) {
  try {
    const q = query(classRoleCollection, where("turmaId", "==", turmaId));
    const snapshot = await getDocs(q);
    const data = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((item) => item.role === "DIRECTOR_TURMA");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
