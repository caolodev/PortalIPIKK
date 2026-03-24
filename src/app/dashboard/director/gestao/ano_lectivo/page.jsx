"use client";
import { useState, useEffect } from "react";
import {
  getAcademicYears,
  activateAcademicYear,
  closeAcademicYear,
  closeFinishedAcademicYears,
} from "../../../../../services/academicYear";
import AcademicYearPageHeader from "../../../../../components/AcademicYearPageHeader";
import FilterStatusSelect from "../../../../../components/FilterStatusSelect";
import AcademicYearTable from "../../../../../components/AcademicYearTable";
import PaginationControls from "../../../../../components/PaginationControls";
import NewAnoLectivo from "../../../../../components/NewAnoLectivo";
import toast from "react-hot-toast";

export default function AcademicYearPage() {
  const [academicYears, setAcademicYears] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showNewAcademicYear, setShowNewAcademicYear] = useState(false);
  const [editingAcademicYear, setEditingAcademicYear] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const rowsPerPage = 8;

  const fetchAcademicYears = async () => {
    setIsLoading(true);
    try {
      await closeFinishedAcademicYears();
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

  const handleToggleStatus = async (academicYear) => {
    if (academicYear.status === "CLOSED") {
      toast.error("Não é possível ativar um ano lectivo encerrado.");
      return;
    }

    setLoadingId(academicYear.id);
    try {
      const response = await activateAcademicYear(academicYear.id);
      if (response.success) {
        toast.success("Ano lectivo ativado com sucesso");
      } else {
        toast.error(response.error || "Erro ao ativar ano lectivo");
      }
      await fetchAcademicYears();
    } catch (error) {
      toast.error("Erro ao ativar ano lectivo");
      console.error("Error activating academic year:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleEdit = (academicYear) => {
    if (academicYear.status === "CLOSED") {
      toast.error("Não é possível editar um ano lectivo encerrado.");
      return;
    }
    setEditingAcademicYear(academicYear);
    setShowNewAcademicYear(true);
  };

  const handleClose = async (academicYear) => {
    if (academicYear.status === "CLOSED") {
      toast.error("Ano lectivo já está encerrado.");
      return;
    }

    setLoadingId(academicYear.id);
    try {
      const response = await closeAcademicYear(academicYear.id);
      if (response.success) {
        toast.success("Ano lectivo encerrado com sucesso");
      } else {
        toast.error(response.error || "Erro ao encerrar ano lectivo");
      }
      await fetchAcademicYears();
    } catch (error) {
      toast.error("Erro ao encerrar ano lectivo");
      console.error("Error closing academic year:", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="mt-10 relative sm:text-[1rem] text-[0.8rem]">
      <AcademicYearPageHeader
        onNewClick={() => {
          setShowNewAcademicYear(true);
          setEditingAcademicYear(null);
        }}
      />

      <FilterStatusSelect
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
      />

      <AcademicYearTable
        displayedAcademicYears={displayedAcademicYears}
        loadingId={loadingId}
        isLoading={isLoading}
        onToggleStatus={handleToggleStatus}
        onEdit={handleEdit}
        onClose={handleClose}
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
