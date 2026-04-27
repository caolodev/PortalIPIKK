"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentGrades } from "@/hooks/useStudentGrades";
import PageHeader from "@/components/PageHeader";
import Filters from "@/components/notas/Filters";
import GradesTable from "@/components/notas/GradesTable";
import StatsCards from "@/components/notas/StatsCards";
import AcademicProfile from "@/components/notas/AcademicProfile";
import Distribution from "@/components/notas/Distribution";

export default function ViewNotas() {
  const { user } = useAuth();
  const {
    dataTable,
    loading,
    selectedQuarter,
    setSelectedQuarter,
    student,
    quarters,
  } = useStudentGrades(user);
  const [selectedSubject, setSelectedSubject] = useState("ALL");

  const subjects = useMemo(
    () =>
      dataTable
        .map((d) => ({
          id: d.subjectId,
          name: d.subject?.name,
        }))
        .filter(
          (item, index, list) =>
            list.findIndex((entry) => entry.id === item.id) === index,
        ),
    [dataTable],
  );

  const processed = useMemo(() => {
    return dataTable
      .map((row) => {
        const latest = row.assessments.find(
          (a) => a.quarterNumber === selectedQuarter,
        );
        const g = latest?.grades || {};

        return {
          subjectId: row.subjectId,
          subject: row.subject,
          PP: g.pp ?? null,
          PT: g.pt ?? null,
          MAC: g.mac ?? null,
          MT: g.mt ?? null,
        };
      })
      .filter(
        (r) => selectedSubject === "ALL" || r.subjectId === selectedSubject,
      );
  }, [dataTable, selectedQuarter, selectedSubject]);

  if (loading) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-[#0F2C59] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title={`Notas de ${student?.nomeCompleto || user?.nomeCompleto}`}
        description={`Curso: ${student?.courseName || "—"} · Turma: ${student?.turmaName || "—"}`}
      />

      <StatsCards data={processed} />

      <Filters
        quarters={quarters}
        selectedQuarter={selectedQuarter}
        setSelectedQuarter={setSelectedQuarter}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        subjects={subjects}
      />

      {selectedQuarter ? (
        <GradesTable data={processed} />
      ) : (
        <div className="flex min-h-45 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
          Não existe trimestre activo neste momento. Aguarde a abertura do
          próximo trimestre ou selecione um trimestre fechado para consultar as
          notas.
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <AcademicProfile data={processed} />
        <Distribution data={processed} />
      </div>
    </div>
  );
}
