import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const CARD_STYLES = {
  blue: {
    iconBg: "#E6F1FB",
    iconColor: "#0C447C",
    barColor: "#378ADD",
    pctColor: "#185FA5",
  },
  green: {
    iconBg: "#E1F5EE",
    iconColor: "#085041",
    barColor: "#1D9E75",
    pctColor: "#0F6E56",
  },
};

export default function InsightCards({ insightData }) {
  const cards = [
    {
      label: "Total de Turmas",
      value: insightData.total,
      pct: 100,
      color: "blue",
    },
    {
      label: "Turmas Activas",
      value: insightData.active,
      pct: insightData.activePct,
      color: "green",
    },
    {
      label: "Inativas",
      value: insightData.inactive,
      pct: insightData.inactivePct,
      color: "blue",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      {cards.map(({ label, value, pct, color }) => {
        const styles = CARD_STYLES[color] || CARD_STYLES.blue;
        return (
          <div
            key={label}
            className="bg-white border border-gray-100 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[22px] font-medium text-[#0F2C59] leading-none mb-0.5">
                  {value}
                </p>
                <p className="text-[11px] text-gray-400">{label}</p>
              </div>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: styles.iconBg }}
              >
                <FontAwesomeIcon
                  icon={faPlus}
                  className="text-[12px]"
                  style={{ color: styles.iconColor }}
                />
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: styles.barColor }}
              />
            </div>
            <p
              className="text-[11px] font-medium mt-2"
              style={{ color: styles.pctColor }}
            >
              {pct}%
            </p>
          </div>
        );
      })}
    </div>
  );
}
