import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getActiveCoordinators } from "./courseRoleService";

const courseCollection = collection(db, "courses");
const academicYearCollection = collection(db, "academicYears");
const usersCollection = collection(db, "Users");

// --- FUNÇÕES MANTIDAS E REFORÇADAS ---

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

export async function getCourseById(courseId) {
  try {
    const courseRef = doc(db, "courses", courseId);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists())
      return { success: false, error: "Curso não encontrado." };
    return { success: true, data: { id: courseSnap.id, ...courseSnap.data() } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// --- REGRAS DE ATUALIZAÇÃO E ARQUIVAMENTO ---

export async function updateCourse(id, { name, code }) {
  try {
    const qClass = query(
      collection(db, "class"),
      where("courseId", "==", id),
      limit(1),
    );
    const classSnap = await getDocs(qClass);

    if (!classSnap.empty) {
      return {
        success: false,
        error: "Edição negada: Este curso já possui histórico de turmas.",
      };
    }

    if (!(await isCodeUnique(code, id)))
      return { success: false, error: "Código já em uso." };
    if (!(await isUniqueName(name, id)))
      return { success: false, error: "Nome já em uso." };

    await updateDoc(doc(db, "courses", id), {
      name,
      code: code.toUpperCase(),
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function softDeleteCourse(id) {
  try {
    const qActive = query(
      collection(db, "class"),
      where("courseId", "==", id),
      where("status", "==", "ACTIVE"),
      limit(1),
    );
    const activeSnap = await getDocs(qActive);

    if (!activeSnap.empty) {
      return {
        success: false,
        error: "Não é possível arquivar um curso com turmas ativas.",
      };
    }

    await updateDoc(doc(db, "courses", id), {
      isDelected: true,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// --- LISTAGEM E INSIGHTS COM ESTADOS CALCULADOS ---

async function isCodeUnique(code, currentId = null) {
  const q = query(
    courseCollection,
    where("code", "==", code.toUpperCase()),
    where("isDelected", "==", false),
  );
  const snapshot = await getDocs(q);
  return !snapshot.docs.some((doc) => doc.id !== currentId);
}

async function isUniqueName(name, currentId = null) {
  const q = query(
    courseCollection,
    where("name", "==", name),
    where("isDelected", "==", false),
  );
  const snapshot = await getDocs(q);
  return !snapshot.docs.some((doc) => doc.id !== currentId);
}

export async function createCourse({ name, code }) {
  try {
    if (!(await isCodeUnique(code)))
      return { success: false, error: "Código em uso." };
    if (!(await isUniqueName(name)))
      return { success: false, error: "Nome em uso." };

    const docRef = await addDoc(courseCollection, {
      name,
      code: code.toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDelected: false,
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getCourses(includeArchived = true) {
  try {
    // Filtro inicial: Por padrão, inclui os arquivados. Use false para excluir cursos com isDelected=true.
    const q = includeArchived
      ? query(courseCollection)
      : query(courseCollection, where("isDelected", "==", false));

    const [coursesSnapshot, coordinatorsResult, matrixSnapshot, hasActiveYear] =
      await Promise.all([
        getDocs(q),
        getActiveCoordinators(),
        getDocs(collection(db, "matrixCourse")),
        hasActiveAcademicYear(),
      ]);

    const usersSnapshot = await getDocs(usersCollection);
    const users = usersSnapshot.docs.reduce(
      (acc, d) => ({ ...acc, [d.id]: d.data() }),
      {},
    );
    const coursesWithMatrix = new Set(
      matrixSnapshot.docs.map((d) => d.data().courseId),
    );

    const coordinatorMap = coordinatorsResult.success
      ? coordinatorsResult.data.reduce(
          (acc, c) => ({
            ...acc,
            [c.courseId]: {
              name: users[c.userId]?.nomeCompleto || "Desconhecido",
            },
          }),
          {},
        )
      : {};

    const data = coursesSnapshot.docs.map((doc) => {
      const courseData = doc.data();
      const hasCoord = !!coordinatorMap[doc.id];
      const hasMatrix = coursesWithMatrix.has(doc.id);

      // LÓGICA DE ESTADO (Para os Badges da Imagem)
      let estado = "Configuração"; // Amarelo
      if (courseData.isDelected)
        estado = "Arquivado"; // Cinza
      else if (!hasActiveYear)
        estado = "Inactivo"; // Cinza/Inactivo
      else if (hasCoord && hasMatrix) estado = "Activo"; // Verde

      return {
        id: doc.id,
        ...courseData,
        coordinator: coordinatorMap[doc.id] || null,
        estado,
        hasMatrix,
        academicYearActive: hasActiveYear,
      };
    });

    return { success: true, data, academicYearActive: hasActiveYear };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getInsights() {
  try {
    const result = await getCourses(false); // Apenas ativos/configuração
    if (!result.success) return result;
    const data = result.data;

    return {
      success: true,
      data: {
        totalCourses: data.length,
        courseActive: data.filter((c) => c.estado === "Activo").length,
        courseInactive: data.filter((c) => c.estado === "Configuração").length,
        courseInactivo: data.filter((c) => c.estado === "Inactivo").length,
        courseArchived: data.filter((c) => c.estado === "Arquivado").length,
        academicYearActive: result.academicYearActive,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function hasCourseClasses(courseId) {
  try {
    const q = query(collection(db, "class"), where("courseId", "==", courseId));
    const snapshot = await getDocs(q);
    return { success: true, hasClasses: !snapshot.empty };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
