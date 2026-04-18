"use client";
import { useState, useEffect } from "react";
import { getAcademicYears, deleteAcademicYear } from "@/services/academicYear";
import PageHeader from "@/components/PageHeader";
import FilterStatusSelect from "@/components/FilterStatusSelect";
import AcademicYearTable from "@/components/AcademicYearTable";
import PaginationControls from "@/components/PaginationControls";
import NewAnoLectivo from "@/components/NewAnoLectivo";
import toast from "react-hot-toast";

export default function AcademicYearPage() {
  const [academicYears, setAcademicYears] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showNewAcademicYear, setShowNewAcademicYear] = useState(false);
  const [editingAcademicYear, setEditingAcademicYear] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const rowsPerPage = 8;
  const fetchAcademicYears = async () => {
    setIsLoading(true);
    try {
      const response = await getAcademicYears();
      if (response.success) {
        setAcademicYears(response.data ?? []);
      } else {
        toast.error(response.error || "Erro ao buscar anos lectivos");
      }
    } catch (error) {
      toast.error("Erro ao buscar anos lectivos");
      console.error("Error fetching academic years:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, [showNewAcademicYear, editingAcademicYear]);

  const filteredAcademicYears = academicYears.filter((year) => {
    if (filterStatus === "ALL") return true;
    return year.status === filterStatus;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAcademicYears.length / rowsPerPage),
  );
  const displayedAcademicYears = filteredAcademicYears.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, academicYears]);

  const hasActiveAcademicYear = academicYears.some(
    (year) => year.status === "ACTIVE",
  );

  const handleEdit = (academicYear) => {
    setEditingAcademicYear(academicYear);
    setShowNewAcademicYear(true);
  };

  const handleDelete = async (yearItem) => {
    if (yearItem.status !== "INACTIVE") return;
    const confirmDelete = window.confirm(
      `Tem certeza que deseja apagar o ano lectivo ${yearItem.name}?`,
    );
    if (!confirmDelete) return;

    try {
      const response = await deleteAcademicYear(yearItem.id);
      if (!response.success) {
        toast.error(response.error || "Erro ao apagar ano lectivo");
        return;
      }
      toast.success("Ano lectivo apagado com sucesso.");
      fetchAcademicYears();
    } catch (error) {
      toast.error(error.message || "Erro ao apagar ano lectivo");
      console.error(error);
    }
  };

  return (
    <div className="mt-10 relative sm:text-[1rem] text-[0.8rem]">
      <PageHeader
        title="Gestão de Ano Lectivo"
        description="Gestão dos períodos académicos do Instituto"
        buttonText="Ano"
        buttonDisabled={hasActiveAcademicYear}
        disabledReason={
          hasActiveAcademicYear
            ? "Encerre o ano actual para permitir um novo ciclo"
            : ""
        }
        onButtonClick={() => {
          setShowNewAcademicYear(true);
          setEditingAcademicYear(null);
        }}
        buttonTitle="Novo Ano Lectivo"
      />
      {hasActiveAcademicYear && (
        <div className="mb-4 rounded-md border border-[#F6C143]/40 bg-[#FFFBEB] p-4 text-sm text-[#9A6C0A]">
          Não é possível criar um novo ano lectivo enquanto houver um ano em andamento.
        </div>
      )}

      <FilterStatusSelect
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
      />

      <AcademicYearTable
        displayedAcademicYears={displayedAcademicYears}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        itemsCount={filteredAcademicYears.length}
        onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      />

      {(showNewAcademicYear || editingAcademicYear) && (
        <NewAnoLectivo
          setAddAnoLectivo={(value) => {
            setShowNewAcademicYear(value);
            if (!value) setEditingAcademicYear(null);
          }}
          isEditing={!!editingAcademicYear}
          data={editingAcademicYear}
        />
      )}
    </div>
  );
}
