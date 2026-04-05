"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Image from "next/image";
import FooterForm from "../../../components/FooterForm";
import HeaderForm from "../../../components/HeaderForm";
import HeadAuth from "../../../components/HeadAuth";
import ButtonSubmit from "../../../components/ButtonSubmit";
import PageTransition from "../../../components/PageTransition";
export default function Login() {
  const [showPassword, setShowPassword] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const role = await login(email, password);
      toast.success("Login realizado com sucesso");
      setTimeout(() => {
        router.replace(`/dashboard/${role.toLowerCase()}`);
      }, 1500);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setSubmitting(true);
      await loginWithGoogle();
      router.replace("/redirect");
    } catch (err) {
      toast.error(err.message);
      setSubmitting(false);
    }
  }
  return (
    <PageTransition>
      <div className="max-w-115 w-full mx-auto">
        <HeadAuth title={"Portal IPIKK"} description={"Excelência Académica"} />
        <div className="rounded-2xl shadow-4xl shadow-gray-400 bg-white shadow-md">
          <HeaderForm
            title={"Entrar no Portal"}
            description={"Aceda ao Portal académico do IPIKK"}
          />
          <div className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="label">
                  Email
                </label>
                <div className="relative group">
                  <FontAwesomeIcon icon={faEnvelope} className="icon" />
                  <input
                    className="inputs"
                    required
                    type="email"
                    placeholder="edson@caolo.com"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label htmlFor="password" className="label">
                    Senha:
                  </label>
                </div>
                <div className="group relative">
                  <FontAwesomeIcon icon={faLock} className="icon" />
                  <input
                    required
                    type={showPassword ? "password" : "text"}
                    id="password"
                    className="inputs"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div
                    className="icon-right cursor-pointer"
                    onClick={(e) => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FontAwesomeIcon
                        icon={faEyeSlash}
                        className="w-4.5 h-4.5"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faEye}
                        className="w-4.5 h-4.5"
                      />
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Link
                    href={"/auth/forget/"}
                    className="text-xs font-bold text-[#0F2C59] hover:underline transition-colors"
                  >
                    esqueceu a senha ?
                  </Link>
                </div>
              </div>
              <ButtonSubmit title={"Entrar"} submitting={submitting} />
              {/*<div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] items-center">
                <span className="bg-white px-4 text-gray-300">
                  ou entrar com
                </span>
              </div>
            </form>
            <button onClick={handleGoogleLogin} className="google-button">
              <Image
                src={"/google.png"}
                alt="google sign in"
                width={30}
                height={30}
              />
              <span>Entrar com Google</span>
            </button>*/}
            </form>
            <FooterForm
              link={"/auth/signup"}
              question={"Não Tem Conta? "}
              linkText={"Criar Conta"}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
