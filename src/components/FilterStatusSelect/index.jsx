export default function FilterStatusSelect({ filterStatus, onFilterChange }) {
  return (
    <div className="mb-4 flex items-center gap-3 sm:text-[1rem] text-[0.8rem]">
      <label htmlFor="filterStatus" className="text-sm text-gray-600">
        Filtrar status:
      </label>
      <select
        id="filterStatus"
        value={filterStatus}
        onChange={(e) => onFilterChange(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
      >
        <option value="ALL">Todos</option>
        <option value="INACTIVE">INACTIVE</option>
        <option value="ACTIVE">ACTIVE</option>
        <option value="CLOSED">CLOSED</option>
      </select>
    </div>
  );
}
