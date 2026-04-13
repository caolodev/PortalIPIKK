import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faSpinner,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import {
  bindCoordinator,
  isProfessorActiveCoordinator,
} from "@/services/courseRoleService";
import { getProfessors } from "@/services/courseService";

function getProfessorName(professor) {
  return professor.name || professor.nomeCompleto || "";
}

export default function VincularCoordinator({ setIsOpen, course, onSuccess }) {
  const [professors, setProfessors] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [professorAlreadyCoordinating, setProfessorAlreadyCoordinating] =
    useState(null);

  const filteredProfessors = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return professors;
    return professors.filter((professor) =>
      getProfessorName(professor).toLowerCase().includes(normalized),
    );
  }, [professors, searchTerm]);

  const shownProfessors = searchTerm.trim() ? filteredProfessors : professors;

  useEffect(() => {
    if (!selectedProfessor) return;
    const selectedName = getProfessorName(selectedProfessor)
      .trim()
      .toLowerCase();
    if (searchTerm.trim().toLowerCase() !== selectedName) {
      setSelectedProfessor(null);
    }
  }, [searchTerm, selectedProfessor]);

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const result = await getProfessors();
        if (result.success) {
          // Validar que todos os professores têm nome
          const validProfessors = result.data.filter(
            (p) => p.name || p.nomeCompleto,
          );
          setProfessors(validProfessors);
        } else {
          console.error("Erro ao carregar professores: " + result.error);
        }
      } catch (error) {
        console.error("Erro ao buscar professores:", error);
        toast.error("Erro ao carregar professores");
      } finally {
        setFetching(false);
      }
    };
    fetchProfessors();
  }, []);

  useEffect(() => {
    if (!selectedProfessor) {
      setProfessorAlreadyCoordinating(null);
      return;
    }

    const validateProfessor = async () => {
      const { isActive, courseId } = await isProfessorActiveCoordinator(
        selectedProfessor.id,
        course.id,
      );
      if (isActive) {
        setProfessorAlreadyCoordinating(courseId);
      } else {
        setProfessorAlreadyCoordinating(null);
      }
    };

    validateProfessor();
  }, [selectedProfessor, course.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProfessor) {
      toast.error("Por favor, selecione um professor válido.");
      return;
    }
    setLoading(true);
    try {
      const result = await bindCoordinator(course.id, selectedProfessor.id);
      if (result.success) {
        toast.success("Coordenador vinculado com sucesso!");
        onSuccess();
        setIsOpen(false);
      } else {
        // Mensagem de erro específica do backend
        toast.error(result.error || "Erro ao vincular coordenador");
      }
    } catch (error) {
      console.error("Erro ao vincular coordenador:", error);
      toast.error("Erro ao vincular coordenador: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0F2C59]/8 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faUserPlus}
                className="w-3.5 h-3.5 text-[#0F2C59]"
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#0F2C59] leading-tight">
                Vincular Coordenador
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">{course.name}</p>
            </div>
          </div>
          <button
            disabled={loading}
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all "
          >
            <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Form */}
        <form className="px-6 py-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Selecionar Professor
            </label>
            {fetching ? (
              <div className="flex items-center justify-center py-4">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin text-gray-500"
                />
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchTerm(value);
                    const prof = professors.find((p) => {
                      const profName = getProfessorName(p);
                      return (
                        profName &&
                        profName.toLowerCase().trim() ===
                          value.toLowerCase().trim()
                      );
                    });
                    setSelectedProfessor(prof || null);
                  }}
                  onBlur={() => {
                    if (selectedProfessor) return;
                    const prof = professors.find((p) => {
                      const profName = getProfessorName(p);
                      return (
                        profName &&
                        profName.toLowerCase().trim() ===
                          searchTerm.toLowerCase().trim()
                      );
                    });
                    if (!prof) {
                      setSearchTerm("");
                      setSelectedProfessor(null);
                    }
                  }}
                  placeholder="Digite o nome do professor"
                  className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 outline-none transition-all"
                />

                {shownProfessors.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                    {shownProfessors.slice(0, 6).map((prof) => (
                      <button
                        key={prof.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          const profName = getProfessorName(prof);
                          setSearchTerm(profName);
                          setSelectedProfessor(prof);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {getProfessorName(prof)}
                      </button>
                    ))}
                  </div>
                )}

                {searchTerm.trim() && filteredProfessors.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Nenhum professor encontrado.
                  </p>
                )}

                {professorAlreadyCoordinating && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                    <FontAwesomeIcon
                      icon={faWarning}
                      className="text-yellow-600 w-4 h-4 mt-0.5"
                    />
                    <p className="text-sm text-yellow-800">
                      Este professor já é coordenador de um curso.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              disabled={loading}
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-500 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors "
            >
              Cancelar
            </button>
            <button
              disabled={loading || !selectedProfessor}
              type="submit"
              className="flex items-center justify-center min-w-[22.5] bg-[#0F2C59] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-[#0F2C59]/90 transition-colors  disabled:opacity-70"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                "Vincular"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
