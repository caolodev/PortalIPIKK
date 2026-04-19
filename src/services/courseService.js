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
import { getActiveAcademicYear } from "./academicYear";

const courseCollection = collection(db, "courses");
const academicYearCollection = collection(db, "academicYears");
const usersCollection = collection(db, "Users");

// Obter coordenadores ativos para múltiplos cursos
export async function getCoordinatorsForCourses(courseIds) {
  try {
    if (!courseIds || courseIds.length === 0) {
      return { success: true, data: {} };
    }

    const q = query(
      collection(db, "courseRoles"),
      where("role", "==", "COORDENADOR"),
    );
    const snapshot = await getDocs(q);

    const usersSnapshot = await getDocs(usersCollection);
    const users = usersSnapshot.docs.reduce(
      (acc, d) => ({ ...acc, [d.id]: d.data() }),
      {},
    );

    const coordinatorMap = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      // Filtrar apenas coordenadores ativos (sem endDate) e dos cursos solicitados
      if (!data.endDate && courseIds.includes(data.courseId)) {
        coordinatorMap[data.courseId] = {
          name: users[data.userId]?.nomeCompleto || "Desconhecido",
          startDate: data.startDate,
        };
      }
    });

    return { success: true, data: coordinatorMap };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

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

export async function hasClassActive(id) {
  try {
    const activeYear = await getActiveAcademicYear();
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// --- REGRAS DE ATUALIZAÇÃO E ARQUIVAMENTO ---

export async function updateCourse(id, { name, code }) {
  try {
    const activeYearResult = await getActiveAcademicYear();
    if (activeYearResult.success && activeYearResult.data) {
      const activeYearId = activeYearResult.data.id;
      const qClass = query(
        collection(db, "class"),
        where("cursoId", "==", id),
        where("anoLectivoId", "==", activeYearId),
        where("isDeleted", "==", false),
        limit(1),
      );
      const classSnap = await getDocs(qClass);

      if (!classSnap.empty) {
        return {
          success: false,
          error:
            "Edição negada: Este curso não pode ser alterado enquanto possuir turmas no ano lectivo activo.",
        };
      }
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
    // Restringir o delete para turmas activas
    const activeYearResult = await getActiveAcademicYear();
    if (activeYearResult.success && activeYearResult.data) {
      const activeYearId = activeYearResult.data.id;
      const qYear = query(
        collection(db, "class"),
        where("cursoId", "==", id),
        where("anoLectivoId", "==", activeYearId),
        where("isDeleted", "==", false),
        limit(1),
      );
      const yearSnap = await getDocs(qYear);
      if (!yearSnap.empty) {
        return {
          success: false,
          error:
            "Não é possível arquivar um curso com turmas no ano lectivo activo.",
        };
      }
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

    const [coursesSnapshot, hasActiveYear, activeYearData, classesSnapshot] =
      await Promise.all([
        getDocs(q),
        hasActiveAcademicYear(),
        getActiveAcademicYear(),
        // Buscar todas as turmas para saber que cursos têm classes
        getDocs(collection(db, "class")),
      ]);

    // Buscar coordenadores apenas após ter os IDs dos cursos
    const coordinatorsResult = await getCoordinatorsForCourses(
      coursesSnapshot.docs.map((doc) => doc.id),
    );

    const usersSnapshot = await getDocs(usersCollection);
    const users = usersSnapshot.docs.reduce(
      (acc, d) => ({ ...acc, [d.id]: d.data() }),
      {},
    );

    const coursesWithClassesInActiveYear = new Set();

    classesSnapshot.docs.forEach((classDoc) => {
      const classData = classDoc.data();
      if (!classData.cursoId || classData.isDeleted === true) return;

      if (activeYearData && activeYearData.data) {
        if (classData.anoLectivoId === activeYearData.data.id) {
          coursesWithClassesInActiveYear.add(classData.cursoId);
        }
      }
    });

    const coordinatorMap = coordinatorsResult.success
      ? coordinatorsResult.data
      : {};

    const data = coursesSnapshot.docs.map((doc) => {
      const courseData = doc.data();
      const hasClassesInActiveYear = coursesWithClassesInActiveYear.has(doc.id);

      // LÓGICA DE ESTADO (Para os Badges da Imagem)
      let estado = "Configuração"; // Amarelo
      if (courseData.isDelected)
        estado = "Arquivado"; // Cinza
      else if (!hasActiveYear)
        estado = "Inactivo"; // Cinza/Inactivo
      else if (hasClassesInActiveYear && hasActiveYear) estado = "Activo"; // Verde - tem turmas E ano activo

      return {
        id: doc.id,
        ...courseData,
        coordinator: coordinatorMap[doc.id] || null,
        hasHistory: hasClassesInActiveYear,
        hasActiveClass: hasClassesInActiveYear,
        estado,
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
    const activeYearResult = await getActiveAcademicYear();
    if (!activeYearResult.success || !activeYearResult.data) {
      return { success: true, hasClasses: false };
    }

    const activeYearId = activeYearResult.data.id;
    const q = query(
      collection(db, "class"),
      where("cursoId", "==", courseId),
      where("anoLectivoId", "==", activeYearId),
      where("isDeleted", "==", false),
      limit(1),
    );
    const snapshot = await getDocs(q);
    return { success: true, hasClasses: !snapshot.empty };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
