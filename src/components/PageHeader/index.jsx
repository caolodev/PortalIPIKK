import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";

export default function PageHeader({
  title,
  description,
  buttonText,
  onButtonClick,
  buttonTitle,
  fontAwesomeIcon = faCalendar,
}) {
  return (
    <div className="flex items-center justify-between mb-10">
      <div className="flex items-end gap-6">
        <div className="w-[0.75] h-12 bg-[#0F2C59] rounded-full shrink-0" />
        <div>
          <h1 className="text-2xl font-bold text-[#0F2C59] leading-tight tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-light">{description}</p>
        </div>
      </div>

      <button
        onClick={onButtonClick}
        title={buttonTitle}
        className="group flex items-center gap-2 border border-[#0F2C59] text-[#0F2C59] px-4 py-2.5 rounded-lg hover:bg-[#0F2C59] hover:text-white transition-all duration-200 cursor-pointer"
      >
        <FontAwesomeIcon icon={fontAwesomeIcon !== undefined ? fontAwesomeIcon : faCalendar} className="w-3.5 h-3.5" />
        <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
        <span className="text-sm font-medium">{buttonText}</span>
      </button>
    </div>
  );
}
