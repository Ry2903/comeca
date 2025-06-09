import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  startAt,
  getDocs
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

const userEmailNav = document.getElementById('user-email-nav');
const logoutBtn = document.getElementById('logout-btn');
const movimentacoesTbody = document.getElementById('movimentacoes-tbody');
const btnAnterior = document.getElementById('btn-anterior');
const btnProximo = document.getElementById('btn-proximo');
const btnExportarPdf = document.getElementById('btn-exportar-pdf');

logoutBtn.addEventListener('click', () => {
  signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    userEmailNav.textContent = user.displayName || user.email;
    carregarPagina(); // carrega a primeira página
  } else {
    window.location.href = 'login.html';
  }
});

const pageSize = 10;
let ultimoDoc = null;
let primeiroDoc = null;
let pilhaPaginas = [];

async function carregarPagina(direcao = "inicio") {
  movimentacoesTbody.innerHTML = "";

  const movRef = collection(db, 'movimentacoes');
  let q;

  if (direcao === "inicio") {
    q = query(movRef, orderBy("data", "desc"), limit(pageSize));
  } else if (direcao === "proximo" && ultimoDoc) {
    q = query(movRef, orderBy("data", "desc"), startAfter(ultimoDoc), limit(pageSize));
  } else if (direcao === "anterior" && pilhaPaginas.length > 1) {
    const penultimo = pilhaPaginas[pilhaPaginas.length - 2];
    q = query(movRef, orderBy("data", "desc"), startAt(penultimo), limit(pageSize));
    pilhaPaginas.pop(); // volta uma página
  } else {
    return;
  }

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    movimentacoesTbody.innerHTML = '<tr><td colspan="4">Nenhuma movimentação registrada.</td></tr>';
    return;
  }

  primeiroDoc = snapshot.docs[0];
  ultimoDoc = snapshot.docs[snapshot.docs.length - 1];
  if (direcao !== "anterior") pilhaPaginas.push(primeiroDoc);

  snapshot.forEach(docSnap => {
    const mov = docSnap.data();
    const tr = document.createElement('tr');

    const dataFormatada = mov.data?.toDate().toLocaleString('pt-BR') || 'Sem data';
    let tipoFormatado = '';
    let tipoClasse = '';
    let tipoIcone = '';

    if (mov.tipo === 'entrada') {
      tipoFormatado = 'Entrada';
      tipoClasse = 'badge badge-entrada';
      tipoIcone = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="#155724" viewBox="0 0 24 24" width="16" height="16" style="vertical-align: middle; margin-right: 5px;">
          <path d="M12 2L5 9h4v7h6V9h4l-7-7z"/>
        </svg>`;
    } else if (mov.tipo === 'saida') {
      tipoFormatado = 'Saída';
      tipoClasse = 'badge badge-saida';
      tipoIcone = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="#721c24" viewBox="0 0 24 24" width="16" height="16" style="vertical-align: middle; margin-right: 5px;">
          <path d="M12 22l7-7h-4V8h-6v7H5l7 7z"/>
        </svg>`;
    }


    tr.innerHTML = `
      <td>${dataFormatada}</td>
      <td>${mov.nomeItem || '—'}</td>
      <td><span class="${tipoClasse}">${tipoIcone} ${tipoFormatado}</span></td>
      <td>${mov.quantidade}</td>
    `;

    movimentacoesTbody.appendChild(tr);
  });
}

btnProximo.addEventListener("click", () => carregarPagina("proximo"));
btnAnterior.addEventListener("click", () => carregarPagina("anterior"));

btnExportarPdf.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("Histórico de Movimentações", 20, 20);

  let y = 30;
  doc.setFontSize(10);

  const rows = movimentacoesTbody.querySelectorAll("tr");

  rows.forEach((tr, index) => {
    const cols = tr.querySelectorAll("td");
    const linha = Array.from(cols).map(td => td.textContent).join(" | ");
    doc.text(linha, 20, y);
    y += 7;

    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("historico-movimentacoes.pdf");
});
