import { db } from "./../lib/firebase";
import {
  getDocs,
  collection,
  addDoc,
  updateDoc,
  getDoc, 
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

const anoLectivoRef = collection(db, "anoLectivo");

export async function createAnoLectivo(data) {
  // Validações
  const { nome, dataInicio, dataFim } = data;

  // Verificar formato do nome: YYYY/YYYY
  const nomeRegex = /^\d{4}\/\d{4}$/;
  if (!nomeRegex.test(nome)) {
    throw new Error("O nome deve estar no formato YYYY/YYYY (ex: 2025/2026).");
  }

  const [anoInicioNome, anoFimNome] = nome.split("/").map(Number);

  // Verificar se o ano de fim é exatamente anoInicio + 1
  if (anoFimNome !== anoInicioNome + 1) {
    throw new Error("O ano final deve ser exatamente o ano inicial + 1.");
  }

  // Verificar se já existe um ano letivo com o mesmo nome
  const q = query(anoLectivoRef, where("nome", "==", nome));
  const existingDocs = await getDocs(q);
  if (!existingDocs.empty) {
    throw new Error("Já existe um ano letivo com este nome.");
  }

  // Converter datas
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);

  // Verificar se datas são válidas
  if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
    throw new Error("Datas inválidas.");
  }

  // Data início < data fim
  if (inicio >= fim) {
    throw new Error("A data de início deve ser anterior à data de fim.");
  }

  // Data início no ano do primeiro valor do nome
  if (inicio.getFullYear() !== anoInicioNome) {
    throw new Error(`A data de início deve estar no ano ${anoInicioNome}.`);
  }

  // Data fim no ano do último valor do nome
  if (fim.getFullYear() !== anoFimNome) {
    throw new Error(`A data de fim deve estar no ano ${anoFimNome}.`);
  }

  // Data início não no passado (opcional, para credibilidade)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (inicio < hoje) {
    throw new Error("A data de início não pode ser no passado.");
  }

  // Adicionar ao Firestore
  try {
    const docRef = await addDoc(anoLectivoRef, {
      nome: data.nome,
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
      createdAt: serverTimestamp(),
      isActive: false,
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Erro ao criar o ano lectivo", error);
    throw new Error("Erro interno ao salvar o ano letivo.");
  }
}

export async function getAnoLectivo() {
  try {
    const snapShot = await getDocs(anoLectivoRef);
    const data = snapShot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao buscar o ano lectivo", error);
    return { success: false, error: error.message };
  }
}

export async function getActiveAnoLectivo() {
  try {
    const q = query(anoLectivoRef, where("isActive", "==", true));
    const snapShot = await getDocs(q);
    if (snapShot.empty) {
      return { success: true, data: null };
    }
    const activeAnoLectivo = snapShot.docs[0];
    return {
      success: true,
      data: { id: activeAnoLectivo.id, ...activeAnoLectivo.data() },
    };
  } catch (error) {
    console.error("Erro ao buscar o ano lectivo activo", error);
    return { success: false, error: error.message };
  }
}

export async function activateAnoLectivo(id) {
  try {
    const q = query(anoLectivoRef, where("isActive", "==", true));
    const snapShot = await getDocs(q);
    const deactivatePromises = snapShot.docs.map((docCurrent) =>
      updateDoc(doc(db, "anoLectivo", docCurrent.id), { isActive: false }),
    );
    await Promise.all(deactivatePromises);
    const docRef = doc(db, "anoLectivo", id);
    const docSnap = await getDoc(docRef);
    const currentStatus = docSnap.data().isActive;
    await updateDoc(doc(db, "anoLectivo", id), { isActive: !currentStatus });
    return { success: true };
  } catch (error) {
    console.error("Erro ao activar o ano lectivo", error);
    return { success: false, error: error.message };
  }
}

export async function updateAnoLectivo(id, data) {
  try {
    await updateDoc(doc(db, "anoLectivo", id), {
      nome: data.nome,
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao actualizar o ano lectivo", error);
    return { success: false, error: error.message };
  }
}

export async function deactivateAnoLectivo(id) {
  try {
    await updateDoc(doc(db, "anoLectivo", id), { isActive: false });
  } catch (error) {
    console.error("Erro ao desativar o ano lectivo", error);
    return { success: false, error: error.message };
  }
}
