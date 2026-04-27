import Badge from "./Badge";

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendType = "positive",
  className = "",
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm p-5 flex flex-col justify-between gap-5 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-[#0F2C59]">
          {Icon ? <Icon className="h-6 w-6" /> : null}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-[#0F2C59]">{value}</p>
        </div>
      </div>
      {trend ? <Badge variant={trendType}>{trend}</Badge> : null}
    </div>
  );
}
