import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";

export default function PageHeader({
  title,
  description,
  buttonText,
  onButtonClick,
  buttonTitle,
  fontAwesomeIcon,
  buttonIcon = faCalendar,
  buttonDisabled = false,
  disabledReason = "",
}) {
  const resolvedIcon = buttonIcon ?? fontAwesomeIcon;
  const showButton = Boolean(buttonText);

  return (
    <div className="flex gap-6 items-center justify-between mb-10 flex-wrap">
      <div className="flex items-end gap-6">
        <div className="w-[0.75] h-12 bg-[#0F2C59] rounded-full shrink-0" />
        <div>
          <h1 className="text-2xl font-bold text-[#0F2C59] leading-tight tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-light">{description}</p>
        </div>
      </div>

      {showButton && (
        <button
          onClick={onButtonClick}
          disabled={buttonDisabled}
          title={buttonDisabled ? disabledReason : buttonTitle}
          className={`group flex items-center gap-2 border px-4 py-2.5 rounded-lg transition-all w-fit duration-200 ${
            buttonDisabled
              ? "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed opacity-60"
              : "border-[#0F2C59] text-[#0F2C59] hover:bg-[#0F2C59] hover:text-white"
          }`}
        >
          {resolvedIcon && (
            <FontAwesomeIcon icon={resolvedIcon} className="w-3.5 h-3.5" />
          )}
          {resolvedIcon && (
            <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
          )}
          <span className="text-sm font-medium">{buttonText}</span>
        </button>
      )}
    </div>
  );
}
