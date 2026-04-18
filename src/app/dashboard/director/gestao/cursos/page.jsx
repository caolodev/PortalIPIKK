"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PageHeader from "@/components/PageHeader";
import toast from "react-hot-toast";
import CourseTable from "@/components/CourseTable";
import EditCourse from "@/components/EditCourse";
import { faSpinner, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useCallback } from "react";
import NewCourse from "@/components/NewCourse";
import InsightCourse from "@/components/InsightCourse";

import VincularCoordinator from "@/components/VincularCoordinator";
import HistoryCoordinator from "@/components/HistoryCoordinator";
import FilterCourseStatus from "@/components/FilterCourseStatus";
import PaginationControls from "@/components/PaginationControls";
import {
  getCourses,
  getInsights,
  hasCourseClasses,
  softDeleteCourse,
} from "@/services/courseService";
import { unbindCoordinator } from "@/services/courseRoleService";
export default function Cursos() {
  const [isOpen, setIsOpen] = useState(false);

  const [vincularModal, setVincularModal] = useState({
    isOpen: false,
    course: null,
  });
  const [historyModal, setHistoryModal] = useState({
    isOpen: false,
    course: null,
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [academicYearActive, setAcademicYearActive] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isCheckingHistory, setIsCheckingHistory] = useState(false);
  const [courseToDeactivate, setCourseToDeactivate] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // fetchData estável — não recria a cada render
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [coursesResult, insightsResult] = await Promise.all([
        getCourses(),
        getInsights(),
      ]);

      if (coursesResult.success) {
        setCourses(coursesResult.data);
        setAcademicYearActive(coursesResult.academicYearActive || false);
      } else {
        console.error("Erro ao carregar cursos:", coursesResult.error);
      }

      if (insightsResult.success) {
        setInsights(insightsResult.data);
      } else {
        console.error("Erro ao carregar insights:", insightsResult.error);
      }
    } catch (error) {
      toast.error("Erro ao carregar dados dos cursos.");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Recarrega quando a quantidade de cursos mudar (ex: após criar um novo curso)

  const filteredCourses = courses.filter((course) => {
    if (filterStatus === "ALL") return course.estado !== "Arquivado";
    if (filterStatus === "ACTIVE") return course.estado === "Activo";
    if (filterStatus === "INACTIVE")
      return course.estado === "Configuração" || course.estado === "Inactivo";
    return true; // fallback
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCourses.length / rowsPerPage),
  );
  const displayedCourses = filteredCourses.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, courses]);

  const handleDesvincular = async (course) => {
    if (!course.coordinator) {
      toast.error("Este curso não possui coordenador para desvincular.");
      return;
    }

    const confirmDesvincular = window.confirm(
      `Tem certeza que deseja desvincular ${course.coordinator.name} do curso ${course.name}?`,
    );

    if (!confirmDesvincular) return;

    try {
      const result = await unbindCoordinator(course.id);
      if (result.success) {
        toast.success("Coordenador desvinculado com sucesso!");
        fetchData(); // Recarregar dados
      } else {
        toast.error(result.error || "Erro ao desvincular coordenador.");
      }
    } catch (error) {
      toast.error("Erro ao desvincular coordenador.");
      console.error("Error unbinding coordinator:", error);
    }
  };

  const handleEditCourse = async (course) => {
    setIsCheckingHistory(true);
    try {
      const result = await hasCourseClasses(course.id);
      if (!result.success) {
        toast.error(result.error || "Erro ao verificar histórico do curso.");
        return;
      }
      setEditingCourse({ ...course, hasHistory: result.hasClasses });
    } finally {
      setIsCheckingHistory(false);
    }
  };

  const closeEditCourse = () => {
    setEditingCourse(null);
  };

  const handleDeactivateCourse = (course) => {
    setCourseToDeactivate(course);
  };

  const handleConfirmDeactivate = async () => {
    if (!courseToDeactivate) return;
    setIsDeactivating(true);
    try {
      const result = await softDeleteCourse(courseToDeactivate.id);
      if (result.success) {
        toast.success(
          "Curso arquivado com sucesso. Dados históricos preservados.",
        );
        fetchData();
        setCourseToDeactivate(null);
      } else {
        toast.error(result.error || "Erro ao arquivar o curso.");
      }
    } catch (error) {
      toast.error(error.message || "Erro ao arquivar o curso.");
      console.error("Erro ao desativar curso:", error);
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div className="mt-10 relative sm:text-[1rem] text-[0.8rem]">
      <PageHeader
        title="Cursos"
        fontAwesomeIcon={faGraduationCap}
        description="Gerencie os cursos oferecidos pela instituição."
        buttonText="Curso"
        onButtonClick={setIsOpen}
        buttonTitle={"Adicionar Curso"}
      />
      {loading ? (
        <div className="flex items-center justify-center mt-10 flex-col gap-4">
          <FontAwesomeIcon
            icon={faSpinner}
            className="animate-spin text-gray-500"
          />
          <p>Carregando cursos...</p>
        </div>
      ) : (
        <div className="mt-6">
          {courses.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Nenhum curso encontrado. Clique em {"Adicionar Curso"} para
                criar o primeiro curso.
              </p>
            </div>
          ) : (
            insights && (
              <div className="mt-6 flex flex-col gap-4">
                {!academicYearActive && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Modo Configuração:</strong> Nenhum ano lectivo
                      activo. Pode criar novos cursos.
                    </p>
                  </div>
                )}
                <InsightCourse
                  insights={insights}
                  onShowArchivedCourses={() => setShowArchivedModal(true)}
                />
                {!showArchivedModal && (
                  <FilterCourseStatus
                    filterStatus={filterStatus}
                    onFilterChange={setFilterStatus}
                  />
                )}
                {!showArchivedModal && (
                  <>
                    <CourseTable
                      courses={displayedCourses}
                      academicYearActive={academicYearActive}
                      onVincular={(course) =>
                        setVincularModal({ isOpen: true, course })
                      }
                      onEdit={handleEditCourse}
                      onDeactivate={handleDeactivateCourse}
                      onHistory={(course) =>
                        setHistoryModal({ isOpen: true, course })
                      }
                      onDesvincular={handleDesvincular}
                    />
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      itemsCount={filteredCourses.length}
                      itemName="cursos"
                      onPrevious={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      onNext={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                    />
                  </>
                )}
              </div>
            )
          )}
        </div>
      )}
      {isOpen && <NewCourse setIsOpen={setIsOpen} onSucess={fetchData} />}

      {vincularModal.isOpen && (
        <VincularCoordinator
          setIsOpen={() => setVincularModal({ isOpen: false, course: null })}
          course={vincularModal.course}
          onSuccess={fetchData}
        />
      )}
      {historyModal.isOpen && (
        <HistoryCoordinator
          setIsOpen={() => setHistoryModal({ isOpen: false, course: null })}
          course={historyModal.course}
        />
      )}
      {editingCourse && (
        <EditCourse
          setIsOpen={closeEditCourse}
          course={editingCourse}
          onSuccess={() => {
            fetchData();
            closeEditCourse();
          }}
          isHistoric={editingCourse.hasHistory}
          isCheckingHistory={isCheckingHistory}
        />
      )}
      {courseToDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setCourseToDeactivate(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#0F2C59]">
              Confirmar arquivamento do curso
            </h3>
            <p className="mt-3 text-sm text-gray-600">
              O curso <strong>{courseToDeactivate.name}</strong> será arquivado.
              Os dados históricos permanecerão seguros e não serão apagados.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCourseToDeactivate(null)}
                className="w-full sm:w-auto rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                disabled={isDeactivating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F2C59] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2C59]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeactivating ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : null}
                {isDeactivating ? "Arquivando..." : "Arquivar curso"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showArchivedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowArchivedModal(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[80vh] rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-[#0F2C59]">
                Cursos Arquivados
              </h2>
              <button
                type="button"
                onClick={() => setShowArchivedModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6">
              {courses.filter((c) => c.estado === "Arquivado").length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">
                      Nenhum curso arquivado.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {courses
                    .filter((c) => c.estado === "Arquivado")
                    .map((course) => (
                      <div
                        key={course.id}
                        className="flex items-start justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {course.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Código:{" "}
                            <span className="font-mono">{course.code}</span>
                          </p>
                          <p className="text-sm text-gray-400 mt-0.5">
                            Criado em {new Date(course.createdAt).getFullYear()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setHistoryModal({ isOpen: true, course });
                            setShowArchivedModal(false);
                          }}
                          className="ml-4 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap"
                        >
                          Histórico
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 sm:flex sm:justify-end">
              <button
                type="button"
                onClick={() => setShowArchivedModal(false)}
                className="w-full sm:w-auto rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
