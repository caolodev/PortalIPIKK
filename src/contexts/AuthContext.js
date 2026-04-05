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
          }
        }
      } catch (error) {
        console.error("Falha ao verificar estado de autenticação", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  async function signup({ firstName, lastName, email, password, process }) {
    const preUserRef = doc(db, "preUsers", process);
    const preUserSnap = await getDoc(preUserRef);

    if (!preUserSnap.exists()) {
      throw new Error("Processo não encontrado. Verifique o número.");
    }

    const dados = preUserSnap.data();
    const partes = dados.nomeCompleto.split(" ");
    const firstNameDB = partes[0].toLowerCase();
    const lastNameDB = partes.slice(-1)[0].toLowerCase();

    if (
      firstNameDB !== firstName.toLowerCase() ||
      lastNameDB !== lastName.toLowerCase()
    ) {
      throw new Error("Nomes não correspondem ao processo.");
    }

    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        throw new Error("Este email já está em uso.");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Email inválido.");
      } else if (error.code === "auth/weak-password") {
        throw new Error("Senha muito fraca. Use pelo menos 6 caracteres.");
      } else {
        throw new Error("Erro ao criar conta. Tente novamente.");
      }
    }

    // await sendEmailVerification(userCredential.user);
    await setDoc(doc(db, "Users", userCredential.user.uid), {
      nomeCompleto: dados.nomeCompleto,
      processo: process,
      role: dados.role,
      email,
      cargos: dados.role === "PROFESSOR" ? [] : null,
      status: true,
      turmaId: dados.turma || null,
      cursoId: dados.curso || null,
      createdAt: new Date(),
    });
    await signOut(auth);
    setUser(null);
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
