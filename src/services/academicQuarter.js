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
import { validateAcademicQuarter } from "./validateNewQuarter";

const quarterCollection = collection(db, "academicQuarters");

function generateQuarterName(number) {
  return `${number}º Trimestre`;
}

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

function getNextQuarterNumber(existingQuarters) {
  if (existingQuarters.length === 0) return 1;

  // Validar limite de 3 trimestres
  if (existingQuarters.length >= 3) {
    return null; // Sinal de que atingiu o limite
  }

  const maxNumber = Math.max(...existingQuarters.map((q) => q.number));
  return maxNumber + 1;
}

// Função para criar um novo trimestre académico
export async function createAcademicQuarter(data) {
  try {
    const yearRef = doc(db, "academicYears", data.academicYearId);
    const yearSnap = await getDoc(yearRef);
    if (!yearSnap.exists()) {
      return { success: false, error: "Ano lectivo não encontrado." };
    }

    const yearData = yearSnap.data();
    if (yearData.status === "CLOSED") {
      return {
        success: false,
        error: "Não é possível adicionar trimestre a um ano lectivo encerrado.",
      };
    }

    const q = query(
      quarterCollection,
      where("academicYearId", "==", data.academicYearId),
    );
    const snapshot = await getDocs(q);
    const existingQuarters = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Validar limite máximo de 3 trimestres
    if (existingQuarters.length >= 3) {
      return {
        success: false,
        error: "O ano lectivo já possui o máximo de 3 trimestres permitidos.",
      };
    }

    const number = getNextQuarterNumber(existingQuarters);
    const validation = validateAcademicQuarter(
      data,
      existingQuarters,
      yearData,
    );
    if (!validation.success) return validation;

    const newQuarter = await addDoc(quarterCollection, {
      name: generateQuarterName(number),
      number,
      academicYearId: data.academicYearId,
      startDate: data.startDate,
      endDate: data.endDate,
      createdAt: serverTimestamp(),
    });

    return { success: true, id: newQuarter.id };
  } catch (err) {
    console.error("Erro ao criar trimestre académico: " + err.message);
    return { success: false, error: err.message };
  }
}

// função para listar os trimestres de um ano lectivo com sincronização de status
export async function getAcademicQuartersByYear(academicYearId) {
  try {
    const q = query(
      quarterCollection,
      where("academicYearId", "==", academicYearId),
    );

    const snapshot = await getDocs(q);

    const quarters = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();

      return {
        id: docSnap.id,
        ...data,
        status: calculateStatus(data.startDate, data.endDate),
      };
    });

    return {
      success: true,
      data: quarters.sort((a, b) => a.number - b.number),
    };
  } catch (err) {
    console.error("Erro ao Buscar os trimestres", err.message);
    return { success: false, error: err.message };
  }
}

// Função para obter o trimestre ativo
export async function getActiveAcademicQuarter() {
  try {
    const snapshot = await getDocs(quarterCollection);
    const activeQuarter = snapshot.docs
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

    if (!activeQuarter) {
      return { success: true, data: null };
    }
    return {
      success: true,
      data: {
        id: activeQuarter.id,
        ...activeQuarter,
        status: calculateStatus(activeQuarter.startDate, activeQuarter.endDate),
      },
    };
  } catch (err) {
    console.error("Erro ao Buscar o trimestre ativo", err.message);
    return { success: false, error: err.message };
  }
}

// Função para atualizar um trimestre académico
export async function updateAcademicQuarter(id, data) {
  try {
    const docRef = doc(db, "academicQuarters", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return { success: false, error: "Trimestre académico não encontrado." };
    }

    const current = docSnap.data();
    if (current.status === "CLOSED") {
      return {
        success: false,
        error: "Não é possível editar um trimestre académico encerrado.",
      };
    }

    const yearRef = doc(db, "academicYears", current.academicYearId);
    const yearSnap = await getDoc(yearRef);
    const yearData = yearSnap.data();

    const q = query(
      quarterCollection,
      where("academicYearId", "==", current.academicYearId),
    );
    const snapshot = await getDocs(q);
    const existingQuarters = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const validation = validateAcademicQuarter(
      data,
      existingQuarters,
      yearData,
      { currentId: id },
    );
    if (!validation.success) return validation;

    await updateDoc(docRef, {
      startDate: data.startDate,
      endDate: data.endDate,
    });
    return { success: true };
  } catch (err) {
    console.error("Erro ao atualizar trimestre académico: " + err.message);
    return { success: false, error: err.message };
  }
}
