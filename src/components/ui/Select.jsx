export default function Select({
  label,
  options = [],
  name,
  value,
  onChange,
  className = "",
}) {
  return (
    <label className="block w-full">
      {label ? (
        <span className="mb-2 block text-sm font-semibold text-slate-600">
          {label}
        </span>
      ) : null}
      <select
        name={name}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
