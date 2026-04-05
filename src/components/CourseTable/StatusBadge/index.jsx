export default function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#0F6E56] bg-[#E1F5EE] px-2.5 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#854F0B] bg-[#FAEEDA] px-2.5 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-[#EF9F27]" />
      Inactivo
    </span>
  );
}