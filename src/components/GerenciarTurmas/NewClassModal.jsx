import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { CLASS_OPTIONS, SHIFT_OPTIONS } from "./constants";

export default function NewClassModal({ onClose, onCreate, loading }) {
  const [classe, setClasse] = useState("10");
  const [turno, setTurno] = useState("Manhã");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-[#0F2C59]">Nova Turma</h2>
          <p className="text-sm text-gray-500 mt-1">
            Informe classe e turno para criar uma nova turma.
          </p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Classe
            </label>
            <select
              value={classe}
              onChange={(e) => setClasse(e.target.value)}
              className="mt-2 w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 outline-none"
            >
              {CLASS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Turno
            </label>
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              className="mt-2 w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 outline-none"
            >
              {SHIFT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onCreate({ classe, turno })}
            className="flex items-center justify-center gap-2 bg-[#0F2C59] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-[#0F2C59]/90 transition-colors disabled:opacity-70"
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              "+ Criar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
