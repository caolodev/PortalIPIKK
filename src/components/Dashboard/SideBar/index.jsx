"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { dashboardMenu } from "../../../app/config/menu";
import { useAuth } from "@/contexts/AuthContext";
import SideBarItem from "../SiderItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faXmark } from "@fortawesome/free-solid-svg-icons";

const SideBar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const menu = user?.role ? dashboardMenu[user.role.toLowerCase()] : [];
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
        className={`fixed top-0 left-0 h-screen w-[260px] bg-[#0F2C59] flex flex-col border-r border-white/5 transition-transform duration-300 ease-in-out z-50 ${
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
          {/* Botão X para fechar dentro do menu (Mobile) */}
          <button
            onClick={onClose}
            className="md:hidden text-white/70 hover:text-white"
          >
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {menu.map(({ label, path, icon }, index) => (
            <SideBarItem
              key={index}
              label={label}
              icon={icon}
              path={path}
              active={pathname === path}
              onClick={onClose}
            />
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-red-500/10 hover:text-red-400 transition"
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
