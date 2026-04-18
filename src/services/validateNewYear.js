export function validateAcademicYear(data, existingYears = [], options = {}) {
  const { startDate, endDate } = data;
  const { currentId = null, latestQuarterEnd = null } = options;

  // 1. Validação de presença e formato
  if (!startDate || !endDate) {
    return { success: false, error: "Datas de início e fim são obrigatórias." };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { success: false, error: "Datas fornecidas são inválidas." };
  }

  if (start >= end) {
    return {
      success: false,
      error: "A data de início deve ser anterior à data de fim.",
    };
  }

  // 2. Regras de Negócio para Criação (sem currentId)
  if (!currentId) {
    const hasActiveOrInactive = existingYears.some(
      (y) => y.status === "ACTIVE" || y.status === "INACTIVE",
    );
    if (hasActiveOrInactive) {
      return {
        success: false,
        error:
          "Já existe um ano lectivo activo ou planeado. Termine o ciclo atual primeiro.",
      };
    }
  }

  // 3. Regras de Integridade com Trimestres (para Update)
  if (currentId && latestQuarterEnd) {
    const limitDate = new Date(latestQuarterEnd);
    if (end < limitDate) {
      return {
        success: false,
        error: `O ano não pode terminar antes do último trimestre (${limitDate.toLocaleDateString()}).`,
      };
    }
  }

  // 4. Verificação de Sobreposição (Overlap)
  const hasConflict = existingYears.some((year) => {
    if (year.id === currentId) return false;
    const yStart = new Date(year.startDate);
    const yEnd = new Date(year.endDate);
    return start <= yEnd && end >= yStart;
  });

  if (hasConflict) {
    return {
      success: false,
      error:
        "As datas escolhidas coincidem com outro ano lectivo já registado.",
    };
  }

  return { success: true };
}
