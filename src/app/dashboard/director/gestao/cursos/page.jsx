"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PageHeader from "@/components/PageHeader";
import toast from "react-hot-toast";
import CourseTable from "@/components/CourseTable";
import {
  faSpinner,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useCallback } from "react";
import NewCourse from "@/components/NewCourse";
import InsightCourse from "@/components/InsightCourse";

import VincularCoordinator from "@/components/VincularCoordinator";
import HistoryCoordinator from "@/components/HistoryCoordinator";
import FilterCourseStatus from "@/components/FilterCourseStatus";
import PaginationControls from "@/components/PaginationControls";
import { getCourses, getInsights } from "@/services/courseService";
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
    if (filterStatus === "ALL") return true;
    return course.active === (filterStatus === "ACTIVE");
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

  return (
    <div className="mt-10 relative sm:text-[1rem] text-[0.8rem]">
      <PageHeader
        title="Cursos"
        fontAwesomeIcon={faGraduationCap}
        description="Gerencie os cursos oferecidos pela instituição."
        buttonText="Curso"
        onButtonClick={setIsOpen}
        buttonTitle={"Adicionar Curso"}
        buttonDisabled={academicYearActive}
        disabledReason="Não pode criar cursos durante um ano lectivo activo"
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
            <p className="text-gray-500">Nenhum curso encontrado.</p>
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
                <InsightCourse insights={insights} />
                <FilterCourseStatus
                  filterStatus={filterStatus}
                  onFilterChange={setFilterStatus}
                />
                <CourseTable
                  courses={displayedCourses}
                  academicYearActive={academicYearActive}
                  onVincular={(course) =>
                    setVincularModal({ isOpen: true, course })
                  }
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
    </div>
  );
}
