import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

export default function DisciplineDeleteConfirm({
  open,
  onClose,
  discipline,
  isDeleting,
  onConfirm,
  errorMessage,
}) {
  if (!open) return null;

  const hasError = errorMessage !== null;
  const subjectName = discipline?.subject?.nome || "Disciplina desconhecida";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => !isDeleting && onClose()}
      />
      <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-red-700">
            Confirmar desactivação da disciplina
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Tem certeza que deseja desactivar a disciplina{" "}
            <strong>{subjectName}</strong>? Esta ação pode ser revertida
            posteriormente.
          </p>
        </div>
        <div className="px-6 py-5 space-y-4">
          {hasError && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4">
              <div className="flex gap-3">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-red-600 mt-0.5 shrink-0"
                />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Não é possível desactivar</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting || hasError}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="text-sm" />
                  <span>Desactivando...</span>
                </>
              ) : (
                "Desactivar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
