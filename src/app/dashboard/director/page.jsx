"use client";
import { useAuth } from "@/contexts/AuthContext";
export default function DashboardDirector() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Dashboard do Director</h1>
      <p>Nome: {user.nomeCompleto}</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
