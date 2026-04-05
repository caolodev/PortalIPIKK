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

const courseCollection = collection(db, "courses");
const academicYearCollection = collection(db, "academicYears");
const courseRoleCollection = collection(db, "courseRoles");

// função para verificar se há um ano lectivo ativo
async function hasActiveAcademicYear() {
  const q = query(academicYearCollection);
  const snapshot = await getDocs(q);

  const now = new Date();

  return snapshot.docs.some((doc) => {
    const data = doc.data();
    return new Date(data.startDate) <= now && new Date(data.endDate) >= now;
  });
}

async function isCodeUnique(code, currentId = null) {
  const q = query(courseCollection, where("code", "==", code));
  const snapshot = await getDocs(q);

  return !snapshot.docs.some((doc) => doc.id !== currentId);
}

// função para criar um novo curso
export async function createCourse({ name, code }) {
  try {
    if (!name || !code) {
      return { success: false, error: "Nome e código são obrigatórios" };
    }

    if (await hasActiveAcademicYear()) {
      return {
        success: false,
        error: "Não pode criar cursos durante ano lectivo ativo",
      };
    }

    const unique = await isCodeUnique(code.toUpperCase());

    if (!unique) {
      return { success: false, error: "Código já existe" };
    }

    const docRef = await addDoc(courseCollection, {
      name,
      code: code.toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// função para atualizar um curso
export async function updateCourse(id, { name, code }) {
  try {
    if (await hasActiveAcademicYear()) {
      return {
        success: false,
        error: "Não pode editar cursos durante ano lectivo ativo",
      };
    }

    const unique = await isCodeUnique(code.toUpperCase(), id);

    if (!unique) {
      return { success: false, error: "Código já existe" };
    }

    const docRef = doc(db, "courses", id);

    await updateDoc(docRef, {
      name,
      code: code.toUpperCase(),
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// função para obter todos os cursos
export async function getCourses() {
  try {
    const snapshot = await getDocs(courseCollection);

    const courses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: courses };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// função para obter as atribuições de coordenação ativas
export async function getActiveCourseRoles() {
  try {
    const q = query(courseRoleCollection, where("role", "==", "COORDENADOR"));
    const snapshot = await getDocs(q);

    const now = new Date();
    const roles = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((role) => !role.endDate || new Date(role.endDate) >= now);

    return { success: true, data: roles };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// função para obter o histórico de atribuições de um curso
export async function getCourseRoles(courseId) {
  try {
    const q = query(courseRoleCollection, where("courseId", "==", courseId));
    const snapshot = await getDocs(q);

    const roles = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    return { success: true, data: roles };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// função para vincular um coordenador a um curso
export async function bindCoordinator(courseId, userId) {
  try {
    const q = query(
      courseRoleCollection,
      where("courseId", "==", courseId),
      where("role", "==", "COORDENADOR"),
    );
    const snapshot = await getDocs(q);

    const now = new Date().toISOString();
    const activeRoles = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((role) => !role.endDate || new Date(role.endDate) >= new Date());

    await Promise.all(
      activeRoles.map((role) =>
        updateDoc(doc(db, "courseRoles", role.id), {
          endDate: now,
        }),
      ),
    );

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
