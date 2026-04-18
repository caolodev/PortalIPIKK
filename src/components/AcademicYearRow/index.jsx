import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons";
import {
  faCheck,
  faClock,
  faLock,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const statusConfig = {
  ACTIVE: {
    label: "Activo",
    classes: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    icon: faCheck,
  },
  INACTIVE: {
    label: "Inactivo",
    classes: "bg-amber-100 text-amber-800 border border-amber-200",
    icon: faClock,
  },
  CLOSED: {
    label: "Encerrado",
    classes: "bg-slate-100 text-slate-700 border border-slate-300",
    icon: faLock,
  },
};

export default function AcademicYearRow({ yearItem, onEdit, onDelete }) {
  const isClosed = yearItem.status === "CLOSED";
  const isInactive = yearItem.status === "INACTIVE";
  const status = statusConfig[yearItem.status] ?? {
    label: yearItem.status,
    classes: "bg-gray-100 text-gray-600 border border-gray-200",
    icon: faLock,
  };

  return (
    <tr className="group border-b border-gray-100 hover:bg-gray-50 transition-colors duration-100">
      <td className="px-3 md:px-6 py-4 text-[11px] md:text-sm font-medium text-[#0F2C59]">
        {yearItem.name}
      </td>
      <td className="px-3 md:px-6 py-4 text-[11px] md:text-sm text-gray-500">
        {yearItem.startDate}
      </td>
      <td className="px-3 md:px-6 py-4 text-[11px] md:text-sm text-gray-500">
        {yearItem.endDate}
      </td>
      <td className="px-3 md:px-6 py-4">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide ${status.classes}`}
        >
          <FontAwesomeIcon icon={status.icon} className="w-3.5 h-3.5" />
          {status.label}
        </span>
      </td>
      <td className="px-3 md:px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(yearItem)}
            title="Editar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0F2C59] border border-[#0F2C59]/20 bg-[#0F2C59]/5 hover:bg-[#0F2C59]/10 transition-all duration-150"
          >
            <FontAwesomeIcon icon={faEdit} className="w-3.5 h-3.5" />
          </button>

          {isInactive ? (
            <button
              type="button"
              onClick={() => onDelete?.(yearItem)}
              title="Apagar"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-700 bg-red-100 border border-red-200 hover:bg-red-200 transition-all duration-150"
            >
              <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div
              title={
                isClosed
                  ? "Não é possível apagar um ano encerrado"
                  : "Só é possível apagar anos inativos"
              }
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 bg-slate-100 border border-slate-200"
            >
              <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
