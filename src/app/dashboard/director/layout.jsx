"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function DirectorLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (user.role !== "DIRECTOR") {
      router.replace("/redirect");
      return;
    }
  }, [user, loading, router]);

  return <div className="max-w-7xl mx-auto p-4 md:p-6">{children}</div>;
}