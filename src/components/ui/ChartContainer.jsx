export default function ChartContainer({
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 ${className}`}>
      <div className="mb-5 flex flex-col gap-1">
        <h2 className="text-xl font-bold text-[#0F2C59]">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}
