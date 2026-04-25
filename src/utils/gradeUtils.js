export function getGradeStatus(mt) {
  if (mt == null) return { label: "Sem nota", color: "#9ca3af" };

  if (mt >= 16) return { label: "Excelente", color: "#16a34a" };
  if (mt >= 13) return { label: "Bom", color: "#2563eb" };
  if (mt >= 10) return { label: "Suficiente", color: "#1e3a8a" };

  return { label: "Em risco", color: "#f59e0b" };
}
