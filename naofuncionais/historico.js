import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

const listaMovimentacoes = document.querySelector('#tabela-movimentacoes tbody');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroDataInicio = document.getElementById('filtro-data-inicio');
const filtroDataFim = document.getElementById('filtro-data-fim');
const btnFiltrar = document.getElementById('btn-filtrar');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const paginaAtualSpan = document.getElementById('pagina-atual');
const totalPaginasSpan = document.getElementById('total-paginas');
const userEmailNav = document.getElementById('user-email-nav');
const logoutBtn = document.getElementById('logout-btn');

let movimentacoes = [];
let movimentacoesFiltradas = [];
let paginaAtual = 1;
const itensPorPagina = 10;

// Logout
logoutBtn.addEventListener('click', () => {
  signOut(auth).then(() => {
    window.location.href = 'login.html';
  });
});

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = 'login.html';
  }
});

function escutarMovimentacoes() {
  const q = query(collection(db, 'movimentacoes'), orderBy('timestamp', 'desc'));
  onSnapshot(q, (snapshot) => {
    movimentacoes = [];
    snapshot.forEach(doc => {
      movimentacoes.push(doc.data());
    });
    movimentacoesFiltradas = movimentacoes;
    paginaAtual = 1;
    renderizarTabela();
  });
}
escutarMovimentacoes();

function renderizarTabela() {
  listaMovimentacoes.innerHTML = '';

  const totalPaginas = Math.max(1, Math.ceil(movimentacoesFiltradas.length / itensPorPagina));
  if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const paginaItens = movimentacoesFiltradas.slice(inicio, fim);

  if (paginaItens.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5" style="text-align:center;">Nenhuma movimentação encontrada.</td>`;
    listaMovimentacoes.appendChild(tr);
  } else {
    paginaItens.forEach(mov => {
      const tr = document.createElement('tr');

      let dataHora = '';
      if (mov.timestamp && mov.timestamp.seconds) {
        dataHora = new Date(mov.timestamp.seconds * 1000).toLocaleString('pt-BR');
      }

      tr.innerHTML = `
        <td>${dataHora}</td>
        <td>${mov.tipo || ''}</td>
        <td>${mov.quantidade || ''}</td>
        <td>${mov.item || ''}</td>
        <td>${mov.usuario || ''}</td>
      `;
      listaMovimentacoes.appendChild(tr);
    });
  }

  paginaAtualSpan.textContent = paginaAtual;
  totalPaginasSpan.textContent = totalPaginas;

  btnPrev.disabled = paginaAtual <= 1;
  btnNext.disabled = paginaAtual >= totalPaginas;
}

btnPrev.addEventListener('click', () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    renderizarTabela();
  }
});

btnNext.addEventListener('click', () => {
  const totalPaginas = Math.ceil(movimentacoesFiltradas.length / itensPorPagina);
  if (paginaAtual < totalPaginas) {
    paginaAtual++;
    renderizarTabela();
  }
});

btnFiltrar.addEventListener('click', () => {
  const tipoFiltro = filtroTipo.value;
  const dataInicio = filtroDataInicio.value;
  const dataFim = filtroDataFim.value;

  movimentacoesFiltradas = movimentacoes.filter(mov => {
    let okTipo = true;
    let okData = true;

    if (tipoFiltro) {
      okTipo = mov.tipo === tipoFiltro;
    }

    if (okTipo && dataInicio) {
      if (mov.timestamp && mov.timestamp.seconds) {
        const dataMov = new Date(mov.timestamp.seconds * 1000);
        okData = dataMov >= new Date(dataInicio);
      } else {
        okData = false;
      }
    }

    if (okTipo && okData && dataFim) {
      if (mov.timestamp && mov.timestamp.seconds) {
        const dataMov = new Date(mov.timestamp.seconds * 1000);
        const fimDia = new Date(dataFim);
        fimDia.setHours(23, 59, 59, 999); // fim do dia
        okData = dataMov <= fimDia;
      } else {
        okData = false;
      }
    }

    return okTipo && okData;
  });

  paginaAtual = 1;
  renderizarTabela();
});
