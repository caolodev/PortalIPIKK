"use client";
import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import ClassCardGrid from "@/components/ProfessorAssignments/ClassCardGrid";
import ClassFilter from "@/components/ProfessorAssignments/ClassFilter";

export default function ClassSelectionStep({
  classes,
  selectedClass,
  onSelectClass,
  studentCounts,
}) {
  const classOptions = useMemo(() => {
    const unique = Array.from(
      new Set(classes.map((turma) => turma.classe).filter(Boolean)),
    );
    return unique.sort((a, b) => Number(a) - Number(b));
  }, [classes]);

  const [selectedClassFilter, setSelectedClassFilter] = React.useState("all");

  const filteredClasses = useMemo(() => {
    if (selectedClassFilter === "all") return classes;
    return classes.filter((turma) => turma.classe === selectedClassFilter);
  }, [classes, selectedClassFilter]);

  const classFilterOptions = useMemo(
    () => ["all", ...classOptions],
    [classOptions],
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-slate-900">
          Passo 1: Selecionar Turma
        </p>
        <p className="text-xs text-slate-500">
          Escolha a turma para a qual deseja lançar notas.
        </p>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-2">
        <ClassFilter
          options={classFilterOptions}
          selectedGrade={selectedClassFilter}
          onSelect={setSelectedClassFilter}
          loading={false}
        />
        <div className="mt-2">
          <ClassCardGrid
            classes={filteredClasses}
            studentCountByClass={studentCounts}
            onSelectClass={onSelectClass}
            selectedClassId={selectedClass?.id}
            loading={false}
          />
        </div>
      </div>
    </div>
  );
}
