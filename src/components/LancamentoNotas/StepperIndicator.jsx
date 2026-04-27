"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function StepperIndicator({
  selectedClass,
  selectedDiscipline,
  students,
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      {/* Step 1 */}
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold mb-0.5 text-xs ${
            selectedClass ? "bg-[#0f2c59]" : "bg-slate-300"
          }`}
        >
          {selectedClass ? <FontAwesomeIcon icon={faCheckCircle} /> : "1"}
        </div>
        <span className="text-xs font-semibold text-slate-600">Turma</span>
      </div>

      {/* Line 1 */}
      <div
        className={`flex-1 h-0.5 mx-1 ${
          selectedClass ? "bg-[#0f2c59]" : "bg-slate-200"
        }`}
      />

      {/* Step 2 */}
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold mb-0.5 text-xs ${
            selectedDiscipline
              ? "bg-[#0f2c59]"
              : selectedClass
                ? "bg-[#0f2c59]"
                : "bg-slate-300"
          }`}
        >
          {selectedDiscipline ? <FontAwesomeIcon icon={faCheckCircle} /> : "2"}
        </div>
        <span className="text-xs font-semibold text-slate-600">Disciplina</span>
      </div>

      {/* Line 2 */}
      <div
        className={`flex-1 h-0.5 mx-1 ${
          selectedDiscipline ? "bg-[#0f2c59]" : "bg-slate-200"
        }`}
      />

      {/* Step 3 */}
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold mb-0.5 text-xs ${
            students.length > 0 ? "bg-[#0f2c59]" : "bg-slate-300"
          }`}
        >
          3
        </div>
        <span className="text-xs font-semibold text-slate-600">Notas</span>
      </div>
    </div>
  );
}
