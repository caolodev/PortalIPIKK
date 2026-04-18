"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faSpinner,
  faTimes,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function TeacherAssignmentModal({
  open,
  onClose,
  professors,
  searchValue,
  onSearchChange,
  selectedProfessor,
  onSelectProfessor,
  onSave,
  loading,
  subjectName,
  currentTeacherName,
  isAlreadyAssigned,
  isCurrentTeacherDirector,
  professorSubjects,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-4 items-center">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="mt-1.5 text-lg font-bold text-slate-900">
                {subjectName}
              </h2>
              <p className="mt-0.5 text-sm text-slate-400">
                {currentTeacherName
                  ? `Atual: ${currentTeacherName}`
                  : "Sem professor vinculado"}
              </p>
              {isCurrentTeacherDirector && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Atenção: esta disciplina está atualmente atribuída ao director
                  de turma. Alterar o professor poderá substituir essa
                  atribuição.
                </div>
              )}
              {isAlreadyAssigned && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  Atenção: este professor leciona a(s) disciplina(s):{" "}
                  {professorSubjects.map((s) => s.name).join(", ")}. queres
                  adicionar está disciplina a ele também?
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center mt-3 p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100"
              aria-label="Fechar modal"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pt-4">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar professor pelo nome..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#0f2c59] focus:bg-white focus:ring-2 focus:ring-[#0f2c59]/10"
            />
          </div>
        </div>

        {/* Professor list */}
        <div className="max-h-75 space-y-2 overflow-y-auto px-6 py-4">
          {professors.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-400">
              Nenhum professor encontrado.
            </div>
          ) : (
            professors.map((professor) => {
              const displayName =
                professor.nomeCompleto || professor.name || "Sem Nome";
              const isSelected = selectedProfessor?.id === professor.id;
              return (
                <button
                  key={professor.id}
                  type="button"
                  onClick={() => onSelectProfessor(professor)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                    isSelected
                      ? "border-[#0f2c59] bg-[#0f2c59]/5 ring-1 ring-[#0f2c59]/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0f2c59] text-[11px] font-bold text-white">
                    {getInitials(displayName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-400">Professor</p>
                  </div>
                  {isSelected && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0f2c59]">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-[10px] text-white"
                      />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!selectedProfessor || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f2c59] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f2c59]/90 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Salvando...
              </>
            ) : (
              "Salvar atribuição"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
