"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

const CLASS_LABELS = {
  all: "Todas",
  10: "10ª Classe",
  11: "11ª Classe",
  12: "12ª Classe",
  13: "13ª Classe",
};

export default function ClassFilter({
  options,
  selectedGrade,
  onSelect,
  loading,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <FontAwesomeIcon icon={faFilter} className="text-slate-400" />
        <span>Filtrar por classe</span>
      </div>

      <div className="flex flex-wrap bg-slate-100 border border-slate-200 rounded-full p-1 gap-1">
        {options.map((grade) => {
          const isActive = selectedGrade === grade;
          return (
            <button
              key={grade}
              type="button"
              onClick={() => onSelect(grade)}
              disabled={loading}
              className={`rounded-full px-3.5 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#0f2c59]/20 ${
                isActive
                  ? "bg-white border border-slate-200 text-slate-900 font-semibold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white"
              }`}
            >
              {CLASS_LABELS[grade] ?? `${grade}ª Classe`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
