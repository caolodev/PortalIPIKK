"use client";
import { getAcademicQuartersByYear } from "@/services/academicQuarter";
import { getActiveAcademicYear } from "@/services/academicYear";
import { useState, useEffect, use, act } from "react";
import AcademicQuarterCard from "@/components/AcademicQuarterCard";
import AcademicQuarterForm from "@/components/AcademicQuarterForm";
import PageHeader from "@/components/PageHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
export default function AcademicQuarter() {
  const [academicQuarters, setAcademicQuarters] = useState([]);
  const [showFormQuarter, setShowFormQuarter] = useState(false);
  const [editingQuarter, setEditingQuarter] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveYear = async () => {
      try {
        const year = await getActiveAcademicYear();
        setActiveYear(year);
      } catch (error) {
        console.error("Erro ao buscar ano lectivo ativo:", error);
      }
    };
    fetchActiveYear();
  }, []);

  useEffect(() => {
    const fetchQuarters = async () => {
      setIsLoading(true);
      try {
        const response = await getAcademicQuartersByYear(activeYear.data.id);
        if (response.success) {
          setAcademicQuarters(response.data || []);
        } else {
          console.error(
            response.error ||
              "Erro ao buscar trimestres verificar o id do ano ativo",
          );
        }
      } catch (error) {
        console.error("Erro ao buscar trimestres:", error);
      } finally {
        setIsLoading(false);
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
    (nextQuarterNumber === 1 || existingNumbers.has(nextQuarterNumber - 1));

  return (
    <div className="mt-10 relative sm:text-[1rem] text-[0.8rem]">
      <PageHeader
        title="Trimestres"
        description="Gestão dos trimestres academicos ."
        buttonText="Trimestre"
        onButtonClick={() => setShowFormQuarter(true)}
        buttonTitle="Novo Trimestre Lectivo"
      />

      {!activeYear || !activeYear.success || !activeYear.data ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-600 font-medium">
              Nenhum ano lectivo ativo encontrado. Crie ou ative um ano lectivo primeiro.
            </p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faSpinner}
              className="w-8 h-8 text-[#0F2C59] mb-3 animate-spin"
            />
            <p className="text-gray-600 font-medium">
              A procurar trimestres ...
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
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
        </div>
      )}

      {showFormQuarter && activeYear && activeYear.success && activeYear.data && (
        <AcademicQuarterForm
          setShowFormQuarter={handleCloseForm}
          isEditing={!!editingQuarter}
          data={editingQuarter}
          academicYearId={activeYear.data.id}
          activeYearData={activeYear.data}
          onSuccess={() => {
            setIsLoading(true);
            getAcademicQuartersByYear(activeYear.data.id).then((response) => {
              if (response.success) {
                setAcademicQuarters(response.data || []);
              }
              setIsLoading(false);
            });
          }}
        />
      )}
    </div>
  );
}
