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
    <div className="overflow-x-auto shadow rounded-lg">
      <table className="w-full border-separate border-spacing-0 min-w-max">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 sm:px-4 md:px-5 py-2 md:py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
              Disciplina
            </th>
            <th className="px-3 sm:px-4 md:px-5 py-2 md:py-3 text-center text-xs font-light text-gray-500 uppercase tracking-wider">
              MAC
            </th>
            <th className="px-3 sm:px-4 md:px-5 py-2 md:py-3 text-center text-xs font-light text-gray-500 uppercase tracking-wider">
              PP
            </th>
            <th className="px-3 sm:px-4 md:px-5 py-2 md:py-3 text-center text-xs font-light text-gray-500 uppercase tracking-wider">
              PT
            </th>
            <th className="px-3 sm:px-4 md:px-5 py-2 md:py-3 text-center text-xs font-light text-gray-500 uppercase tracking-wider">
              MT
            </th>
            <th className="px-3 sm:px-4 md:px-5 py-2 md:py-3 text-center text-xs font-light text-gray-500 uppercase tracking-wider">
              Situação
            </th>
          </tr>
        </thead>

        <tbody className="bg-white">
          {data.map((row) => {
            const status = getGradeStatus(row.MT);

            return (
              <tr
                key={row.subjectId}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-100"
              >
                <td className="px-3 sm:px-4 md:px-5 py-2 md:py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs md:text-sm font-medium text-gray-900">
                      {row.subject?.name}
                    </span>
                    <span className="text-[10px] md:text-xs text-gray-400">
                      {row.subject?.sigla}
                    </span>
                  </div>
                </td>
                <td className="px-3 sm:px-4 md:px-5 py-2 md:py-3 text-center text-xs md:text-sm text-gray-600">
                  {row.MAC ?? "-"}
                </td>
                <td className="px-3 sm:px-4 md:px-5 py-2 md:py-3 text-center text-xs md:text-sm text-gray-600">
                  {row.PP ?? "-"}
                </td>
                <td className="px-3 sm:px-4 md:px-5 py-2 md:py-3 text-center text-xs md:text-sm text-gray-600">
                  {row.PT ?? "-"}
                </td>
                <td className="px-3 sm:px-4 md:px-5 py-2 md:py-3 text-center text-xs md:text-sm font-semibold text-gray-900">
                  {row.MT ?? "-"}
                </td>
                <td className="px-3 sm:px-4 md:px-5 py-2 md:py-3 text-center">
                  <span
                    className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${statusStyles[status.label]}`}
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
