import { getGradeStatus } from "@/utils/gradeUtils";

export default function GradesTable({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border min-w-150">
        <thead>
          <tr className="bg-gray-100 text-sm">
            <th className="p-2 text-start px-5">Disciplina</th>
            <th className="p-2">MAC</th>
            <th className="p-2">PP</th>
            <th className="p-2">PT</th>
            <th className="p-2">MT</th>
            <th className="p-2">Situação</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => {
            const status = getGradeStatus(row.MT);

            return (
              <tr key={row.subjectId} className="border-t text-sm">
                <td className="px-5 py-2">
                  <div className="flex flex-col">
                    <span>{row.subject?.name}</span>
                    <span className="text-gray-500 text-xs">
                      {row.subject?.sigla}
                    </span>
                  </div>
                </td>
                <td className="text-center">{row.MAC ?? "-"}</td>
                <td className="text-center">{row.PP ?? "-"}</td>
                <td className="text-center">{row.PT ?? "-"}</td>
                <td className="text-center font-semibold">{row.MT ?? "-"}</td>

                <td className="text-center">
                  <span
                    className="px-2 py-1 rounded text-white text-xs"
                    style={{ backgroundColor: status.color }}
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
