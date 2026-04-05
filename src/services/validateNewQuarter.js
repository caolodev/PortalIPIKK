export function validateAcademicQuarter(
  data,
  existingQuarters = [],
  academicYear,
  options = {},
) {
  const { startDate, endDate } = data;
  const { currentId = null } = options;

  if (!startDate || !endDate) {
    return {
      success: false,
      error: "Datas são obrigatórias.",
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end)) {
    return { success: false, error: "Datas inválidas." };
  }

  if (start >= end) {
    return {
      success: false,
      error: "A data de início deve ser antes da data de fim.",
    };
  }

  // dentro do ano
  if (academicYear) {
    const yearStart = new Date(academicYear.startDate);
    const yearEnd = new Date(academicYear.endDate);

    if (start < yearStart || end > yearEnd) {
      return {
        success: false,
        error: "Trimestre deve estar dentro do ano lectivo.",
      };
    }
  }

  // conflito de datas
  const hasConflict = existingQuarters.some((q) => {
    if (q.id === currentId) return false;

    const qStart = new Date(q.startDate);
    const qEnd = new Date(q.endDate);

    return start <= qEnd && end >= qStart;
  });

  if (hasConflict) {
    return {
      success: false,
      error: "Conflito de datas com outro trimestre.",
    };
  }
  return { success: true };
}
