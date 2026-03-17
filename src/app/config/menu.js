import {
  faGraduationCap,
  faFileLines,
  faChalkboardUser,
  faTableColumns,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
export const dashboardMenu = {
  director: [
    { label: "Dashboard", path: "/dashboard/director", icon: faLayerGroup },
    {
      label: "Gestão Académica",
      path: "/dashboard/director/gestao",
      icon: faGraduationCap,
    },
    {
      label: "Turmas",
      path: "/dashboard/director/turmas",
      icon: faChalkboardUser,
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
      label: "Turmas",
      path: "/dashboard/professor/turmas",
      icon: faChalkboardUser,
    },
    {
      label: "Notas",
      path: "/dashboard/professor/notas",
      icon: faGraduationCap,
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
