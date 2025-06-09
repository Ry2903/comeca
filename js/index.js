import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  onSnapshot,
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

const itensLista = document.getElementById('itens-lista');
const controleEstoque = document.getElementById('controle-estoque');
const userEmailNav = document.getElementById('user-email-nav');
const logoutBtn = document.getElementById('logout-btn');

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  userEmailNav.textContent = user.email;
  controleEstoque.style.display = 'block';

  carregarItens();
});

logoutBtn.addEventListener('click', () => {
  signOut(auth);
});

function carregarItens() {
  const itensRef = collection(db, 'itens');
  onSnapshot(itensRef, (snapshot) => {
    itensLista.innerHTML = '';
    if (snapshot.empty) {
      itensLista.textContent = 'Nenhum item cadastrado.';
      return;
    }
    snapshot.forEach(docSnap => {
      const item = docSnap.data();
      const li = document.createElement('li');
      li.textContent = `${item.nome} — Estoque: ${item.quantidade || 0}`;
      itensLista.appendChild(li);
    });
  });
}