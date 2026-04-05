export function validateAcademicYear(data, existingYears = [], options = {}) {
  const { startDate, endDate } = data;
  const { currentId = null, hasQuarters = false } = options;

  // Impedir actualização do ano quando vinculados a um trimestre , para evitar inconsistência ;
  if (currentId && hasQuarters){
    return {
      success: false,
      error: "Este ano já possui trimestres vinculados. A edição de datas foi bloqueada."
    }
  }

  // Bloquear Actualização de anos lectivos vinculados .  
  if (!currentId){
    const hasActiveOrInactive = existingYears.some((year) => year.status === "ACTIVE" || year.status === "INACTIVE");
    if (hasActiveOrInactive){
      return {
        success: false,
        error: "Já existe um ano lectivo activo ou planeado. Termine o ciclo atual primeiro."
      }
    }
  }

  if (!startDate || !endDate) {
    return {
      success: false,
      error: "Datas de início e fim são obrigatórias.",
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      success: false,
      error: "Datas inválidas.",
    };
  }

  if (start >= end) {
    return {
      success: false,
      error: "A data de início deve ser antes da data de fim.",
    };
  }

  const hasConflict = existingYears.some((year) => {
    if (year.id === currentId) return false;

    const yStart = new Date(year.startDate);
    const yEnd = new Date(year.endDate);

    return start <= yEnd && end >= yStart;  
  });

  if (hasConflict) {
    return {
      success: false,
      error: "Já existe um ano lectivo com datas sobrepostas.",
    };
  }
  return { success: true };
}
