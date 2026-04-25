"use client";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "../../../components/PageHeader";
import { useEffect, useState } from "react";
export default function DashboardDirector() {
  const { user, logout } = useAuth();
  return (
    <>
      <PageHeader title={"Dashboard do Aluno"} />
    </>
  );
}
