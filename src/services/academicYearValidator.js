function parseAcademicYearName(name) {
  const simple = /^([0-9]{4})$/;
  const range = /^([0-9]{4})\/(20[0-9]{2})$/;

  let match = simple.exec(name);
  if (match) {
    const year = parseInt(match[1], 10);
    return { type: "SINGLE", startYear: year, endYear: year };
  }

  match = range.exec(name);
  if (match) {
    const startYear = parseInt(match[1], 10);
    const endYear = parseInt(match[2], 10);
    if (endYear === startYear + 1) {
      return { type: "RANGE", startYear, endYear };
    }
  }

  return null;
}

function expectedDatesFromName(name) {
  const parsed = parseAcademicYearName(name);
  if (!parsed) return null;

  if (parsed.type === "SINGLE") {
    const startDate = `${parsed.startYear}-01-01`;
    const endDate = `${parsed.endYear}-12-31`;
    return { startDate, endDate };
  }

  if (parsed.type === "RANGE") {
    const startDate = `${parsed.startYear}-09-01`;
    const endDate = `${parsed.endYear}-07-01`;
    return { startDate, endDate };
  }

  return null;
}

function dateIsPastOrFinished(endDate) {
  const now = new Date();
  const candidate = new Date(`${endDate}T23:59:59.999Z`);
  return candidate < now;
}

function toDateRange(d1, d2) {
  return {
    start: new Date(`${d1}T00:00:00.000Z`),
    end: new Date(`${d2}T23:59:59.999Z`),
  };
}

export async function validateAcademicYear(
  data,
  existingId = null,
  allYears = [],
) {
  if (!data.name)
    return { success: false, error: "Nome do ano lectivo é obrigatório." };
  const parsed = parseAcademicYearName(data.name);
  if (!parsed)
    return {
      success: false,
      error: "Nome de ano lectivo inválido. Use 2026 ou 2026/2027.",
    };

  let startDate = data.startDate;
  let endDate = data.endDate;
  const expected = expectedDatesFromName(data.name);

  if (!startDate && !endDate && expected) {
    startDate = expected.startDate;
    endDate = expected.endDate;
  }

  if (!startDate || !endDate) {
    return { success: false, error: "Data de início e fim são obrigatórias." };
  }

  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T23:59:59.999Z`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { success: false, error: "Datas inválidas." };
  }

  if (start >= end) {
    return {
      success: false,
      error: "Data de início deve ser anterior à data de fim.",
    };
  }

  if (parsed.type === "SINGLE") {
    if (
      start.getUTCFullYear() !== parsed.startYear ||
      end.getUTCFullYear() !== parsed.endYear
    ) {
      return {
        success: false,
        error: "Datas devem cair no mesmo ano do nome do ano lectivo.",
      };
    }
  }

  if (parsed.type === "RANGE") {
    if (
      start.getUTCFullYear() !== parsed.startYear ||
      end.getUTCFullYear() !== parsed.endYear
    ) {
      return {
        success: false,
        error:
          "Datas devem estar dentro dos anos indicados no nome (e.g., 2026/2027).",
      };
    }
  }

  if (dateIsPastOrFinished(endDate)) {
    return {
      success: false,
      error: "Não é possível criar/editar um ano lectivo já terminado.",
    };
  }

  const sameName = allYears.find(
    (y) => y.name === data.name && y.id !== existingId,
  );
  if (sameName) {
    return { success: false, error: "Já existe um ano lectivo com esse nome." };
  }

  const candidate = toDateRange(startDate, endDate);
  for (const yearItem of allYears) {
    if (yearItem.id === existingId) continue;
    const target = toDateRange(yearItem.startDate, yearItem.endDate);

    if (candidate.start <= target.end && target.start <= candidate.end) {
      return {
        success: false,
        error: `O ano lectivo cruza datas com o ano existente '${yearItem.name}'.`,
      };
    }
  }

  return {
    success: true,
    value: {
      name: data.name,
      startDate,
      endDate,
      expected,
    },
  };
}
