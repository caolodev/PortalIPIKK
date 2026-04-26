import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClockRotateLeft,
  faSpinner,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const formatHistoryDate = (dateString) => {
  if (!dateString) return "?";
  return new Date(dateString).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function HistoryEntriesModal({
  title,
  subtitle,
  entries,
  loading,
  onClose,
  emptyMessage = "Nenhum histórico encontrado.",
}) {

  const entriesSorted = entries.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); // Ordenar por data de início mais recente primeiro

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0F2C59]/10 flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faClockRotateLeft}
                  className="w-4 h-4 text-[#0F2C59]"
                />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#0F2C59]">
                  {title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-6 py-5 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <FontAwesomeIcon
                icon={faSpinner}
                className="animate-spin text-gray-500"
              />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-gray-500 text-center">{emptyMessage}</p>
          ) : (
            <div className="space-y-4">
              {entriesSorted.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {entry.name || entry.userName || "Sem nome"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      De {formatHistoryDate(entry.startDate)}
                      {entry.endDate
                        ? ` até ${formatHistoryDate(entry.endDate)}`
                        : " (atual)"}
                    </p>
                  </div>
                  {!entry.endDate && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Atual
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
