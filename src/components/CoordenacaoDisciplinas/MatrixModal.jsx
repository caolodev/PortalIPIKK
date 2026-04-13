import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSpinner,
  faCheckCircle,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

export default function MatrixModal({
  open,
  onClose,
  subjects,
  disabledIds,
  selectedIds,
  onToggle,
  onConfirm,
  loading,
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const safeSubjects = Array.isArray(subjects) ? subjects : [];
  const safeDisabledIds =
    disabledIds instanceof Set ? disabledIds : new Set(disabledIds || []);
  const safeSelectedIds = Array.isArray(selectedIds) ? selectedIds : [];

  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timeout);
  }, [open]);

  const filteredSubjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return safeSubjects
      .filter((subject) => {
        if (!normalized) return true;
        const name = (subject.name || subject.nome || "").toLowerCase();
        const sigla = (subject.sigla || "").toLowerCase();
        return name.includes(normalized) || sigla.includes(normalized);
      })
      .slice(0, 10);
  }, [query, safeSubjects]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-3xl mx-4 rounded-2xl bg-white shadow-2xl overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80">
            <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-8 py-6 shadow-lg border border-slate-200">
              <FontAwesomeIcon
                icon={faSpinner}
                className="animate-spin text-3xl text-[#0F2C59]"
              />
              <span className="text-sm font-medium text-slate-700">
                Salvando disciplinas...
              </span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Adicionar disciplinas à matriz
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Digite para filtrar e selecione até 10 disciplinas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 transition"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Buscar disciplinas
          </label>
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              placeholder="Procure por nome ou sigla"
            />
          </div>
        </div>

        <div className="max-h-[54vh] overflow-y-auto px-6 py-4 space-y-2">
          {filteredSubjects.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
              Nenhuma disciplina encontrada.
            </div>
          ) : (
            filteredSubjects.map((subject) => {
              const isDisabled = safeDisabledIds.has(subject.id);
              const isSelected = safeSelectedIds.includes(subject.id);
              const subjectIsGeneral =
                subject.isGeneral ??
                (!subject?.cursos || subject?.cursos.length === 0);
              const typeLabel =
                subject.type || (subjectIsGeneral ? "Geral" : "Específica");
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => !isDisabled && onToggle(subject.id)}
                  disabled={isDisabled}
                  className={`w-full rounded-md border p-4 text-left transition ${
                    isDisabled
                      ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                      : isSelected
                        ? "border-[#0F2C59] bg-[#0F2C59] text-white"
                        : "border-slate-200 bg-white text-slate-900 hover:border-[#0F2C59] hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">
                        {subject.nome ||
                          subject.sigla ||
                          "Disciplina não encontrada"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {subject.description ||
                          (typeLabel && `Tipo: ${typeLabel}`)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-slate-900 justify-center p-3 text-[11px] w-15 font-semibold text-white">
                        {subject.sigla || "N/A"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-t border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-500">
            {selectedIds.length} disciplina(s) selecionada(s)
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading || selectedIds.length === 0}
              className="inline-flex items-center gap-2 rounded-md bg-[#0F2C59] px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {loading ? (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin text-[#0F2C59]"
                />
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Confirmar vínculo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
