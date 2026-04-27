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
    );
    const existingSnapshot = await getDocs(existingCoordinatorQuery);

    const activeExistingCoordinator = existingSnapshot.docs
      .map((d) => d.data())
      .find((item) => item.role === "COORDENADOR" && item.endDate === null);

    if (activeExistingCoordinator) {
      const existingCourse = activeExistingCoordinator.courseId;
      if (existingCourse !== courseId) {
        return {
          success: false,
          error:
            "Este professor já é coordenador ativo de outro curso. Remova esse vínculo primeiro.",
        };
      }
    }

    // 2. Buscar atribuições actuais de coordenação para este curso
    const q = query(courseRoleCollection, where("courseId", "==", courseId));
    const snapshot = await getDocs(q);

    // 3. Encerrar qualquer coordenação que não tenha endDate (ou seja, activa)
    const activeRoles = snapshot.docs
      .map((doc) => ({ id: doc.id, data: doc.data() }))
      .filter(
        (item) =>
          item.data.role === "COORDENADOR" && item.data.endDate === null,
      )
      .map((item) => ({ id: item.id, data: item.data }));

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
    const q = query(courseRoleCollection, where("role", "==", "COORDENADOR"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((item) => item.endDate === null);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getActiveCourseForCoordinator(userId) {
  try {
    const q = query(courseRoleCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const active = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .find((item) => item.role === "COORDENADOR" && item.endDate === null);
    if (!active) {
      return { success: true, data: null };
    }
    return { success: true, data: active };
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
    const q = query(courseRoleCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const activeRole = snapshot.docs
      .map((doc) => doc.data())
      .find((item) => item.role === "COORDENADOR" && item.endDate === null);

    if (!activeRole) {
      return { isActive: false, courseId: null };
    }
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
    const q = query(courseRoleCollection, where("courseId", "==", courseId));
    const snapshot = await getDocs(q);
    const data = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((item) => item.role === "COORDENADOR");
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
    const q = query(courseRoleCollection, where("courseId", "==", courseId));
    const snapshot = await getDocs(q);

    const activeRoleDoc = snapshot.docs
      .map((d) => ({ id: d.id, data: d.data() }))
      .find(
        (item) =>
          item.data.role === "COORDENADOR" && item.data.endDate === null,
      );

    if (!activeRoleDoc) {
      return {
        success: false,
        error: "Este curso não possui coordenador ativo.",
      };
    }

    await updateDoc(doc(db, "courseRoles", activeRoleDoc.id), { endDate: now });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
