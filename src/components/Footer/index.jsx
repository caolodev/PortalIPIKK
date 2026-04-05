import Image from "next/image";
export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div>
            <Image
              src={"/logo.png"}
              width={50}
              height={50}
              alt="Logotipo do Instituto"
            ></Image>
          </div>
          <div className="text-left leading-2">
            <span className="text-sm font-black text-[#0F2C59] block">
              Portal IPIKK - NV
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              Portal Académico
            </span>
          </div>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest sm:text-start text-center">
          © IPIKK 2026 Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
