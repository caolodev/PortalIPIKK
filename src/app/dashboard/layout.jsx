"use client";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathName = usePathname();
  const { user, loading } = useAuth();
  const roleURL = pathName.split("/").slice(-1)[0];

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (roleURL !== user.role.toLowerCase()) {
      router.replace(`/dashboard/${user.role.toLowerCase()}`);
    }
  }, [router, user, roleURL, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-[#0F2C59] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  if (!user) return null;
  return <div>{children}</div>;
}
