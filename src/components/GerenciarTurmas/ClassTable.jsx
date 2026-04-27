import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faUserMinus,
  faClockRotateLeft,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Avatar from "@/components/CourseTable/Avatar";
import StatusBadge from "@/components/CourseTable/StatusBadge";

function formatClasse(classe) {
  if (!classe) return "-";
  return classe.endsWith("ª") ? classe : `${classe}ª`;
}

function formatTurno(turno) {
  if (!turno) return "-";
  return turno;
}

function renderDerivedField(value) {
  if (!value || value === "N/A") {
    return (
      <span
        className="text-[10px] sm:text-[11px] md:text-[12px] text-orange-600 font-medium"
        title="Verifique o vínculo com o classTemplate"
      >
        N/A
      </span>
    );
  }
  return value;
}

export default function ClassTable({
  classes,
  onBind,
  onUnbind,
  onHistory,
  onEdit,
  onDelete,
  actionLoading,
}) {
  return (
    <div className="overflow-x-auto shadow rounded-2xl">
      <table className="w-full border-separate border-spacing-0 min-w-max">
        <thead className="bg-gray-100">
          <tr>
            {[
              "TURMA",
              "CLASSE",
              "TURNO",
              "DIRECTOR DE TURMA",
              "ESTADO",
              "ACÇÕES",
            ].map((heading) => (
              <th
                key={heading}
                className="px-3 sm:px-4 md:px-6 py-3 md:py-4 text-[9px] sm:text-[10px] md:text-xs text-left font-light text-gray-500 uppercase tracking-wider"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {classes.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-3 sm:px-4 md:px-6 py-6 text-center text-gray-500"
              >
                Nenhuma turma encontrada para o filtro selecionado.
              </td>
            </tr>
          ) : (
            classes.map((turma, index) => {
              return (
                <tr
                  key={turma.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-100"
                >
                  <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
                    <p className="text-[11px] sm:text-[12px] md:text-[13.5px] font-medium text-gray-900 leading-tight">
                      {turma.nomeBase && turma.nomeBase !== "N/A"
                        ? turma.nomeBase
                        : turma.nomeExibicao || renderDerivedField("N/A")}
                    </p>
                    <p className="text-[9px] sm:text-[10px] md:text-[11px] text-gray-400 mt-0.5">
                      Criado em {turma.createdAt ? new Date(turma.createdAt.seconds * 1000).getFullYear() : "Desconhecido"}
                    </p>
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
                    <span className="text-[10px] sm:text-[11px] md:text-[12px] text-gray-500 bg-gray-100 border border-gray-200 rounded-md px-2 py-1">
                      {turma.classe && turma.classe !== "N/A"
                        ? formatClasse(turma.classe)
                        : renderDerivedField("N/A")}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
                    <p className="text-[10px] sm:text-[11px] md:text-[12px] text-gray-600">
                      {formatTurno(turma.turno)}
                    </p>
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
                    {turma.director ? (
                      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
                        <Avatar name={turma.director.name} index={index} />
                        <div>
                          <p className="text-[11px] sm:text-[12px] md:text-[13px] font-medium text-gray-900 leading-tight">
                            {turma.director.name}
                          </p>
                          <p className="text-[9px] sm:text-[10px] md:text-[11px] text-gray-400 mt-0.5">
                            Desde{" "}
                            {turma.director.startDate
                              ? (() => {
                                  const year = new Date(
                                    turma.director.startDate,
                                  ).getFullYear();
                                  return !isNaN(year) ? year : "Desconhecido";
                                })()
                              : "Desconhecido"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] sm:text-[11px] md:text-[12px] text-gray-400 italic">
                        Sem director de turma
                      </span>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
                    <StatusBadge
                      active={turma.active}
                      hasCoordinator={!!turma.director}
                      academicYearActive={turma.academicYearActive}
                    />
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {turma.director ? (
                        <button
                          onClick={() => onUnbind(turma)}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] md:text-[12px] text-red-600 border border-red-200 rounded-md px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 hover:bg-red-50 transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={faUserMinus}
                            className="text-[9px] sm:text-[10px]"
                          />
                          <span className="hidden sm:inline">Desvincular</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onBind(turma)}
                          className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] md:text-[12px] text-blue-600 border border-blue-200 rounded-md px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 hover:bg-blue-50 transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={faUserPlus}
                            className="text-[9px] sm:text-[10px]"
                          />
                          <span className="hidden sm:inline">Vincular</span>
                        </button>
                      )}
                      <button
                        onClick={() => onEdit?.(turma)}
                        disabled={
                          actionLoading ||
                          !turma.academicYearActive ||
                          turma.hasStudents
                        }
                        title={
                          !turma.academicYearActive
                            ? "Turma de ano lectivo encerrado"
                            : turma.hasStudents
                              ? "Turma com alunos não pode ser editada"
                              : undefined
                        }
                        className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] md:text-[12px] text-[#0F2C59] border border-[#0F2C59]/20 rounded-md bg-[#0F2C59]/5 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 hover:bg-[#0F2C59]/10 transition-colors disabled:text-gray-400 disabled:border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          className="text-[9px] sm:text-[10px]"
                        />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                      <button
                        onClick={() => onDelete?.(turma)}
                        disabled={
                          actionLoading ||
                          !turma.academicYearActive ||
                          turma.hasStudents
                        }
                        title={
                          !turma.academicYearActive
                            ? "Turma de ano lectivo encerrado"
                            : turma.hasStudents
                              ? "Turma com alunos não pode ser eliminada"
                              : undefined
                        }
                        className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] md:text-[12px] text-red-600 border border-red-200 rounded-md px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 hover:bg-red-50 transition-colors disabled:text-gray-400 disabled:border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="text-[10px] sm:text-[11px]"
                        />
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                      <button
                        onClick={() => onHistory(turma)}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-md border border-gray-200 text-gray-400 hover:bg-gray-100 flex items-center justify-center transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={faClockRotateLeft}
                          className="text-[9px] sm:text-[10px] md:text-[11px]"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
