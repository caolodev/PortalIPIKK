import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function HistoryModal({ turma, entries, loading, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#0F2C59]">
              Histórico de Diretores
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Histórico de vinculações desta turma.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <FontAwesomeIcon
                icon={faSpinner}
                className="animate-spin text-gray-500"
              />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhum histórico de diretores encontrado.
            </p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-gray-200 p-4 bg-gray-50"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {entry.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Desde {new Date(entry.startDate).getFullYear()} até{" "}
                    {entry.endDate
                      ? new Date(entry.endDate).getFullYear()
                      : "Presente"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
