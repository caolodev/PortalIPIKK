import HistoryEntriesModal from "@/components/HistoryEntries";

export default function HistoryModal({ turma, entries, loading, onClose }) {
  return (
    <HistoryEntriesModal
      title="Histórico de Diretores"
      subtitle={turma?.nomeExibicao || "Histórico da turma"}
      entries={entries}
      loading={loading}
      onClose={onClose}
      emptyMessage="Nenhum histórico de diretores encontrado."
    />
  );
}
