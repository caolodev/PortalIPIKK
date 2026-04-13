"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext"; // Ajustado para o teu padrão
import SideBarItem from "../SiderItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faRightFromBracket, faXmark } from "@fortawesome/free-solid-svg-icons";

// Agora recebemos menuItems como prop do DashboardLayout
const SideBar = ({ isOpen, onClose, menuItems = [] }) => {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  return (
    <>
      {/* Fundo escuro (Overlay) para mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-65 bg-[#0F2C59] flex flex-col border-r border-white/5 transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="logo" width={40} height={40} />
            <span className="text-white font-semibold text-lg">
              Portal IPIKK
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-white/70 hover:text-white"
          >
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems
            .filter((item) => item.path !== "/dashboard/profile")
            .map((item, index) => {
              // Lógica para renderizar o Separador (Ex: COORDENAÇÃO)
              if (item.type === "separator") {
                return (
                  <div key={`sep-${index}`} className="p-3 pt-6 pb-0">
                    <span className="text-xs font-medium text-slate-300 uppercase border-b border-white/10 pb-2 block">
                      {item.label}
                    </span>
                  </div>
                );
              }

              // Renderização normal do item de menu
              return (
                <SideBarItem
                  key={index}
                  label={item.label}
                  icon={item.icon}
                  path={item.path}
                  active={pathname === item.path}
                  onClick={onClose}
                />
              );
            })}
        </nav>

        <div className="px-4 py-3 border-t border-white/10">
          <div className="">
            <div className="flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200/10 text-lg font-semibold text-white">
                {user?.nomeCompleto
                  ? user.nomeCompleto.split(" ")[0].slice(0, 2).toUpperCase()
                  : user?.email
                    ? user.email.slice(0, 2).toUpperCase()
                    : "UI"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.nomeCompleto || "Usuário"}
                </p>
                <p className="text-xs text-slate-300 truncate">
                  {user?.email || "sem email"}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/profile"
            onClick={onClose}
            className={`mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              pathname === "/dashboard/profile"
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 bg-[#0f3968] text-white/80 hover:border-white/20 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
            Meu Perfil
          </Link>
        </div>

        <div className="p-3 border-t border-white/10">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
            onClick={logout}
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
            Sair do Portal
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
