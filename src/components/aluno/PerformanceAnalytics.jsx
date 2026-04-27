"use client";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, Cell 
} from 'recharts';
import { Trophy, Info, Target } from "lucide-react";

export default function PerformanceAnalytics({ chartData, evolutionData, ranking }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Evolução por Trimestre */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Target size={18} className="text-blue-500" />
            Evolução vs Média da Turma
          </h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis domain={[0, 20]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Line 
                type="monotone" 
                dataKey="aluno" 
                name="Minha Média" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
              />
              <Line 
                type="monotone" 
                dataKey="turma" 
                name="Média da Turma" 
                stroke="#cbd5e1" 
                strokeDasharray="5 5" 
                strokeWidth={2} 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranking e Destaques */}
      <div className="flex flex-col gap-6">
        {/* Card Ranking */}
        <div className="bg-[#0F2C59] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <Trophy className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 rotate-12" />
          <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-1">Ranking na Turma</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-5xl font-black">{ranking.pos}º</h2>
            <span className="text-blue-200">lugar</span>
          </div>
          <p className="mt-4 text-xs text-blue-100 flex items-center gap-1">
            <Info size={12} />
            Baseado na média MT do trimestre atual.
          </p>
        </div>

        {/* Destaques */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex-1">
          <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            Insights de Desempenho
          </h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold text-xs">
                MAX
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Melhor Disciplina</p>
                <p className="text-sm font-semibold text-gray-700">{ranking.bestSubject || "—"}</p>
              </div>
              <span className="ml-auto text-green-600 font-bold">{ranking.bestGrade || "—"}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs">
                MIN
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Pior Disciplina</p>
                <p className="text-sm font-semibold text-gray-700">{ranking.worstSubject || "—"}</p>
              </div>
              <span className="ml-auto text-red-600 font-bold">{ranking.worstGrade || "—"}</span>
            </div>
            
            <div className="pt-4 border-t border-gray-50 mt-2">
               <p className="text-xs text-gray-500 italic">
                "{ranking.insight}"
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
