"use client";
import { useAuth } from "@/contexts/AuthContext";
import UnderDevelopment from "@/components/UnderDevelopment";

export default function DashboardProfessorEmDesenvolvimento() {
  const { user } = useAuth();

  return (
    <UnderDevelopment
      title="Dashboard do Professor em desenvolvimento"
      description={`Oi ${user?.nomeCompleto?.split(" ")[0] || "Professor"}, esta área ainda está a ser construída. Agradecemos a paciência enquanto continuamos a desenvolver este painel.`}
    />
  );
}
