import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

export default function PaginationControls({
  currentPage,
  totalPages,
  itemsCount,
  onPrevious,
  onNext,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mt-4">
      <span className="text-xs md:text-sm text-gray-600 text-center md:text-left">
        Página {currentPage} de {totalPages} ({itemsCount} anos)
      </span>
      <div className="flex items-center gap-2 justify-center md:justify-end">
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="px-3 md:px-3 py-2 md:py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          title="Página anterior"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="px-3 md:px-3 py-2 md:py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          title="Próxima página"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
}
