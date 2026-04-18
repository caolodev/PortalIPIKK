export function validateAcademicQuarter(
  data,
  existingQuarters = [],
  academicYear,
  options = {},
) {
  const { startDate, endDate } = data;
  const { currentId = null, hasGrades = false } = options;

  if (!startDate || !endDate) {
    return { success: false, error: "Datas são obrigatórias." };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (start >= end) {
    return {
      success: false,
      error: "A data de início deve ser anterior à data de fim.",
    };
  }

  // 1. Integridade com o Ano Lectivo
  if (academicYear) {
    const yearStart = new Date(academicYear.startDate);
    const yearEnd = new Date(academicYear.endDate);
    if (start < yearStart || end > yearEnd) {
      return {
        success: false,
        error: "O trimestre deve estar dentro do intervalo do Ano Lectivo.",
      };
    }
  }

  // 2. Proteção contra alteração de início se houver notas
  if (currentId && hasGrades) {
    const original = existingQuarters.find((q) => q.id === currentId);
    if (
      original &&
      new Date(original.startDate).getTime() !== start.getTime()
    ) {
      return {
        success: false,
        error: "Já existem notas lançadas. Não pode alterar a data de início.",
      };
    }
  }

  // 3. Conflito de datas e Ordem Cronológica
  const sortedQuarters = [...existingQuarters]
    .filter((q) => q.id !== currentId)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  for (const q of sortedQuarters) {
    const qStart = new Date(q.startDate);
    const qEnd = new Date(q.endDate);

    // Verificação de Sobreposição
    if (start <= qEnd && end >= qStart) {
      return {
        success: false,
        error: "Conflito de datas com outro trimestre.",
      };
    }
  }

  return { success: true };
}
