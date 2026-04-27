export default function DataTable({ columns, data, className = "" }) {
  return (
    <div
      className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 font-semibold text-slate-600"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-slate-500"
              >
                Nenhum item encontrado.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id ?? rowIndex} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="whitespace-nowrap px-4 py-4 text-slate-700"
                  >
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
