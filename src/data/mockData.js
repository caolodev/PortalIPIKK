export const statCards = [
  {
    id: "1",
    label: "Média Atual",
    value: "15.4",
    trend: "+0.4 pts",
    trendType: "positive",
  },
  {
    id: "2",
    label: "Disciplinas Aprovadas",
    value: "8",
    trend: "+2 desde o último trimestre",
    trendType: "positive",
  },
  {
    id: "3",
    label: "Risco de Reprovação",
    value: "2",
    trend: "Em atenção",
    trendType: "warning",
  },
  {
    id: "4",
    label: "Progressão",
    value: "78%",
    trend: "+6% desde anterior",
    trendType: "positive",
  },
];

export const evolutionSeries = [
  { quarter: "Trim 1", you: 13.2, classAverage: 12.8 },
  { quarter: "Trim 2", you: 14.1, classAverage: 13.6 },
  { quarter: "Trim 3", you: 14.8, classAverage: 13.9 },
  { quarter: "Trim 4", you: 15.4, classAverage: 14.2 },
];

export const compositionData = [
  { subject: "PP", value: 42 },
  { subject: "PT", value: 33 },
  { subject: "MAC", value: 25 },
];

export const performanceData = [
  { name: "Matemática", score: 92, isRisk: false },
  { name: "Física", score: 84, isRisk: false },
  { name: "Português", score: 76, isRisk: false },
  { name: "Biologia", score: 55, isRisk: true },
  { name: "História", score: 67, isRisk: true },
];

export const insights = [
  {
    id: "insight-1",
    title: "Excelente rendimento em Matemática",
    description: "Continue assim: a sua média está acima da turma.",
    variant: "positive",
  },
  {
    id: "insight-2",
    title: "Foco recomendado em Biologia",
    description: "A disciplina mostra risco. Reforce as sessões de estudo.",
    variant: "warning",
  },
  {
    id: "insight-3",
    title: "Reunião com orientador disponível",
    description: "Consulta o seu calendário para planejar o próximo trimestre.",
    variant: "info",
  },
];

export const notesColumns = [
  { key: "subject", header: "Disciplina", accessor: "subject" },
  { key: "code", header: "Sigla", accessor: "code" },
  { key: "mac", header: "MAC", accessor: "mac" },
  { key: "pp", header: "PP", accessor: "pp" },
  { key: "pt", header: "PT", accessor: "pt" },
  { key: "mt", header: "MT", accessor: "mt" },
  {
    key: "status",
    header: "Situação",
    render: (row) => {
      const statusMap = {
        Excelente: "bg-emerald-100 text-emerald-700",
        Bom: "bg-blue-100 text-blue-700",
        Suficiente: "bg-amber-100 text-amber-700",
        Fraco: "bg-rose-100 text-rose-700",
      };
      return (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusMap[row.status] || "bg-slate-100 text-slate-700"}`}
        >
          {row.status}
        </span>
      );
    },
  },
];

export const notesData = [
  {
    id: "n1",
    subject: "Matemática",
    code: "MAT",
    mac: "18",
    pp: "17",
    pt: "16",
    mt: "15",
    status: "Excelente",
  },
  {
    id: "n2",
    subject: "Física",
    code: "FIS",
    mac: "15",
    pp: "14",
    pt: "15",
    mt: "14",
    status: "Bom",
  },
  {
    id: "n3",
    subject: "Biologia",
    code: "BIO",
    mac: "12",
    pp: "11",
    pt: "13",
    mt: "12",
    status: "Suficiente",
  },
  {
    id: "n4",
    subject: "História",
    code: "HIS",
    mac: "10",
    pp: "9",
    pt: "11",
    mt: "10",
    status: "Fraco",
  },
  {
    id: "n5",
    subject: "Português",
    code: "POR",
    mac: "16",
    pp: "15",
    pt: "14",
    mt: "15",
    status: "Bom",
  },
];

export const trimestreOptions = [
  { value: "all", label: "Todos os trimestres" },
  { value: "t1", label: "1º Trimestre" },
  { value: "t2", label: "2º Trimestre" },
  { value: "t3", label: "3º Trimestre" },
  { value: "t4", label: "4º Trimestre" },
];

export const disciplinaOptions = [
  { value: "all", label: "Todas as disciplinas" },
  { value: "mat", label: "Matemática" },
  { value: "fis", label: "Física" },
  { value: "bio", label: "Biologia" },
  { value: "his", label: "História" },
  { value: "por", label: "Português" },
];
