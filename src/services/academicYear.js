import { db } from "../lib/firebase";
import {
  getDocs,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

const academicYearCollection = collection(db, "academicYears");
import { validateAcademicYear } from "./validateNewYear";
import { getAcademicQuartersByYear } from "./academicQuarter";

// Função auxiliar para determinar o status com base nas datas
function calculateStatus(startDate, endDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  if (now < start) return "INACTIVE";
  if (now > end) return "CLOSED";
  return "ACTIVE";
}

export default function generateNameYear(startDate, endDate) {
  const startYear = new Date(startDate).getFullYear();
  const endYear = new Date(endDate).getFullYear();
  if (startYear === endYear) {
    return `${startYear}`;
  }
  return `${startYear} - ${endYear}`;
}

// Função para criar um novo ano Lectivo
export async function createAcademicYear(data) {
  try {
    const snapshot = await getDocs(academicYearCollection);

    const existingYears = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const validation = await validateAcademicYear(data, existingYears);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }
    const newAcademicYear = await addDoc(academicYearCollection, {
      startDate: data.startDate,
      endDate: data.endDate,
      name: generateNameYear(data.startDate, data.endDate),
      createdAt: serverTimestamp(),
    });
    return { success: true, id: newAcademicYear.id };
  } catch (err) {
    console.error("Erro ao criar ano académico: " + err.message);
    return { success: false, error: err.message };
  }
}

// Função para pegar todos os anos Lectivos e atualizar status automaticamente
export async function getAcademicYears() {
  try {
    const snapshot = await getDocs(academicYearCollection);
    const academicYears = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const status = calculateStatus(data.startDate, data.endDate);
      return {
        id: docSnap.id,
        ...data,
        status,
      };
    });
    return { success: true, data: academicYears };
  } catch (err) {
    console.error("Erro ao obter anos académicos: " + err.message);
    return { success: false, error: err.message };
  }
}

//Função para pegar o ano Lectivo activo
export async function getActiveAcademicYear() {
  try {
    const snapshot = await getDocs(academicYearCollection);
    const activeYear = snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data();
        const status = calculateStatus(data.startDate, data.endDate);
        return {
          id: docSnap.id,
          ...data,
          status,
        };
      })
      .find((year) => year.status === "ACTIVE");

    if (!activeYear) {
      return { success: true, data: null };
    }
    return {
      success: true,
      data: {
        id: activeYear.id,
        ...activeYear,
        status: calculateStatus(activeYear.startDate, activeYear.endDate),
      },
    };
  } catch (err) {
    console.error("Erro ao obter ano académico activo: " + err.message);
    return { success: false, error: err.message };
  }
}

// Função para actualizar um ano Lectivo
export async function updateAcademicYear(id, data) {
  try {
    const docRef = doc(db, "academicYears", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: "Ano académico não encontrado." };
    }

    const currentYear = docSnap.data();
    const currentStatus = calculateStatus(
      currentYear.startDate,
      currentYear.endDate,
    );
    if (currentStatus === "CLOSED") {
      return {
        success: false,
        error: "Não é possível editar um ano académico encerrado.",
      };
    }

    // Buscar Trimestres para validar seu vinculo
    const quartersRes = await getAcademicQuartersByYear(id);
    const hasQuarters = quartersRes.success && quartersRes.data.length > 0;

    const snapshot = await getDocs(academicYearCollection);
    const existingYears = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const validation = await validateAcademicYear(data, existingYears, {
      currentId: id,
      hasQuarters: hasQuarters,
    });

    if (!validation.success) {
      return { success: false, error: validation.error };
    }
    // Se ano está ACTIVE, mantemos regra de não quebrar consistência de datas (mesma validação já aplica)
    await updateDoc(docRef, {
      name: generateNameYear(data.startDate, data.endDate),
      startDate: data.startDate,
      endDate: data.endDate,
    });
    return { success: true };
  } catch (err) {
    console.error("Erro ao actualizar ano académico: " + err.message);
    return { success: false, error: err.message };
  }
}
