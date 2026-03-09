"use client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sobre from "../components/Sobre";
import Funcionalidades from "../components/Funcionalidades";
import Review from "../components/Review";
import Footer from "../components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import PageTransition from "../components/PageTransition";
export default function Home() {
  const { user, logout } = useAuth();
  const [dropDownMenu, setDropDownMenu] = useState(false);
  return (
    <PageTransition>
      <div
        className="relative min-h-screen"
        onClick={() => {
          if (dropDownMenu) setDropDownMenu(!dropDownMenu);
        }}
      >
        <Header
          user={user}
          logout={logout}
          dropDownMenu={dropDownMenu}
          setDropDownMenu={setDropDownMenu}
        />
        <main className="mt-14.5 w-full">
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
