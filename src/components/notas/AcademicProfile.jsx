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
import { BarChart3 } from "lucide-react";

export default function AcademicProfile({ data }) {
  const chartData = data.map((d) => ({
    subject: d.subject?.sigla || d.subject?.name,
    nota: d.MT || 0,
    objetivo: 14,
  }));

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-[#0F2C59]" />
        <h2 className="text-lg font-semibold text-[#0F2C59]">
          Perfil Académico
        </h2>
      </div>
      <div className="w-full h-75">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis domain={[0, 20]} />
            <Radar
              name="Nota"
              dataKey="nota"
              stroke="#0F2C59"
              fill="#0F2C59"
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
