"use client";
import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faBookOpen,
  faGraduationCap,
  faCheckCircle,
  faArrowRight,
  faArrowLeft,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
  getStudentsByClass,
  getGradesByContext,
  saveStudentGrades,
  getDisciplinesByTeacherAndClass,
} from "../../../../services/assessmentService";
import {
  getClassById,
  getStudentCountsByClassIds,
} from "../../../../services/classService";
import { getAssignmentsByProfessor } from "../../../../services/teacherAssignmentService";
import { getActiveAcademicYear } from "../../../../services/academicYear";
import { getActiveAcademicQuarter } from "../../../../services/academicQuarter";
import ClassCardGrid from "@/components/ProfessorAssignments/ClassCardGrid";
import ClassFilter from "@/components/ProfessorAssignments/ClassFilter";
import ClassSelectionStep from "@/components/LancamentoNotas/ClassSelectionStep";
import DisciplineSelectionStep from "@/components/LancamentoNotas/DisciplineSelectionStep";
import StepperIndicator from "@/components/LancamentoNotas/StepperIndicator";
import GradesTable from "@/components/GradesTable";

export default function LancamentoNotas() {
  const { user } = useAuth();

  // Step 1: Class Selection
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [studentCounts, setStudentCounts] = useState({});
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");

  // Step 2: Discipline Selection
  const [disciplines, setDisciplines] = useState([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);

  // Step 3: Grades Entry
  const [students, setStudents] = useState([]);
  const [existingGrades, setExistingGrades] = useState({});
  const [academicYear, setAcademicYear] = useState(null);
  const [academicQuarter, setAcademicQuarter] = useState(null);
  const [gradesData, setGradesData] = useState(null);
  const [gradesCache, setGradesCache] = useState({}); // Cache para preservar notas ao mudar de disciplina

  // UI States
  const [loading, setLoading] = useState(true);
  const [loadingDisciplines, setLoadingDisciplines] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch assignments and classes
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch academic year and quarter
        const yearRes = await getActiveAcademicYear();
        if (yearRes.success && yearRes.data) {
          setAcademicYear(yearRes.data);
        }

        const quarterRes = await getActiveAcademicQuarter();
        if (quarterRes.success && quarterRes.data) {
          setAcademicQuarter(quarterRes.data);
        }

        // Fetch professor assignments
        const assignmentsData = await getAssignmentsByProfessor(
          user.uid,
          yearRes.data?.id || "",
        );
        setAssignments(assignmentsData);

        if (assignmentsData.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch classes
        const classIds = [...new Set(assignmentsData.map((a) => a.classId))];
        const classPromises = classIds.map((id) => getClassById(id));
        const classData = await Promise.all(classPromises);
        const successfulClasses = classData
          .filter((c) => c.success)
          .map((c) => c.data);
        setClasses(successfulClasses);

        if (successfulClasses.length > 0) {
          setSelectedClass(successfulClasses[0]);
        }

        const countsResult = await getStudentCountsByClassIds(classIds);
        if (countsResult.success) {
          setStudentCounts(countsResult.data);
        }
      } catch (error) {
        console.error("Erro ao buscar dados iniciais:", error);
        toast.error("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Fetch disciplines when class is selected
  useEffect(() => {
    async function fetchDisciplines() {
      if (!selectedClass || !user || !academicYear) {
        setDisciplines([]);
        setSelectedDiscipline(null);
        return;
      }

      setLoadingDisciplines(true);
      try {
        const result = await getDisciplinesByTeacherAndClass(
          user.uid,
          selectedClass.id,
          academicYear.id,
        );

        if (result.success && result.data) {
          setDisciplines(result.data);
          setSelectedDiscipline(null); // Reset selected discipline
        } else {
          setDisciplines([]);
          toast.error("Erro ao carregar disciplinas.");
        }
      } catch (error) {
        console.error("Erro ao buscar disciplinas:", error);
        setDisciplines([]);
        toast.error("Erro ao carregar disciplinas.");
      } finally {
        setLoadingDisciplines(false);
      }
    }
    fetchDisciplines();
  }, [selectedClass, user, academicYear]);

  // Fetch students and grades when discipline is selected
  useEffect(() => {
    async function fetchGradesData() {
      if (!selectedDiscipline || !selectedClass || !academicQuarter) {
        setStudents([]);
        setExistingGrades({});
        setGradesData(null);
        return;
      }

      setLoadingGrades(true);
      try {
        // Fetch students
        const studentsResult = await getStudentsByClass(selectedClass.id);
        if (Array.isArray(studentsResult)) {
          setStudents(studentsResult);
        } else {
          setStudents([]);
        }

        // Verificar cache primeiro
        const cacheKey = `${selectedClass.id}_${selectedDiscipline.subjectId}`;
        if (gradesCache[cacheKey]) {
          // Usar dados em cache
          setExistingGrades(gradesCache[cacheKey]);
        } else {
          // Fetch existing grades from Firebase
          const gradesResult = await getGradesByContext(
            selectedClass.id,
            selectedDiscipline.subjectId,
            academicQuarter.id,
          );

          const gradeData = gradesResult.success ? gradesResult.data || {} : {};
          setExistingGrades(gradeData);

          // Guardar no cache
          setGradesCache((prev) => ({
            ...prev,
            [cacheKey]: gradeData,
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar notas:", error);
        setStudents([]);
        setExistingGrades({});
        toast.error("Erro ao carregar alunos e notas.");
      } finally {
        setLoadingGrades(false);
      }
    }
    fetchGradesData();
  }, [selectedDiscipline, selectedClass, academicQuarter, gradesCache]);

  // Save grades
  const handleSaveGrades = async () => {
    if (!gradesData || !gradesData.getChanged) {
      toast.error("Nenhuma nota para guardar.");
      return;
    }

    if (
      !selectedClass ||
      !selectedDiscipline ||
      !academicYear ||
      !academicQuarter ||
      !user
    ) {
      toast.error("Contexto incompleto para guardar notas.");
      return;
    }

    const changedStudents = gradesData.getChanged();
    if (changedStudents.length === 0) {
      toast.info("Nenhuma alteração para guardar.");
      return;
    }

    setSaving(true);
    try {
      const promises = changedStudents.map(({ student, grades }) =>
        saveStudentGrades({
          studentId: student.id,
          classId: selectedClass.id,
          subjectId: selectedDiscipline.subjectId,
          quarterId: academicQuarter.id,
          yearId: academicYear.id,
          teacherId: user.uid,
          assignmentId: selectedDiscipline.assignmentId,
          grades,
        }),
      );

      const results = await Promise.all(promises);
      const failed = results.find((r) => !r.success);

      if (failed) {
        toast.error(`Erro ao guardar: ${failed.error}`);
      } else {
        toast.success(
          `${changedStudents.length} nota(s) guardada(s) com sucesso!`,
        );

        // Reload existing grades and update cache
        const gradesResult = await getGradesByContext(
          selectedClass.id,
          selectedDiscipline.subjectId,
          academicQuarter.id,
        );
        if (gradesResult.success) {
          const updatedGrades = gradesResult.data || {};
          setExistingGrades(updatedGrades);

          // Atualizar cache
          const cacheKey = `${selectedClass.id}_${selectedDiscipline.subjectId}`;
          setGradesCache((prev) => ({
            ...prev,
            [cacheKey]: updatedGrades,
          }));
        }
      }
    } catch (error) {
      console.error("Erro ao guardar notas:", error);
      toast.error("Erro ao guardar notas. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // Computed values
  const classStudentCount = useMemo(() => studentCounts, [studentCounts]);

  const classOptions = useMemo(() => {
    const unique = Array.from(
      new Set(classes.map((turma) => turma.classe).filter(Boolean)),
    );
    return unique.sort((a, b) => Number(a) - Number(b));
  }, [classes]);

  const filteredClasses = useMemo(() => {
    if (selectedClassFilter === "all") return classes;
    return classes.filter((turma) => turma.classe === selectedClassFilter);
  }, [classes, selectedClassFilter]);

  const classFilterOptions = useMemo(
    () => ["all", ...classOptions],
    [classOptions],
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <PageHeader
          title="Lançamento de Notas"
          description="Selecione uma turma para lançar avaliações."
          fontAwesomeIcon={faBookOpen}
        />
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8 mt-8">
          <div className="flex flex-col items-center justify-center gap-3">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-2xl text-[#0f2c59]"
            />
            <p className="text-sm font-medium text-slate-600">
              Carregando turmas...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <PageHeader
          title="Lançamento de Notas"
          description="Selecione uma turma para lançar avaliações."
          fontAwesomeIcon={faBookOpen}
        />
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center mt-8">
          <FontAwesomeIcon
            icon={faBookOpen}
            className="text-4xl text-slate-300 mb-3"
          />
          <p className="text-sm font-medium text-slate-600 mt-2">
            Nenhuma turma encontrada.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Você não está vinculado como professor a nenhuma turma neste
            momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 md:p-4">
      <PageHeader
        title="Lançamento de Notas"
        description="Preencha as avaliações dos alunos através dos passos abaixo."
        fontAwesomeIcon={faBookOpen}
      />

      {/* Stepper Indicator */}
      <div className="mt-6 mb-6">
        <StepperIndicator
          selectedClass={selectedClass}
          selectedDiscipline={selectedDiscipline}
          students={students}
        />
      </div>

      {/* Step 1: Class Selection */}
      <div className="mb-6">
        <ClassSelectionStep
          classes={classes}
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
          studentCounts={studentCounts}
        />
      </div>

      {/* Step 2: Discipline Selection */}
      {selectedClass && (
        <div className="mb-6">
          <DisciplineSelectionStep
            disciplines={disciplines}
            selectedDiscipline={selectedDiscipline}
            onSelectDiscipline={setSelectedDiscipline}
            loading={loadingDisciplines}
          />
        </div>
      )}

      {/* Step 3: Grades Entry */}
      {selectedDiscipline && (
        <div>
          <div className="flex flex-col gap-1 mb-3">
            <p className="text-base font-semibold text-slate-900">
              Passo 3: Lançar Notas
            </p>
            <p className="text-xs text-slate-500">
              Preencha as notas de PP, PT e MAC. A média será calculada
              automaticamente.
            </p>
          </div>

          {loadingGrades ? (
            <div className="rounded-md border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-center gap-3">
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  className="text-lg text-[#0f2c59]"
                />
                <span className="text-sm text-slate-600">
                  Carregando alunos e notas...
                </span>
              </div>
            </div>
          ) : students.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-600">
                Nenhum aluno encontrado para esta turma.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border border-slate-200 bg-white p-2 mb-3 overflow-auto">
                <GradesTable
                  students={students}
                  existingGrades={existingGrades}
                  onGradesChange={setGradesData}
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedDiscipline(null);
                    setStudents([]);
                    setExistingGrades({});
                  }}
                  className="px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                  Voltar
                </button>
                <button
                  onClick={handleSaveGrades}
                  disabled={saving}
                  className="px-3 py-2 rounded-md bg-[#0f2c59] text-white font-medium text-sm hover:bg-[#0a1e40] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
