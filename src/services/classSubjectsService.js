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

const turmaDisciplinaCollection = collection(db, "classSubjects");
const teacherAssignmentCollection = collection(db, "teacherAssignments");

export async function assignProfessorToSubject({
  turmaId,
  subjectId,
  professorId,
  anoLectivoId,
}) {
  try {
    const now = new Date().toISOString();
    const q = query(
      turmaDisciplinaCollection,
      where("turmaId", "==", turmaId),
      where("subjectId", "==", subjectId),
      where("endDate", "==", null),
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const active = snapshot.docs[0];
      if (active.data().professorId === professorId) return { success: true };
      await updateDoc(doc(db, "classSubjects", active.id), { endDate: now });
    }

    const docRef = await addDoc(turmaDisciplinaCollection, {
      turmaId,
      subjectId,
      professorId,
      anoLectivoId,
      startDate: now,
      endDate: null,
      createdAt: now,
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getActiveProfessorsByTurma(turmaId) {
  try {
    const q = query(
      teacherAssignmentCollection,
      where("classId", "==", turmaId),
      where("endDate", "==", null),
    );
    const snapshot = await getDocs(q);
    const professorIds = [
      ...new Set(snapshot.docs.map((d) => d.data().teacherId)),
    ];
    return { success: true, data: professorIds };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
