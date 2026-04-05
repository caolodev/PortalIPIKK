"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectPage() {
  const { loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    router.replace(`/dashboard/${user.role.toLowerCase()}`);
  }, [loading, user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin h-10 w-10 border-4 border-[#0F2C59] border-t-transparent rounded-full mx-auto"></div>
        <p className="font-medium text-gray-500">
          A preparar o seu painel...
        </p>
      </div>
    </div>
  );
}