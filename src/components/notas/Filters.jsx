export default function Filters({
  selectedQuarter,
  setSelectedQuarter,
  selectedSubject,
  setSelectedSubject,
  subjects,
}) {
  return (
    <div className="flex gap-4 mb-4">
      <select
        value={selectedQuarter ?? ""}
        className="border p-2"
        onChange={(e) => setSelectedQuarter(Number(e.target.value))}
      >
        {[1, 2, 3].map((q) => (
          <option key={q} value={q}>
            {q}º Trimestre
          </option>
        ))}
      </select>

      <select
        value={selectedSubject}
        className="border p-2 shrink"
        onChange={(e) => setSelectedSubject(e.target.value)}
      >
        <option value="ALL">Todas</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
