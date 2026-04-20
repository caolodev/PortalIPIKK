"use client";

export default function ClassCard({
  turma,
  studentCount = 0,
  isSelected = false,
  onClick,
}) {
  const getAulaName = () => {
    return turma.nomeBase || turma.nomeExibicao || "Turma";
  };

  const getAcademicYear = () => {
    if (!turma.nomeExibicao) return "2026";
    const parts = turma.nomeExibicao.split("_");
    return parts[0] || "2026";
  };

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border transition-all duration-200 overflow-hidden focus:outline-none ${
        isSelected
          ? "border-transparent bg-[#0f2c59] text-white shadow-md"
          : "border-slate-200 bg-white text-slate-900 shadow-sm hover:shadow-md hover:border-slate-300"
      }`}
    >
      <div className="p-3 space-y-2 text-left">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm font-semibold ${isSelected ? "text-white" : "text-slate-900"}`}
          >
            {getAulaName()}
          </p>
        </div>

        <p
          className={`text-xs ${isSelected ? "text-slate-200" : "text-slate-500"}`}
        >
          {getAcademicYear()} • {turma.turno || "–"}
        </p>

        <p
          className={`text-sm font-semibold ${isSelected ? "text-white" : "text-slate-900"}`}
        >
          {studentCount} {studentCount === 1 ? "aluno" : "alunos"}
        </p>
      </div>
    </button>
  );
}
