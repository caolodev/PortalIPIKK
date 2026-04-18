import {
  faGraduationCap,
  faFileLines,
  faChalkboardUser,
  faLayerGroup,
  faBook,
  faUser,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

export const baseMenu = {
  director: [
    { label: "Dashboard", path: "/dashboard/director", icon: faLayerGroup },
    {
      label: "Gestão Académica",
      path: "/dashboard/director/gestao",
      icon: faGraduationCap,
    },
    {
      label: "Relatórios",
      path: "/dashboard/director/relatorios",
      icon: faFileLines,
    },
  ],
  professor: [
    { label: "Dashboard", path: "/dashboard/professor", icon: faLayerGroup },
    {
      label: "Minhas Turmas",
      path: "/dashboard/professor/turmas",
      icon: faChalkboardUser,
    },
    {
      label: "Lançar Notas",
      path: "/dashboard/professor/notas",
      icon: faGraduationCap,
    },
    {
      label: "Relatórios",
      path: "/dashboard/professor/relatorios",
      icon: faFileLines,
    },
  ],
  aluno: [
    { label: "Dashboard", path: "/dashboard/aluno", icon: faLayerGroup },
    { label: "Notas", path: "/dashboard/aluno/notas", icon: faGraduationCap },
    {
      label: "Relatórios",
      path: "/dashboard/aluno/relatorios",
      icon: faFileLines,
    },
  ],
};

export const roleSpecificMenu = {
  COORDENADOR: [
    { type: "separator", label: "COORDENAÇÃO" },
    {
      label: "Gestão de Turmas",
      path: "/dashboard/professor/coordenacao/cursos_turmas",
      icon: faGraduationCap,
    },
    {
      label: "Matriz Curricular",
      path: "/dashboard/professor/coordenacao/disciplinas",
      icon: faBook,
    },
    {
      label: "Atribuição de Professores",
      path: "/dashboard/professor/coordenacao/professores",
      icon: faUser,
    },
    {
      label: "Relátorios do Curso",
      path: "/dashboard/professor/coordenacao/relatorios",
      icon: faChartLine,
    },
  ],
  DIRECTOR_TURMA: [
    { type: "separator", label: "DIRECÇÃO DE TURMA" },
    {
      label: "Direcção de Turma",
      path: "/dashboard/professor/direcao-turma/direcao",
      icon: faChalkboardUser,
    },
    {
      label: "Relatório da Turma",
      path: "/dashboard/professor/direcao-turma/relatorio",
      icon: faFileLines,
    },
  ],
};
