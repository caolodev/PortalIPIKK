"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useState } from "react";

import { useStudentGrades } from "@/hooks/useStudentGrades";
import PageHeader from "@/components/PageHeader";
import Filters from "@/components/notas/Filters";
import GradesTable from "@/components/notas/GradesTable";
import StatsCards from "@/components/notas/StatsCards";
import AcademicProfile from "@/components/notas/AcademicProfile";
import Distribution from "@/components/notas/Distribution";

export default function ViewNotas() {
  const { user } = useAuth();

  const { dataTable, loading, selectedQuarter, setSelectedQuarter } =
    useStudentGrades(user);

  const [selectedSubject, setSelectedSubject] = useState("ALL");

  const subjects = dataTable.map((d) => ({
    id: d.subjectId,
    name: d.subject?.name,
  }));

  const processed = useMemo(() => {
    return dataTable
      .map((row) => {
        const filtered = row.assessments.filter(
          (a) => a.quarterNumber === selectedQuarter,
        );

        const latest = filtered[0];
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <PageHeader title="Notas" />

      <StatsCards data={processed} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <AcademicProfile data={processed} />
        <Distribution data={processed} />
      </div>
      
      <Filters
        selectedQuarter={selectedQuarter}
        setSelectedQuarter={setSelectedQuarter}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        subjects={subjects}
      />
      <GradesTable data={processed} />
    </div>
  );
}
