"use client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faBook,
  faUsers,
  faArrowUpRightFromSquare,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

export default function GestaoAcademica() {
  const sections = [
    {
      title: "Ano Lectivo",
      href: "./gestao/ano_lectivo",
      icon: faCalendarAlt,
      desc: "Gerencie os anos letivos e períodos académicos",
    },
    {
      title: "Cursos",
      href: "./gestao/cursos",
      icon: faBook,
      desc: "Administre os cursos oferecidos pela instituição",
    },
    {
      title: "Turmas",
      href: "./gestao/turmas",
      icon: faUsers,
      desc: "Organize e controle as turmas da instituição",
    },
    {
      title: "Trimestre",
      href: "./gestao/trimestre",
      icon: faClock,
      desc: "Configure os trimestres do calendário académico",
    },
  ];

  return (
    <div className="mt-10 max-w-2xl">
      {/* Header */}
      <div className="flex items-end gap-6 mb-10">
        <div className="w-[0.75] h-12 bg-[#0F2C59] rounded-full shrink-0" />
        <div>
          <h1 className="text-2xl font-bold text-[#0F2C59] leading-tight tracking-tight">
            Gestão Académica
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-light">
            Administre todos os aspectos académicos da instituição
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 divide-x divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
        {sections.map((section, index) => (
          <Link
            key={index}
            href={section.href}
            className="group relative bg-white hover:bg-gray-50 transition-colors duration-150 p-7 flex flex-col gap-5 overflow-hidden"
          >
            {/* Top bar slide-in */}
            <div className="absolute top-0 left-0 right-0 h-[0.5] bg-[#0F2C59] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-200" />

            {/* Icon + Arrow */}
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 border border-gray-200 group-hover:border-[#0F2C59] group-hover:bg-[#0F2C59]/10 rounded-lg flex items-center justify-center transition-all duration-150">
                <FontAwesomeIcon
                  icon={section.icon}
                  className="w-[4.5] h-[4.5] text-[#0F2C59] opacity-60 group-hover:opacity-100 transition-opacity duration-150"
                />
              </div>
              {/* Diagonal arrow */}
              <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-150"
              />
            </div>

            {/* Body */}
            <div>
              <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-gray-300 mb-1.5">
                0{index + 1}
              </p>
              <h3 className="text-base font-semibold text-[#0F2C59] leading-snug tracking-tight mb-1.5">
                {section.title}
              </h3>
              <p className="text-[13px] text-gray-500 font-light leading-relaxed">
                {section.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}