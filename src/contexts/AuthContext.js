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
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      if (!firebaseUser.emailVerified) {
        await signOut(auth);
        setUser(null);
        setLoading(false);
        return;
      }

      const userRef = doc(db, "Users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await signOut(auth);
        setUser(null);
        setLoading(false);
        return;
      }
      setUser({
        uid: firebaseUser.uid,
        ...userSnap.data(),
      });
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function signup({ firstName, lastName, email, password, process }) {
    const preUserRef = doc(db, "preUsers", process);
    const preUserSnap = await getDoc(preUserRef);

    if (!preUserSnap.exists()) {
      throw new Error("Este processo não existe");
    }

    const dados = preUserSnap.data();
    const partes = dados.nomeCompleto.split(" ");
    const firstNameDB = partes[0].toLowerCase();
    const lastNameDB = partes.slice(-1)[0].toLowerCase();

    if (
      firstNameDB !== firstName.toLowerCase() ||
      lastNameDB !== lastName.toLowerCase()
    ) {
      throw new Error("Nomes não coincidem com o processo");
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    await sendEmailVerification(userCredential.user);
    await setDoc(doc(db, "Users", userCredential.user.uid), {
      nomeCompleto: dados.nomeCompleto,
      processo: process,
      role: dados.role,
      email,
      cargos: dados.role === "PROFESSOR" ? [] : null,
      ativo: true,
      createdAt: new Date(),
    });

    await signOut(auth);
  }

  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    if (!userCredential.user.emailVerified) {
      await signOut(auth);
      throw new Error("Verifique o seu email antes de logar");
    }
    const userRef = doc(db, "Users", userCredential.user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await signOut(auth);
      throw new Error("Conta não encontrada");
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
    await sendPasswordResetEmail(auth, email);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      await signOut(auth);
      throw new Error("Conta Google não autorizada");
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
  return useContext(AuthContext);\
}
