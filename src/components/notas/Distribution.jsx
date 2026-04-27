"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PieChart } from "lucide-react";

import { getGradeStatus } from "@/utils/gradeUtils";

const COLORS = {
  Excelente: "#16a34a",
  Bom: "#2563eb",
  Suficiente: "#1e3a8a",
  "Em risco": "#f59e0b",
  "Sem nota": "#9ca3af",
};

export default function Distribution({ data }) {
  const categories = {};

  data.forEach((d) => {
    const status = getGradeStatus(d.MT).label;
    categories[status] = (categories[status] || 0) + 1;
  });

  const chartData = Object.entries(categories).map(([name, value]) => ({
    name,
    value,
  }));

  const total = chartData.reduce((acc, c) => acc + c.value, 0);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-base font-semibold text-[#0F2C59]">
        <PieChart className="h-4 w-4" />
        <span>Distribuição de Situação</span>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_0.9fr] items-center">
        <div className="min-h-65">
          <ResponsiveContainer width="100%" height={240}>
            <RechartsPieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} disciplinas`, name]}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          {chartData.map((item) => {
            const percent = total
              ? ((item.value / total) * 100).toFixed(0)
              : "0";
            const badgeClasses = {
              Excelente: "bg-emerald-500",
              Bom: "bg-blue-500",
              Suficiente: "bg-slate-800",
              "Em risco": "bg-amber-500",
              "Sem nota": "bg-slate-400",
            };

            return (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <span
                  className={`w-3 h-3 rounded-full ${badgeClasses[item.name]}`}
                />
                <span className="flex-1 font-medium text-slate-700">
                  {item.name}
                </span>
                <span className="text-slate-500">
                  {item.value} ({percent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
