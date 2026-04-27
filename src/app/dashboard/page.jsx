"use client";

import {
  AreaChart,
  Area,
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
import { Activity, BarChart2, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import ChartContainer from "@/components/ui/ChartContainer";
import StatCard from "@/components/ui/StatCard";
import {
  insights,
  performanceData,
  compositionData,
  evolutionSeries,
  statCards,
} from "@/data/mockData";

const insightStyles = {
  positive: "border-emerald-500/20 bg-emerald-50",
  warning: "border-amber-500/20 bg-amber-50",
  info: "border-sky-500/20 bg-sky-50",
};

const insightAccent = {
  positive: "bg-emerald-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <StatCard
            key={item.id}
            icon={Activity}
            label={item.label}
            value={item.value}
            trend={item.trend}
            trendType={item.trendType}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <ChartContainer
          title="Evolução da Média"
          subtitle="Comparação entre tu e a turma"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={evolutionSeries}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradientYou" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F2C59" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0F2C59" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="gradientClass"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="quarter"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip wrapperClassName="shadow-lg rounded-2xl" />
                <Area
                  type="monotone"
                  dataKey="you"
                  stroke="#0F2C59"
                  fill="url(#gradientYou)"
                  fillOpacity={1}
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="classAverage"
                  stroke="#F59E0B"
                  fill="url(#gradientClass)"
                  fillOpacity={1}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        <ChartContainer title="Composição da Nota" subtitle="PP, PT e MAC">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={compositionData} outerRadius="80%">
                <PolarGrid stroke="#CBD5E1" />
                <PolarAngleAxis dataKey="subject" stroke="#334155" />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 50]}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Radar
                  name="Notas"
                  dataKey="value"
                  stroke="#0F2C59"
                  fill="#0F2C59"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        <ChartContainer
          title="Desempenho por Disciplina"
          subtitle="Cores refletem risco de nota"
        >
          <div className="h-72">
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
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip wrapperClassName="shadow-lg rounded-2xl" />
                <Bar dataKey="score" radius={[12, 12, 0, 0]}>
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
        </ChartContainer>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`rounded-3xl border-l-4 p-5 shadow-sm ${insightStyles[insight.variant]}`}
          >
            <div
              className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white ${insightAccent[insight.variant]}`}
            >
              {insight.variant === "positive" ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <BarChart2 className="h-5 w-5" />
              )}
            </div>
            <h3 className="text-base font-semibold text-[#0F2C59]">
              {insight.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{insight.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
