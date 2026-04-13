import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons";

const statusConfig = {
  ACTIVE: {
    label: "Activo",
    classes: "bg-green-100 text-green-700 border border-green-200",
  },
  CLOSED: {
    label: "Encerrado",
    classes: "bg-red-100 text-red-600 border border-red-200",
  },
  INACTIVE: {
    label: "Inactivo",
    classes: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },
};

export default function AcademicYearRow({ yearItem, onEdit }) {
  const isClosed = yearItem.status === "CLOSED";
  const status = statusConfig[yearItem.status] ?? {
    label: yearItem.status,
    classes: "bg-gray-100 text-gray-600 border border-gray-200",
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
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide ${status.classes}`}
        >
          {status.label}
        </span>
      </td>
      <td className="px-3 md:px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(yearItem)}
            disabled={isClosed}
            title="Editar"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150
              ${
                isClosed
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-400 hover:text-[#0F2C59] hover:bg-[#0F2C59]/8 "
              }`}
          >
            <FontAwesomeIcon icon={faEdit} className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
