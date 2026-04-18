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
import { getClassesByCourse, createClass } from "@/services/classService";
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
  const [bindModal, setBindModal] = useState({ open: false, turma: null });
  const [historyModal, setHistoryModal] = useState({
    open: false,
    turma: null,
    entries: [],
  });
  const [historyLoading, setHistoryLoading] = useState(false);

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

  const handleCreateClass = async ({ classe, turno }) => {
    if (!course || !activeYear) return;
    setActionLoading(true);
    try {
      const result = await createClass({
        cursoId: course.id,
        cursoCode: course.code,
        classe,
        turno,
        anoLectivo: activeYear,
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

  const handleUnbind = async (turma) => {
    const confirmed = window.confirm(
      `Desvincular o director da turma ${turma.nomeExibicao}?`,
    );
    if (!confirmed) return;
    setActionLoading(true);
    try {
      const result = await unbindClassDirector(turma.id);
      if (!result.success) {
        toast.error(result.error || "Erro ao desvincular director de turma.");
      } else {
        toast.success("director de turma desvinculado com sucesso.");
        await refreshClasses();
      }
    } catch (error) {
      toast.error("Erro ao desvincular director de turma.");
    } finally {
      setActionLoading(false);
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
          onClose={() => setNewClassOpen(false)}
          onCreate={handleCreateClass}
          loading={actionLoading}
        />
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
    </div>
  );
}
