"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUser } from "@fortawesome/free-regular-svg-icons";
import { faBriefcase, faFingerprint } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import Link from "next/link";

export default function Profile() {
  const { user } = useAuth();

  const firstName = user.nomeCompleto.split(" ")[0];
  const lastName = user.nomeCompleto.split(" ").slice(-1)[0];
  const sigla = firstName.slice(0, 2).toUpperCase();

  const role =
    user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();

  const [list] = useState([
    { label: "Primeiro Nome", value: firstName },
    { label: "Sobrenome", value: lastName },
    { label: "Email", value: user.email },
    { label: "Função / Cargo", value: role },
    { label: "Processo", value: user.processo },
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Meu Perfil</h2>
        <p className="text-gray-500 text-sm md:text-base mt-1">
          Gere a sua conta e preferências
        </p>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:max-w-xs p-6 md:p-8 bg-white border rounded-2xl shadow-md flex flex-col gap-5 text-gray-500 border-gray-300">
          
          <div className="text-center">
            <div className="bg-[#0F2C59] text-white mx-auto w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full font-black text-2xl md:text-3xl border-3 border-gray-300 shadow-sm">
              {sigla}
            </div>

            <p className="text-[#0F2C59] mt-2 font-medium">
              {firstName} {lastName}
            </p>
            <p className="text-gray-400 text-sm">{role}</p>
          </div>
          <div className="bg-gray-200 w-full h-px" />

          <ul className="text-sm space-y-2">
            <li className="flex items-center gap-2">
              <FontAwesomeIcon icon={faEnvelope} />
              <span className="truncate">{user.email}</span>
            </li>
            <li className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} />
              <span>{user.nomeCompleto}</span>
            </li>
            <li className="flex items-center gap-2">
              <FontAwesomeIcon icon={faBriefcase} />
              <span>{role}</span>
            </li>
            <li className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFingerprint} />
              <span>{user.processo}</span>
            </li>
          </ul>
          <div className="bg-gray-200 w-full h-px" />
          <Link
            href="/auth/forget"
            className="text-center border shadow-md py-2 px-4 rounded-xl text-white bg-[#0F2C59] hover:bg-[#0f2d59e1] transition"
          >
            Reset Password
          </Link>
        </div>
        <div className="flex-1 bg-white border rounded-2xl shadow-md p-6 md:p-10 flex flex-col gap-8 border-gray-300">
          
          <div>
            <h2 className="text-lg md:text-xl font-bold">
              Informações Pessoais
            </h2>
            <span className="text-gray-500 text-sm">
              Apresenta de forma clara e organizada os dados pessoais dos usuários
            </span>
          </div>
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {list.map(({ value, label }, index) => {
              const isFull = value === user.email;

              return (
                <div
                  key={index}
                  className={`${isFull ? "sm:col-span-2" : ""} flex flex-col`}
                >
                  <label className="text-sm text-gray-600">{label}</label>
                  <input
                    type="text"
                    readOnly
                    value={value}
                    className="bg-white rounded-lg p-2 shadow-sm border outline-none text-sm border-gray-300"
                  />
                </div>
              );
            })}
          </form>
          <div className="bg-gray-200 w-full h-px" />
          <h2 className="text-gray-400 text-center text-sm">
            Portal Ipikk | 2026
          </h2>
        </div>
      </div>
    </div>
  );
}