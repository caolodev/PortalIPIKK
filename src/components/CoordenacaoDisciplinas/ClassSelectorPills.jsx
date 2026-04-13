export default function ClassSelectorPills({
  options,
  selectedClass,
  onSelect,
  loading = false,
}) {
  function formatClasseLabel(classe) {
    if (classe === undefined || classe === null) return "-";
    const value = String(classe);
    return value.endsWith("ª") ? value : `${value}ª`;
  }

  if (loading) {
    return (
      <div className="flex flex-wrap gap-3 rounded-md border border-slate-200 bg-white p-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-10 min-w-22 rounded-md bg-slate-200/70 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white px-5 py-4 text-sm text-slate-600">
        Nenhuma classe configurada para este curso. Crie turmas em Gestão de
        Turmas para começar.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((item) => {
        const isActive = item.value === selectedClass;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onSelect(item.value)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-[#0F2C59] text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {formatClasseLabel(item.value)} classe
          </button>
        );
      })}
    </div>
  );
}
