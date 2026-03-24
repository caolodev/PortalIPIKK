export default function AcademicYearPageHeader({ onNewClick }) {
  return (
    <div className="flex items-center justify-between mb-5 sm:text-[1rem] text-[0.8rem]">
      <div>
        <h1 className="text-2xl font-bold text-[#0F2C59]">
          Gestão de Ano Lectivo
        </h1>
        <p className="text-gray-500">
          Gestão dos períodos académicos do Instituto
        </p>
      </div>
      <button
        onClick={onNewClick}
        className="bg-[#0F2C59] text-white px-4 py-2 rounded-md hover:bg-[#0F2C59]/90 transition-colors cursor-pointer"
      >
        Novo Ano Lectivo
      </button>
    </div>
  );
}
