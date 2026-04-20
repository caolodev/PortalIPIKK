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
import { validateAcademicQuarter } from "./validateNewQuarter";
import { getActiveAcademicYear } from "./academicYear";

const { data: activeYearData } = await getActiveAcademicYear();

const quarterCollection = collection(db, "academicQuarters");

function calculateQuarterStatus(startDate, endDate, yearStatus) {
  if (yearStatus === "CLOSED") return "CLOSED";
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (now < start) return "INACTIVE";
  if (now > end) return "CLOSED";
  return "ACTIVE";
}

export async function getActiveAcademicQuarter() {
  try {
    const snapshot = await getDocs(quarterCollection);
    const activeQuarters = snapshot.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
        status: calculateQuarterStatus(
          d.data().startDate,
          d.data().endDate,
          activeYearData.status,
        ),
      }))
      .find((q) => q.status === "ACTIVE");
    return { success: true, data: activeQuarters || null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function createAcademicQuarter(data) {
  try {
    const yearSnap = await getDoc(
      doc(db, "academicYears", data.academicYearId),
    );
    const yearData = { id: yearSnap.id, ...yearSnap.data() };

    const snapshot = await getDocs(
      query(
        quarterCollection,
        where("academicYearId", "==", data.academicYearId),
      ),
    );
    const existing = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    const validation = validateAcademicQuarter(data, existing, yearData);
    if (!validation.success) return validation;

    const existingNumbers = existing.map((q) => Number(q.number));
    let nextNumber = 1;
    while (existingNumbers.includes(nextNumber)) nextNumber++;

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
    const current = docSnap.data();

    const yearSnap = await getDoc(
      doc(db, "academicYears", current.academicYearId),
    );
    if (yearSnap.data().status === "CLOSED")
      return { success: false, error: "Ano encerrado." };

    // Verificar notas
    const qGrades = query(
      collection(db, "grades"),
      where("quarterId", "==", id),
      limit(1),
    );
    const gradesSnap = await getDocs(qGrades);

    const snapshot = await getDocs(
      query(
        quarterCollection,
        where("academicYearId", "==", current.academicYearId),
      ),
    );
    const existing = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    const validation = validateAcademicQuarter(
      data,
      existing,
      yearSnap.data(),
      {
        currentId: id,
        hasGrades: !gradesSnap.empty,
      },
    );
    if (!validation.success) return validation;

    await updateDoc(docRef, {
      startDate: data.startDate,
      endDate: data.endDate,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getAcademicQuartersByYear(academicYearId, yearStatus) {
  try {
    const snapshot = await getDocs(
      query(quarterCollection, where("academicYearId", "==", academicYearId)),
    );
    const data = snapshot.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
        status: calculateQuarterStatus(
          d.data().startDate,
          d.data().endDate,
          yearStatus,
        ),
      }))
      .sort((a, b) => (a.number || 0) - (b.number || 0));
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteAcademicQuarter(id) {
  try {
    const docRef = doc(db, "academicQuarters", id);
    const docSnap = await getDoc(docRef);
    const current = docSnap.data();

    const qGrades = query(
      collection(db, "grades"),
      where("quarterId", "==", id),
      limit(1),
    );
    const gradesSnap = await getDocs(qGrades);
    if (!gradesSnap.empty)
      return {
        success: false,
        error: "Não pode apagar um trimestre com notas.",
      };

    const yearSnap = await getDoc(
      doc(db, "academicYears", current.academicYearId),
    );
    const status = calculateQuarterStatus(
      current.startDate,
      current.endDate,
      yearSnap.data().status,
    );

    if (status !== "INACTIVE")
      return {
        success: false,
        error: "Apenas trimestres INACTIVE podem ser apagados.",
      };

    await deleteDoc(docRef);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
