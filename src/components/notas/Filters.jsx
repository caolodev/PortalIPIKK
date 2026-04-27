import { ChevronDown } from "lucide-react";

export default function Filters({
  quarters = [],
  selectedQuarter,
  setSelectedQuarter,
  selectedSubject,
  setSelectedSubject,
  subjects,
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-50">
        <p className="mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
          Trimestre
        </p>
        <div className="relative">
          <select
            value={selectedQuarter ?? ""}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#0F2C59] focus:ring-1 focus:ring-[#0F2C59]/20"
            onChange={(e) =>
              setSelectedQuarter(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">Trimestre activo</option>
            {quarters.length > 0 ? (
              quarters.map((quarter) => (
                <option key={quarter.id} value={quarter.number}>
                  {quarter.number}º Trimestre
                  {quarter.status === "ACTIVE"
                    ? " (Activo)"
                    : quarter.status === "CLOSED"
                      ? " (Fechado)"
                      : ""}
                </option>
              ))
            ) : (
              <option value="">Sem trimestres</option>
            )}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="flex-1 min-w-50">
        <p className="mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
          Disciplina
        </p>
        <div className="relative">
          <select
            value={selectedSubject}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#0F2C59] focus:ring-1 focus:ring-[#0F2C59]/20"
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="ALL">Todas as disciplinas</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
