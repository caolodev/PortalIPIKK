export default function StatusBadge({ estado }) {
  if (estado === "Arquivado") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gray-600 bg-gray-200 px-2.5 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
        Arquivado
      </span>
    );
  }

  if (estado === "Inactivo") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gray-600 bg-gray-200 px-2.5 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
        Inactivo
      </span>
    );
  }

  if (estado === "Configuração") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#854F0B] bg-[#FAEEDA] px-2.5 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EF9F27]" />
        Configuração
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#0F6E56] bg-[#E1F5EE] px-2.5 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
      Activo
    </span>
  );
}
