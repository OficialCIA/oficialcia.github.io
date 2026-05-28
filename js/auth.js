import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCnBVK5TpuO6WkjOkvkcfm-vWDCefYtBtg",
  authDomain: "kayque-e2385.firebaseapp.com",
  projectId: "kayque-e2385",
  storageBucket: "kayque-e2385.firebasestorage.app",
  messagingSenderId: "719897671237",
  appId: "1:719897671237:web:179646f8ae5d9d13f3952c",
  measurementId: "G-XRS6YB72LT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const page = document.body.dataset.page;

function setMessage(elementId, text, type = "error") {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = text;
  el.className = "message";
  if (text) el.classList.add(type);
}

function setFieldError(inputId, errorId, text) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (!input || !error) return;
  input.classList.toggle("invalid", Boolean(text));
  error.textContent = text || "";
}

function mapAuthError(code) {
  const errors = {
    "auth/invalid-email": "Email inválido.",
    "auth/missing-password": "Informe a senha.",
    "auth/user-disabled": "Conta desativada.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "Email ou senha inválidos.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/email-already-in-use": "Este email já está em uso.",
    "auth/weak-password": "A senha deve ter pelo menos 6 caracteres."
  };
  return errors[code] || "Não foi possível concluir a operação. Tente novamente.";
}

function setupSidebar() {
  const body = document.body;
  const toggle = document.getElementById("sidebar-toggle");
  const overlay = document.getElementById("sidebar-overlay");
  const navLinks = document.querySelectorAll("#site-sidebar a");
  if (!toggle || !overlay) return;

  const mobile = window.matchMedia("(max-width: 900px)");
  const updateAria = () => {
    const expanded = mobile.matches
      ? body.classList.contains("sidebar-open")
      : !body.classList.contains("sidebar-collapsed");
    toggle.setAttribute("aria-expanded", String(expanded));
  };

  const syncLayout = () => {
    if (mobile.matches) {
      body.classList.add("sidebar-collapsed");
      body.classList.remove("sidebar-open");
    } else {
      body.classList.remove("sidebar-collapsed");
      body.classList.remove("sidebar-open");
    }
    updateAria();
  };

  toggle.addEventListener("click", () => {
    if (mobile.matches) {
      body.classList.toggle("sidebar-open");
    } else {
      body.classList.toggle("sidebar-collapsed");
    }
    updateAria();
  });

  overlay.addEventListener("click", () => {
    body.classList.remove("sidebar-open");
    updateAria();
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (mobile.matches) {
        body.classList.remove("sidebar-open");
        updateAria();
      }
    });
  });

  mobile.addEventListener("change", syncLayout);
  syncLayout();
}

function calculatePasswordStrength(password) {
  let points = 0;
  if (password.length >= 8) points++;
  if (/[A-Z]/.test(password)) points++;
  if (/[a-z]/.test(password)) points++;
  if (/\d/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password)) points++;
  return points;
}

function setupLoginPage() {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const button = document.getElementById("loginButton");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");

  if (!form || !emailInput || !passwordInput || !button) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("formMessage", "");
    setFieldError("email", "emailError", "");
    setFieldError("password", "passwordError", "");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email) setFieldError("email", "emailError", "Informe o email.");
    if (!password) setFieldError("password", "passwordError", "Informe a senha.");
    if (!email || !password) return;

    button.disabled = true;
    button.textContent = "Entrando...";
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("formMessage", "Login realizado com sucesso! Redirecionando...", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    } catch (error) {
      setMessage("formMessage", mapAuthError(error.code), "error");
    } finally {
      button.disabled = false;
      button.textContent = "Entrar";
    }
  });

  forgotPasswordLink?.addEventListener("click", async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    setMessage("formMessage", "");
    setFieldError("email", "emailError", "");

    if (!email) {
      setFieldError("email", "emailError", "Digite seu email para recuperar a senha.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("formMessage", "Enviamos um email de recuperação de senha.", "success");
    } catch (error) {
      setMessage("formMessage", mapAuthError(error.code), "error");
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user) window.location.replace("dashboard.html");
  });
}

function setupRegisterPage() {
  const form = document.getElementById("registerForm");
  const nameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");
  const termsInput = document.getElementById("terms");
  const strengthEl = document.getElementById("passwordStrength");
  const button = document.getElementById("registerButton");

  if (!form || !nameInput || !emailInput || !passwordInput || !confirmInput || !termsInput || !strengthEl || !button) return;

  const updateStrength = () => {
    const score = calculatePasswordStrength(passwordInput.value);
    let label = "fraca";
    let className = "weak";
    if (score >= 4) {
      label = "forte";
      className = "strong";
    } else if (score >= 2) {
      label = "média";
      className = "medium";
    }
    strengthEl.textContent = `Força da senha: ${label}`;
    strengthEl.className = `strength ${className}`;
  };

  passwordInput.addEventListener("input", updateStrength);
  updateStrength();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("formMessage", "");
    setFieldError("fullName", "fullNameError", "");
    setFieldError("email", "emailError", "");
    setFieldError("password", "passwordError", "");
    setFieldError("confirmPassword", "confirmPasswordError", "");
    setFieldError("terms", "termsError", "");

    const fullName = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;
    const strength = calculatePasswordStrength(password);

    if (fullName.length < 3) setFieldError("fullName", "fullNameError", "Informe seu nome completo.");
    if (!email) setFieldError("email", "emailError", "Informe o email.");
    if (password.length < 6) {
      setFieldError("password", "passwordError", "A senha precisa de pelo menos 6 caracteres.");
    } else if (strength < 2) {
      setFieldError("password", "passwordError", "Use uma senha mais forte (maiúsculas, números e símbolos).");
    }
    if (confirmPassword !== password) setFieldError("confirmPassword", "confirmPasswordError", "As senhas não coincidem.");
    if (!termsInput.checked) setFieldError("terms", "termsError", "Você precisa aceitar os termos.");

    if (fullName.length < 3 || !email || password.length < 6 || strength < 2 || confirmPassword !== password || !termsInput.checked) {
      return;
    }

    button.disabled = true;
    button.textContent = "Criando conta...";

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: fullName,
        email,
        createdAt: serverTimestamp()
      }, { merge: true });

      setMessage("formMessage", "Conta criada com sucesso! Redirecionando...", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 700);
    } catch (error) {
      setMessage("formMessage", mapAuthError(error.code), "error");
    } finally {
      button.disabled = false;
      button.textContent = "Criar conta";
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user) window.location.replace("dashboard.html");
  });
}

function formatCreatedAt(user, profileData) {
  const timestamp = profileData?.createdAt;
  if (timestamp && typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleString("pt-BR");
  }
  if (user?.metadata?.creationTime) {
    return new Date(user.metadata.creationTime).toLocaleString("pt-BR");
  }
  return "Não disponível";
}

function setupDashboardPage() {
  const logoutBtn = document.getElementById("logoutBtn");
  const welcomeName = document.getElementById("welcomeName");
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profileCreated = document.getElementById("profileCreated");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.replace("login.html");
      return;
    }

    let profileData;
    try {
      const profileRef = doc(db, "users", user.uid);
      const profileSnapshot = await getDoc(profileRef);
      profileData = profileSnapshot.exists() ? profileSnapshot.data() : undefined;
    } catch {
      setMessage("dashboardMessage", "Não foi possível carregar todos os dados do perfil.", "error");
    }

    const name = profileData?.name || user.displayName || "Usuário";
    const email = profileData?.email || user.email || "Não disponível";

    if (welcomeName) welcomeName.textContent = name;
    if (profileName) profileName.textContent = name;
    if (profileEmail) profileEmail.textContent = email;
    if (profileCreated) profileCreated.textContent = formatCreatedAt(user, profileData);
  });

  logoutBtn?.addEventListener("click", async () => {
    logoutBtn.disabled = true;
    logoutBtn.textContent = "Saindo...";
    setMessage("dashboardMessage", "");
    try {
      await signOut(auth);
      window.location.replace("login.html");
    } catch (error) {
      setMessage("dashboardMessage", mapAuthError(error.code), "error");
      logoutBtn.disabled = false;
      logoutBtn.textContent = "Sair da conta";
    }
  });
}

setupSidebar();

if (page === "login") setupLoginPage();
if (page === "register") setupRegisterPage();
if (page === "dashboard") setupDashboardPage();
