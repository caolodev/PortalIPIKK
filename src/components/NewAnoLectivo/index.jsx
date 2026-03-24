"use client";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import {
  createAnoLectivo,
  updateAnoLectivo,
} from "../../services/academicYear";
export default function NewAnoLectivo({
  setAddAnoLectivo,
  isEditing = false,
  data = null,
}) {
  const [nome, setNome] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (isEditing && data) {
      setNome(data.name ?? "");
      setDataInicio(data.startDate ?? "");
      setDataFim(data.endDate ?? "");
    } else {
      setNome("");
      setDataInicio("");
      setDataFim("");
    }
  }, [isEditing, data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!nome || !dataInicio || !dataFim) {
      toast.error("Por favor, preencha todos os campos");
      setIsSubmitting(false);
      return;
    }
    try {
      if (isEditing && data?.id) {
        const response = await updateAnoLectivo(data.id, {
          nome,
          dataInicio,
          dataFim,
        });
        if (!response.success) {
          throw new Error(response.error || "Erro ao atualizar Ano Lectivo");
        }
        toast.success("Ano Lectivo atualizado com sucesso!");
      } else {
        const response = await createAnoLectivo({ nome, dataInicio, dataFim });
        if (!response.success) {
          throw new Error(response.error || "Erro ao criar Ano Lectivo");
        }
        toast.success("Ano Lectivo criado com sucesso!");
      }
      setAddAnoLectivo(false);
    } catch (error) {
      console.error("Erro ao criar/atualizar Ano Lectivo", error);
      toast.error(error.message || "Erro ao criar/atualizar Ano Lectivo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[#00000057]"></div>
      <div className="relative flex items-center justify-center h-full">
        <div className="bg-white flex flex-col gap-3 py-5 rounded-lg w-full max-w-md mx-2">
          <h1 className="px-5 font-semibold text-[16px]">Novo Ano Lectivo</h1>
          <hr className="text-gray-200" />
          <form
            className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-[14px]"
            onSubmit={handleSubmit}
          >
            <div className="col-span-1 md:col-span-2 flex flex-col gap">
              <label htmlFor="nome">Nome do Ano Lectivo</label>

              <input
                required
                type="text"
                placeholder="Ex: 2025/2026"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="border rounded-lg px-4 py-2 border-gray-300 focus:border-[#0F2C59] focus:ring-1 focus:ring-[#0F2C59]/50 outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap">
              <label htmlFor="dataInicio">Data de Início</label>
              <input
                type="date"
                required
                id="dataInicio"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="border rounded-lg px-4 py-2 border-gray-300 focus:border-[#0F2C59] focus:ring-1 focus:ring-[#0F2C59]/50 outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap">
              <label htmlFor="dataFim">Data de Fim</label>
              <input
                type="date"
                value={dataFim}
                required
                id="dataFim"
                onChange={(e) => setDataFim(e.target.value)}
                className="border rounded-lg px-4 py-2 border-gray-300 focus:border-[#0F2C59] focus:ring-1 focus:ring-[#0F2C59]/50 outline-none transition-colors"
              />
            </div>
          </form>
          <hr className="text-gray-200" />
          <div className="flex items-center justify-end px-5 gap-5">
            <button
              onClick={() => setAddAnoLectivo(false)}
              className="font-medium text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#0F2C59] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#0F2C59]/90 transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "Criar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
