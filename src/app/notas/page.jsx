"use client";

import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Select from "@/components/ui/Select";
import {
  disciplinaOptions,
  notesColumns,
  notesData,
  trimestreOptions,
} from "@/data/mockData";

export default function NotasPage() {
  const [trimestre, setTrimestre] = useState("all");
  const [disciplina, setDisciplina] = useState("all");

  const filteredNotes = useMemo(() => {
    return notesData.filter((item) => {
      const matchesDisciplina =
        disciplina === "all" || item.code.toLowerCase() === disciplina;
      return matchesDisciplina;
    });
  }, [disciplina]);

  const averageGrade = useMemo(() => {
    if (filteredNotes.length === 0) return "-";
    const total = filteredNotes.reduce(
      (sum, item) => sum + Number(item.mt || 0),
      0,
    );
    return (total / filteredNotes.length).toFixed(1);
  }, [filteredNotes]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Notas
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#0F2C59]">
              Notas de Aluno Teste
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Curso: Gestão Académica · Turma: A1
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="rounded-3xl p-5">
              <p className="text-sm font-semibold text-slate-500">
                Disciplinas
              </p>
              <p className="mt-3 text-2xl font-bold text-[#0F2C59]">
                {filteredNotes.length}
              </p>
            </Card>
            <Card className="rounded-3xl p-5">
              <p className="text-sm font-semibold text-slate-500">
                Média Geral
              </p>
              <p className="mt-3 text-2xl font-bold text-[#0F2C59]">
                {averageGrade}
              </p>
            </Card>
            <Card className="rounded-3xl p-5">
              <p className="text-sm font-semibold text-slate-500">
                Avaliações concluídas
              </p>
              <p className="mt-3 text-2xl font-bold text-[#0F2C59]">
                {notesData.length * 3}
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Select
          label="Trimestre"
          options={trimestreOptions}
          value={trimestre}
          onChange={setTrimestre}
        />
        <Select
          label="Disciplina"
          options={disciplinaOptions}
          value={disciplina}
          onChange={setDisciplina}
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F2C59]">
              Resumo de Notas
            </h2>
            <p className="text-sm text-slate-500">
              Veja o resultado por disciplina e situação atual.
            </p>
          </div>
        </div>
        <DataTable columns={notesColumns} data={filteredNotes} />
      </section>
    </div>
  );
}
