"use client";
import toast from "react-hot-toast";
import {
  getAcademicQuartersByYear,
  deleteAcademicQuarter,
} from "@/services/academicQuarter";
import { getActiveAcademicYear } from "@/services/academicYear";
import { useState, useEffect } from "react"; // Removido 'use' e 'act' que não eram necessários
import AcademicQuarterCard from "@/components/AcademicQuarterCard";
import AcademicQuarterForm from "@/components/AcademicQuarterForm";
import PageHeader from "@/components/PageHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";

export default function AcademicQuarter() {
  const [academicQuarters, setAcademicQuarters] = useState([]);
  const [showFormQuarter, setShowFormQuarter] = useState(false);
  const [editingQuarter, setEditingQuarter] = useState(null);
  const [quarterToDelete, setQuarterToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeYear, setActiveYear] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Busca o ano ativo
  useEffect(() => {
    const fetchActiveYear = async () => {
      try {
        const year = await getActiveAcademicYear();
        setActiveYear(year);

        // Se não houver ano ativo, paramos o loading aqui
        if (!year || !year.success || !year.data) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao buscar ano lectivo ativo:", error);
        setIsLoading(false); // Para o loading mesmo em erro
      }
    };
    fetchActiveYear();
  }, []);

  // 2. Busca os trimestres apenas se o ano ativo existir
  useEffect(() => {
    const fetchQuarters = async () => {
      if (!activeYear?.data?.id) return;

      setIsLoading(true);
      try {
        const response = await getAcademicQuartersByYear(
          activeYear.data.id,
          activeYear.data.status,
        );
        if (response.success) {
          setAcademicQuarters(response.data || []);
        } else {
          toastError(response.error || "Erro ao carregar trimestres.");
          setAcademicQuarters([]);
        }
      } catch (error) {
        console.error("Erro ao buscar trimestres:", error);
        toastError(
          "Erro ao carregar os trimestres. Veja o console para mais detalhes.",
        );
        setAcademicQuarters([]);
      } finally {
        setIsLoading(false); // Garante que o loading para aqui
      }
    };

    if (activeYear && activeYear.success && activeYear.data) {
      fetchQuarters();
    }
  }, [activeYear]);

  const handleCloseForm = () => {
    setShowFormQuarter(false);
    setEditingQuarter(null);
  };

  const toastError = (message) => {
    toast.error(message);
  };

  const handleEditQuarter = (quarter) => {
    setEditingQuarter(quarter);
    setShowFormQuarter(true);
  };

  const handleDeleteQuarter = (quarter) => {
    if (quarter.status !== "INACTIVE") {
      toastError("Só é possível apagar trimestres inativos.");
      return;
    }

    setQuarterToDelete(quarter);
  };

  const handleCancelDeleteQuarter = () => {
    setQuarterToDelete(null);
  };

  const handleConfirmDeleteQuarter = async () => {
    if (!quarterToDelete) return;
    setIsDeleting(true);

    try {
      const response = await deleteAcademicQuarter(quarterToDelete.id);
      if (!response.success) {
        toastError(response.error || "Erro ao apagar o trimestre.");
        return;
      }

      toast.success("Trimestre apagado com sucesso.");
      const resp = await getAcademicQuartersByYear(
        activeYear.data.id,
        activeYear.data.status,
      );
      if (resp.success) setAcademicQuarters(resp.data || []);
      setQuarterToDelete(null);
      handleCloseForm();
    } catch (error) {
      toastError(error.message || "Erro ao apagar o trimestre.");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const sortedQuarters = [...academicQuarters].sort(
    (a, b) => a.number - b.number,
  );
  const existingNumbers = new Set(sortedQuarters.map((q) => q.number));
  let nextQuarterNumber = 1;

  while (existingNumbers.has(nextQuarterNumber) && nextQuarterNumber <= 3) {
    nextQuarterNumber += 1;
  }

  const canAddNextQuarter =
    nextQuarterNumber <= 3 &&
    (nextQuarterNumber === 1 || existingNumbers.has(nextQuarterNumber - 1)) &&
    activeYear?.data?.status !== "CLOSED";

  return (
    <div className="mt-10 relative sm:text-[1rem] text-[0.8rem]">
      <PageHeader
        title="Trimestres"
        description="Gestão dos trimestres académicos."
        buttonText="Trimestre"
        disabledReason="Todos os trimestres já foram criados ou o anterior falta criar."
        buttonDisabled={!canAddNextQuarter || isLoading}
        onButtonClick={() => setShowFormQuarter(true)}
        buttonTitle="Novo Trimestre Lectivo"
      />
      {activeYear?.data && (
        <div className="mt-4 rounded-md border border-[#0F2C59]/20 bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F2C59]">
          Ano Lectivo activo:{" "}
          <span className="font-semibold">{activeYear.data.name}</span> — início{" "}
          {new Date(activeYear.data.startDate).toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}{" "}
          até fim{" "}
          {new Date(activeYear.data.endDate).toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      )}

      {/* ESTADO 1: Carregando */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 mb-3 rounded-full border-4 border-[#0F2C59]/20 border-t-[#0F2C59] animate-spin" />
          <p className="text-gray-600 font-medium">A procurar trimestres...</p>
        </div>
      ) : /* ESTADO 2: Sem Ano Lectivo Ativo */
      !activeYear?.data ? (
        <div className="flex flex-col items-center justify-center py-20 border-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
          <p className="text-red-500 font-semibold">Atenção!</p>
          <p className="text-gray-600">
            Nenhum ano lectivo activo encontrado. Por favor, active um primeiro.
          </p>
        </div>
      ) : (
        /* ESTADO 3: Lista Vazia ou Com Dados */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {sortedQuarters.length === 0 && !canAddNextQuarter ? (
            <div className="col-span-full text-center py-10">
              <FontAwesomeIcon
                icon={faFolderOpen}
                className="text-gray-300 text-4xl mb-2"
              />
              <p className="text-gray-500">
                Nenhum trimestre registado para este ano.
              </p>
            </div>
          ) : (
            <>
              {sortedQuarters.map((quarter) => (
                <AcademicQuarterCard
                  key={quarter.id}
                  quarter={quarter}
                  onEdit={handleEditQuarter}
                  onDelete={handleDeleteQuarter}
                />
              ))}

              {canAddNextQuarter && (
                <AcademicQuarterCard
                  isAddCard
                  onAdd={() => {
                    setEditingQuarter(null);
                    setShowFormQuarter(true);
                  }}
                />
              )}
            </>
          )}
        </div>
      )}

      {quarterToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={handleCancelDeleteQuarter}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#0F2C59]">
              Confirmar eliminação
            </h3>
            <p className="mt-3 text-sm text-gray-600">
              Deseja apagar o {quarterToDelete.number ?? "?"}º trimestre?
              Trimestres só podem ser apagados se não tiverem notas e ainda não
              tiverem iniciado.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={handleCancelDeleteQuarter}
                className="w-full sm:w-auto rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteQuarter}
                disabled={isDeleting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F2C59] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2C59]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {isDeleting ? "A apagar..." : "Apagar trimestre"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showFormQuarter && activeYear?.data && (
        <AcademicQuarterForm
          setShowFormQuarter={handleCloseForm}
          isEditing={!!editingQuarter}
          data={editingQuarter}
          quarterNumber={nextQuarterNumber}
          academicYearId={activeYear.data.id}
          activeYearData={activeYear.data}
          onSuccess={async () => {
            // Atualização rápida sem resetar todo o loading da página se preferir
            const resp = await getAcademicQuartersByYear(
              activeYear.data.id,
              activeYear.data.status,
            );
            if (resp.success) setAcademicQuarters(resp.data || []);
            handleCloseForm();
          }}
        />
      )}
    </div>
  );
}
