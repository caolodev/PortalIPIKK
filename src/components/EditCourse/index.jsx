import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { updateCourse, hasCourseClasses } from "@/services/courseService";

export default function EditCourse({
  setIsOpen,
  course,
  onSuccess,
  isHistoric = false,
  isCheckingHistory = false,
}) {
  const [name, setName] = useState(course.name || "");
  const [code, setCode] = useState(course.code || "");
  const [loading, setLoading] = useState(false);
  const [hasHistory, setHasHistory] = useState(course.hasHistory || false);

  useEffect(() => {
    setName(course.name || "");
    setCode(course.code || "");
    setHasHistory(course.hasHistory || false);
  }, [course]);

  useEffect(() => {
    if (isCheckingHistory) {
      const checkHistory = async () => {
        try {
          const result = await hasCourseClasses(course.id);
          if (!result.success) {
            toast.error(
              result.error || "Erro ao verificar histórico do curso.",
            );
            setIsOpen(false);
            return;
          }
          setHasHistory(result.hasClasses);
        } catch (error) {
          toast.error("Erro ao verificar histórico do curso.");
          setIsOpen(false);
        } finally {
          // Note: isCheckingHistory is not set to false here, as it's a prop
        }
      };
      checkHistory();
    }
  }, [isCheckingHistory, course.id, setIsOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (hasHistory) {
        toast.error(
          "Identidade do curso preservada devido ao histórico académico.",
        );
        setLoading(false);
        return;
      }

      if (!name.trim() || !code.trim()) {
        toast.error("Por favor, preencha todos os campos.");
        setLoading(false);
        return;
      }
      const result = await updateCourse(course.id, { name, code });
      if (result.success) {
        toast.success("Curso atualizado com sucesso!");
        onSuccess(); // Recarrega a lista de cursos no componente pai
        setIsOpen(false);
      } else {
        toast.error("Erro ao atualizar curso: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao atualizar curso:", error);
      toast.error("Erro ao atualizar curso: " + error.message);
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
                icon={faGraduationCap}
                className="w-3.5 h-3.5 text-[#0F2C59]"
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#0F2C59] leading-tight">
                Editar Curso
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Gerenciamento de cursos
              </p>
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
        <form
          className="px-6 py-5 grid grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="nomeCurso"
              className="text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Nome do Curso
            </label>
            <input
              type="text"
              id="nomeCurso"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Informática"
              readOnly={isHistoric}
              className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="codigoCurso"
              className="text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Codigo do Curso
            </label>
            <input
              type="text"
              id="codigoCurso"
              required
              value={code}
              onChange={(e) =>
                setCode(e.target.value.toUpperCase().slice(0, 3))
              }
              placeholder="Ex.: INF"
              maxLength={3}
              readOnly={isHistoric}
              className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          {isHistoric && (
            <div className="col-span-2 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
              Identidade do curso preservada devido ao histórico académico.
            </div>
          )}
          <div className="col-span-2 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-500 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors "
            >
              Cancelar
            </button>
            <button
              disabled={loading || isHistoric}
              type="submit"
              className="flex items-center justify-center min-w-[22.5] bg-[#0F2C59] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-[#0F2C59]/90 transition-colors  disabled:opacity-70"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                "Atualizar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
