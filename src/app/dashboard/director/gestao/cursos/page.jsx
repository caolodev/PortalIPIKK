"use client";
import PageHeader from "@/components/PageHeader";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
export default function Cursos() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mt-10 relative sm:text-[1rem] text-[0.8rem]">
      <PageHeader title="Cursos" fontAwesomeIcon={faGraduationCap} description = "Gerencie os cursos oferecidos pela instituição." buttonText = "Curso" onButtonClick = {setIsOpen} buttonTitle = {"Adicionar Curso"}/>
    </div>
  );
}