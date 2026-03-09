"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { useAuth } from "@/contexts/AuthContext";
import HeadAuth from "../../../components/HeadAuth";
import HeaderForm from "../../../components/HeaderForm";
import FooterForm from "../../../components/FooterForm";
import ButtonSubmit from "../../../components/ButtonSubmit";
import PageTransition from "../../../components/PageTransition";
import toast from "react-hot-toast";
export default function ForgetPassword() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      await resetPassword(email);
      toast.success("Email de redefinição de senha enviado com sucesso");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <PageTransition>
      <div className="max-w-100 w-full mx-auto">
        <HeadAuth title={"Recuperar senha"} description={"Portal Ipikk"} />
        <div className="rounded-2xl shadow-4xl shadow-blue-900/5 bg-white">
          <HeaderForm
            title={"Recuperar Senha"}
            description={
              "Introduza o seu email e enviaremos um Link de redefinição"
            }
          />
          <div className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="label">
                  Email:{" "}
                </label>
                <div className="group relative">
                  <FontAwesomeIcon icon={faEnvelope} className="icon" />
                  <input
                    className="inputs"
                    type="email"
                    placeholder="edson@caolo.dev"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <ButtonSubmit title={"Enviar"} submitting={submitting} />
            </form>
            <FooterForm link={"/auth/login"} linkText={"Iniciar Sessão"} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
