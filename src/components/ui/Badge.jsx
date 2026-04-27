const variantStyles = {
  positive: "bg-emerald-50 text-emerald-700",
  negative: "bg-rose-50 text-rose-700",
  warning: "bg-amber-50 text-amber-700",
  info: "bg-sky-50 text-sky-700",
  default: "bg-slate-100 text-slate-700",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variantStyles[variant] ?? variantStyles.default} ${className}`}
    >
      {children}
    </span>
  );
}
