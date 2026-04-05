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
}) {
  const baseCardStyles =
    "flex flex-col w-full rounded-lg transition-all h-full min-h-[180px]";
  // --- CARD DE ADICIONAR ---
  if (isAddCard) {
    return (
      <button
        onClick={!isDisabled ? onAdd : undefined}
        disabled={isDisabled}
        className={`${baseCardStyles} items-center justify-center p-5 border-2 border-dashed ${
          isDisabled
            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
            : "border-gray-300 bg-white cursor-pointer hover:border-slate-400 text-slate-400 hover:text-slate-600 shadow-sm hover:shadow-md"
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

  const tweaksByStatus = () => {
    if (status === "ACTIVE")
      return { text: "Activo", style: "text-green-600 bg-green-100" };
    if (status === "INACTIVE")
      return { text: "Inactivo", style: "text-blue-600 bg-blue-100" };
    if (status === "CLOSED")
      return { text: "Fechado", style: "text-red-600 bg-red-100" };
    return { text: "Desconhecido", style: "text-gray-500 bg-gray-100" };
  };

  const statusInfo = tweaksByStatus();
  return (
    <div
      className={`${baseCardStyles} border border-gray-200 bg-white shadow-sm overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <h4 className="text-sm uppercase font-bold text-[#0F2C59]">
          {number || 3}º Trimestre
        </h4>
        <span
          className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md ${statusInfo.style}`}
        >
          {statusInfo.text}
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

      {/* Ações */}
      <div className="flex gap-2 p-3 pt-0">
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
      </div>
    </div>
  );
}
