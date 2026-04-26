import HistoryEntriesModal from "@/components/HistoryEntries";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getCoordinatorHistory } from "@/services/courseRoleService";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function HistoryCoordinator({ setIsOpen, course }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const result = await getCoordinatorHistory(course.id);
      if (result.success) {
        const usersSnapshot = await getDocs(collection(db, "Users"));
        const users = usersSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});

        const historyWithNames = result.data
          .map((h) => ({
            ...h,
            name: users[h.userId]?.nomeCompleto || "Desconhecido",
          }))
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

        setHistory(historyWithNames);
      } else {
        toast.error("Erro ao carregar histórico: " + result.error);
      }
      setLoading(false);
    };
    fetchHistory();
  }, [course.id]);

  return (
    <HistoryEntriesModal
      title="Histórico de Coordenadores"
      subtitle={course.name}
      entries={history}
      loading={loading}
      onClose={() => setIsOpen(false)}
      emptyMessage="Nenhum histórico de coordenadores encontrado."
    />
  );
}
