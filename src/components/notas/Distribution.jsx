"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

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
    <div className="border rounded-lg p-4 flex flex-col md:flex-row gap-4">
      {/* GRAFICO */}
      <div className="flex-1 min-h-[62.5]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
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
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* LEGENDA LATERAL */}
      <div className="flex flex-col justify-center gap-2 text-sm">
        {chartData.map((item) => {
          const percent = ((item.value / total) * 100).toFixed(0);

          return (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: COLORS[item.name] }}
              />

              <span className="flex-1">{item.name}</span>

              <span className="text-gray-500">
                {item.value} ({percent}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
