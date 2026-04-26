"use client";

import ClassTable from "./ClassTable";
import PaginationControls from "@/components/PaginationControls";

export default function ClassTableSection({
  displayedClasses,
  currentPage,
  setCurrentPage,
  totalPages,
  filteredClasses,
  onBind,
  onUnbind,
  onEdit,
  onDelete,
  onHistory,
  actionLoading,
}) {
  return (
    <>
      <ClassTable
        classes={displayedClasses}
        onBind={onBind}
        onUnbind={onUnbind}
        onEdit={onEdit}
        onDelete={onDelete}
        onHistory={onHistory}
        actionLoading={actionLoading}
      />

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        itemsCount={filteredClasses.length}
        itemName="turmas"
        onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      />
    </>
  );
}
