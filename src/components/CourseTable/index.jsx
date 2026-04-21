// components/courses/CourseTable.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faClockRotateLeft,
  faUserMinus,
  faPenToSquare,
  faArchive,
} from "@fortawesome/free-solid-svg-icons";
import Avatar from "./Avatar";
import StatusBadge from "./StatusBadge";

export default function CourseTable({
  displayedCourses,
  onVincular,
  onEdit,
  onDeactivate,
  onHistory,
  onDesvincular,
  academicYearActive = true,
}) {
  return (
    <div className="overflow-x-auto shadow rounded-2xl">
      <table className="w-full border-separate border-spacing-0 min-w-max">
        <thead className="bg-gray-100">
          <tr>
            {["Curso", "Código", "Coordenador Actual", "Estado", "acções"].map(
              (h) => (
                <th
                  key={h}
                  className="px-3 sm:px-4 md:px-6 py-3 md:py-4
                           text-[9px] sm:text-[10px] md:text-xs
                           text-left font-light text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>

        <tbody className="bg-white">
          {displayedCourses.map((course, i) => (
            <tr
              key={course.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-100"
            >
              {/* Curso */}
              <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
                <p className="text-[11px] sm:text-[12px] md:text-[13.5px] font-medium text-gray-900 leading-tight">
                  {course.name}
                </p>
                <p className="text-[9px] sm:text-[10px] md:text-[11px] text-gray-400 mt-0.5">
                  Criado em{" "}
                  {course.createdAt
                    ? (() => {
                        const year = new Date(course.createdAt).getFullYear();
                        return !isNaN(year) ? year : "Desconhecido";
                      })()
                    : "Desconhecido"}
                </p>
              </td>

              {/* Código */}
              <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
                <span
                  className="text-[9px] sm:text-[10px] md:text-[11px]
                                 font-medium text-gray-500 bg-gray-100
                                 border border-gray-200 rounded-md
                                 px-1.5 sm:px-2 md:px-2.5 py-0.5 md:py-1 tracking-wide"
                >
                  {course.code}
                </span>
              </td>

              {/* Coordenador */}
              <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
                {course.coordinator ? (
                  <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
                    <Avatar name={course.coordinator.name} index={i} />
                    <div>
                      <p className="text-[11px] sm:text-[12px] md:text-[13px] font-medium text-gray-900 leading-tight">
                        {course.coordinator.name}
                      </p>
                      <p className="text-[9px] sm:text-[10px] md:text-[11px] text-gray-400 mt-0.5">
                        Desde{" "}
                        {course.coordinator.startDate
                          ? (() => {
                              const year = new Date(
                                course.coordinator.startDate,
                              ).getFullYear();
                              return !isNaN(year) ? year : "Desconhecido";
                            })()
                          : "Desconhecido"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] sm:text-[11px] md:text-[12px] text-gray-400 italic">
                    Sem coordenador
                  </span>
                )}
              </td>

              {/* Estado */}
              <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
                <StatusBadge estado={course.estado} />
              </td>

              {/* acções */}
              <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
                <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                  <button
                    onClick={() => onEdit(course)}
                    disabled={course.hasHistory}
                    title={
                      course.hasHistory
                        ? "Este curso possui histórico e não pode ser editado."
                        : undefined
                    }
                    className={`inline-flex items-center gap-1 sm:gap-1.5
                               text-[10px] sm:text-[11px] md:text-[12px]
                               text-[#0F2C59] border border-[#0F2C59]/20 rounded-md
                               bg-[#0F2C59]/5 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1
                               hover:bg-[#0F2C59]/10 transition-colors
                               disabled:text-gray-400 disabled:border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  >
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="text-[9px] sm:text-[10px]"
                    />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                  <button
                    onClick={() => onDeactivate(course)}
                    disabled={course.hasActiveClass}
                    title={
                      course.hasActiveClass
                        ? "Não é possível arquivar um curso com turmas ativas."
                        : undefined
                    }
                    className={`inline-flex items-center gap-1 sm:gap-1.5
                               text-[10px] sm:text-[11px] md:text-[12px]
                               text-orange-600 border border-orange-200 rounded-md
                               px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1
                               hover:bg-orange-50 transition-colors
                               disabled:text-gray-400 disabled:border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  >
                    <FontAwesomeIcon
                      icon={faArchive}
                      className="text-[9px] sm:text-[10px]"
                    />
                    <span className="hidden sm:inline">Arquivar</span>
                  </button>
                  {course.coordinator ? (
                    <button
                      onClick={() => onDesvincular(course)}
                      className="inline-flex items-center gap-1 sm:gap-1.5
                                 text-[10px] sm:text-[11px] md:text-[12px]
                                 text-red-600 border border-red-200 rounded-md
                                 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1
                                 hover:bg-red-50 transition-colors"
                    >
                      <FontAwesomeIcon
                        icon={faUserMinus}
                        className="text-[9px] sm:text-[10px]"
                      />
                      <span className="hidden sm:inline">Desvincular</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onVincular(course)}
                      className="inline-flex items-center gap-1 sm:gap-1.5
                                 text-[10px] sm:text-[11px] md:text-[12px]
                                 text-blue-600 border border-blue-200 rounded-md
                                 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1
                                 hover:bg-blue-50 transition-colors"
                    >
                      <FontAwesomeIcon
                        icon={faUserPlus}
                        className="text-[9px] sm:text-[10px]"
                      />
                      <span className="hidden sm:inline">Vincular</span>
                    </button>
                  )}

                  <button
                    onClick={() => onHistory(course)}
                    className="w-6 h-6 sm:w-7 sm:h-7
                               rounded-md border border-gray-200 text-gray-400
                               hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={faClockRotateLeft}
                      className="text-[9px] sm:text-[10px] md:text-[11px]"
                    />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
