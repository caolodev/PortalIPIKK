"use client";
{
  /*
 Responsabilidades:
 Manter Globalmente o usuário autenticado.
 Manter estado de Loading
 Buscar dados de Loading depois do login
 Export funções como: signup,login,resetPassword
 */
}
import { auth, db } from "@/lib/firebase";
import {
  getDoc,
  setDoc,
  doc,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser /*&& firebaseUser.emailVerified */) {
          const userRef = doc(db, "Users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUser({
              uid: firebaseUser.uid,
              ...userSnap.data(),
            });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Falha ao verificar estado de autenticação", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  async function signup({ firstName, lastName, email, password, process }) {
    const usersRef = collection(db, "Users");
    const preUserRef = doc(db, "preUsers", process);
    const preUserSnap = await getDoc(preUserRef);

    // 1. Validação Básica do preUser
    if (!preUserSnap.exists()) throw new Error("Processo não encontrado.");
    const dados = preUserSnap.data();

    // 2. Validação de Nome
    const partes = dados.nomeCompleto.split(" ");
    if (
      partes[0].toLowerCase() !== firstName.toLowerCase() ||
      partes.slice(-1)[0].toLowerCase() !== lastName.toLowerCase()
    ) {
      throw new Error("Nomes não correspondem ao processo.");
    }

    // 3. Validação de Unicidade (Email, Nome, Processo) antes de criar Auth
    // (Otimize fazendo estas checagens em paralelo se desejar)
    const qEmail = query(usersRef, where("email", "==", email));
    const qProcess = query(usersRef, where("processo", "==", process));
    const [emailSnap, processSnap] = await Promise.all([
      getDocs(qEmail),
      getDocs(qProcess),
    ]);

    if (!emailSnap.empty) throw new Error("Este email já está em uso.");
    if (!processSnap.empty) throw new Error("Este processo já está em uso.");

    // --- BLOCO CRÍTICO: VALIDAÇÃO DE TURMA E IDs (ANTES DO AUTH) ---
    let cursoIdReal = null;
    let turmaIdReal = null;
    let anoLectivoIdReal = null;
    let classeReal = null;

    if (dados.cursoRef) {
      const qCurso = query(
        collection(db, "courses"),
        where("code", "==", dados.cursoRef),
      );
      const cursoSnap = await getDocs(qCurso);
      if (cursoSnap.empty)
        throw new Error("Erro ao identificar CursoID: Curso não encontrado.");
      cursoIdReal = cursoSnap.docs[0].id;
    }

    if (dados.role === "ALUNO") {
      const turmaString = dados.turmaInicial; // Ex: "2025-2026_INF10BT"
      if (!turmaString)
        throw new Error(
          "Erro ao identificar TurmaID: Turma não atribuída no pré-registo.",
        );

      const [anoNomePre, nomeBasePre] = turmaString.split("_");
      // A) Buscar o ID do Ano pelo Nome
      const qAno = query(
        collection(db, "academicYears"),
        where("name", "==", anoNomePre),
      );
      const anoSnap = await getDocs(qAno);
      if (anoSnap.empty)
        throw new Error(`Erro ao identificar TurmaID: Ano lectivo Incorreto.`);
      anoLectivoIdReal = anoSnap.docs[0].id;

      // B) Buscar o Template para pegar a classe e o ID do template
      const qTemp = query(
        collection(db, "classTemplates"),
        where("nomeBase", "==", nomeBasePre),
      );
      const tempSnap = await getDocs(qTemp);
      if (tempSnap.empty)
        throw new Error(
          `Erro ao identificar TurmaID: A estrutura da turma Incorrecta.`,
        );
      const templateId = tempSnap.docs[0].id;
      classeReal = tempSnap.docs[0].data().classe;

      // C) Buscar a Instância da Turma (class) Ativa
      const qTurma = query(
        collection(db, "class"),
        where("templateId", "==", templateId),
        where("anoLectivoId", "==", anoLectivoIdReal),
        where("isDeleted", "==", false), // TRAVA: Se for true, não cria conta
      );
      const turmaSnap = await getDocs(qTurma);

      if (turmaSnap.empty) {
        throw new Error(
          "Esta turma não está disponível ou foi desativada para o ano lectivo atual.",
        );
      }

      turmaIdReal = turmaSnap.docs[0].id;
    }

    // --- FIM DAS VALIDAÇÕES: SE CHEGOU AQUI, PODEMOS CRIAR A CONTA ---

    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
    } catch (error) {
      const errorMap = {
        "auth/email-already-in-use": "Este email já está em uso.",
        "auth/weak-password": "Senha muito fraca.",
      };
      throw new Error(errorMap[error.code] || "Erro ao criar credenciais.");
    }

    const userUid = userCredential.user.uid;

    // 4. Salvar Usuário
    await setDoc(doc(db, "Users", userUid), {
      nomeCompleto: dados.nomeCompleto,
      processo: process,
      email,
      role: dados.role,
      status: true,
      isDeleted: false,
      cursoId: dados.cursoRef || null,
      createdAt: new Date(),
    });

    // 5. Salvar Matrícula (Já temos os IDs validados acima)
    if (dados.role === "ALUNO") {
      await setDoc(doc(db, "studentsRecords", userUid), {
        userId: userUid,
        processo: process,
        turmaId: turmaIdReal, // Agora é o ID Real (kenokhQm...)
        anoLectivoId: anoLectivoIdReal,
        cursoId: cursoIdReal,
        classe: classeReal,
        estadoFinal: null,
        createdAt: new Date(),
      });
    }
    await logout(); // Força o logout para evitar problemas de estado
    return true;
  }

  async function login(email, password) {
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        throw new Error("Usuário não encontrado.");
      } else if (error.code === "auth/wrong-password") {
        throw new Error("Senha incorreta.");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Email inválido.");
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("Muitas tentativas. Tente novamente mais tarde.");
      } else if (error.code === "auth/invalid-credential") {
        throw new Error("Credenciais inválidas.");
      } else {
        throw new Error("Erro ao fazer login. Tente novamente.");
      }
    }

    /*
    if (!userCredential.user.emailVerified) {
      await signOut(auth);
      throw new Error("Verifique o seu email antes de Entrar");
    }*/
    const userRef = doc(db, "Users", userCredential.user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await signOut(auth);
      throw new Error("Conta não encontrada. Verifique email e senha.");
    }
    const userData = userSnap.data();
    setUser({
      uid: userCredential.user.uid,
      ...userData,
    });
    return userData.role;
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        throw new Error("Usuário não encontrado.");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Email inválido.");
      } else {
        throw new Error(
          "Erro ao enviar email de redefinição. Tente novamente.",
        );
      }
    }
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    let result;
    try {
      result = await signInWithPopup(auth, provider);
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Login cancelado pelo usuário.");
      } else if (error.code === "auth/popup-blocked") {
        throw new Error("Popup bloqueado. Permita popups para este site.");
      } else {
        throw new Error("Erro ao fazer login com Google. Tente novamente.");
      }
    }
    const email = result.user.email;
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      await signOut(auth);
      throw new Error("Conta Google não autorizada. Contate o administrador.");
    }
    return result;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        resetPassword,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}