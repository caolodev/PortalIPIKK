import AcademicYearRow from "../AcademicYearRow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";

export default function AcademicYearTable({
  displayedAcademicYears,
  isLoading,
  onEdit,
}) {
  return (
    <div className="overflow-x-auto shadow rounded-2xl">
      <table className="w-full border-separate border-spacing-0 min-w-max">
        <thead className="bg-gray-100">
          <tr className="border-b">
            <th className="px-3 md:px-6 py-4 text-left text-[10px] md:text-xs font-light text-gray-500 uppercase tracking-wider">
              Ano Lectivo
            </th>
            <th className="px-3 md:px-6 py-4 text-left text-[10px] md:text-xs font-light text-gray-500 uppercase tracking-wider">
              Data Início
            </th>
            <th className="px-3 md:px-6 py-4  text-left text-[10px] md:text-xs font-light text-gray-500 uppercase tracking-wider">
              Data Fim
            </th>
            <th className="px-3 md:px-6 py-4 text-left text-[10px] md:text-xs font-light text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-3 md:px-6 py-4 text-right text-[10px] md:text-xs font-light text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white rounded-b-4xl ">
          {isLoading ? (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center">
                <div className="flex items-center justify-center gap-2">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="animate-spin text-[#0F2C59]"
                    width={20}
                    height={20}
                  />
                  <span className="text-gray-600 font-medium">
                    Carregando anos lectivos...
                  </span>
                </div>
              </td>
            </tr>
          ) : displayedAcademicYears.length > 0 ? (
            displayedAcademicYears.map((yearItem) => (
              <AcademicYearRow
                key={yearItem.id}
                yearItem={yearItem}
                onEdit={onEdit}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className="px-6 py-8 text-center text-sm text-gray-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <FontAwesomeIcon icon={faCalendar} />
                  <span>Nenhum ano lectivo encontrado.</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
