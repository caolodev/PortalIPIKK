import { Activity, Award, CheckCircle2, TrendingUp } from "lucide-react";

export default function StatsCards({ data }) {
  const valid = data.filter((d) => d.MT != null);
  const avg = valid.length
    ? valid.reduce((acc, cur) => acc + cur.MT, 0) / valid.length
    : 0;

  const best = valid.reduce((prev, current) => {
    return current.MT > prev.MT ? current : prev;
  }, valid[0] || {});

  const worst = valid.reduce((prev, current) => {
    return current.MT < prev.MT ? current : prev;
  }, valid[0] || {});

  const approvalRate = valid.length
    ? (valid.filter((d) => d.MT >= 10).length / valid.length) * 100
    : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
      <div className="rounded-xl bg-white p-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Média Geral</p>
            <p className="mt-3 text-3xl font-bold text-[#0F2C59]">
              {avg.toFixed(1)}
            </p>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-[#0F2C59]">
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Taxa de Aprovação</p>
            <p className="mt-3 text-3xl font-bold text-[#0F2C59]">
              {approvalRate.toFixed(0)}%
            </p>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-[#0F2C59]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Melhor Disciplina</p>
            <p className="mt-3 text-2xl font-bold text-[#0F2C59]">
              {best?.subject?.sigla || best?.subject?.name || "—"}
            </p>
            <p className="text-sm text-slate-400">
              {best?.MT != null ? best.MT.toFixed(1) : "-"}
            </p>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-[#0F2C59]">
            <Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Pior Disciplina</p>
            <p className="mt-3 text-2xl font-bold text-[#0F2C59]">
              {worst?.subject?.sigla || worst?.subject?.name || "—"}
            </p>
            <p className="text-sm text-slate-400">
              {worst?.MT != null ? worst.MT.toFixed(1) : "-"}
            </p>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-[#0F2C59]">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
