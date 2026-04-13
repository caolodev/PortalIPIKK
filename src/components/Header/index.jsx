"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import UserMenu from "../Dashboard/UserMenu";

export default function Header({
  user,
  items,
  isOpen,
  setIsOpen,
  menuRef,
  shortName,
  firstName,
  lastName,
  role,
}) {
  const [mobile, setMobile] = useState(false);
  return (
    <header className="fixed top-0 w-screen z-50 border-gray-200 border bg-white">
      <div
        className={
          mobile
            ? "flex mx-auto w-[95%] max-w-7xl justify-between items-center h-fit py-1 flex-wrap"
            : "flex mx-auto w-[95%] max-w-7xl justify-between items-center h-14.5 py-1"
        }
      >
        <Link href={"/"} className="flex gap-2 items-center">
          <div className="image">
            <Image
              width={50}
              height={50}
              alt="Logotipo Institucional"
              src={"/logo.png"}
            />
          </div>
          <div className="flex flex-col leading-2 justify-center">
            <p className="text-lg font-bold text-[#0F2C59]">IPIKK - NV</p>
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              Portal IPIKK
            </span>
          </div>
        </Link>
        <div
          className="sm:hidden flex transition-discrete flex-col gap-1  w-6 h-6 items-center justify-center relative"
          style={{ gap: mobile && "0" }}
          onClick={() => setMobile(!mobile)}
        >
          <span
            className={
              mobile
                ? "bg-[#0F2C59] w-6 h-0.5 rotate-45 transition-all absolute"
                : "bg-[#0F2C59] w-6 h-0.5 tracking-normal transition-all"
            }
          ></span>
          <span
            className={
              mobile
                ? "w-0"
                : "bg-[#0F2C59] w-6 h-0.5 tracking-normal transition-all"
            }
          ></span>
          <span
            className={
              mobile
                ? "bg-[#0F2C59] w-6 h-0.5 -rotate-45 transition-all"
                : "bg-[#0F2C59] w-6 h-0.5 tracking-normal transition-all"
            }
          ></span>
        </div>
        <nav
          className={
            mobile
              ? "gap-5 w-full py-5 px-2 flex flex-col"
              : "items-center justify-between gap-10 hidden sm:flex"
          }
        >
          <ul
            className={
              mobile ? "flex flex-col gap-2 py-2" : "flex items-center gap-5"
            }
          >
            <Link href={"/"} className="links">
              Início
            </Link>
            <Link href={"/#sobre"} className="links">
              Sobre
            </Link>
            <Link href={"/#sistema"} className="links">
              Funcionalidades
            </Link>
          </ul>
          <span
            className={
              mobile ? "h-px w-full bg-gray-200" : "h-8 w-px bg-gray-200"
            }
          ></span>
          <div
            className={
              mobile
                ? "flex gap-10 items-center w-full justify-center"
                : "flex gap-5 items-center"
            }
          >
            {user ? (
              <>
                {mobile ? (
                  <>
                    <p className="text-sm font-medium text-gray-500">
                      Bem Vindo,{" "}
                      <span className="text-[#0F2C59] font-bold">
                        {user.nomeCompleto.split(" ")[0]}
                      </span>
                    </p>
                    <Link
                      href={"/redirect"}
                      className="text-sm transition-colors py-2 bg-[#0F2C59] hover:bg-[#0F2C59]/90 rounded-full px-6 font-bold shadow-lg shadow-blue-900/10 text-white"
                    >
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <div className="relative" ref={menuRef}>
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0F2C59]  hover:shadow-md transition-all active:scale-95"
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      <span className="text-white font-bold text-sm">
                        {shortName}
                      </span>
                    </div>
                    {isOpen && (
                      <UserMenu
                        firstName={firstName}
                        lastName={lastName}
                        role={role}
                        items={items}
                      />
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <Link
                  href={"/auth/login"}
                  className="text-sm transition-colors font-bold text-gray-600 hover:text-[#0F2C59]"
                >
                  Login
                </Link>
                <Link
                  href={"/auth/signup"}
                  className="text-sm transition-colors py-2 bg-[#0F2C59] hover:bg-[#0F2C59]/90 rounded-full px-6 font-bold shadow-lg shadow-blue-900/10 text-white"
                >
                  Criar Conta
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
