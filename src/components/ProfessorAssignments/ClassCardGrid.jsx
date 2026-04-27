"use client";

import ClassCard from "./ClassCard";

export default function ClassCardGrid({
  classes,
  studentCountByClass,
  onSelectClass,
  selectedClassId,
  loading = false,
}) {
  const handleSelectClass = (classData) => {
    onSelectClass?.(classData);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm font-medium text-slate-600">
          Nenhuma turma encontrada para o filtro selecionado.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {classes.map((turma) => (
        <ClassCard
          key={turma.id}
          turma={turma}
          studentCount={studentCountByClass[turma.id] || 0}
          isSelected={selectedClassId === turma.id}
          onClick={() => handleSelectClass(turma)}
        />
      ))}
    </div>
  );
}
