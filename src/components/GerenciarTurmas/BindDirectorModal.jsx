"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { bindClassDirector } from "@/services/classRoleService";
import { getActiveProfessorsByTurma } from "@/services/classSubjectsService";
import { getProfessors } from "@/services/courseService";

function getProfessorName(professor) {
  return professor.nomeCompleto || professor.name || "";
}

export default function BindDirectorModal({ turma, onClose, onBind }) {
  const [professors, setProfessors] = useState([]);
  const [selectedProfessorId, setSelectedProfessorId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadProfessors() {
      setLoading(true);
      try {
        const eligibleRes = await getActiveProfessorsByTurma(turma.id);
        if (!eligibleRes.success) {
          toast.error(
            eligibleRes.error || "Erro ao carregar professores da turma.",
          );
          setProfessors([]);
          return;
        }

        const professorListRes = await getProfessors();
        if (!professorListRes.success) {
          toast.error(
            professorListRes.error || "Erro ao carregar professores.",
          );
          setProfessors([]);
          return;
        }

        const filtered = professorListRes.data.filter((prof) =>
          eligibleRes.data.includes(prof.id),
        );

        setProfessors(filtered);
      } catch (error) {
        toast.error("Erro ao carregar professores da turma.");
      } finally {
        setLoading(false);
      }
    }

    loadProfessors();
  }, [turma.id]);

  const handleSubmit = async () => {
    if (!selectedProfessorId) {
      toast.error("Selecione um professor para vincular.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await bindClassDirector(turma.id, selectedProfessorId);
      if (!result.success) {
        toast.error(result.error || "Erro ao vincular director de turma.");
      } else {
        toast.success("director de turma vinculado com sucesso.");
        onBind();
        onClose();
      }
    } catch (error) {
      toast.error("Erro ao vincular director de turma.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-[#0F2C59]">
            Vincular director de Turma
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Selecione um professor que leciona nesta turma.
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <FontAwesomeIcon
                icon={faSpinner}
                className="animate-spin text-gray-500"
              />
            </div>
          ) : professors.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhum professor ativo encontrado para esta turma.
            </p>
          ) : (
            <div className="relative">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Buscar professor
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  if (!value) {
                    setSelectedProfessorId("");
                    return;
                  }

                  const exactMatch = professors.find((prof) => {
                    const profName = getProfessorName(prof);
                    return (
                      profName &&
                      profName.toLowerCase().trim() ===
                        value.toLowerCase().trim()
                    );
                  });
                  setSelectedProfessorId(exactMatch?.id || "");
                }}
                onBlur={() => {
                  const match = professors.find(
                    (prof) =>
                      getProfessorName(prof).toLowerCase().trim() ===
                      searchTerm.toLowerCase().trim(),
                  );
                  if (!match) {
                    setSelectedProfessorId("");
                  }
                }}
                placeholder="Digite o nome do professor"
                className="mt-2 w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 outline-none"
              />
              <div className="mt-2 max-h-52 overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                {professors
                  .filter((prof) =>
                    getProfessorName(prof)
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase().trim()),
                  )
                  .slice(0, 8)
                  .map((prof) => {
                    const name = getProfessorName(prof);
                    const isSelected = prof.id === selectedProfessorId;
                    return (
                      <button
                        key={prof.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setSearchTerm(name);
                          setSelectedProfessorId(prof.id);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 ${
                          isSelected ? "bg-[#0F2C59]/10 text-[#0F2C59]" : ""
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
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
            disabled={submitting || professors.length === 0}
            onClick={handleSubmit}
            className="flex items-center justify-center gap-2 bg-[#0F2C59] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-[#0F2C59]/90 transition-colors disabled:opacity-70"
          >
            {submitting ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              "Vincular"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
