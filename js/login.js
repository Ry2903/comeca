import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc
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

const signupBtn = document.getElementById('signup-btn');
const signupName = document.getElementById('signup-name');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');

const loginBtn = document.getElementById('login-btn');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');

const forgotPasswordLink = document.getElementById('forgot-password');

const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const userEmailSpan = document.getElementById('user-email');
const authSection = document.getElementById('auth-section');

signupBtn.addEventListener('click', async () => {
  const nome = signupName.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value;

  if (!nome) {
    alert('Por favor, informe o nome.');
    return;
  }
  if (!email) {
    alert('Por favor, informe o email.');
    return;
  }
  if (!password) {
    alert('Por favor, informe a senha.');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Atualiza displayName no perfil do usuário Firebase
    await updateProfile(userCredential.user, { displayName: nome });

    // Salva dados no Firestore na coleção "usuarios"
    await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
      nome,
      email,
      criadoEm: new Date()
    });

    alert('Cadastro realizado com sucesso!');
    signupName.value = '';
    signupEmail.value = '';
    signupPassword.value = '';
  } catch (error) {
    alert(error.message);
  }
});

loginBtn.addEventListener('click', () => {
  const email = loginEmail.value;
  const password = loginPassword.value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = 'index.html';
    })
    .catch(e => alert(e.message));
});

logoutBtn.addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  if (user) {
    authSection.style.display = 'none';
    userInfo.style.display = 'block';
    userEmailSpan.textContent = user.displayName || user.email;
  } else {
    authSection.style.display = 'block';
    userInfo.style.display = 'none';
    userEmailSpan.textContent = '';
  }
});

forgotPasswordLink?.addEventListener('click', () => {
  const email = loginEmail.value.trim();

  if (!email) {
    alert('Por favor, insira seu email no campo "Email" para redefinir a senha.');
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert('Email de redefinição de senha enviado! Verifique sua caixa de entrada.');
    })
    .catch((error) => {
      alert('Erro ao enviar email de redefinição: ' + error.message);
    });
});
