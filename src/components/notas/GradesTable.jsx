import { getGradeStatus } from "@/utils/gradeUtils";

const statusStyles = {
  Excelente: "bg-emerald-100 text-emerald-700",
  Bom: "bg-blue-100 text-blue-700",
  Suficiente: "bg-slate-100 text-slate-800",
  "Em risco": "bg-amber-100 text-amber-700",
  "Sem nota": "bg-slate-100 text-slate-700",
};

export default function GradesTable({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-5 py-3 text-left font-semibold">Disciplina</th>
            <th className="px-4 py-3 text-center font-semibold">MAC</th>
            <th className="px-4 py-3 text-center font-semibold">PP</th>
            <th className="px-4 py-3 text-center font-semibold">PT</th>
            <th className="px-4 py-3 text-center font-semibold">MT</th>
            <th className="px-4 py-3 text-center font-semibold">Situação</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {data.map((row) => {
            const status = getGradeStatus(row.MT);

            return (
              <tr key={row.subjectId} className="bg-white hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-slate-800">
                      {row.subject?.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {row.subject?.sigla}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center text-slate-700">
                  {row.MAC ?? "-"}
                </td>
                <td className="px-4 py-4 text-center text-slate-700">
                  {row.PP ?? "-"}
                </td>
                <td className="px-4 py-4 text-center text-slate-700">
                  {row.PT ?? "-"}
                </td>
                <td className="px-4 py-4 text-center font-semibold text-slate-800">
                  {row.MT ?? "-"}
                </td>
                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status.label]}`}
                  >
                    {status.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
