"use client";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import SideBar from "../../components/Dashboard/SideBar";
import NavBar from "../../components/Dashboard/NavBar";
import { useEffect, useState } from "react";
import { dashboardMenu } from "../config/menu";
import PageTransition from "../../components/PageTransition";
export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathName = usePathname();
  const { user, loading } = useAuth();
  const roleURL = pathName.split("/")[2];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (roleURL !== user.role.toLowerCase() && roleURL !== "profile") {
      router.replace(`/dashboard/${user.role.toLowerCase()}`);
    }
  }, [router, user, roleURL, loading]);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-screen w-screen">
          <div className="animate-spin h-10 w-10 border-4 border-[#0F2C59] border-t-transparent rounded-full"></div>
        </div>
      </PageTransition>
    );
  }
  if (!user) return null;
  const role = user.role;
  const firstName = user.nomeCompleto.split(" ")[0];
  const lastName = user.nomeCompleto.split(" ").slice(-1)[0];
  const shortName = firstName.slice(0, 2).toUpperCase();
  const menu = user.role ? dashboardMenu[user.role.toLowerCase()] : [];
  const activeItem = menu?.find((item) => item.path === pathName);
  const title =
    pathName === "/dashboard/profile"
      ? " Meu Perfil"
      : activeItem?.label || "Dashboard";

  return (
    <div className="relative">
      <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <NavBar
        onOpen={() => setSidebarOpen(true)}
        title={title}
        firstName={firstName}
        lastName={lastName}
        shortName={shortName}
        role={role}
      />
      <main className="md:ml-65 mt-16 min-h-screen p-5">{children}</main>
    </div>
  );
}
