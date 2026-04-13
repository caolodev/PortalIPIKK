"use client";
import Link from "next/link";
export default function Hero({ user }) {
  return (
    <section
      id="inicio"
      className="flex items-center justify-center bg-[#0F2C59]"
    >
      <div className="w-[95%] mx-auto max-w-7xl px-2 py-32 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-black mb-6">
          Portal IPIKK <br />
          <span className="text-blue-300 font-light">
            Sistema Académico Integrado
          </span>
        </h1>
        <p className="text-xl md:text-2xl font-medium text-blue-100/80 mb-4 max-w-3xl mx-auto">
          Plataforma digital oficial para gestão académica moderna.
        </p>
        <p className="text-lg text-blue-100/60 mb-12 max-w-2xl mx-auto">
          O Portal IPIKK centraliza processos académicos, facilita acesso à
          informação escolar e promove organização institucional eficiente.
        </p>
        {user ? (
          <Link
            href={"/redirect"}
            className="bg-white py-5 px-12 rounded-full text-[#0F2C59] md:text-xl text-[14px] font-bold hover:bg-[#EFF6FF] hover:space-x-2.5"
          >
            <span>Ir para meu painel</span>{" "}
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={"/auth/login"}
              className="bg-white py-3 px-10 text-[#0F2C59] rounded-full font-black text-xl hover:bg-[#EFF6FF]"
            >
              Fazer o Login
            </Link>
            <Link
              href={"/auth/signup"}
              className="border-white py-3 px-10 rounded-full font-black text-xl border hover:bg-[#27426C]"
            >
              Criar Conta
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
