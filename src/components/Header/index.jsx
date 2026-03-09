"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
export default function Header({
  user,
  logout,
  setDropDownMenu,
  dropDownMenu,
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
          className="sm:hidden flex transition-discrete flex-col gap-1 cursor-pointer w-6 h-6 items-center justify-center relative"
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
                  <div
                    className="p-1.75 rounded-full bg-[#0F2C59] cursor-pointer relative"
                    onClick={() => setDropDownMenu(!dropDownMenu)}
                  >
                    <span className="text-white font-bold">
                      {user.nomeCompleto
                        .split(" ")[0]
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    {dropDownMenu && (
                      <div className="absolute top-12 z-50 py-2 w-40 px-3 right-0 rounded-xl flex flex-col gap-2 shadow-[0px_0px_4px_rgba(0,0,0,0.2)] text-[13px] text-gray-700 cursor-pointer transition-all bg-[#ffffffee]">
                        <div
                          className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-200"
                          onClick={logout}
                        >
                          <FontAwesomeIcon icon={faArrowRightFromBracket} />
                          <button>Logout</button>
                        </div>
                        <Link
                          href={"/redirect"}
                          className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-200"
                        >
                          <FontAwesomeIcon icon={faChartLine} />
                          <span>Dashboard</span>
                        </Link>
                      </div>
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
