import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const courseCollection = collection(db, "courses");
const academicYearCollection = collection(db, "academicYears");
const usersCollection = collection(db, "Users");

// Função para verificar se há um ano lectivo ativo
async function hasActiveAcademicYear() {
  const q = query(academicYearCollection);
  const snapshot = await getDocs(q);

  const now = new Date();

  return snapshot.docs.some((doc) => {
    const data = doc.data();
    return new Date(data.startDate) <= now && new Date(data.endDate) >= now;
  });
}

// Função para verificar se o código do curso é único
async function isCodeUnique(code, currentId = null) {
  const q = query(courseCollection, where("code", "==", code));
  const snapshot = await getDocs(q);

  return !snapshot.docs.some((doc) => doc.id !== currentId);
}

// Função para criar um novo curso
export async function createCourse({ name, code }) {
  try {
    if (!name || !code) {
      return { success: false, error: "Nome e código são obrigatórios" };
    }

    // Verificar se há um ano lectivo ativo
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

// Função para obter professores cadastrados como usuários
export async function getProfessors() {
  try {
    const q = query(usersCollection, where("role", "==", "PROFESSOR"));
    const snapshot = await getDocs(q);

    const professors = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: professors };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Função para atualizar um curso
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

// Função para obter todos os cursos
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
