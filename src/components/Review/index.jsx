import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";
export default function review() {
  return (
    <section className="py-24 px-6 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-[#0F2C59] rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
          <FontAwesomeIcon icon={faCode} className="text-[200px]" />
        </div>
        <h2 className="text-3xl md:text-5xl font-black mb-6 relative z-10">
          Faça parte da comunidade IPIKK.
        </h2>
        <p className="text-blue-100/70 mb-10 text-lg md:text-xl relative z-10">
          O futuro da sua educação começa com a organização de hoje.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          <Link
            href={"/redirect"}
            className="transition-colors border py-4 px-12 rounded-full bg-white text-[#0F2C59] hover:bg-blue-50 font-black text-lg"
          >
            Ir para painel
          </Link>
        </div>
      </div>
    </section>
  );
}
