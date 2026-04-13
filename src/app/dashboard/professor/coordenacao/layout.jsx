"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CoordenacaoLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isAllowed, setIsAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verifyAccess() {
      if (loading) return;

      if (!user) {
        router.replace("/auth/login");
        return;
      }

      try {
        const coordQuery = query(
          collection(db, "courseRoles"),
          where("userId", "==", user.uid),
          where("endDate", "==", null),
        );
        const coordSnapshot = await getDocs(coordQuery);

        if (coordSnapshot.empty) {
          router.replace("/dashboard/professor");
          return;
        }

        setIsAllowed(true);
      } catch (error) {
        console.error("Erro ao verificar acesso de coordenador:", error);
        router.replace("/dashboard/professor");
      } finally {
        setChecking(false);
      }
    }

    verifyAccess();
  }, [user, loading, router]);

  return <div className="max-w-7xl mx-auto p-4 md:p-6">{children}</div>;
}
