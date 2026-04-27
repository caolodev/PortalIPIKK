"use client";

import { useMemo } from "react";

export default function ClassFiltersSection({
  filterClass,
  setFilterClass,
  setCurrentPage,
  classes,
  activeYear,
}) {
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

  return (
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
  );
}
