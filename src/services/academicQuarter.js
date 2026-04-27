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
  orderBy,
} from "firebase/firestore";
import { validateAcademicQuarter } from "./validateNewQuarter";
import { getActiveAcademicYear } from "./academicYear";

const quarterCollection = collection(db, "academicQuarters");

// Função pura para derivar o status - Centralizada para evitar inconsistências
export function calculateQuarterStatus(startDate, endDate, yearStatus) {
  if (yearStatus === "CLOSED") return "CLOSED";

  const now = new Date("2026-07-07");
  const start = new Date(startDate);
  const end = new Date(endDate);
  // Garante que o fim do dia conta como ativo
  end.setHours(23, 59, 59, 999);

  if (now < start) return "INACTIVE";
  if (now > end) return "CLOSED";
  return "ACTIVE";
}

export async function getActiveAcademicQuarter() {
  try {
    // 1. Precisamos primeiro do status do ano ativo
    const yearRes = await getActiveAcademicYear();
    if (!yearRes.success || !yearRes.data) return { success: true, data: null };

    const yearData = yearRes.data;
    const snapshot = await getDocs(
      query(quarterCollection, where("academicYearId", "==", yearData.id)),
    );

    // 2. Mapeia e encontra o que está "ACTIVE" pelo cálculo derivado
    const activeQuarter = snapshot.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          status: calculateQuarterStatus(
            data.startDate,
            data.endDate,
            yearData.status,
          ),
        };
      })
      .find((q) => q.status === "ACTIVE");
    return { success: true, data: activeQuarter || null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getAcademicQuartersByYear(academicYearId, yearStatus) {
  try {
    const q = query(
      quarterCollection,
      where("academicYearId", "==", academicYearId),
    );

    const snapshot = await getDocs(q);
    const data = snapshot.docs
      .map((d) => {
        const docData = d.data();
        return {
          id: d.id,
          ...docData,
          status: calculateQuarterStatus(
            docData.startDate,
            docData.endDate,
            yearStatus,
          ),
        };
      })
      .sort((a, b) => (a.number || 0) - (b.number || 0));

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function createAcademicQuarter(data) {
  try {
    const yearSnap = await getDoc(
      doc(db, "academicYears", data.academicYearId),
    );
    if (!yearSnap.exists()) throw new Error("Ano lectivo não encontrado.");

    const yearData = { id: yearSnap.id, ...yearSnap.data() };

    // Bloqueio: Não permitir criar trimestres se o ano já estiver fechado
    if (yearData.status === "CLOSED") {
      return {
        success: false,
        error: "Não é possível criar trimestres em um ano lectivo fechado.",
      };
    }

    const snapshot = await getDocs(
      query(
        quarterCollection,
        where("academicYearId", "==", data.academicYearId),
      ),
    );
    const existing = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Validação de datas e sobreposições
    const validation = validateAcademicQuarter(data, existing, yearData);
    if (!validation.success) return validation;

    const nextNumber = existing.length + 1;
    if (nextNumber > 3)
      return { success: false, error: "Limite de 3 trimestres atingido." };

    const docRef = await addDoc(quarterCollection, {
      ...data,
      number: nextNumber,
      createdAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateAcademicQuarter(id, data) {
  try {
    const docRef = doc(db, "academicQuarters", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Trimestre não encontrado.");

    const current = docSnap.data();

    // Buscar dados do ano para calcular o status atual antes de permitir edição
    const yearSnap = await getDoc(
      doc(db, "academicYears", current.academicYearId),
    );
    const yearData = { id: yearSnap.id, ...yearSnap.data() };

    const currentStatus = calculateQuarterStatus(
      current.startDate,
      current.endDate,
      yearData.status,
    );

    // Bloqueio: Se o trimestre já estiver fechado, impede a edição
    if (currentStatus === "CLOSED") {
      return {
        success: false,
        error: "Não é possível editar um trimestre que já está fechado.",
      };
    }

    // Validação de datas e sobreposições (excluindo o próprio registro)
    const snapshot = await getDocs(
      query(
        quarterCollection,
        where("academicYearId", "==", current.academicYearId),
      ),
    );
    const existing = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((q) => q.id !== id);

    const validation = validateAcademicQuarter(data, existing, yearData);
    if (!validation.success) return validation;

    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteAcademicQuarter(id) {
  try {
    const docRef = doc(db, "academicQuarters", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Trimestre não encontrado.");

    const current = docSnap.data();

    // Bloqueio se houver notas (usando a tua coleção assessments/grades)
    const qAssess = query(
      collection(db, "assessments"),
      where("quarterId", "==", id),
      limit(1),
    );
    const assessSnap = await getDocs(qAssess);

    if (!assessSnap.empty) {
      return {
        success: false,
        error: "Impossível apagar: Existem notas lançadas neste trimestre.",
      };
    }

    const yearRes = await getActiveAcademicYear();
    const status = calculateQuarterStatus(
      current.startDate,
      current.endDate,
      yearRes.data?.status,
    );

    if (status === "ACTIVE") {
      return {
        success: false,
        error: "Não pode apagar um trimestre que está actualmente activo.",
      };
    }

    // Bloqueio: Não permite apagar se o trimestre já estiver fechado
    if (status === "CLOSED") {
      return {
        success: false,
        error: "Não é possível apagar um trimestre que já foi encerrado.",
      };
    }

    await deleteDoc(docRef);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
