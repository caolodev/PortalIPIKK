import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
export default function AcademicYearRow({
  yearItem,
  loadingId,
  onToggleStatus,
  onEdit,
  onClose,
}) {
  return (
    <tr
      key={yearItem.id}
      className="border-b hover:bg-gray-50 transition-colors"
    >
      <td className="px-3 md:px-6 py-4 text-[11px] md:text-sm text-gray-500 border-t border-gray-200">
        {yearItem.name}
      </td>
      <td className="px-3 md:px-6 py-4 text-[11px] md:text-sm text-gray-500 border-t border-gray-200">
        {yearItem.startDate}
      </td>
      <td className="px-3 md:px-6 py-4 text-[11px] md:text-sm text-gray-500 border-t border-gray-200">
        {yearItem.endDate}
      </td>
      <td className="px-3 md:px-6 py-4 text-[11px] md:text-sm text-gray-500 border-t border-gray-200">
        <button
          onClick={() => onToggleStatus(yearItem)}
          disabled={loadingId === yearItem.id || yearItem.status === "CLOSED"}
          className={`px-3 py-1 rounded-full sm:text-xs text-[11px] font-medium ${
            yearItem.status === "CLOSED"
              ? "bg-gray-300 text-gray-700 cursor-not-allowed"
              : yearItem.status === "ACTIVE"
                ? "bg-green-200 text-green-800"
                : "bg-yellow-200 text-yellow-800"
          }`}
        >
          {loadingId === yearItem.id ? (
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faSpinner} spin className="text-[10px]" />
              <span>Carregando</span>
            </span>
          ) : (
            yearItem.status
          )}
        </button>
      </td>
      <td className="px-3 md:px-6 py-4 text-right text-[11px] md:text-sm font-medium flex items-center justify-end gap-2 border-t border-gray-200">
        <button
          onClick={() => onEdit(yearItem)}
          disabled={yearItem.status === "CLOSED"}
          className={`text-[#0F2C59] ${yearItem.status === "CLOSED" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
        <button
          onClick={() => onClose(yearItem)}
          disabled={yearItem.status === "CLOSED"}
          className={`text-red-600 ml-2 ${yearItem.status === "CLOSED" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      </td>
    </tr>
  );
}
