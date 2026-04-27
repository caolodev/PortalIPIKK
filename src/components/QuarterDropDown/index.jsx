import { useEffect, useRef, useState } from "react";

export default function QuarterDropdown({
  quarters,
  selectedQuarter,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = quarters.find((q) => q.number === selectedQuarter);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-50" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          flex w-full items-center justify-between
          rounded-xl border border-slate-200 bg-white
          px-4 py-2.5 text-sm text-slate-800
          shadow-sm transition
          hover:border-slate-300 hover:bg-slate-50
          focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20
        "
      >
        <span>
          {selected ? `${selected.number}º Trimestre` : "Selecionar trimestre"}
        </span>

        <svg
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute z-50 mt-2 w-full
            overflow-hidden rounded-xl
            border border-slate-200 bg-white
            shadow-lg
          "
        >
          {quarters.length > 0 ? (
            quarters.map((quarter) => (
              <button
                key={quarter.id}
                onClick={() => {
                  onChange(quarter.number); // 🔥 FIX REAL
                  setOpen(false);
                }}
                className="
                  flex w-full items-center justify-between
                  px-4 py-2.5 text-sm text-slate-700
                  transition
                  hover:bg-slate-50
                "
              >
                <span>{quarter.number}º Trimestre</span>

                <span className="text-xs text-slate-400">
                  {quarter.status === "ACTIVE"
                    ? "Activo"
                    : quarter.status === "CLOSED"
                      ? "Fechado"
                      : ""}
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500">
              Sem trimestres
            </div>
          )}
        </div>
      )}
    </div>
  );
}
