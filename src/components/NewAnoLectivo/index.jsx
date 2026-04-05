"use client";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark,faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { createAcademicYear, updateAcademicYear } from "@/services/academicYear";

export default function NewAnoLectivo({ setAddAnoLectivo, isEditing = false, data = null }) {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  useEffect(() => {
    if (isEditing && data) {
      setDataInicio(data.startDate ?? "");
      setDataFim(data.endDate ?? "");
    } else {
      setDataInicio("");
      setDataFim("");
    }
  }, [isEditing, data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!dataInicio || !dataFim) {
      toast.error("Por favor, preencha todos os campos");
      setIsSubmitting(false);
      return;
    }
    if (new Date(dataInicio) >= new Date(dataFim)) {
      toast.error("A data de início deve ser anterior à data de fim");
      setIsSubmitting(false);
      return;
    }
    try {
      if (isEditing && data?.id) {
        const response = await updateAcademicYear(data.id, { startDate: dataInicio, endDate: dataFim });
        if (!response.success) throw new Error(response.error || "Erro ao atualizar Ano Lectivo");
        toast.success("Ano Lectivo atualizado com sucesso!");
      } else {
        const response = await createAcademicYear({ startDate: dataInicio, endDate: dataFim });
        if (!response.success) throw new Error(response.error || "Erro ao criar Ano Lectivo");
        toast.success("Ano Lectivo criado com sucesso!");
      }
      setAddAnoLectivo(false);
    } catch (error) {
      toast.error(error.message || "Erro ao criar/atualizar Ano Lectivo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={() => setAddAnoLectivo(false)}
      />

      <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0F2C59]/8 flex items-center justify-center">
              <FontAwesomeIcon icon={faCalendar} className="w-3.5 h-3.5 text-[#0F2C59]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#0F2C59] leading-tight">
                {isEditing ? "Editar Ano Lectivo" : "Novo Ano Lectivo"}
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {isEditing ? "Atualize os dados do período" : "Defina o novo período académico"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAddAnoLectivo(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Form */}
        <form className="px-6 py-5 grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dataInicio" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data de Início
            </label>
            <input
              type="date"
              id="dataInicio"
              required
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="dataFim" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data de Fim
            </label>
            <input
              type="date"
              id="dataFim"
              required
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:border-[#0F2C59] focus:ring-2 focus:ring-[#0F2C59]/10 outline-none transition-all"
            />
          </div>

          <div className="col-span-2 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddAnoLectivo(false)}
              className="text-sm text-gray-500 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center min-w-[22.5] bg-[#0F2C59] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-[#0F2C59]/90 transition-colors cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" />
              ) : isEditing ? "Atualizar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}