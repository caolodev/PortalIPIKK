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
import { getActiveAcademicYear } from "./academicYear";

const quarterCollection = collection(db, "academicQuarters");

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

    if (
      data.startDate < yearData.startDate ||
      data.endDate > yearData.endDate
    ) {
      return {
        success: false,
        error: "Datas do trimestre devem estar dentro do ano lectivo.",
      };
    }

    if (data.startDate >= data.endDate) {
      return {
        success: false,
        error: "Data de início deve ser anterior à data de fim.",
      };
    }

    const q = query(
      quarterCollection,
      where("academicYearId", "==", data.academicYearId),
    );
    const snapshot = await getDocs(q);

    const hasConflict = snapshot.docs.some((docItem) => {
      const quarter = docItem.data();
      return (
        data.startDate <= quarter.endDate && data.endDate >= quarter.startDate
      );
    });
    if (hasConflict) {
      return {
        success: false,
        error: "Já existe um trimestre com datas conflitantes.",
      };
    }

    const newQuarter = await addDoc(quarterCollection, {
      name: `${data.number}º Trimestre`,
      number: data.number,
      academicYearId: data.academicYearId,
      startDate: data.startDate,
      endDate: data.endDate,
      createdAt: serverTimestamp(),
      status: "INACTIVE",
    });

    return { success: true, id: newQuarter.id };
  } catch (err) {
    console.error("Erro ao criar trimestre académico: " + err.message);
    return { success: false, error: err.message };
  }
}

// função para listar os trimestres de um ano lectivo
export async function getAcademicQuartersByYear(academicYearId) {
  try {
    const q = query(
      quarterCollection,
      where("academicYearId", "==", academicYearId),
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, data };
  } catch (err) {
    console.error("Erro ao Buscar os trimestres", err.message);
    return { success: false, error: err.message };
  }
}

export async function getActiveAcademicQuarter() {
  try {
    const q = query(quarterCollection, where("status", "==", "ACTIVE"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { success: true, data: null };
    }
    const docData = snapshot.docs[0];
    return { success: true, data: { id: docData.id, ...docData.data() } };
  } catch (err) {
    console.error("Erro ao Buscar o trimestre ativo", err.message);
    return { success: false, error: err.message };
  }
}

export async function activateAcademicQuarter(id) {
  try {
    const docRef = doc(db, "academicQuarters", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return { success: false, error: "Trimestre académico não encontrado." };
    }

    const selected = docSnap.data();
    if (selected.status === "CLOSED") {
      return {
        success: false,
        error: "Não é possível activar um trimestre académico encerrado.",
      };
    }
    const yearRef = doc(db, "academicYears", selected.academicYearId);
    const yearSnap = await getDoc(yearRef);

    if (!yearSnap.exists()) {
      return { success: false, error: "Ano lectivo não encontrado." };
    }

    if (yearSnap.data().status !== "ACTIVE") {
      return {
        success: false,
        error:
          "Não é possível activar um trimestre de um ano lectivo encerrado.",
      };
    }

    const q = query(
      quarterCollection,
      where("academicYearId", "==", selected.academicYearId),
      where("status", "==", "ACTIVE"),
    );
    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map((docItem) => {
      const docRef = doc(db, "academicQuarters", docItem.id);
      return updateDoc(docRef, { status: "INACTIVE" });
    });

    await Promise.all(updates);
    await updateDoc(docRef, { status: "ACTIVE" });
    return { success: true };
  } catch (err) {
    console.error("Erro ao ativar trimestre académico: " + err.message);
    return { success: false, error: err.message };
  }
}

export async function closeAcademicQuarter(id) {
  try {
    const docRef = doc(db, "academicQuarters", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: "Trimestre académico não encontrado." };
    }
    await updateDoc(docRef, { status: "CLOSED" });
    return { success: true };
  } catch (err) {
    console.error("Erro ao encerrar trimestre académico: " + err.message);
    return { success: false, error: err.message };
  }
}

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
    await updateDoc(docRef, {
      name: `${data.number}º Trimestre`,
      number: data.number,
      startDate: data.startDate,
      endDate: data.endDate,
    });
    return { success: true };
  } catch (err) {
    console.error("Erro ao atualizar trimestre académico: " + err.message);
    return { success: false, error: err.message };
  }
}

