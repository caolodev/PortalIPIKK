import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
const STATUS_OPTIONS = [
  { value: "ALL", label: "Todos", activeClass: "" },
  { value: "ACTIVE", label: "Active", activeClass: "text-teal-700" },
  { value: "INACTIVE", label: "Inactive", activeClass: "text-amber-700" },
  { value: "CLOSED", label: "Closed", activeClass: "text-red-700" },
];

export default function StatusFilter({ filterStatus, onFilterChange }) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap my-5">
      <div>
        <FontAwesomeIcon icon={faFilter} className="text-[13px] mr-2 text-gray-500"/>
        <span className="text-sm text-gray-500 whitespace-nowrap">
          Filtrar status
        </span>
      </div>

      <div className="flex bg-gray-100 border border-gray-200 rounded-full p-[0.75] gap-0.5">
        {STATUS_OPTIONS.map(({ value, label, activeClass }) => {
          const isActive = filterStatus === value;
          return (
            <button
              key={value}
              onClick={() => onFilterChange(value)}
              className={`
                px-3.5 py-1 rounded-full text-[13px] transition-all duration-150
                ${
                  isActive
                    ? `bg-white border border-gray-200 font-medium ${activeClass || "text-gray-900"}`
                    : "text-gray-500 hover:bg-white hover:text-gray-800"
                }
              `}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
