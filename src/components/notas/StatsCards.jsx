export default function StatsCards({ data }) {
  const valid = data.filter((d) => d.MT != null);

  const avg = valid.reduce((acc, cur) => acc + cur.MT, 0) / (valid.length || 1);

  // MELHOR DISCIPLINA (objeto completo)
  const best = valid.reduce((prev, current) => {
    return current.MT > prev.MT ? current : prev;
  }, valid[0] || {});
  // PIOR DISCIPLINA

  const worst = valid.reduce((prev, current) => {
    return current.MT < prev.MT ? current : prev;
  }, valid[0] || {});

  const approvalRate =
    (valid.filter((d) => d.MT >= 10).length / (valid.length || 1)) * 100;

  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <div className="border p-4">Média Geral: {avg.toFixed(1)}</div>

      <div className="border p-4">
        Taxa Aprovação: {approvalRate.toFixed(0)}%
      </div>

      <div className="border p-4">
        Melhor: {best?.subject?.sigla || best?.subject?.name || "—"} (
        {best?.MT?.toFixed(1) ?? "-"})
      </div>

      <div className="border p-4">
        Pior: {worst?.subject?.sigla || worst?.subject?.name || "—"} (
        {worst?.MT?.toFixed(1) ?? "-"})
      </div>
    </div>
  );
}
