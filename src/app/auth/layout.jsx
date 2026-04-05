"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({ children }) {
  const pathName = usePathname();
  const exceptUrl = pathName.split("/")[2];
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && user && exceptUrl !== "forget") {
      router.replace("/redirect");
    }
  }, [user, loading, router, exceptUrl]);
  return (
    <div className="p-3 bg-[#F9FAFB] min-h-screen">
      <div className="flex items-center gap-2 text-sm font-bold text-[#0F2C59] transition-all w-full max-w-115 my-5 mx-auto">
        <FontAwesomeIcon icon={faArrowLeft} />
        <Link href={"/"} className="hover:underline">
          Voltar ao Início
        </Link>
      </div>
      {children}
    </div>
  );
}
