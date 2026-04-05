import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getActiveCoordinators } from "./courseRoleService";

const courseCollection = collection(db, "courses");
const academicYearCollection = collection(db, "academicYears");
const usersCollection = collection(db, "Users");

// Auxiliar: Verifica se existe algum ano lectivo a decorrer hoje
export async function hasActiveAcademicYear() {
  const snapshot = await getDocs(academicYearCollection);
  const now = new Date();

  return snapshot.docs.some((doc) => {
    const data = doc.data();
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return now >= start && now <= end;
  });
}

async function isCodeUnique(code, currentId = null) {
  const q = query(courseCollection, where("code", "==", code.toUpperCase()));
  const snapshot = await getDocs(q);
  return !snapshot.docs.some((doc) => doc.id !== currentId);
}

async function isUniqueName(name, currentId = null) {
  const q = query(courseCollection, where("name", "==", name));
  const snapshot = await getDocs(q);
  return !snapshot.docs.some((doc) => doc.id !== currentId);
}

export async function createCourse({ name, code }) {
  try {
    if (await hasActiveAcademicYear()) {
      return {
        success: false,
        error: "Não pode criar cursos durante um ano lectivo activo.",
      };
    }

    if (!(await isCodeUnique(code))) {
      return { success: false, error: "Este código de curso já está em uso." };
    }

    if (!(await isUniqueName(name))) {
      return { success: false, error: "Este nome de curso já está em uso." };
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

export async function getCourses() {
  try {
    const [coursesSnapshot, coordinatorsResult, hasActiveYear] =
      await Promise.all([
        getDocs(courseCollection),
        getActiveCoordinators(),
        hasActiveAcademicYear(),
      ]);

    const courses = coursesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get users for coordinators
    const usersSnapshot = await getDocs(usersCollection);
    const users = usersSnapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data();
      return acc;
    }, {});

    // Map coordinators to courses
    const coordinatorMap = coordinatorsResult.success
      ? coordinatorsResult.data.reduce((acc, c) => {
          acc[c.courseId] = {
            name:
              users[c.userId]?.name ||
              users[c.userId]?.nomeCompleto ||
              "Unknown",
            since: new Date(c.startDate).getFullYear(),
          };
          return acc;
        }, {})
      : {};

    // Calculate active state:
    // - Se há ano lectivo activo: curso é "activo" apenas se tem coordenador
    // - Se não há ano lectivo activo: sistema em modo configuração, todos os cursos são "inactivos"
    const coursesWithCoordinators = courses.map((course) => ({
      ...course,
      coordinator: coordinatorMap[course.id] || null,
      active: hasActiveYear && !!coordinatorMap[course.id], // Active only if academic year is active AND has coordinator
      academicYearActive: hasActiveYear,
    }));

    return {
      success: true,
      data: coursesWithCoordinators,
      academicYearActive: hasActiveYear,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getInsights() {
  try {
    const result = await getCourses();
    if (!result.success) return result;

    const data = result.data;
    const hasActiveYear = result.academicYearActive;

    const totalCourses = data.length;
    const coursesWithCoordinators = data.filter(
      (course) => course.coordinator,
    ).length;
    const coursesWithoutCoordinators = totalCourses - coursesWithCoordinators;
    // Active = has coordinator AND academic year is active
    const courseActive = hasActiveYear ? coursesWithCoordinators : 0;
    const courseInactive = hasActiveYear
      ? coursesWithoutCoordinators
      : totalCourses;
    return {
      success: true,
      data: {
        totalCourses,
        courseActive,
        courseInactive,
        coursesWithCoordinators,
        coursesWithoutCoordinators,
        academicYearActive: hasActiveYear,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getProfessors() {
  try {
    const q = query(usersCollection, where("role", "==", "PROFESSOR"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
