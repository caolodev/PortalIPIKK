import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { validateAcademicYear } from "./validateNewYear";

const academicYearCollection = collection(db, "academicYears");

// --- AUXILIARES ---
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

export function generateNameYear(startDate, endDate) {
  const sYear = new Date(startDate).getFullYear();
  const eYear = new Date(endDate).getFullYear();
  return sYear === eYear ? `${sYear}` : `${sYear} - ${eYear}`;
}

// --- CRUD COM REGRAS DE INTEGRIDADE ---

export async function createAcademicYear(data) {
  try {
    const snapshot = await getDocs(academicYearCollection);
    const existingYears = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      status: calculateStatus(d.data().startDate, d.data().endDate),
    }));

    // REGRA: Apenas um ativo por vez
    if (existingYears.some((y) => y.status === "ACTIVE")) {
      return {
        success: false,
        error: "Já existe um ano lectivo activo. Encerre o actual primeiro.",
      };
    }

    const validation = await validateAcademicYear(data, existingYears);
    if (!validation.success) return { success: false, error: validation.error };

    const docRef = await addDoc(academicYearCollection, {
      ...data,
      name: generateNameYear(data.startDate, data.endDate),
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateAcademicYear(id, data) {
  try {
    const docRef = doc(db, "academicYears", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists())
      return { success: false, error: "Ano não encontrado." };

    const current = docSnap.data();
    const status = calculateStatus(current.startDate, current.endDate);

    if (status === "CLOSED")
      return { success: false, error: "Anos encerrados são imutáveis." };

    // Buscar último trimestre para validação de limite
    const qQuarters = query(
      collection(db, "academicQuarters"),
      where("academicYearId", "==", id),
    );
    const quartersSnap = await getDocs(qQuarters);

    let latestQuarterEnd = null;
    if (!quartersSnap.empty) {
      const dates = quartersSnap.docs.map((d) =>
        new Date(d.data().endDate).getTime(),
      );
      latestQuarterEnd = Math.max(...dates);
    }

    // Chamar Validador
    const snapshot = await getDocs(academicYearCollection);
    const existingYears = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    const validation = validateAcademicYear(data, existingYears, {
      currentId: id,
      latestQuarterEnd,
    });

    if (!validation.success) return validation;

    // Regra Extra: Se ACTIVE, trava startDate
    const updatePayload = {
      endDate: data.endDate,
      name: generateNameYear(data.startDate, data.endDate),
      updatedAt: serverTimestamp(),
    };

    if (status !== "ACTIVE") {
      updatePayload.startDate = data.startDate;
    } else if (data.startDate !== current.startDate) {
      return {
        success: false,
        error: "Não é permitido alterar o início de um ano já em curso.",
      };
    }

    await updateDoc(docRef, updatePayload);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteAcademicYear(id) {
  try {
    const docRef = doc(db, "academicYears", id);
    const docSnap = await getDoc(docRef);
    const status = calculateStatus(
      docSnap.data().startDate,
      docSnap.data().endDate,
    );

    if (status !== "INACTIVE")
      return {
        success: false,
        error: "Só é possível apagar anos com status INACTIVE.",
      };

    const qClasses = query(
      collection(db, "class"),
      where("academicYearId", "==", id),
      limit(1),
    );
    const classSnap = await getDocs(qClasses);
    if (!classSnap.empty)
      return { success: false, error: "Este ano já possui turmas vinculadas." };

    await deleteDoc(docRef);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getAcademicYears() {
  try {
    const snapshot = await getDocs(academicYearCollection);
    const data = snapshot.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
        status: calculateStatus(d.data().startDate, d.data().endDate),
      }))
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getActiveAcademicYear() {
  try {
    const snapshot = await getDocs(academicYearCollection);
    const active = snapshot.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
        status: calculateStatus(d.data().startDate, d.data().endDate),
      }))
      .find((y) => y.status === "ACTIVE");
    return { success: true, data: active || null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
