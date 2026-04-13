"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import HeadAuth from "../../../components/HeadAuth";
import HeaderForm from "../../../components/HeaderForm";
import FooterForm from "../../../components/FooterForm";
import ButtonSubmit from "../../../components/ButtonSubmit";
import PageTransition from "../../../components/PageTransition";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
  faFingerprint,
} from "@fortawesome/free-solid-svg-icons";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [process, setProcess] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showCheckPassword, setCheckShowPassword] = useState(true);
  const [showPassword, setShowPassword] = useState(true);
  const [checkPassword, setCheckPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { signup } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (checkPassword !== password) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (
      firstName.trim() === "" ||
      lastName.trim() === "" ||
      process.trim() === ""
    ) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      setSubmitting(true);
      await signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        process: process.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      toast.success("Conta criada com sucesso!");
      setSubmitting(false);
      setTimeout(() => {
        router.replace("/auth/login");
      }, 2000);
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <PageTransition>
      <div className="max-w-140 w-full mx-auto">
        <HeadAuth title={"Criar Conta"} description={"Acesso Institucional"} />
        <div className="rounded-2xl shadow-4xl shadow-gray-400 bg-white shadow-md">
          <HeaderForm
            title={"Registo Académico"}
            description={"Acesse o Portal Académico do IPIKK"}
          />
          <div className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="label">
                    Primeiro Nome:
                  </label>
                  <div className="relative group">
                    <FontAwesomeIcon icon={faUser} className="icon" />
                    <input
                      required
                      type="text"
                      placeholder="Edson"
                      id="firstName"
                      className="inputs"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="label">
                    Último Nome:
                  </label>
                  <div className="relative group">
                    <FontAwesomeIcon icon={faUser} className="icon" />
                    <input
                      required
                      type="text"
                      placeholder="Caolo"
                      id="lastName"
                      className="inputs"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="process" className="label">
                  Processo:
                </label>
                <div className="relative group">
                  <FontAwesomeIcon icon={faFingerprint} className="icon" />
                  <input
                    required
                    type="text"
                    placeholder="XXXX"
                    className="inputs"
                    id="process"
                    value={process}
                    onChange={(e) => setProcess(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="label">
                  Email:
                </label>
                <div className="relative group">
                  <FontAwesomeIcon icon={faEnvelope} className="icon" />
                  <input
                    required
                    type="email"
                    placeholder="edson@caolo.com"
                    id="email"
                    className="inputs"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="password" className="label">
                    Senha:
                  </label>
                  <div className="group relative">
                    <FontAwesomeIcon icon={faLock} className="icon" />
                    <input
                      required
                      type={showPassword ? "password" : "text"}
                      className="inputs"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div
                      className="icon-right "
                      onClick={(e) => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FontAwesomeIcon
                          icon={faEyeSlash}
                          className="w-4.5 h-4.5"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faEye} className="w-4.5 h-4.5" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="checkPassword" className="label">
                    Verificar Senha:
                  </label>
                  <div className="relative group">
                    <FontAwesomeIcon icon={faLock} className="icon" />
                    <input
                      value={checkPassword}
                      onChange={(e) => setCheckPassword(e.target.value)}
                      required
                      type={showCheckPassword ? "password" : "text"}
                      id="checkPassword"
                      className="inputs"
                    />
                    <div
                      className="icon-right "
                      onClick={(e) => setCheckShowPassword(!showCheckPassword)}
                    >
                      {showCheckPassword ? (
                        <FontAwesomeIcon
                          icon={faEyeSlash}
                          className="w-4.5 h-4.5"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faEye} className="w-4.5 h-4.5" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <ButtonSubmit title={"Criar Conta"} submitting={submitting} />
            </form>
            <FooterForm
              link={"/auth/login"}
              question={"Já tem uma conta? "}
              linkText={"Iniciar Sessão"}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
