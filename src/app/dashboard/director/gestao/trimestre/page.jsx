"use client";
import { getAcademicQuartersByYear } from "@/services/academicQuarter";
import { getActiveAcademicYear } from "@/services/academicYear";
import { useState, useEffect } from "react"; // Removido 'use' e 'act' que não eram necessários
import AcademicQuarterCard from "@/components/AcademicQuarterCard";
import AcademicQuarterForm from "@/components/AcademicQuarterForm";
import PageHeader from "@/components/PageHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faFolderOpen } from "@fortawesome/free-solid-svg-icons"; // Adicionado ícone de vazio

export default function AcademicQuarter() {
  const [academicQuarters, setAcademicQuarters] = useState([]);
  const [showFormQuarter, setShowFormQuarter] = useState(false);
  const [editingQuarter, setEditingQuarter] = useState(null);
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
        const response = await getAcademicQuartersByYear(activeYear.data.id);
        if (response.success) {
          setAcademicQuarters(response.data || []);
        }
      } catch (error) {
        console.error("Erro ao buscar trimestres:", error);
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

  const handleEditQuarter = (quarter) => {
    setEditingQuarter(quarter);
    setShowFormQuarter(true);
  };

  const sortedQuarters = [...academicQuarters].sort((a, b) => a.number - b.number);
  const existingNumbers = new Set(sortedQuarters.map((q) => q.number));
  let nextQuarterNumber = 1;

  while (existingNumbers.has(nextQuarterNumber) && nextQuarterNumber <= 3) {
    nextQuarterNumber += 1;
  }

  const canAddNextQuarter =
    nextQuarterNumber <= 3 &&
    (nextQuarterNumber === 1 || existingNumbers.has(nextQuarterNumber - 1));

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

      {/* ESTADO 1: Carregando */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#0F2C59] mb-3 animate-spin" />
          <p className="text-gray-600 font-medium">A procurar trimestres...</p>
        </div>
      ) : 
      
      /* ESTADO 2: Sem Ano Lectivo Ativo */
      !activeYear?.data ? (
        <div className="flex flex-col items-center justify-center py-20 border-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
          <p className="text-red-500 font-semibold">Atenção!</p>
          <p className="text-gray-600">Nenhum ano lectivo activo encontrado. Por favor, active um primeiro.</p>
        </div>
      ) : 
      /* ESTADO 3: Lista Vazia ou Com Dados */
      (
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {sortedQuarters.length === 0 && !canAddNextQuarter ? (
            <div className="col-span-full text-center py-10">
               <FontAwesomeIcon icon={faFolderOpen} className="text-gray-300 text-4xl mb-2" />
               <p className="text-gray-500">Nenhum trimestre registado para este ano.</p>
            </div>
          ) : (
            <>
              {sortedQuarters.map((quarter) => (
                <AcademicQuarterCard
                  key={quarter.id}
                  quarter={quarter}
                  onEdit={handleEditQuarter}
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

      {showFormQuarter && activeYear?.data && (
        <AcademicQuarterForm
          setShowFormQuarter={handleCloseForm}
          isEditing={!!editingQuarter}
          data={editingQuarter}
          academicYearId={activeYear.data.id}
          activeYearData={activeYear.data}
          onSuccess={async () => {
             // Atualização rápida sem resetar todo o loading da página se preferir
             const resp = await getAcademicQuartersByYear(activeYear.data.id);
             if (resp.success) setAcademicQuarters(resp.data || []);
             handleCloseForm();
          }}
        />
      )}
    </div>
  );
}