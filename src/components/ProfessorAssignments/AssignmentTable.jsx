"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faUserPlus,
  faChalkboardTeacher,
  faUserEdit,
} from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";

function getInitials(name) {
  return name.slice(0, 2).toUpperCase();
}

export default function AssignmentTable({
  displayedRows,
  onAssign,
  loading,
  directorId,
}) {
  const [openHistoryId, setOpenHistoryId] = useState(null);

  const historyRow = useMemo(
    () => displayedRows.find((row) => row.subjectId === openHistoryId) || null,
    [openHistoryId, displayedRows],
  );

  const historyEntries = useMemo(() => {
    if (!historyRow) return [];
    const currentEntry = historyRow.activeTeacher
      ? [
          {
            id: `${historyRow.subjectId}-current`,
            teacherName: historyRow.activeTeacher.teacherName,
            startDate: historyRow.activeTeacher.startDate,
            endDate: null,
            current: true,
          },
        ]
      : [];
    return [...currentEntry, ...(historyRow.history || [])];
  }, [historyRow]);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex min-h-55 flex-col items-center justify-center gap-3 p-6">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-xl text-[#0f2c59]"
          />
          <p className="text-sm font-medium text-slate-500">
            Carregando disciplinas...
          </p>
        </div>
      </div>
    );
  }

  if (displayedRows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400">
        Nenhuma disciplina encontrada para esta turma.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto shadow rounded-2xl">
        <table className="w-full border-separate border-spacing-0 min-w-max">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-[9px] sm:text-[10px] md:text-xs text-left font-light text-gray-500 uppercase tracking-wider">
                Disciplina
              </th>
              <th className="w-28 px-3 sm:px-4 md:px-6 py-3 md:py-4 text-[9px] sm:text-[10px] md:text-xs text-left font-light text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-[9px] sm:text-[10px] md:text-xs text-left font-light text-gray-500 uppercase tracking-wider">
                Professor Atual
              </th>
              <th className="w-44 px-3 sm:px-4 md:px-6 py-3 md:py-4 text-[9px] sm:text-[10px] md:text-xs text-right font-light text-gray-500 uppercase tracking-wider">
                Acção
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {displayedRows.map((row) => (
              <tr
                key={row.subjectId}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-100"
              >
                <td className="px-3 sm:px-4 md:px-6 py-2">
                  <p className="text-[11px] sm:text-[12px] md:text-[13px] font-medium text-gray-900">
                    {row.subject.name}
                  </p>
                  <span className="mt-1 inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold tracking-wide text-slate-500">
                    {row.subject.sigla}
                  </span>
                </td>
                <td className="px-3 sm:px-4 md:px-6 py-2">
                  {row.activeTeacher ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      Atribuído
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                      Vago
                    </span>
                  )}
                </td>
                <td className="px-3 sm:px-4 md:px-6 py-2">
                  <div
                    className={`flex items-center gap-3 ${row.activeTeacher ? "" : "justify-between"}`}
                  >
                    {row.activeTeacher ? (
                      <>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f2c59] text-[11px] font-bold text-white">
                          {getInitials(row.activeTeacher.teacherName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {row.activeTeacher.teacherName}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-slate-400">
                            <FontAwesomeIcon
                              icon={faChalkboardTeacher}
                              className="text-[#0f2c59]/60"
                            />
                            {row.activeTeacher &&
                            row.activeTeacher.teacherId === directorId
                              ? "director de turma"
                              : "Professor"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="flex items-center gap-2 text-sm text-slate-400">
                        <FontAwesomeIcon icon={faUserPlus} />
                        Sem professor
                      </p>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 sm:px-4 md:px-6 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {(row.activeTeacher || (row.history?.length || 0) > 0) && (
                      <button
                        type="button"
                        onClick={() => setOpenHistoryId(row.subjectId)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 transition hover:border-[#0f2c59]/40 hover:text-[#0f2c59]"
                        aria-label={`Histórico de ${row.subject.name}`}
                      >
                        <FontAwesomeIcon icon={faClock} className="text-sm" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onAssign(row)}
                      className="inline-flex items-center gap-2 rounded-md border border-[#0f2c59] bg-white px-3 py-1.5 text-[10px] sm:text-[11px] font-semibold text-[#0f2c59] transition hover:bg-[#0f2c59] hover:text-white"
                    >
                      <FontAwesomeIcon
                        icon={faUserEdit}
                        className="text-[10px] sm:text-[11px]"
                      />
                      {row.activeTeacher ? "Alterar" : "Atribuir"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {historyRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setOpenHistoryId(null)}
          />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    {historyRow.subject.name}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {historyRow.subject.sigla}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenHistoryId(null)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100"
                  aria-label="Fechar histórico"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-2.5 px-6 py-5">
              {historyEntries.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-400">
                  Nenhum histórico anterior encontrado.
                </div>
              ) : (
                historyEntries.map((entry) => (
                  <div
                    key={`${historyRow.subjectId}-${entry.id}`}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-600">
                      {getInitials(entry.teacherName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {entry.teacherName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(entry.startDate).toLocaleDateString("pt-BR")}{" "}
                        •{" "}
                        {entry.endDate
                          ? new Date(entry.endDate).toLocaleDateString("pt-BR")
                          : "Atual"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 px-6 py-4 text-right">
              <button
                type="button"
                onClick={() => setOpenHistoryId(null)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
