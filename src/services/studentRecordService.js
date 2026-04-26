import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

const studentRecordsCollection = collection(db, "studentsRecords");
const usersCollection = collection(db, "Users");

export async function getStudentsByUserId(userId) {
  try {
    const q = query(studentRecordsCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const studentRecords = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    return { success: true, data: studentRecords };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
}
