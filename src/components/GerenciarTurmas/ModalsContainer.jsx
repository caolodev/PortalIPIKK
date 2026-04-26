"use client";

import NewClassModal from "./NewClassModal";
import BindDirectorModal from "./BindDirectorModal";
import HistoryModal from "./HistoryModal";
import DeleteConfirm from "./DeleteConfirm";

export default function ModalsContainer({
  newClassOpen,
  setNewClassOpen,
  editClassOpen,
  setEditClassOpen,
  editTurma,
  setEditTurma,
  editTurmaHasStudents,
  setEditTurmaHasStudents,
  deleteConfirm,
  setDeleteConfirm,
  deleteHasStudents,
  isDeleting,
  handleConfirmDelete,
  bindModal,
  setBindModal,
  historyModal,
  setHistoryModal,
  historyLoading,
  course,
  activeYear,
  actionLoading,
  handleCreateClass,
  handleUpdateClass,
  refreshClasses,
}) {
  return (
    <>
      {newClassOpen && (
        <NewClassModal
          mode="create"
          courseCode={course?.code}
          courseId={course?.id}
          activeYearName={activeYear?.name}
          academicYearActive={!!activeYear}
          onClose={() => setNewClassOpen(false)}
          onSubmit={handleCreateClass}
          loading={actionLoading}
          submitLabel="Criar Turma"
          disableSubmit={!activeYear}
          disableReason={
            !activeYear
              ? "Não é possível criar turmas sem um ano lectivo activo."
              : undefined
          }
        />
      )}

      {editClassOpen && editTurma && (
        <NewClassModal
          mode="edit"
          courseCode={course?.code}
          activeYearName={activeYear?.name}
          academicYearActive={editTurma.academicYearActive}
          initialData={{ classe: editTurma.classe, turno: editTurma.turno }}
          onClose={() => {
            setEditClassOpen(false);
            setEditTurma(null);
            setEditTurmaHasStudents(false);
          }}
          onSubmit={handleUpdateClass}
          loading={actionLoading}
          submitLabel="Guardar Alterações"
          disableSubmit={!editTurma.academicYearActive || editTurmaHasStudents}
          disableReason={
            editTurmaHasStudents
              ? "Esta turma não pode ser alterada porque possui alunos matriculados."
              : !editTurma.academicYearActive
                ? "Esta turma não pode ser alterada porque pertence a um ano lectivo encerrado."
                : undefined
          }
        />
      )}

      {deleteConfirm && (
        <DeleteConfirm
          setDeleteConfirm={setDeleteConfirm}
          deleteConfirm={deleteConfirm}
          deleteHasStudents={deleteHasStudents}
          isDeleting={isDeleting}
          handleConfirmDelete={handleConfirmDelete}
        />
      )}

      {bindModal.open && (
        <BindDirectorModal
          turma={bindModal.turma}
          onClose={() => setBindModal({ open: false, turma: null })}
          onBind={async () => {
            setBindModal({ open: false, turma: null });
            await refreshClasses();
          }}
        />
      )}

      {historyModal.open && (
        <HistoryModal
          turma={historyModal.turma}
          entries={historyModal.entries}
          loading={historyLoading}
          onClose={() =>
            setHistoryModal({ open: false, turma: null, entries: [] })
          }
        />
      )}
    </>
  );
}
