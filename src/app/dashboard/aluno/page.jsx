"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
} from "recharts";

function parseNumericGrade(value) {
  const grade = Number(value);
  return Number.isFinite(grade) ? grade : null;
}
import { Activity, TrendingUp, ShieldCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "../../../components/PageHeader";
import { useStudentGrades } from "@/hooks/useStudentGrades";
import Card from "@/components/ui/Card";

export default function DashboardDirector() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    dataTable,
    loading,
    selectedQuarter,
    setSelectedQuarter,
    student,
    academicYear,
    quarters,
    ranking,
    quarterSeries,
  } = useStudentGrades(user);

  const grades = useMemo(() => {
    return dataTable.map((row) => {
      const assessment = row.assessments.find(
        (a) => a.quarterNumber === selectedQuarter,
      );
      const grades = assessment?.grades || {};
      return {
        subjectId: row.subjectId,
        subject: row.subject,
        PP: parseNumericGrade(grades.pp),
        PT: parseNumericGrade(grades.pt),
        MAC: parseNumericGrade(grades.mac),
        MT: parseNumericGrade(grades.mt),
      };
    });
  }, [dataTable, selectedQuarter]);

  const averageGrade = useMemo(() => {
    const valid = grades.filter((row) => row.MT != null);
    if (valid.length === 0) return 0;
    return valid.reduce((sum, row) => sum + row.MT, 0) / valid.length;
  }, [grades]);

  const riskCount = useMemo(
    () => grades.filter((row) => row.MT != null && row.MT < 10).length,
    [grades],
  );
  const statusLabel =
    averageGrade >= 10
      ? "Aprovado"
      : averageGrade >= 8
        ? "Recuperação"
        : "Em risco";
  const statusSubtitle =
    averageGrade >= 10
      ? "Continua o bom trabalho"
      : averageGrade >= 8
        ? "Foco nas avaliações"
        : "Reforce o estudo";
  const courseLabel = student?.courseName || "—";
  const turmaLabel = student?.turmaName || "—";

  const compositionData = useMemo(() => {
    const totals = { PP: 0, PT: 0, MAC: 0 };
    let count = 0;

    grades.forEach((row) => {
      if (row.PP != null || row.PT != null || row.MAC != null) {
        count += 1;
        totals.PP += row.PP ?? 0;
        totals.PT += row.PT ?? 0;
        totals.MAC += row.MAC ?? 0;
      }
    });

    if (count === 0) {
      return [
        { subject: "PP", value: 0 },
        { subject: "PT", value: 0 },
        { subject: "MAC", value: 0 },
      ];
    }

    return [
      { subject: "PP", value: Number((totals.PP / count).toFixed(0)) },
      { subject: "PT", value: Number((totals.PT / count).toFixed(0)) },
      { subject: "MAC", value: Number((totals.MAC / count).toFixed(0)) },
    ];
  }, [grades]);

  const performanceData = useMemo(() => {
    return grades.map((row) => ({
      name: row.subject?.sigla || row.subject?.name || "-",
      score: row.MT ?? 0,
      isRisk: row.MT != null && row.MT < 10,
    }));
  }, [grades]);

  if (loading) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-[#0F2C59] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${student?.nomeCompleto?.split(" ")[0] || "Aluno"}`}
        description={`Resumo do teu desempenho académico · ${courseLabel} · Turma ${turmaLabel}`}
        buttonText="Ver todas as notas"
        buttonTitle="Ir para a página de notas"
        onButtonClick={() => router.push("/dashboard/aluno/notas")}
        buttonIcon={null}
      />

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Trimestre ativo
          </p>
          <p className="text-lg font-bold text-[#0F2C59]">
            {selectedQuarter
              ? `${selectedQuarter}º Trimestre`
              : "Sem trimestre activo"}
          </p>
        </div>
        <div className="min-w-50">
          <label className="sr-only">Selecionar trimestre</label>
          <select
            value={selectedQuarter ?? ""}
            onChange={(e) => {
              setSelectedQuarter(
                e.target.value ? Number(e.target.value) : null,
              );
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#0F2C59] focus:ring-1 focus:ring-[#0F2C59]/20"
          >
            {quarters.length > 0 ? (
              quarters.map((quarter) => (
                <option key={quarter.id} value={quarter.number}>
                  {quarter.number}º Trimestre
                  {quarter.status === "ACTIVE"
                    ? " (Activo)"
                    : quarter.status === "CLOSED"
                      ? " (Fechado)"
                      : ""}
                </option>
              ))
            ) : (
              <option value="">Sem trimestres</option>
            )}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-xl border border-slate-200 p-4 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Média Geral
              </p>
              <p className="mt-4 text-3xl font-bold text-[#0F2C59]">
                {averageGrade.toFixed(1)}
              </p>
              <p className="mt-2 text-sm text-slate-400">em escala 0-20</p>
            </div>
            <div className="rounded-3xl bg-slate-100 p-3 text-[#0F2C59]">
              <Activity className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="rounded-xl border border-slate-200 p-4 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Situação</p>
              <p className="mt-4 text-3xl font-bold text-[#0F2C59]">
                {statusLabel}
              </p>
              <p className="mt-2 text-sm text-slate-400">{statusSubtitle}</p>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-[#0F2C59]">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="rounded-xl border border-slate-200 p-4 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Ranking na turma
              </p>
              <p className="mt-4 text-3xl font-bold text-[#0F2C59]">
                {ranking.position ? `${ranking.position}º` : "—"}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                de {ranking.total || "—"} alunos
              </p>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-[#0F2C59]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="rounded-xl border border-slate-200 p-4 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Disciplinas em risco
              </p>
              <p className="mt-4 text-3xl font-bold text-[#0F2C59]">
                {riskCount}
              </p>
              <p className="mt-2 text-sm text-slate-400">Tudo em ordem</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-[#0F2C59]">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="bg-white rounded-xl p-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#0F2C59]">
              Evolução da Média
            </h2>
            <p className="text-xs text-slate-500">
              Comparação entre tu e a média da turma.
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={quarterSeries}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E2E8F0"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip wrapperClassName="rounded-xl shadow-lg" />
                <Line
                  type="monotone"
                  dataKey="you"
                  name="Minha Média"
                  stroke="#0F2C59"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="classAverage"
                  name="Média da Turma"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#0F2C59]">
              Composição da Nota
            </h2>
            <p className="text-xs text-slate-500">
              Média das avaliações por componente.
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={compositionData} outerRadius="75%">
                <PolarGrid stroke="#CBD5E0" />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke="#334155"
                  fontSize={11}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 20]}
                  tick={{ fill: "#64748b", fontSize: 10 }}
                />
                <Radar
                  name="Nota"
                  dataKey="value"
                  stroke="#0F2C59"
                  fill="#0F2C59"
                  fillOpacity={0.35}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm transition-shadow duration-200 hover:-translate-y-1 hover:shadow-xl">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#0F2C59]">
            Desempenho por Disciplina
          </h2>
          <p className="text-xs text-slate-500">
            Suas notas por disciplina no trimestre.
          </p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
              margin={{ top: 10, right: 0, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E2E8F0"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <Tooltip wrapperClassName="rounded-xl shadow-lg" />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {performanceData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.isRisk ? "#F59E0B" : "#0F2C59"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
