"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AcademicProfile({ data }) {
  const chartData = data.map((d) => ({
    subject: d.subject?.sigla || d.subject?.name,
    nota: d.MT || 0,
    objetivo: 14,
  }));

  return (
    <div className="border rounded-lg p-4 flex flex-col">
      <h2 className="mb-2 font-medium text-sm text-gray-600">
        Perfil Académico
      </h2>

      <div className="w-full h-75">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid />

            <PolarAngleAxis dataKey="subject" />

            <PolarRadiusAxis domain={[0, 20]} />

            <Radar
              name="Nota"
              dataKey="nota"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.6}
            />

            <Radar
              name="Objetivo"
              dataKey="objetivo"
              stroke="#94a3b8"
              fillOpacity={0}
            />

            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
