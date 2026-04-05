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

const courseRoleCollection = collection(db, "courseRoles");

// Vincular um coordenador (encerra o anterior automaticamente)
export async function bindCoordinator(courseId, userId) {
  try {
    const now = new Date().toISOString();

    // 1. Validar que o professor não é coordenador activo de outro curso
    const existingCoordinatorQuery = query(
      courseRoleCollection,
      where("userId", "==", userId),
      where("role", "==", "COORDENADOR"),
      where("endDate", "==", null),
    );
    const existingSnapshot = await getDocs(existingCoordinatorQuery);

    if (existingSnapshot.docs.length > 0) {
      const existingCourse = existingSnapshot.docs[0].data().courseId;
      if (existingCourse !== courseId) {
        return {
          success: false,
          error:
            "Este professor já é coordenador ativo de outro curso. Remova esse vínculo primeiro.",
        };
      }
    }

    // 2. Buscar atribuições actuais de coordenação para este curso
    const q = query(
      courseRoleCollection,
      where("courseId", "==", courseId),
      where("role", "==", "COORDENADOR"),
    );
    const snapshot = await getDocs(q);

    // 3. Encerrar qualquer coordenação que não tenha endDate (ou seja, activa)
    const activeRoles = snapshot.docs.filter((doc) => !doc.data().endDate);

    const terminations = activeRoles.map((roleDoc) =>
      updateDoc(doc(db, "courseRoles", roleDoc.id), { endDate: now }),
    );
    await Promise.all(terminations);

    // 4. Criar a nova coordenação
    const roleRef = await addDoc(courseRoleCollection, {
      courseId,
      userId,
      role: "COORDENADOR",
      startDate: now,
      endDate: null,
    });

    return { success: true, id: roleRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Obter quem é o coordenador actual de cada curso
export async function getActiveCoordinators() {
  try {
    const q = query(
      courseRoleCollection,
      where("role", "==", "COORDENADOR"),
      where("endDate", "==", null),
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Validar se um professor já é coordenador ativo de outro curso
export async function isProfessorActiveCoordinator(
  userId,
  excludeCourseId = null,
) {
  try {
    const q = query(
      courseRoleCollection,
      where("userId", "==", userId),
      where("role", "==", "COORDENADOR"),
      where("endDate", "==", null),
    );
    const snapshot = await getDocs(q);

    if (snapshot.docs.length === 0) {
      return { isActive: false, courseId: null };
    }

    const activeRole = snapshot.docs[0].data();
    const isActive = excludeCourseId
      ? activeRole.courseId !== excludeCourseId
      : true;

    return { isActive, courseId: activeRole.courseId };
  } catch (error) {
    console.error("Erro ao validar professor coordenador:", error);
    return { isActive: false, courseId: null };
  }
}

// Obter histórico de coordenadores para um curso
export async function getCoordinatorHistory(courseId) {
  try {
    const q = query(
      courseRoleCollection,
      where("courseId", "==", courseId),
      where("role", "==", "COORDENADOR"),
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Desvincular coordenador (encerra coordenação ativa)
export async function unbindCoordinator(courseId) {
  try {
    const now = new Date().toISOString();

    // Buscar coordenação ativa para este curso
    const q = query(
      courseRoleCollection,
      where("courseId", "==", courseId),
      where("role", "==", "COORDENADOR"),
      where("endDate", "==", null),
    );
    const snapshot = await getDocs(q);

    if (snapshot.docs.length === 0) {
      return {
        success: false,
        error: "Este curso não possui coordenador ativo.",
      };
    }

    // Encerrar a coordenação ativa
    const activeRole = snapshot.docs[0];
    await updateDoc(doc(db, "courseRoles", activeRole.id), { endDate: now });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
