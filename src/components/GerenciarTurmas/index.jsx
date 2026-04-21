"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import InsightCards from "@/components/GerenciarTurmas/InsightCards";
import ClassFiltersSection from "@/components/GerenciarTurmas/ClassFiltersSection";
import ClassTableSection from "@/components/GerenciarTurmas/ClassTableSection";
import ModalsContainer from "@/components/GerenciarTurmas/ModalsContainer";
import {
  getClassesByCourse,
  createClass,
  updateClass,
  deleteClass,
  hasStudentsInClass,
} from "@/services/classService";
import {
  bindClassDirector,
  unbindClassDirector,
  getClassDirectorHistory,
} from "@/services/classRoleService";
import { getCourseById, getProfessors } from "@/services/courseService";
import { getActiveAcademicYear } from "@/services/academicYear";
import { getActiveCourseForCoordinator } from "@/services/courseRoleService";

export default function GerenciarTurmas() {
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [classes, setClasses] = useState([]);
  const [filterClass, setFilterClass] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [newClassOpen, setNewClassOpen] = useState(false);
  const [editClassOpen, setEditClassOpen] = useState(false);
  const [editTurma, setEditTurma] = useState(null);
  const [editTurmaHasStudents, setEditTurmaHasStudents] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteHasStudents, setDeleteHasStudents] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bindModal, setBindModal] = useState({ open: false, turma: null });
  const [historyModal, setHistoryModal] = useState({
    open: false,
    turma: null,
    entries: [],
  });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [directorToUnbind, setDirectorToUnbind] = useState(null);
  const [isUnbindingDirector, setIsUnbindingDirector] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadPage() {
      setLoading(true);

      const courseRoleRes = await getActiveCourseForCoordinator(user.uid);
      if (!courseRoleRes.success) {
        toast.error("Não foi possível carregar o curso do coordenador.");
        setLoading(false);
        return;
      }

      if (!courseRoleRes.data) {
        setCourse(null);
        setLoading(false);
        return;
      }

      const courseRes = await getCourseById(courseRoleRes.data.courseId);
      if (!courseRes.success) {
        toast.error(courseRes.error || "Erro ao buscar curso.");
        setLoading(false);
        return;
      }

      const activeYearRes = await getActiveAcademicYear();
      if (!activeYearRes.success) {
        toast.error(activeYearRes.error || "Erro ao buscar ano lectivo.");
        setLoading(false);
        return;
      }

      setCourse(courseRes.data);
      setActiveYear(activeYearRes.data);

      if (!activeYearRes.data) {
        setClasses([]);
        setLoading(false);
        return;
      }

      const classesRes = await getClassesByCourse(
        courseRes.data.id,
        activeYearRes.data.id,
      );
      if (!classesRes.success) {
        toast.error(classesRes.error || "Erro ao carregar turmas.");
        setClasses([]);
      } else {
        setClasses(classesRes.data);
      }

      setLoading(false);
    }

    loadPage();
  }, [user]);

  const filteredClasses = useMemo(() => {
    if (filterClass === "ALL") return classes;
    return classes.filter((turma) => turma.classe === filterClass);
  }, [classes, filterClass]);

  const classOptions = useMemo(() => {
    const uniqueClasses = Array.from(
      new Set(classes.map((turma) => turma.classe).filter(Boolean)),
    );
    return uniqueClasses.sort((a, b) => Number(a) - Number(b));
  }, [classes]);

  function formatClasseLabel(classe) {
    if (!classe) return "-";
    return classe.toString().endsWith("ª") ? classe : `${classe}ª`;
  }

  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / 5));
  const displayedClasses = filteredClasses.slice(
    (currentPage - 1) * 5,
    currentPage * 5,
  );

  const insightData = useMemo(() => {
    const total = classes.length;
    const active = classes.filter((item) => item.active).length;
    const inactive = total - active;
    return {
      total,
      active,
      inactive,
      activePct: total ? Math.round((active / total) * 100) : 0,
      inactivePct: total ? Math.round((inactive / total) * 100) : 0,
    };
  }, [classes]);

  const refreshClasses = async () => {
    if (!course || !activeYear) return;
    setLoading(true);
    const classesRes = await getClassesByCourse(course.id, activeYear.id);
    if (!classesRes.success) {
      toast.error(classesRes.error || "Erro ao recarregar turmas.");
      setClasses([]);
    } else {
      setClasses(classesRes.data);
    }
    setLoading(false);
  };

  const handleCreateClass = async ({
    classe,
    turno,
    courseCode,
    sigla,
    nomeBase,
    nomeExibicao,
  }) => {
    if (!course || !activeYear) return;
    setActionLoading(true);
    try {
      const result = await createClass({
        cursoId: course.id,
        cursoCode: courseCode || course.code,
        classe,
        turno,
        anoLectivo: activeYear,
        sigla,
        nomeBase,
        nomeExibicao,
      });
      if (!result.success) {
        toast.error(result.error || "Erro ao criar turma.");
      } else {
        toast.success("Turma criada com sucesso.");
        setNewClassOpen(false);
        await refreshClasses();
      }
    } catch (error) {
      toast.error("Erro ao criar turma.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = async (turma) => {
    setEditTurma(turma);
    setEditClassOpen(true);
    // Verificar estudantes em background
    try {
      const students = await hasStudentsInClass(turma.id);
      setEditTurmaHasStudents(students);
    } catch (error) {
      toast.error("Erro ao verificar estado da turma.");
      console.error(error);
    }
  };

  const handleUpdateClass = async ({
    classe,
    turno,
    courseCode,
    sigla,
    nomeBase,
    nomeExibicao,
  }) => {
    if (!editTurma) return;
    setActionLoading(true);
    try {
      const result = await updateClass(
        editTurma.id,
        editTurma.academicYearActive,
        {
          classe,
          turno,
          courseCode,
          sigla,
          nomeBase,
          nomeExibicao,
        },
      );
      if (!result.success) {
        toast.error(result.error || "Erro ao atualizar turma.");
      } else {
        toast.success("Turma atualizada com sucesso.");
        setEditClassOpen(false);
        setEditTurma(null);
        setEditTurmaHasStudents(false);
        await refreshClasses();
      }
    } catch (error) {
      toast.error("Erro ao atualizar turma.");
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRequest = async (turma) => {
    setDeleteConfirm(turma);
    // Verificar estudantes em background
    try {
      const students = await hasStudentsInClass(turma.id);
      setDeleteHasStudents(students);
    } catch (error) {
      toast.error("Erro ao verificar estado da turma.");
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      const result = await deleteClass(
        deleteConfirm.id,
        deleteConfirm.academicYearActive,
      );
      if (!result.success) {
        toast.error(result.error || "Erro ao eliminar turma.");
      } else {
        toast.success("Turma eliminada com sucesso.");
        setDeleteConfirm(null);
        await refreshClasses();
      }
    } catch (error) {
      toast.error("Erro ao eliminar turma.");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUnbind = async (turma) => {
    setDirectorToUnbind(turma);
  };

  const handleConfirmUnbind = async () => {
    if (!directorToUnbind) return;
    setIsUnbindingDirector(true);
    try {
      const result = await unbindClassDirector(directorToUnbind.id);
      if (!result.success) {
        toast.error(result.error || "Erro ao desvincular director de turma.");
      } else {
        toast.success("Director de turma desvinculado com sucesso.");
        await refreshClasses();
        setDirectorToUnbind(null);
      }
    } catch (error) {
      toast.error("Erro ao desvincular director de turma.");
      console.error("Error unbinding director:", error);
    } finally {
      setIsUnbindingDirector(false);
    }
  };

  const handleHistory = async (turma) => {
    setHistoryLoading(true);
    setHistoryModal({ open: true, turma, entries: [] });
    try {
      const historyRes = await getClassDirectorHistory(turma.id);
      if (!historyRes.success) {
        toast.error(historyRes.error || "Erro ao carregar histórico.");
        setHistoryModal({ open: true, turma, entries: [] });
        return;
      }

      const professorsRes = await getProfessors();
      const usersMap = professorsRes.success
        ? professorsRes.data.reduce((acc, userItem) => {
            acc[userItem.id] = userItem.nomeCompleto || userItem.name;
            return acc;
          }, {})
        : {};

      const entries = historyRes.data.map((item) => ({
        ...item,
        name: usersMap[item.userId] || "Professor desconhecido",
      }));

      setHistoryModal({ open: true, turma, entries });
    } catch (error) {
      toast.error("Erro ao carregar histórico.");
      setHistoryModal({ open: true, turma, entries: [] });
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-10 relative sm:text-[1rem] text-[0.8rem]">
        <PageHeader
          title="Gestão de Turmas"
          description="Carregando turmas e informações do curso..."
          fontAwesomeIcon={faClockRotateLeft}
          buttonText="Nova Turma"
          buttonTitle="Aguarde o carregamento"
          buttonDisabled
        />
        <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <FontAwesomeIcon
            icon={faSpinner}
            className="animate-spin text-2xl text-[#0F2C59]"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 relative sm:text-[1rem] text-[0.8rem]">
      <PageHeader
        title="Gestão de Turmas"
        description={
          course
            ? `Gerencie as turmas do curso ${course.name}`
            : "Nenhum curso de coordenação encontrado."
        }
        fontAwesomeIcon={faClockRotateLeft}
        buttonText="Nova Turma"
        buttonTitle={
          activeYear ? "Adicionar nova turma" : "Não há ano lectivo activo"
        }
        onButtonClick={() => setNewClassOpen(true)}
        buttonDisabled={!course || !activeYear || actionLoading}
      />

      <InsightCards insightData={insightData} />

      <ClassFiltersSection
        filterClass={filterClass}
        setFilterClass={setFilterClass}
        setCurrentPage={setCurrentPage}
        classes={classes}
        activeYear={activeYear}
      />

      <ClassTableSection
        displayedClasses={displayedClasses}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        filteredClasses={filteredClasses}
        onBind={(turma) => setBindModal({ open: true, turma })}
        onUnbind={handleUnbind}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteRequest}
        onHistory={handleHistory}
        actionLoading={actionLoading}
      />

      <ModalsContainer
        newClassOpen={newClassOpen}
        setNewClassOpen={setNewClassOpen}
        editClassOpen={editClassOpen}
        setEditClassOpen={setEditClassOpen}
        editTurma={editTurma}
        setEditTurma={setEditTurma}
        editTurmaHasStudents={editTurmaHasStudents}
        setEditTurmaHasStudents={setEditTurmaHasStudents}
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        deleteHasStudents={deleteHasStudents}
        isDeleting={isDeleting}
        handleConfirmDelete={handleConfirmDelete}
        bindModal={bindModal}
        setBindModal={setBindModal}
        historyModal={historyModal}
        setHistoryModal={setHistoryModal}
        historyLoading={historyLoading}
        course={course}
        activeYear={activeYear}
        actionLoading={actionLoading}
        handleCreateClass={handleCreateClass}
        handleUpdateClass={handleUpdateClass}
        refreshClasses={refreshClasses}
      />

      {directorToUnbind && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setDirectorToUnbind(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl p-6">
            <h2 className="text-xl font-semibold text-[#0F2C59] mb-4">
              Desvincular Director?
            </h2>
            <p className="text-gray-600 mb-6">
              Tem a certeza que deseja desvincular o director da turma{" "}
              <strong>{directorToUnbind.nomeExibicao}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={isUnbindingDirector}
                onClick={() => setDirectorToUnbind(null)}
                className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmUnbind}
                disabled={isUnbindingDirector}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUnbindingDirector ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin /> Desvinculando...
                  </>
                ) : (
                  "Desvincular"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
