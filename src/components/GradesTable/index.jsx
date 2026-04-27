"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faFilter } from "@fortawesome/free-solid-svg-icons";

function parseGradeValue(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function GradesTable({
  students,
  existingGrades,
  onGradesChange,
  readOnly = false,
  academicQuarter,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [grades, setGrades] = useState(() => {
    const initialGrades = {};
    students.forEach((student) => {
      initialGrades[student.id] = existingGrades[student.id] || {
        pp: "",
        pt: "",
        mac: "",
      };
    });
    return initialGrades;
  });

  useEffect(() => {
    const initialGrades = {};
    students.forEach((student) => {
      initialGrades[student.id] = existingGrades[student.id] || {
        pp: "",
        pt: "",
        mac: "",
      };
    });
    setGrades(initialGrades);
  }, [students, existingGrades]);

  // Calculate status based on grades
  const calculateStatus = (pp, pt, mac) => {
    const n1 = parseGradeValue(pp);
    const n2 = parseGradeValue(pt);
    const nMAC = parseGradeValue(mac);

    const validNotes = [n1, n2, nMAC].filter((v) => v !== null && !isNaN(v));
    if (validNotes.length === 0) return { average: "-", status: "-" };

    const average = (
      validNotes.reduce((acc, curr) => acc + curr, 0) / validNotes.length
    ).toFixed(1);
    const status = Number(average) >= 10 ? "Aprovado" : "Reprovado";

    return { average: Number(average), status };
  };

  // Filter students by search term and status
  const filteredStudents = useMemo(() => {
    let filtered = students.filter((student) => {
      const name = (student.name || student.nomeCompleto || "").toLowerCase();
      const numero = (student.numero || student.processo || "").toString();
      const term = searchTerm.toLowerCase();
      return name.includes(term) || numero.includes(term);
    });

    // Apply status filter
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((student) => {
        const studentGrades = grades[student.id] || {
          pp: "",
          pt: "",
          mac: "",
        };
        const { status } = calculateStatus(
          studentGrades.pp,
          studentGrades.pt,
          studentGrades.mac,
        );

        if (filterStatus === "Aprovados") return status === "Aprovado";
        if (filterStatus === "Reprovados") return status === "Reprovado";
        return true;
      });
    }

    // Sort alphabetically by name
    return filtered.sort((a, b) => {
      const nameA = (a.name || a.nomeCompleto || "").toLowerCase();
      const nameB = (b.name || b.nomeCompleto || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [students, searchTerm, filterStatus, grades]);

  const handleGradeChange = (studentId, field, value) => {
    if (readOnly) return;

    // Validate range 0-20
    const numValue = value === "" ? "" : Number(value);
    if (numValue !== "" && (numValue < 0 || numValue > 20)) {
      return; // Ignore invalid values
    }

    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const getChangedStudents = useCallback(() => {
    if (readOnly) return [];

    const changed = [];
    students.forEach((student) => {
      const currentGrade = grades[student.id];
      const previousGrade = existingGrades[student.id] || {
        pp: "",
        pt: "",
        mac: "",
      };

      // Check if any field changed
      if (
        currentGrade.pp !== (previousGrade.pp || "") ||
        currentGrade.pt !== (previousGrade.pt || "") ||
        currentGrade.mac !== (previousGrade.mac || "")
      ) {
        changed.push({ student, grades: currentGrade });
      }
    });
    return changed;
  }, [grades, students, existingGrades, readOnly]);

  // Expose changed students to parent
  useEffect(() => {
    onGradesChange({ grades, getChanged: getChangedStudents });
  }, [grades, getChangedStudents, onGradesChange]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-semibold text-slate-900">
            Pauta de Notas
          </h3>
          <p className="text-xs text-slate-500">Insira as notas de 0 a 20.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">
            {filteredStudents.length} aluno(s) listado(s)
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center mb-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-xs">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
          />
          <input
            type="text"
            placeholder="Nome ou nº processo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-[#0f2c59]/20 focus:border-[#0f2c59]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1">
          <FontAwesomeIcon icon={faFilter} className="text-slate-400 text-xs" />
          <div className="flex bg-slate-100 border border-slate-200 rounded-full p-0.5 gap-0.5">
            {["ALL", "Aprovados", "Reprovados"].map((status) => {
              const isActive = filterStatus === status;
              const label = status === "ALL" ? "Todos" : status;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white border border-slate-200 text-[#0f2c59]"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative rounded-md border border-slate-200 overflow-hidden bg-white">
        {readOnly && (
          <div className="absolute inset-0 bg-gray-50 opacity-50 z-10" />
        )}
        <div className="overflow-x-auto relative">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0f2c59] border-b border-slate-200">
                <th className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Nº Processo
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Nome do Aluno
                </th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">
                  MAC
                </th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">
                  PP
                </th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">
                  PT
                </th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">
                  Média
                </th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-white uppercase tracking-wider">
                  Situação
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-2 py-4 text-center text-slate-500"
                  >
                    <p className="text-xs">
                      {searchTerm || filterStatus !== "ALL"
                        ? "Nenhum aluno encontrado com esses critérios."
                        : "Nenhum aluno disponível."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const studentGrades = grades[student.id] || {
                    pp: "",
                    pt: "",
                    mac: "",
                  };
                  const { average, status } = calculateStatus(
                    studentGrades.pp,
                    studentGrades.pt,
                    studentGrades.mac,
                  );

                  const statusColor =
                    status === "Aprovado"
                      ? "text-emerald-700 bg-emerald-50"
                      : status === "Reprovado"
                        ? "text-red-700 bg-red-50"
                        : "text-slate-700 bg-slate-50";

                  return (
                    <tr
                      key={student.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-2 py-1.5 text-xs font-medium text-[#0f2c59]">
                        {student.numero || student.processo || "-"}
                      </td>
                      <td className="px-2 py-1.5 text-xs font-medium text-slate-900">
                        {student.name || student.nomeCompleto || "N/A"}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          placeholder="-"
                          value={studentGrades.mac}
                          onChange={(e) =>
                            handleGradeChange(student.id, "mac", e.target.value)
                          }
                          disabled={readOnly}
                          className="w-14 px-1.5 py-0.5 border border-slate-200 rounded text-center text-xs focus:outline-none focus:ring-2 focus:ring-[#0f2c59]/20 focus:border-[#0f2c59] disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          placeholder="-"
                          value={studentGrades.pp}
                          onChange={(e) =>
                            handleGradeChange(student.id, "pp", e.target.value)
                          }
                          disabled={readOnly}
                          className="w-14 px-1.5 py-0.5 border border-slate-200 rounded text-center text-xs focus:outline-none focus:ring-2 focus:ring-[#0f2c59]/20 focus:border-[#0f2c59] disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          placeholder="-"
                          value={studentGrades.pt}
                          onChange={(e) =>
                            handleGradeChange(student.id, "pt", e.target.value)
                          }
                          disabled={readOnly}
                          className="w-14 px-1.5 py-0.5 border border-slate-200 rounded text-center text-xs focus:outline-none focus:ring-2 focus:ring-[#0f2c59]/20 focus:border-[#0f2c59] disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center font-semibold text-xs text-slate-900">
                        {average}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${statusColor}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {readOnly && (
        <div className="rounded-b-md border-t border-slate-200 bg-gray-100 px-4 py-3 text-xs text-slate-600">
          Lançamento de notas bloqueado. O {academicQuarter.number}º trimestre
          terminou.
        </div>
      )}
    </div>
  );
}
