import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
export default function DeleteConfirm({
  setDeleteConfirm,
  deleteConfirm,
  deleteHasStudents,
  isDeleting,
  handleConfirmDelete,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => setDeleteConfirm(null)}
      />
      <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-red-700">
            Confirmar eliminação de turma
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Tem certeza que deseja eliminar a turma{" "}
            <strong>{deleteConfirm.nomeExibicao}</strong>? Esta ação é
            irreversível e só pode ser feita se não houver alunos vinculados.
          </p>
        </div>
        <div className="px-6 py-5 space-y-4">
          {deleteHasStudents || !deleteConfirm.academicYearActive ? (
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
              {deleteHasStudents
                ? "Não é possível eliminar esta turma porque existem alunos vinculados."
                : "Não é possível eliminar esta turma porque pertence a um ano lectivo encerrado."}
            </div>
          ) : null}
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={
                isDeleting ||
                deleteHasStudents ||
                !deleteConfirm.academicYearActive
              }
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Eliminando...
                </>
              ) : (
                "Confirmar Eliminação"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
