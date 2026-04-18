import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPencilAlt,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

export default function AcademicQuarterCard({
  quarter,
  isAddCard = false,
  isDisabled = false,
  onAdd,
  onEdit,
  onDelete,
}) {
  const baseCardStyles =
    "flex flex-col w-full rounded-lg transition-all h-full min-h-[180px] overflow-hidden";

  const statusStyles = {
    ACTIVE: {
      label: "Activo",
      badge: "text-emerald-700 bg-emerald-100",
      card: "border-emerald-200 bg-emerald-50",
      button: "border-emerald-200 text-emerald-700 hover:bg-emerald-100",
    },
    INACTIVE: {
      label: "inactivo",
      badge: "text-amber-700 bg-amber-100",
      card: "border-amber-200 bg-amber-50",
      button: "border-amber-200 text-amber-700 hover:bg-amber-100",
    },
    CLOSED: {
      label: "Fechado",
      badge: "text-slate-700 bg-slate-100",
      card: "border-slate-200 bg-slate-50",
      button: "border-slate-200 text-slate-700 hover:bg-slate-100",
    },
    UNKNOWN: {
      label: "Desconhecido",
      badge: "text-gray-500 bg-gray-100",
      card: "border-gray-200 bg-white",
      button: "border-gray-200 text-gray-600 hover:bg-gray-100",
    },
  };

  // --- CARD DE ADICIONAR ---
  if (isAddCard) {
    return (
      <button
        onClick={!isDisabled ? onAdd : undefined}
        disabled={isDisabled}
        className={`${baseCardStyles} items-center justify-center p-5 border-2 border-dashed ${
          isDisabled
            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
            : "border-gray-300 bg-white  hover:border-slate-400 text-slate-400 hover:text-slate-600 shadow-sm hover:shadow-md"
        }`}
      >
        <div
          className={`rounded-full p-4 mb-2 ${isDisabled ? "bg-gray-100" : "bg-slate-50"}`}
        >
          <FontAwesomeIcon icon={faPlus} className="w-5 h-5" />
        </div>
        <span className="text-sm font-semibold tracking-wider">
          Novo Trimestre
        </span>
      </button>
    );
  }

  if (!quarter) {
    return null;
  }

  const { number, startDate, endDate, status } = quarter;
  const displayNumber = Number.isInteger(number) ? number : "?";
  const statusInfo = statusStyles[status] || statusStyles.UNKNOWN;

  return (
    <div
      className={`${baseCardStyles} border border-gray-200 bg-white shadow-sm`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F2C59] text-sm font-bold text-white">
            {displayNumber}º
          </div>
          <div>
            <p className="text-sm uppercase font-bold text-[#0F2C59]">
              Trimestre
            </p>
            <p className="text-xs text-slate-500">Número do trimestre</p>
          </div>
        </div>
        <span
          className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md ${statusInfo.badge}`}
        >
          {statusInfo.label}
        </span>
      </div>

      <hr className="border-gray-100" />

      {/* Datas */}
      <div className="p-3 space-y-3 grow">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400 font-medium">Início</span>
          <span className="font-semibold text-slate-700">
            {new Date(startDate).toLocaleDateString("pt-PT", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400 font-medium">Fim</span>
          <span className="font-semibold text-slate-700">
            {new Date(endDate).toLocaleDateString("pt-PT", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* acções */}
      <div className="flex flex-col gap-3 p-3 pt-0">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onEdit?.(quarter)}
            className="grow flex items-center justify-center gap-2 py-1 px-4 border border-gray-200 rounded-[5px] text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FontAwesomeIcon
              icon={faPencilAlt}
              className="text-slate-400 text-xs"
            />
            Editar
          </button>

          {status === "INACTIVE" && (
            <button
              onClick={() => onDelete?.(quarter)}
              className="grow flex items-center justify-center gap-2 py-1 px-4 border rounded-[5px] text-sm font-bold text-rose-700 border-rose-200 hover:bg-rose-50 transition-colors"
            >
              <FontAwesomeIcon
                icon={faTrashAlt}
                className="text-rose-400 text-xs"
              />
              Apagar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
