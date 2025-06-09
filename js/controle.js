import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  getDoc,
  addDoc
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

const selectItem = document.getElementById('select-item');
const formMovimentacao = document.getElementById('form-movimentacao');
const tipoMovimentacao = document.getElementById('tipo-movimentacao');
const quantidadeInput = document.getElementById('quantidade');

const userEmailNav = document.getElementById('user-email-nav');
const logoutBtn = document.getElementById('logout-btn');

logoutBtn.addEventListener('click', () => {
  signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    userEmailNav.textContent = user.displayName || user.email;
    escutarItens();
  } else {
    window.location.href = 'login.html';
  }
});

function escutarItens() {
  const itensRef = collection(db, 'itens');
  onSnapshot(itensRef, (snapshot) => {
    selectItem.innerHTML = '';

    if (snapshot.empty) {
      const option = document.createElement('option');
      option.textContent = 'Nenhum item cadastrado.';
      option.disabled = true;
      selectItem.appendChild(option);
      return;
    }

    snapshot.forEach(docSnap => {
      const item = docSnap.data();
      const option = document.createElement('option');
      option.value = docSnap.id;
      option.textContent = item.nome;
      selectItem.appendChild(option);
    });
  });
}

formMovimentacao.addEventListener('submit', async (e) => {
  e.preventDefault();

  const itemId = selectItem.value;
  const tipo = tipoMovimentacao.value;
  const quantidade = Number(quantidadeInput.value);

  if (!itemId) {
    alert('Selecione um item.');
    return;
  }
  if (quantidade <= 0) {
    alert('Informe uma quantidade válida.');
    return;
  }

  try {
    const itemRef = doc(db, 'itens', itemId);
    const itemDoc = await getDoc(itemRef);

    if (!itemDoc.exists()) {
      alert('Item não encontrado.');
      return;
    }

    const itemData = itemDoc.data();
    let novoEstoque = itemData.quantidade || 0;

    if (tipo === 'entrada') {
      novoEstoque += quantidade;
    } else if (tipo === 'saida') {
      if (quantidade > novoEstoque) {
        alert('Quantidade de saída maior que o estoque disponível.');
        return;
      }
      novoEstoque -= quantidade;
    }

    await updateDoc(itemRef, {
      quantidade: novoEstoque,
      ultimaAtualizacao: serverTimestamp()
    });

    await addDoc(collection(db, 'movimentacoes'), {
      nomeItem: itemData.nome,
      tipo,
      quantidade,
      data: serverTimestamp()
    });

    alert('Movimentação registrada com sucesso!');
    quantidadeInput.value = '1';
  } catch (error) {
    alert('Erro ao registrar movimentação: ' + error.message);
  }
});
