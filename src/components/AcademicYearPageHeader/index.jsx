import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCalendar } from "@fortawesome/free-solid-svg-icons";

export default function AcademicYearPageHeader({ onNewClick }) {
  return (
    <div className="flex items-center justify-between mb-5 sm:text-[1rem] text-[0.8rem]">
      <div>
        <h1 className="text-2xl font-bold text-[#0F2C59]">
          Gestão de Ano Lectivo
        </h1>
        <p className="text-gray-500">
          Gestão dos períodos académicos do Instituto
        </p>
      </div>
      <button
        onClick={onNewClick}
        title="Novo Ano Lectivo"
        className="flex items-center gap-2 bg-[#0F2C59] text-white px-4 py-3 rounded-lg hover:bg-[#0F2C59]/90 transition-all  shadow-md hover:shadow-lg duration-200"
      >
        <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
        <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
        <span className="text-sm font-medium">Ano</span>
      </button>
    </div>
  );
}
