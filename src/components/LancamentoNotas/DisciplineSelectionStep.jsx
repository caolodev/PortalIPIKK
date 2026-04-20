"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function DisciplineSelectionStep({
  disciplines,
  selectedDiscipline,
  onSelectDiscipline,
  loading,
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-slate-900">
          Passo 2: Selecionar Disciplina
        </p>
        <p className="text-xs text-slate-500">
          Escolha a disciplina para a qual deseja lançar notas.
        </p>
      </div>

      {loading ? (
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-center gap-2">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-xs text-[#0f2c59]"
            />
            <span className="text-xs text-slate-600">
              Carregando disciplinas...
            </span>
          </div>
        </div>
      ) : disciplines.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-xs text-slate-600">
            Nenhuma disciplina encontrada para esta turma.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-slate-200 bg-white p-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
            {disciplines.map((discipline) => (
              <button
                key={discipline.id}
                onClick={() => onSelectDiscipline(discipline)}
                className={`p-2 rounded-sm border-2 transition-all text-left text-xs ${
                  selectedDiscipline?.id === discipline.id
                    ? "border-[#0f2c59] bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className="font-semibold text-slate-900 text-xs">
                  {discipline.subject?.name || "Disciplina desconhecida"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {discipline.subject?.sigla || "N/A"}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
