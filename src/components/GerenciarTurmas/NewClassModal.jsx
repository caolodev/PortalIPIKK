import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { CLASS_OPTIONS, SHIFT_OPTIONS } from "./constants";
import { getNextClassSigla } from "../../services/classService";

export default function NewClassModal({
  mode = "create",
  courseCode = "",
  courseId = "",
  activeYearName = "",
  initialData = null,
  onClose,
  onSubmit,
  loading,
  submitLabel,
  disableSubmit,
  disableReason,
}) {
  // Calcular valores iniciais
  const initialClasse = initialData?.classe || "10";
  const initialTurno = initialData?.turno || "Manhã";
  const initialCourseCode = courseCode || "";
  const initialSigla = initialData?.sigla || "A";
  const initialNomeBase =
    initialData?.nomeBase ||
    `${initialCourseCode || "CUR"}${initialClasse}${initialSigla}${initialTurno[0].toUpperCase()}`;
  const initialNomeExibicao =
    initialData?.nomeExibicao ||
    (activeYearName ? `${activeYearName}_${initialNomeBase}` : initialNomeBase);

  const [classe, setClasse] = useState(initialClasse);
  const [turno, setTurno] = useState(initialTurno);
  const [courseCodeInput, setCourseCodeInput] = useState(initialCourseCode);
  const [sigla, setSigla] = useState(initialSigla);
  const [nomeBase, setNomeBase] = useState(initialNomeBase);
  const [nomeExibicao, setNomeExibicao] = useState(initialNomeExibicao);

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Previews para referência (não usados nos inputs, pois são editáveis)
  const previewSigla = useMemo(() => "A", []);
  const previewNomeBase = useMemo(() => {
    const turnoInitial = turno ? turno[0].toUpperCase() : "";
    return `${courseCodeInput || "CUR"}${classe}${previewSigla}${turnoInitial}`;
  }, [courseCodeInput, classe, turno, previewSigla]);

  const previewExibicao = useMemo(() => {
    return activeYearName
      ? `${activeYearName}_${previewNomeBase}`
      : previewNomeBase;
  }, [activeYearName, previewNomeBase]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {mode === "edit" ? "Editar Turma" : "Nova Turma"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Ajuste a classe e o turno. O nome base e a exibição final são
              gerados automaticamente.
            </p>
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        <form
          className="px-6 py-5 grid grid-cols-2 gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (showPreview) {
              onSubmit(previewData);
            } else if (mode === "create") {
              setPreviewLoading(true);
              try {
                // Calcular dados gerados
                const generatedSigla = await getNextClassSigla(
                  courseId,
                  classe,
                );
                const generatedNomeBase = `${courseCodeInput || "CUR"}${classe}${generatedSigla}${turno[0].toUpperCase()}`;
                const generatedNomeExibicao = activeYearName
                  ? `${activeYearName}_${generatedNomeBase}`
                  : generatedNomeBase;
                setPreviewData({
                  classe,
                  turno,
                  courseCode: courseCodeInput,
                  sigla: generatedSigla,
                  nomeBase: generatedNomeBase,
                  nomeExibicao: generatedNomeExibicao,
                });
                setShowPreview(true);
              } catch (error) {
                console.error("Erro ao gerar nome da turma:", error);
                // Talvez mostrar toast ou algo
              } finally {
                setPreviewLoading(false);
              }
            } else {
              onSubmit({
                classe,
                turno,
                courseCode: courseCodeInput,
                sigla,
                nomeBase,
                nomeExibicao,
              });
            }
          }}
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Classe
            </label>
            <select
              value={classe}
              onChange={(e) => setClasse(e.target.value)}
              className="border border-gray-200 rounded-xl bg-white px-3.5 py-3 text-sm text-gray-700 focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 outline-none transition-all"
            >
              {CLASS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Turno
            </label>
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              className="border border-gray-200 rounded-xl bg-white px-3.5 py-3 text-sm text-gray-700 focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 outline-none transition-all"
            >
              {SHIFT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {mode === "edit" && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código do Curso
                </label>
                <input
                  type="text"
                  value={courseCodeInput}
                  onChange={(e) => setCourseCodeInput(e.target.value)}
                  className="border border-gray-200 rounded-xl bg-white px-3.5 py-3 text-sm text-gray-700 focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sigla sugerida
                </label>
                <input
                  type="text"
                  value={sigla}
                  onChange={(e) => setSigla(e.target.value)}
                  className="border border-gray-200 rounded-xl bg-white px-3.5 py-3 text-sm text-gray-700 focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome Base
                </label>
                <input
                  type="text"
                  value={nomeBase}
                  onChange={(e) => setNomeBase(e.target.value)}
                  className="border border-gray-200 rounded-xl bg-white px-3.5 py-3 text-sm text-gray-700 focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome de exibição final
                </label>
                <input
                  type="text"
                  value={nomeExibicao}
                  onChange={(e) => setNomeExibicao(e.target.value)}
                  className="border border-gray-200 rounded-xl bg-white px-3.5 py-3 text-sm text-gray-700 focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 outline-none transition-all"
                />
              </div>
            </>
          )}

          {showPreview && (
            <div className="col-span-2 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
              <p className="font-medium">Nome da Turma Gerado:</p>
              <p className="mt-1 font-mono">{previewData.nomeExibicao}</p>
            </div>
          )}

          {disableSubmit && (
            <div className="col-span-2 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              {disableReason ||
                "Esta turma não pode ser alterada no momento. Verifique as regras e tente novamente."}
            </div>
          )}

          <div className="col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => {
                if (showPreview) {
                  setShowPreview(false);
                  setPreviewData(null);
                } else {
                  onClose();
                }
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:w-auto"
            >
              {showPreview ? "Voltar" : "Cancelar"}
            </button>
            <button
              type="submit"
              disabled={loading || disableSubmit || previewLoading}
              className="w-full rounded-xl bg-[#0F2C59] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0F2C59]/90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Processando...
                </span>
              ) : previewLoading ? (
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Gerando nome...
                </span>
              ) : showPreview ? (
                "Confirmar Criação"
              ) : (
                submitLabel ||
                (mode === "edit" ? "Guardar Alterações" : "Criar Turma")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
