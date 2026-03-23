"use client";
import { useState, useEffect } from "react";
import {
  getAnoLectivo,
  activateAnoLectivo,
} from "../../../../../services/anoLectivo";
import NewAnoLectivo from "../../../../../components/NewAnoLectivo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashCan } from "@fortawesome/free-regular-svg-icons";
export default function AnoLectivo() {
  const [anoLectivo, setAnoLectivo] = useState([]);
  const [addAnoLectivo, setAddAnoLectivo] = useState(false);
  const [editingAno, setEditingAno] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const handleToggleStatus = async (id) => {
    try {
      setLoadingId(id);
      await activateAnoLectivo(id);
      const data = await getAnoLectivo();
      setAnoLectivo(data.data);
    } catch (error) {
      console.error("Erro ao alterar status", error);
    } finally {
      setLoadingId(null);
    }
  };
  useEffect(() => {
    const fetchAnoLectivo = async () => {
      try {
        const data = await getAnoLectivo();
        setAnoLectivo([...data.data]);
      } catch (error) {
        console.error("Erro ao buscar ano lectivo:", error);
      }
    };
    fetchAnoLectivo();
  }, [addAnoLectivo, editingAno]);
  return (
    <div className="mt-10 relative">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2C59]">Ano Lectivo</h1>
          <p className="text-gray-500">
            {" "}
            Gestão dos períodos Academicos do Instituto{" "}
          </p>
        </div>
        <button
          onClick={() => setAddAnoLectivo(true)}
          className="bg-[#0F2C59] text-white px-4 py-2 rounded-md hover:bg-[#0F2C59]/90 transition-colors cursor-pointer"
        >
          Novo Ano Lectivo
        </button>
      </div>
      <table className="w-full border-separate border-spacing-0 rounded-t-2xl rounded-b-2xl overflow-hidden shadow">
        <thead className="bg-gray-100">
          <tr className="border-b">
            <th className="px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
              Ano Lectivo
            </th>
            <th className="px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
              Data Início
            </th>
            <th className="px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
              Data Fim
            </th>
            <th className="px-6 py-3 text-left text-xs font-light text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-light text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white rounded-b-4xl ">
          {anoLectivo.length > 0 ? (
            anoLectivo.map((ano) => (
              <tr key={ano.id} className="border-b">
                <td className="px-6 py-4 text-sm text-gray-500">{ano.nome}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {ano.dataInicio}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {ano.dataFim}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <button
                    onClick={() => handleToggleStatus(ano.id)}
                    disabled={loadingId === ano.id}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ano.isActive
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    } ${loadingId === ano.id ? "opacity-50 cursor-not-allowed" : "hover:brightness-110"}`}
                  >
                    {loadingId === ano.id
                      ? "Processando..."
                      : ano.isActive
                        ? "Ativo"
                        : "Inativo"}
                  </button>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditingAno(ano.id)}
                    className="text-[#0F2C59] cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button className="text-red-600 ml-2 cursor-pointer">
                    <FontAwesomeIcon icon={faTrashCan} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                Nenhum ano lectivo encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {(addAnoLectivo || editingAno) && (
        <NewAnoLectivo
          setAddAnoLectivo={(value) => {
            setAddAnoLectivo(value);
            setEditingAno(null);
          }}
          isEditing={!!editingAno}
          data={editingAno}
        />
      )}
    </div>
  );
}
