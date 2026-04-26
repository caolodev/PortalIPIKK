"use client";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import SideBar from "../../components/Dashboard/SideBar";
import NavBar from "../../components/Dashboard/NavBar";
import { useEffect, useState } from "react";
import { baseMenu, roleSpecificMenu } from "../config/menu";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getActiveAcademicYear } from "@/services/academicYear";
import { getActiveAcademicQuarter } from "@/services/academicQuarter";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import PageTransition from "../../components/PageTransition";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathName = usePathname();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dynamicMenu, setDynamicMenu] = useState([]);
  const [activeAcademicYear, setActiveAcademicYear] = useState(null);
  const [activeAcademicQuarter, setActiveAcademicQuarter] = useState(null);

  useEffect(() => {
    async function fetchAdditionalRoles() {
      if (loading) return;
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      try {
        // 1. Menu Base dependendo do Role (director, PROFESSOR, ALUNO) [cite: 8]
        let finalMenu = [...(baseMenu[user.role.toLowerCase()] || [])];

        // 2. Lógica específica para Professores (Busca de vínculos)
        if (user.role === "PROFESSOR") {
          const rolesFound = [];

          // Verificação de Coordenação de Curso [cite: 18, 22, 25]
          const qCoord = query(
            collection(db, "courseRoles"),
            where("userId", "==", user.uid),
            where("endDate", "==", null),
          );
          const coordSnap = await getDocs(qCoord);
          if (!coordSnap.empty) rolesFound.push("COORDENADOR");

          // Verificação de Direção de Turma [cite: 16, 17]
          const qDir = query(
            collection(db, "classRoles"),
            where("userId", "==", user.uid),
            where("endDate", "==", null),
            where("role", "==", "DIRECTOR_TURMA"),
          );
          const dirSnap = await getDocs(qDir);
          if (!dirSnap.empty) rolesFound.push("DIRECTOR_TURMA");
          // Injetar menus específicos conforme os cargos encontrados [cite: 17, 30]
          rolesFound.forEach((role) => {
            if (roleSpecificMenu[role]) {
              finalMenu = [...finalMenu, ...roleSpecificMenu[role]];
            }
          });
        }

        // 3. Adicionar Perfil sempre ao final
        finalMenu.push({
          label: "Meu Perfil",
          path: "/dashboard/profile",
          icon: faUser,
        });

        setDynamicMenu(finalMenu);
      } catch (error) {
        console.error("Erro ao carregar menu dinâmico:", error);
      }
    }

    fetchAdditionalRoles();
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchActiveAcademicPeriod() {
      if (loading || !user) return;

      try {
        const [yearRes, quarterRes] = await Promise.all([
          getActiveAcademicYear(),
          getActiveAcademicQuarter(),
        ]);

        setActiveAcademicYear(yearRes.success ? yearRes.data : null);
        setActiveAcademicQuarter(quarterRes.success ? quarterRes.data : null);
      } catch (error) {
        console.error("Erro ao buscar ano/trimestre activo:", error);
        setActiveAcademicYear(null);
        setActiveAcademicQuarter(null);
      }
    }

    fetchActiveAcademicPeriod();
  }, [user, loading]);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-screen w-screen">
          <div className="animate-spin h-10 w-10 border-4 border-[#0F2C59] border-t-transparent rounded-full"></div>
        </div>
      </PageTransition>
    );
  }

  if (!user) {
    return null;
  }

  const profileMenuItem = {
    label: "Meu Perfil",
    path: "/dashboard/profile",
    icon: faUser,
  };
  const baseMenuItems = user
    ? [...(baseMenu[user.role.toLowerCase()] || [])]
    : [];
  const menuItems =
    dynamicMenu.length > 0 ? dynamicMenu : [...baseMenuItems, profileMenuItem];

  // Cálculo do Título baseado no menu atual
  const activeItem = menuItems.find((item) => item.path === pathName);
  let title = activeItem ? activeItem.label : "Dashboard";

  const firstName = user?.nomeCompleto?.split(" ")[0] || "";
  const lastName = user?.nomeCompleto?.split(" ").slice(-1)[0] || "";
  const shortName = firstName.slice(0, 2).toUpperCase();

  return (
    <div className="relative bg-gray-50 min-h-screen">
      {/* Passamos o menu dinâmico para a Sidebar renderizar */}
      <SideBar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={menuItems}
      />

      <NavBar
        onOpen={() => setSidebarOpen(true)}
        title={title}
        firstName={firstName}
        lastName={lastName}
        shortName={shortName}
        role={user?.role}
        activeAcademicYear={activeAcademicYear}
        activeAcademicQuarter={activeAcademicQuarter}
      />

      <main className="md:ml-64 mt-16 min-h-screen p-5">{children}</main>
    </div>
  );
}
