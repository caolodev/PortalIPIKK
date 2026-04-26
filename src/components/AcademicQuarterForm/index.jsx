"use client";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import {
  createAcademicQuarter,
  updateAcademicQuarter,
} from "@/services/academicQuarter";
export default function AcademicQuarterForm({
  setShowFormQuarter,
  isEditing = false,
  data = null,
  quarterNumber,
  academicYearId,
  activeYearData,
  onSuccess,
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isYearClosed = activeYearData?.status === "CLOSED";
  const quarterStatus = data?.status;
  const isActiveQuarter = isEditing && quarterStatus === "ACTIVE";
  const isClosedQuarter = isEditing && quarterStatus === "CLOSED";
  const disableStartDate = isYearClosed || isActiveQuarter || isClosedQuarter;
  const disableEndDate = isYearClosed || isClosedQuarter;
  const disableSubmit = isYearClosed || isClosedQuarter;
  const toastError = (message) => {
    toast.error(message, {
      style: {
        background: "#0F2C59",
        color: "#ffffff",
        fontWeight: "600",
      },
    });
  };
  const statusNotice = isYearClosed
    ? "Ano lectivo encerrado. Nenhuma alteração é permitida."
    : isClosedQuarter
      ? "Trimestre encerrado. Edição bloqueada."
      : isActiveQuarter
        ? "Trimestre activo. Apenas a alteração da data de fim é permitida."
        : "";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (isEditing && data) {
      setStartDate(data.startDate ?? "");
      setEndDate(data.endDate ?? "");
    } else {
      setStartDate("");
      setEndDate("");
    }
  }, [isEditing, data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (startDate && endDate && startDate > endDate) {
        throw new Error(
          "A data de início deve ser anterior ou igual à data de fim.",
        );
      }

      let response;
      if (isEditing && data?.id) {
        response = await updateAcademicQuarter(data.id, {
          startDate,
          endDate,
        });
        if (!response.success)
          throw new Error(response.error || "Erro ao atualizar trimestre");
        toast.success("Trimestre atualizado com sucesso!");
      } else {
        response = await createAcademicQuarter({
          startDate,
          endDate,
          academicYearId,
        });
        if (!response.success)
          throw new Error(response.error || "Erro ao criar trimestre");
        toast.success("Trimestre criado com sucesso!");
      }

      if (onSuccess) onSuccess();
      setShowFormQuarter(false);
    } catch (error) {
      toastError(error.message || "Erro ao processar trimestre");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateForInput = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const visibleNumber = isEditing ? data?.number : quarterNumber;
  const formattedNumber = Number.isInteger(visibleNumber)
    ? `${visibleNumber}º`
    : "?º";

  const formatDateForDisplay = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={() => setShowFormQuarter(false)}
      />

      <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0F2C59]/8 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faClock}
                className="w-3.5 h-3.5 text-[#0F2C59]"
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#0F2C59] leading-tight">
                {isEditing ? "Editar Trimestre" : "Novo Trimestre"}
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {isEditing
                  ? "Atualize as datas do trimestre"
                  : "Defina as datas do novo trimestre"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFormQuarter(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all "
          >
            <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-px bg-gray-100" />

        {activeYearData && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-600">
              Ano Lectivo:{" "}
              <span className="font-medium text-[#0F2C59]">
                {activeYearData.name}
              </span>{" "}
              ({formatDateForDisplay(activeYearData.startDate)} à{" "}
              {formatDateForDisplay(activeYearData.endDate)})
            </p>
          </div>
        )}

        {/* Form */}
        <form
          className="px-6 py-5 grid grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          {(statusNotice || isYearClosed) && (
            <div className="col-span-2 px-4 py-3 rounded-lg bg-[#f8fafc] border border-[#0F2C59]/20 text-sm text-[#0F2C59]">
              {statusNotice}
            </div>
          )}
          <div className="col-span-2 flex flex-col gap-1.5">
            <label
              htmlFor="quarterNumber"
              className="text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Número
            </label>
            <input
              type="text"
              id="quarterNumber"
              value={formattedNumber}
              readOnly
              className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-700"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="startDate"
              className="text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Data de Início
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className={
                "px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 border-gray-200"
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="endDate"
              className="text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Data de Fim
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className={
                "px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 border-gray-200"
              }
            />
          </div>

          <div className="col-span-2 h-px bg-gray-100 my-2" />

          <button
            type="button"
            onClick={() => setShowFormQuarter(false)}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || disableSubmit}
            className="px-4 py-2.5 text-sm font-medium text-white bg-[#0F2C59] border border-transparent rounded-lg hover:bg-[#0F2C59]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="mx-auto h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : disableSubmit ? (
              "Bloqueado"
            ) : isEditing ? (
              "Atualizar"
            ) : (
              "Criar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
