"use client";
import { useState, useEffect } from "react";
import { getAcademicYears } from "@/services/academicYear";
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

  const handleEdit = (academicYear) => {
    if (academicYear.status === "CLOSED") {
      toast.error("Não é possível editar um ano lectivo encerrado.");
      return;
    }
    setEditingAcademicYear(academicYear);
    setShowNewAcademicYear(true);
  };

  return (
    <div className="mt-10 relative sm:text-[1rem] text-[0.8rem]">
      <PageHeader
        title="Gestão de Ano Lectivo"
        description="Gestão dos períodos académicos do Instituto"
        buttonText="Ano"
        onDisa
        onButtonClick={() => {
          setShowNewAcademicYear(true);
          setEditingAcademicYear(null);
        }}
        buttonTitle="Novo Ano Lectivo"
      />

      <FilterStatusSelect
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
      />

      <AcademicYearTable
        displayedAcademicYears={displayedAcademicYears}
        onEdit={handleEdit}
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
