import { db } from "../lib/firebase";
import {
  getDocs,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { validateAcademicYear } from "./academicYearValidator";

const academicYearCollection = collection(db, "academicYears");

// Função para criar um novo ano Lectivo
export async function createAcademicYear(data) {
  try {
    const validation = await validateAcademicYear(data);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    const newAcademicYear = await addDoc(academicYearCollection, {
      name: validation.value.name,
      startDate: validation.value.startDate,
      endDate: validation.value.endDate,
      status: "INACTIVE",
      createdAt: serverTimestamp(),
    });
    return { success: true, id: newAcademicYear.id };
  } catch (err) {
    console.error("Erro ao criar ano académico: " + err.message);
    return { success: false, error: err.message };
  }
}

// Função para pegar todos os anos Lectivos
export async function getAcademicYears() {
  try {
    const snapshot = await getDocs(academicYearCollection);
    const academicYears = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, data: academicYears };
  } catch (err) {
    console.error("Erro ao obter anos académicos: " + err.message);
    return { success: false, error: err.message };
  }
}

function isPastEndDate(endDate) {
  if (!endDate) return false;
  const now = new Date();
  const end = new Date(`${endDate}T23:59:59.999Z`);
  return end < now;
}

export async function closeFinishedAcademicYears() {
  try {
    const snapshot = await getDocs(academicYearCollection);
    const jobs = [];

    snapshot.docs.forEach((docItem) => {
      const data = docItem.data();
      if (data.status !== "CLOSED" && isPastEndDate(data.endDate)) {
        const docRef = doc(db, "academicYears", docItem.id);
        jobs.push(updateDoc(docRef, { status: "CLOSED" }));
      }
    });

    if (jobs.length > 0) await Promise.all(jobs);

    return { success: true, closedCount: jobs.length };
  } catch (err) {
    console.error("Erro ao encerrar anos lectivos finalizados: " + err.message);
    return { success: false, error: err.message };
  }
}

//Função para pegar o ano Lectivo activo
export async function getActiveAcademicYear() {
  try {
    const q = query(academicYearCollection, where("status", "==", "ACTIVE"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { success: false, data: null };
    }
    const activeYear = snapshot.docs[0];
    return { success: true, data: { id: activeYear.id, ...activeYear.data() } };
  } catch (err) {
    console.error("Erro ao obter ano académico activo: " + err.message);
    return { success: false, error: err.message };
  }
}

// Função para activar ano Lectivo
export async function activateAcademicYear(id) {
  try {
    const selectedDocRef = doc(db, "academicYears", id);
    const selectedDocSnap = await getDoc(selectedDocRef);

    if (!selectedDocSnap.exists()) {
      return { success: false, error: "Ano académico não encontrado." };
    }

    const selectedYear = selectedDocSnap.data();
    if (selectedYear.status === "CLOSED") {
      return {
        success: false,
        error: "Não é possível activar um ano académico encerrado.",
      };
    }

    // Primeiro, desactivar o ano Lectivo actualmente activo
    const q = query(academicYearCollection, where("status", "==", "ACTIVE"));
    const snapshot = await getDocs(q);

    const updates = snapshot.docs.map((docItem) => {
      const docRef = doc(db, "academicYears", docItem.id);
      return updateDoc(docRef, { status: "INACTIVE" });
    });

    await Promise.all(updates);

    // Agora, activar o ano Lectivo seleccionado
    await updateDoc(selectedDocRef, { status: "ACTIVE" });
    return { success: true };
  } catch (err) {
    console.error("Erro ao activar ano académico: " + err.message);
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
    if (currentYear.status === "CLOSED") {
      return {
        success: false,
        error: "Não é possível editar um ano académico encerrado.",
      };
    }

    const validation = await validateAcademicYear(data, id);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    // Se ano está ACTIVE, mantemos regra de não quebrar consistência de datas (mesma validação já aplica)
    await updateDoc(docRef, {
      name: validation.value.name,
      startDate: validation.value.startDate,
      endDate: validation.value.endDate,
    });
    return { success: true };
  } catch (err) {
    console.error("Erro ao actualizar ano académico: " + err.message);
    return { success: false, error: err.message };
  }
}

// Função para Encerrar um ano Lectivo
export async function closeAcademicYear(id) {
  try {
    const docRef = doc(db, "academicYears", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: "Ano académico não encontrado." };
    }

    const currentYear = docSnap.data();
    if (currentYear.status === "CLOSED") {
      return { success: false, error: "Ano académico já está encerrado." };
    }

    await updateDoc(docRef, { status: "CLOSED" });
    return { success: true };
  } catch (err) {
    console.error("Erro ao encerrar ano académico: " + err.message);
    return { success: false, error: err.message };
  }
}

// Wrappers para nomes existentes no frontend
export async function createAnoLectivo(data) {
  return createAcademicYear({
    name: data.name ?? data.nome,
    startDate: data.startDate ?? data.dataInicio,
    endDate: data.endDate ?? data.dataFim,
  });
}

export async function getAnoLectivo() {
  return getAcademicYears();
}

export async function activateAnoLectivo(id) {
  return activateAcademicYear(id);
}

export async function updateAnoLectivo(id, data) {
  return updateAcademicYear(id, {
    name: data.name ?? data.nome,
    startDate: data.startDate ?? data.dataInicio,
    endDate: data.endDate ?? data.dataFim,
  });
}

export async function closeAnoLectivo(id) {
  return closeAcademicYear(id);
}
