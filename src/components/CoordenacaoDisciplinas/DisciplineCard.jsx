export default function DisciplineCard({ discipline }) {
  const subject = discipline.subject || {};
  const isGeneral =
    subject.isGeneral ?? (!subject?.cursos || subject?.cursos.length === 0);
  const typeLabel = subject.type || (isGeneral ? "Geral" : "Específica");

  return (
    <div
      className={`rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden transition hover:-translate-y-0.5 duration-200 ${
        isGeneral ? "border-emerald-500" : "border-slate-900"
      }`}
    >
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {subject.name ||
                subject.nome ||
                subject.sigla ||
                "Disciplina não encontrada"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {subject.description || `${typeLabel === "Geral" ? "Geral para todos os cursos" : "Específica do curso(s) " + subject.cursos?.join(", ") || "Sem descrição disponível"}`}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-md px-3 py-1 text-[11px] font-semibold tracking-wide ${
              isGeneral
                ? "bg-emerald-100 text-emerald-800"
                : "bg-[#0F2C59] text-white"
            }`}
          >
            {subject.sigla || "N/A"}
          </span>
        </div>
      </div>
      <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
          {isGeneral ? "Geral" : "Específica"}
        </p>
      </div>
    </div>
  );
}
