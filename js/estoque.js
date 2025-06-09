import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDF8g3RscUZG0Xm5ADTa5nrVFRtxCvVdRM",
  authDomain: "comeca-camargo.firebaseapp.com",
  projectId: "comeca-camargo",
  storageBucket: "comeca-camargo.firebasestorage.app",
  messagingSenderId: "577328802152",
  appId: "1:577328802152:web:ebf8bd6644952cacaf4edd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const formCadastro = document.getElementById("form-cadastro");
const inputNome = document.getElementById("nome-item");
const inputQuantidade = document.getElementById("quantidade-item");
const inputRefeicao = document.getElementById("refeicao-item");

const userEmailElement = document.getElementById("user-email-nav");
const logoutBtn = document.getElementById("logout-btn");

onAuthStateChanged(auth, (user) => {
  if (user) {
    userEmailElement.textContent = user.displayName || user.email || "Usuário";
  } else {
    alert("Você precisa estar logado para cadastrar produtos.");
    window.location.href = "login.html";
  }
});

formCadastro.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = inputNome.value.trim();
  const quantidade = Number(inputQuantidade.value);
  const refeicao = inputRefeicao.value;

  if (!nome) {
    alert("Informe o nome do item.");
    return;
  }

  if (quantidade < 0) {
    alert("Quantidade não pode ser negativa.");
    return;
  }

  if (!refeicao) {
    alert("Selecione a refeição.");
    return;
  }

  try {
    await addDoc(collection(db, "itens"), {
      nome,
      quantidade,
      refeicao,
    });

    alert("Item cadastrado com sucesso!");
    formCadastro.reset();
  } catch (error) {
    alert("Erro ao cadastrar item: " + error.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
