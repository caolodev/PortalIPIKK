"use client";

import { useEffect, useMemo, useState } from "react";
import { faBookOpen, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveCourseForCoordinator } from "@/services/courseRoleService";
import { getCourseById } from "@/services/courseService";
import { getActiveAcademicYear } from "@/services/academicYear";
import { getClassesByCourse } from "@/services/classService";
import {
  getFilteredSubjects,
  getCourseMatrix,
} from "@/services/subjectService";
import {
  getAssignmentsByClass,
  assignTeacherToClassSubject,
  getAllProfessors,
} from "@/services/teacherAssignmentService";
import PageHeader from "@/components/PageHeader";
import ClassFilter from "@/components/ProfessorAssignments/ClassFilter";
import AssignmentTable from "@/components/ProfessorAssignments/AssignmentTable";
import TeacherAssignmentModal from "@/components/ProfessorAssignments/TeacherAssignmentModal";
import PaginationControls from "@/components/PaginationControls";

const GRADE_OPTIONS = [10, 11, 12, 13];
const ALL_GRADES = "all";

function getInitialGrade(classes) {
  const available = GRADE_OPTIONS.find((grade) =>
    classes.some((turma) => Number(turma.classe) === grade),
  );
  return available ?? GRADE_OPTIONS[0];
}

export default function ProfessorAssignmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState(null);
  const [academicYear, setAcademicYear] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(GRADE_OPTIONS[0]);
  const [selectedTurma, setSelectedTurma] = useState(null);
  const [rows, setRows] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Per-class assignment counts (for card badges)
  const [classCounts, setClassCounts] = useState({});

  const classesByGrade = useMemo(() => {
    return classes.reduce((acc, turma) => {
      const grade = Number(turma.classe);
      if (!GRADE_OPTIONS.includes(grade)) return acc;
      if (!acc[grade]) acc[grade] = [];
      acc[grade].push(turma);
      return acc;
    }, {});
  }, [classes]);

  const visibleClasses = useMemo(() => {
    if (selectedGrade === ALL_GRADES) return classes;
    return classesByGrade[selectedGrade] || [];
  }, [classesByGrade, selectedGrade, classes]);

  const filteredProfessors = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return professors;
    return professors.filter((professor) => {
      const name = (
        professor.nomeCompleto ||
        professor.name ||
        ""
      ).toLowerCase();
      return name.includes(normalized);
    });
  }, [professors, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const displayedRows = rows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const totalSubjects = rows.length;
  const assignedCount = rows.filter((row) => row.activeTeacher).length;
  const vacantCount = totalSubjects - assignedCount;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    async function initPage() {
      setLoading(true);
      try {
        const courseRole = await getActiveCourseForCoordinator(user.uid);
        if (!courseRole.success || !courseRole.data) {
          toast.error("Erro ao identificar o curso do coordenador.");
          return;
        }
        const courseRes = await getCourseById(courseRole.data.courseId);
        if (!courseRes.success) {
          toast.error(courseRes.error || "Erro ao carregar o curso.");
          return;
        }

        const yearRes = await getActiveAcademicYear();
        if (!yearRes.success || !yearRes.data) {
          toast.error(yearRes.error || "Erro ao carregar o ano letivo ativo.");
          return;
        }

        const classesRes = await getClassesByCourse(
          courseRes.data.id,
          yearRes.data.id,
        );
        if (!classesRes.success) {
          toast.error(classesRes.error || "Erro ao carregar as turmas.");
          return;
        }

        const professorRes = await getAllProfessors();
        if (!professorRes.success) {
          toast.error(professorRes.error || "Erro ao carregar professores.");
          return;
        }

        setCourse(courseRes.data);
        setAcademicYear(yearRes.data);
        setClasses(classesRes.data);
        setProfessors(professorRes.data);

        const initialGrade = getInitialGrade(classesRes.data);
        setSelectedGrade(initialGrade);
        const initialTurma = classesRes.data.find(
          (turma) => Number(turma.classe) === initialGrade,
        );
        setSelectedTurma(initialTurma || null);
      } catch (error) {
        console.error(error);
        toast.error("Erro inesperado ao inicializar a página.");
      } finally {
        setLoading(false);
      }
    }
    initPage();
  }, [authLoading, user]);

  useEffect(() => {
    if (!classes.length) return;
    if (selectedGrade === ALL_GRADES) return;
    const hasGradeClass = classes.some(
      (turma) => Number(turma.classe) === selectedGrade,
    );
    if (!hasGradeClass) {
      setSelectedTurma(null);
      return;
    }
    if (!selectedTurma || Number(selectedTurma.classe) !== selectedGrade) {
      const nextTurma = classes.find(
        (turma) => Number(turma.classe) === selectedGrade,
      );
      setSelectedTurma(nextTurma || null);
    }
  }, [selectedGrade, classes, selectedTurma]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTurma]);

  useEffect(() => {
    if (!course || !selectedTurma || !academicYear) {
      setRows([]);
      return;
    }

    async function loadAssignments() {
      setTableLoading(true);
      try {
        const [matrixRes, subjectsRes, assignmentsRes] = await Promise.all([
          getCourseMatrix(course.id, Number(selectedTurma.classe)),
          getFilteredSubjects(course.code),
          getAssignmentsByClass(selectedTurma.id, academicYear.id),
        ]);
        if (!matrixRes.success) {
          toast.error(
            matrixRes.error || "Erro ao carregar a matriz curricular.",
          );
          setRows([]);
          return;
        }

        const subjectMap = (subjectsRes.success ? subjectsRes.data : []).reduce(
          (acc, subject) => {
            acc[subject.id] = subject;
            return acc;
          },
          {},
        );

        const assignments = assignmentsRes.success ? assignmentsRes.data : [];
        const rowData = matrixRes.data.map((entry) => {
          const fallback = subjectMap[entry.subjectId] || {};
          const subject = {
            id: entry.subject?.id || entry.subjectId,
            name:
              entry.subject?.name || fallback.name || "Disciplina desconhecida",
            sigla: entry.subject?.sigla || fallback.sigla || entry.subjectId,
          };
          const subjectAssignments = assignments.filter(
            (item) => item.subjectId === entry.subjectId,
          );
          const activeTeacher = subjectAssignments.find(
            (item) => item.endDate === null,
          );
          const history = subjectAssignments
            .filter((item) => item.endDate !== null)
            .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
          return {
            id: entry.id,
            subjectId: entry.subjectId,
            subject,
            activeTeacher,
            history,
          };
        });

        setRows(rowData);

        // Update class counts cache
        const assigned = rowData.filter((r) => r.activeTeacher).length;
        setClassCounts((prev) => ({
          ...prev,
          [selectedTurma.id]: { assigned, total: rowData.length },
        }));
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar a atribuição de disciplinas.");
      } finally {
        setTableLoading(false);
      }
    }
    loadAssignments();
  }, [course, selectedTurma, academicYear]);

  const handleSelectTurma = (turma) => {
    setSelectedTurma(turma);
    setCurrentRow(null);
  };

  const handleOpenAssignment = (row) => {
    setCurrentRow(row);
    setSelectedProfessor(
      row.activeTeacher
        ? professors.find((prof) => prof.id === row.activeTeacher.teacherId) ||
            null
        : null,
    );
    setSearchQuery("");
    setModalOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!currentRow || !selectedProfessor || !selectedTurma || !academicYear) {
      toast.error("Selecione uma turma, disciplina e professor.");
      return;
    }
    setSaving(true);
    try {
      const result = await assignTeacherToClassSubject({
        teacherId: selectedProfessor.id,
        classId: selectedTurma.id,
        subjectId: currentRow.subjectId,
        anoLectivoId: academicYear.id,
      });
      if (!result.success) {
        toast.error(result.error || "Erro ao salvar a atribuição.");
        return;
      }

      const now = new Date().toISOString();
      setRows((currentRows) =>
        currentRows.map((row) => {
          if (row.subjectId !== currentRow.subjectId) return row;
          const archivedTeacher = row.activeTeacher
            ? { ...row.activeTeacher, endDate: now }
            : null;
          return {
            ...row,
            activeTeacher: {
              teacherId: selectedProfessor.id,
              teacherName:
                selectedProfessor.nomeCompleto ||
                selectedProfessor.name ||
                "Professor sem nome",
              startDate: now,
              endDate: null,
            },
            history: archivedTeacher
              ? [archivedTeacher, ...row.history]
              : row.history,
          };
        }),
      );
      toast.success("Professor atribuído com sucesso.");
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar a atribuição.");
    } finally {
      setSaving(false);
    }
  };

  const gradeFilterOptions = [
    ALL_GRADES,
    ...GRADE_OPTIONS.filter((g) => classes.some((t) => Number(t.classe) === g)),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-10">
        <PageHeader
          title="Atribuição de Professores"
          description="Gerencie o corpo docente vinculado às disciplinas de cada turma."
          fontAwesomeIcon={faBookOpen}
        />

        {/* Class selector card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Card header */}
          <div className="px-6 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Selecionar Turma
                </h2>
              </div>
              {selectedTurma && (
                <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
                  <FontAwesomeIcon
                    icon={faGraduationCap}
                    className="text-[#0f2c59]"
                  />
                  {selectedTurma.nomeExibicao}
                </div>
              )}
            </div>
            {selectedTurma?.director && (
              <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <p className="font-semibold">director de turma</p>
                <p>
                  {selectedTurma.director.name} • desde{" "}
                  {selectedTurma.director.since}
                </p>
              </div>
            )}
            <div className="mt-4">
              <ClassFilter
                options={gradeFilterOptions}
                selectedGrade={selectedGrade}
                onSelect={setSelectedGrade}
                loading={loading}
              />
            </div>
          </div>

          {/* Class cards grid */}
          <div className="grid gap-4 p-6 xl:grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-xl bg-slate-100"
                />
              ))
            ) : visibleClasses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-400">
                Não existem turmas para esta classe.
              </div>
            ) : (
              visibleClasses.map((turma) => {
                const isSelected = selectedTurma?.id === turma.id;
                const counts = classCounts[turma.id];
                return (
                  <button
                    key={turma.id}
                    type="button"
                    onClick={() => handleSelectTurma(turma)}
                    className={`group flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-150 ${
                      isSelected
                        ? "border-[#0f2c59] bg-[#0f2c59] text-white shadow-md"
                        : "border-slate-200 bg-white text-slate-900 hover:border-[#0f2c59]/30 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={`text-sm font-semibold ${isSelected ? "text-blue-300" : "text-slate-600"}`}
                        >
                          {turma.nomeBase || turma.nomeExibicao}
                        </p>
                        <p
                          className={`mt-0.5 text-xs ${isSelected ? "text-blue-200" : "text-slate-500"}`}
                        >
                          {course?.name || "Curso"}
                        </p>
                      </div>
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${isSelected ? "bg-white/10" : "bg-slate-100"}`}
                      >
                        <FontAwesomeIcon
                          icon={faGraduationCap}
                          className={
                            isSelected ? "text-white" : "text-[#0f2c59]"
                          }
                        />
                      </div>
                    </div>
                    <div
                      className={`mt-4 flex items-center gap-3 text-xs ${isSelected ? "text-blue-200" : "text-slate-500"}`}
                    >
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${isSelected ? "bg-white/10" : "bg-slate-100"}`}
                      >
                        {turma.turno || "—"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${isSelected ? "bg-white/10" : "bg-slate-100"}`}
                      >
                        {turma.classe}.º ano
                      </span>
                    </div>
                    {turma.director && (
                      <p
                        className={`mt-3 text-xs font-medium ${isSelected ? "text-blue-200" : "text-slate-500"}`}
                      >
                        director de turma: {turma.director.name}
                      </p>
                    )}
                    {counts && (
                      <p
                        className={`mt-2 text-xs font-medium ${isSelected ? "text-blue-200" : "text-slate-400"}`}
                      >
                        {counts.assigned} de {counts.total} disciplinas
                        atribuídas
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Stats pills */}
          {selectedTurma && (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 px-6 py-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Atribuídos: {assignedCount}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Vagos: {vacantCount}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                Matriz: {totalSubjects} disciplinas
              </span>
            </div>
          )}
        </div>

        {/* Subjects table panel */}
        {selectedTurma ? (
          <>
            <AssignmentTable
              displayedRows={displayedRows}
              onAssign={handleOpenAssignment}
              loading={tableLoading}
              directorId={selectedTurma?.director?.userId}
            />
            {rows.length > 0 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                itemsCount={rows.length}
                itemName="disciplinas"
                onPrevious={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                onNext={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              />
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-14 text-center text-sm text-slate-400">
            Selecione uma turma acima para carregar a matriz curricular.
          </div>
        )}
      </div>

      <TeacherAssignmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        professors={filteredProfessors}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        selectedProfessor={selectedProfessor}
        onSelectProfessor={setSelectedProfessor}
        onSave={handleSaveAssignment}
        loading={saving}
        subjectName={currentRow?.subject.name || "Disciplina"}
        currentTeacherName={currentRow?.activeTeacher?.teacherName || null}
        isCurrentTeacherDirector={
          !!currentRow?.activeTeacher?.teacherId &&
          currentRow.activeTeacher.teacherId === selectedTurma?.director?.userId
        }
      />
    </div>
  );
}