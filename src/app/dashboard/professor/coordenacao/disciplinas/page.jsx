"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faSpinner } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import {
  getFilteredSubjects,
  getCourseMatrix,
  bindSubjectToCourseMatrix,
} from "@/services/subjectService";
import { getActiveCourseForCoordinator } from "@/services/courseRoleService";
import { getCourseById } from "@/services/courseService";
import { getClassTemplatesByCourse } from "@/services/classService";
import DisciplineCard from "@/components/CoordenacaoDisciplinas/DisciplineCard";
import MatrixModal from "@/components/CoordenacaoDisciplinas/MatrixModal";
import ClassSelectorPills from "@/components/CoordenacaoDisciplinas/ClassSelectorPills";

function formatClasseLabel(classe) {
  if (classe === undefined || classe === null) return "-";
  const value = String(classe);
  return value.endsWith("ª") ? value : `${value}ª`;
}

export default function DisciplinasPage() {
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState(null);
  const [classOptions, setClassOptions] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [matrixSubjects, setMatrixSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setInitialLoading(false);
      return;
    }

    async function loadInitialData() {
      setInitialLoading(true);

      try {
        const roleRes = await getActiveCourseForCoordinator(user.uid);

        if (!roleRes.success) {
          toast.error("Não foi possível identificar o curso do coordenador.");
          return;
        }

        if (!roleRes.data) {
          toast.error(
            "Nenhum curso de coordenação encontrado para este usuário.",
          );
          return;
        }

        const courseRes = await getCourseById(roleRes.data.courseId);
        if (!courseRes.success) {
          toast.error(courseRes.error || "Erro ao carregar curso.");
          return;
        }

        setCourse(courseRes.data);

        const templatesRes = await getClassTemplatesByCourse(courseRes.data.id);
        if (!templatesRes.success) {
          toast.error(templatesRes.error || "Erro ao buscar classes do curso.");
          return;
        }

        const classes = Array.from(
          new Set(
            templatesRes.data
              .map((template) => String(template.classe))
              .filter(Boolean),
          ),
        ).sort((a, b) => Number(a) - Number(b));

        setClassOptions(classes);
        const initialClass = classes[0] || null;
        setSelectedClass(initialClass);

        const [subjectsRes, matrixRes] = await Promise.all([
          getFilteredSubjects(courseRes.data.code),
          initialClass
            ? getCourseMatrix(courseRes.data.id, initialClass)
            : Promise.resolve({ success: true, data: [] }),
        ]);

        if (!subjectsRes.success) {
          toast.error(subjectsRes.error || "Erro ao carregar disciplinas.");
        } else {
          setAvailableSubjects(subjectsRes.data);
        }

        if (!matrixRes.success) {
          toast.error(
            matrixRes.error || "Erro ao carregar matriz de disciplinas.",
          );
        } else {
          setMatrixSubjects(matrixRes.data);
        }
      } catch (error) {
        toast.error("Erro ao carregar a matriz. Tente atualizar a página.");
        console.error(error);
      } finally {
        setInitialLoading(false);
      }
    }

    loadInitialData();
  }, [authLoading, user]);

  useEffect(() => {
    if (!course || !selectedClass) return;

    async function refreshMatrix() {
      setRefreshing(true);
      setMatrixSubjects([]);
      const matrixRes = await getCourseMatrix(course.id, selectedClass);
      if (!matrixRes.success) {
        toast.error(matrixRes.error || "Erro ao atualizar matriz.");
        setMatrixSubjects([]);
      } else {
        setMatrixSubjects(matrixRes.data);
      }
      setRefreshing(false);
    }

    refreshMatrix();
  }, [course, selectedClass]);

  const matrixSubjectIds = useMemo(
    () => new Set(matrixSubjects.map((item) => item.subjectId)),
    [matrixSubjects],
  );

  const sortedClassOptions = useMemo(
    () =>
      classOptions.map((classe) => ({
        value: classe,
        label: formatClasseLabel(classe),
      })),
    [classOptions],
  );

  const handleToggleSubject = (subjectId) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects((current) =>
        current.filter((id) => id !== subjectId),
      );
      return;
    }
    setSelectedSubjects((current) => [...current, subjectId]);
  };

  const handleConfirmBinding = async () => {
    if (!course || !selectedClass || selectedSubjects.length === 0) {
      toast.error("Selecione pelo menos uma disciplina.");
      return;
    }

    setSaving(true);
    try {
      const promises = selectedSubjects.map((subjectId) =>
        bindSubjectToCourseMatrix({
          courseId: course.id,
          subjectId,
          classe: selectedClass,
        }),
      );
      const results = await Promise.all(promises);
      const failed = results.find((item) => !item.success);
      if (failed) {
        toast.error(failed.error || "Erro ao vincular disciplinas.");
      } else {
        toast.success("Disciplinas vinculadas com sucesso.");
        setModalOpen(false);
        setSelectedSubjects([]);
        const matrixRes = await getCourseMatrix(course.id, selectedClass);
        if (matrixRes.success) {
          setMatrixSubjects(matrixRes.data);
        }
      }
    } catch (error) {
      toast.error("Erro ao vincular disciplinas.");
    } finally {
      setSaving(false);
    }
  };

  const availableOptions = useMemo(() => {
    return [...availableSubjects].sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
    );
  }, [availableSubjects]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <PageHeader
        title="Matriz Curricular"
        description={
          initialLoading
            ? "Carregando dados do curso e da matriz..."
            : course
              ? `Configure as disciplinas do curso ${course.name}`
              : "Nenhum curso encontrado para coordenação."
        }
        fontAwesomeIcon={faBookOpen}
        buttonText="Adicionar à Matriz"
        buttonTitle={
          initialLoading
            ? "Aguarde o carregamento inicial"
            : selectedClass
              ? "Adicionar novas disciplinas à classe"
              : "Selecione uma classe para adicionar disciplinas"
        }
        onButtonClick={() => setModalOpen(true)}
        buttonDisabled={!selectedClass || saving || initialLoading}
        disabledReason={
          initialLoading
            ? "Aguarde o carregamento inicial"
            : !selectedClass
              ? "Selecione uma classe para adicionar disciplinas"
              : ""
        }
      />

      <div className="mt-6">
        <ClassSelectorPills
          options={sortedClassOptions}
          selectedClass={selectedClass}
          onSelect={setSelectedClass}
          loading={authLoading || initialLoading}
        />
      </div>

      {!initialLoading && classOptions.length === 0 && (
        <div className="mt-8 rounded-4xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
          <p className="text-sm font-semibold">
            Nenhuma classe configurada para este curso.
          </p>
          <p className="mt-2 text-sm leading-6">
            Crie turmas em Gestão de Turmas para começar a montar a matriz
            curricular.
          </p>
        </div>
      )}

      <div className="mt-8">
        {initialLoading ? (
          <div className="rounded-4xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin text-3xl text-[#0F2C59]"
            />
            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Carregando a matriz
            </h2>
            <p className="mt-2 text-sm leading-6">
              Aguardando carregamento das disciplinas do curso.
            </p>
          </div>
        ) : selectedClass ? (
          <div className="relative">
            {refreshing && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-4xl bg-white/80 p-12 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/90 px-8 py-6 shadow-lg border border-slate-200">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="animate-spin text-3xl text-[#0F2C59]"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Atualizando disciplinas...
                  </span>
                </div>
              </div>
            )}
            <div className="grid gap-5 xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-1">
              {refreshing ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-44 rounded-4xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse"
                  />
                ))
              ) : matrixSubjects.length === 0 ? (
                <div className="col-span-full rounded-4xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                    <FontAwesomeIcon icon={faBookOpen} className="text-2xl" />
                  </div>
                  <h2 className="mt-5 text-lg font-semibold text-slate-900">
                    Classe vazia
                  </h2>
                  <p className="mt-2 text-sm leading-6">
                    Esta classe ainda não possui disciplinas definidas.
                  </p>
                </div>
              ) : (
                matrixSubjects.map((entry) => (
                  <DisciplineCard key={entry.id} discipline={entry} />
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-4xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
              <FontAwesomeIcon icon={faBookOpen} className="text-2xl" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Selecione uma classe
            </h2>
            <p className="mt-2 text-sm leading-6">
              Escolha uma classe acima para visualizar e adicionar disciplinas.
            </p>
          </div>
        )}
      </div>

      <MatrixModal
        key={modalOpen ? "matrix-open" : "matrix-closed"}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSubjects([]);
        }}
        subjects={availableOptions}
        disabledIds={matrixSubjectIds}
        selectedIds={selectedSubjects}
        onToggle={handleToggleSubject}
        onConfirm={handleConfirmBinding}
        loading={saving}
      />
    </div>
  );
}
