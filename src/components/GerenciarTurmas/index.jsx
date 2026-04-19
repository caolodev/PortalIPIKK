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
import PaginationControls from "@/components/PaginationControls";
import InsightCards from "@/components/GerenciarTurmas/InsightCards";
import ClassTable from "@/components/GerenciarTurmas/ClassTable";
import NewClassModal from "@/components/GerenciarTurmas/NewClassModal";
import BindDirectorModal from "@/components/GerenciarTurmas/BindDirectorModal";
import HistoryModal from "@/components/GerenciarTurmas/HistoryModal";
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

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="text-sm text-gray-500 whitespace-nowrap">
            Filtrar por classe
          </span>
          <div className="flex flex-wrap items-center gap-2 bg-gray-100 border border-gray-200 rounded-full p-1">
            {[
              { value: "ALL", label: "Todas" },
              ...classOptions.map((classeOption) => ({
                value: classeOption,
                label: formatClasseLabel(classeOption),
              })),
            ].map((option) => {
              const isActive = filterClass === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFilterClass(option.value);
                    setCurrentPage(1);
                  }}
                  className={`rounded-full px-3.5 py-1 text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-white border border-gray-200 font-medium text-slate-900"
                      : "text-gray-500 hover:bg-white hover:text-gray-800"
                  }`}
                >
                  {option.label == "Todas"
                    ? option.label
                    : `${option.label} classe`}
                </button>
              );
            })}
          </div>
        </div>

        {activeYear ? (
          <span className="text-xs text-gray-500">
            Ano lectivo activo: {activeYear.name}
          </span>
        ) : (
          <span className="text-xs text-yellow-700">
            Nenhum ano lectivo activo. Não é possível criar turmas.
          </span>
        )}
      </div>

      <ClassTable
        classes={displayedClasses}
        onBind={(turma) => setBindModal({ open: true, turma })}
        onUnbind={handleUnbind}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteRequest}
        onHistory={handleHistory}
        actionLoading={actionLoading}
      />

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        itemsCount={filteredClasses.length}
        itemName="turmas"
        onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      />

      {newClassOpen && (
        <NewClassModal
          mode="create"
          courseCode={course?.code}
          courseId={course?.id}
          activeYearName={activeYear?.name}
          academicYearActive={!!activeYear}
          onClose={() => setNewClassOpen(false)}
          onSubmit={handleCreateClass}
          loading={actionLoading}
          submitLabel="Criar Turma"
          disableSubmit={!activeYear}
          disableReason={
            !activeYear
              ? "Não é possível criar turmas sem um ano lectivo activo."
              : undefined
          }
        />
      )}

      {editClassOpen && editTurma && (
        <NewClassModal
          mode="edit"
          courseCode={course?.code}
          activeYearName={activeYear?.name}
          academicYearActive={editTurma.academicYearActive}
          initialData={{ classe: editTurma.classe, turno: editTurma.turno }}
          onClose={() => {
            setEditClassOpen(false);
            setEditTurma(null);
            setEditTurmaHasStudents(false);
          }}
          onSubmit={handleUpdateClass}
          loading={actionLoading}
          submitLabel="Guardar Alterações"
          disableSubmit={!editTurma.academicYearActive || editTurmaHasStudents}
          disableReason={
            editTurmaHasStudents
              ? "Esta turma não pode ser alterada porque possui alunos matriculados."
              : !editTurma.academicYearActive
                ? "Esta turma não pode ser alterada porque pertence a um ano lectivo encerrado."
                : undefined
          }
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-red-700">
                Confirmar eliminação de turma
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Tem certeza que deseja eliminar a turma{" "}
                <strong>{deleteConfirm.nomeExibicao}</strong>? Esta ação é
                irreversível e só pode ser feita se não houver alunos
                vinculados.
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">
              {deleteHasStudents || !deleteConfirm.academicYearActive ? (
                <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                  {deleteHasStudents
                    ? "Não é possível eliminar esta turma porque existem alunos vinculados."
                    : "Não é possível eliminar esta turma porque pertence a um ano lectivo encerrado."}
                </div>
              ) : null}
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={
                    isDeleting ||
                    deleteHasStudents ||
                    !deleteConfirm.academicYearActive
                  }
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> Eliminando...
                    </>
                  ) : (
                    "Confirmar Eliminação"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {bindModal.open && (
        <BindDirectorModal
          turma={bindModal.turma}
          onClose={() => setBindModal({ open: false, turma: null })}
          onBind={async () => {
            setBindModal({ open: false, turma: null });
            await refreshClasses();
          }}
        />
      )}
      {historyModal.open && (
        <HistoryModal
          turma={historyModal.turma}
          entries={historyModal.entries}
          loading={historyLoading}
          onClose={() =>
            setHistoryModal({ open: false, turma: null, entries: [] })
          }
        />
      )}

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
