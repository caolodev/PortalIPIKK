"use client";
import Link from "next/link";
export default function GestaoAcademica() {
  return (
    <div>
      <h1>Gestão Académica</h1>
      <ul>
        <Link href={"./gestao/ano_lectivo"}>Ano Lectivo</Link>
        <Link href={"./gestao/cursos"}>Cursos</Link>
        <Link href={"./gestao/turmas"}>Turmas</Link>
        <Link href={"./gestao/trimestre"}>Trimestre</Link>
      </ul>
    </div>
  );
}
