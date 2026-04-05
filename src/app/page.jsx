"use client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sobre from "../components/Sobre";
import Funcionalidades from "../components/Funcionalidades";
import Review from "../components/Review";
import Footer from "../components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import PageTransition from "../components/PageTransition";
import {
  faLayerGroup,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  const { user, logout } = useAuth();
  const [dropDownMenu, setDropDownMenu] = useState(false);
  const menuRef = useRef(null);

  // Fecha o menu automaticamente ao clicar em qualquer lugar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDropDownMenu(false);
      }
    };

    if (dropDownMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropDownMenu]);

  // Prepara os dados do utilizador e itens do menu com ícones
  const firstName = user?.nomeCompleto?.split(" ")[0] || "";
  const lastName = user?.nomeCompleto?.split(" ").slice(-1)[0] || "";
  const shortName = firstName?.slice(0, 2).toUpperCase() || "";

  const homeMenuItems = [
    {
      label: "Dashboard",
      icon: faLayerGroup,
      path: user ? `/dashboard/${user.role.toLowerCase()}` : "#",
    },
    {
      label: "Sair",
      icon: faRightFromBracket,
      onClick: logout,
      variant: "danger",
    },
  ];

  return (
    <PageTransition>
      <div className="relative min-h-screen">
        <Header
          user={user}
          items={homeMenuItems}
          isOpen={dropDownMenu}
          setIsOpen={setDropDownMenu}
          menuRef={menuRef}
          shortName={shortName}
          firstName={firstName}
          lastName={lastName}
          role={user?.role}
        />
        <main className="mt-14.5 w-full bg-white">
          <Hero user={user} />
          <Sobre />
          <Funcionalidades />
          <Review />
          <Footer />
        </main>
      </div>
    </PageTransition>
  );
}
