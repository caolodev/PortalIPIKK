import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faCircleCheck,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
export default function InsightCourse({ insights }) {
  const insightCards = [
    {
      label: "Total de Cursos",
      value: insights.totalCourses,
      pct: 100,
      icon: faBookOpen,
      iconBg: "#E6F1FB",
      iconColor: "#185FA5",
      barColor: "#378ADD",
      pctColor: "#185FA5",
    },
    {
      label: "Cursos Activos",
      value: insights.courseActive,
      pct: Math.round((insights.courseActive / insights.totalCourses) * 100),
      icon: faCircleCheck,
      iconBg: "#E1F5EE",
      iconColor: "#0F6E56",
      barColor: "#1D9E75",
      pctColor: "#0F6E56",
    },
    {
      label: "Inactivos",
      value: insights.courseInactive,
      pct: Math.round((insights.courseInactive / insights.totalCourses) * 100),
      icon: faWarning,
      iconBg: "#FAEEDA",
      iconColor: "#854F0B",
      barColor: "#EF9F27",
      pctColor: "#854F0B",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
      {insightCards.map(
        ({
          label,
          value,
          pct,
          icon,
          iconBg,
          iconColor,
          barColor,
          pctColor,
        }) => (
          <div
            key={label}
            className="bg-white border border-gray-100 rounded-lg p-3"
          >
            <div className="flex justify-between items-start mb-2.5">
              <div>
                <p className="text-[22px] font-medium text-[#0F2C59] leading-none mb-0.5">
                  {value}
                </p>
                <p className="text-[11px] text-gray-400">{label}</p>
              </div>
              <div
                className="w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: iconBg }}
              >
                <FontAwesomeIcon
                  icon={icon}
                  className="text-[12px]"
                  style={{ color: iconColor }}
                />
              </div>
            </div>

            {/* barra */}
            <div className="h-0.75 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: barColor }}
              />
            </div>

            <p
              className="text-[11px] font-medium mt-1"
              style={{ color: pctColor }}
            >
              {pct}%
            </p>
          </div>
        ),
      )}
    </div>
  );
}
