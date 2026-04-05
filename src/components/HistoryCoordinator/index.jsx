import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClockRotateLeft,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
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
        // Get user names
        const usersSnapshot = await getDocs(collection(db, "Users"));
        const users = usersSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});

        const historyWithNames = result.data
          .map((h) => ({
            ...h,
            userName: users[h.userId]?.nomeCompleto || "Desconhecido",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0F2C59]/8 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faClockRotateLeft}
                className="w-3.5 h-3.5 text-[#0F2C59]"
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#0F2C59] leading-tight">
                Histórico de Coordenadores
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">{course.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Content */}
        <div className="px-6 py-5 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <FontAwesomeIcon
                icon={faSpinner}
                className="animate-spin text-gray-500"
              />
            </div>
          ) : history.length === 0 ? (
            <p className="text-gray-500 text-center">
              Nenhum histórico encontrado.
            </p>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.userName}
                    </p>
                    <p className="text-xs text-gray-500">
                      De {new Date(item.startDate).toLocaleDateString()}
                      {item.endDate
                        ? ` até ${new Date(item.endDate).toLocaleDateString()}`
                        : " (atual)"}
                    </p>
                  </div>
                  {!item.endDate && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Atual
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
