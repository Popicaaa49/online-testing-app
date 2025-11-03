const API_URL = 'http://localhost:8080';

/**
 * Obține tokenul CSRF de la backend (Spring Boot trimite cookie + header info)
 */
export async function getCsrf() {
  const res = await fetch(`${API_URL}/api/auth/csrf`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed CSRF');
  return res.json();
}

/**
 * Login user (cu token CSRF inclus manual în header)
 */
export async function login(username, password) {
  // 1️⃣ Obținem tokenul CSRF
  const csrf = await getCsrf();

  // 2️⃣ Pregătim formularul de autentificare
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);

  // 3️⃣ Trimitem cererea de login
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      [csrf.headerName]: csrf.token // adăugăm tokenul CSRF în header
    },
    body: form
  });

  if (!res.ok) throw new Error('Bad credentials');
}

/**
 * Verifică dacă utilizatorul este autentificat
 */
export async function me() {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    credentials: 'include'
  });
  return res.json();
}

/**
 * Citește cookie-ul XSRF din browser (pentru cereri POST autentificate)
 */
function getCookie(name) {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
}

/**
 * Creează un test (endpoint protejat)
 */
export async function createTest(testData) {
  // 1️⃣ Reîmprospătăm tokenul CSRF de fiecare dată înainte de POST
  const csrf = await getCsrf();

  const res = await fetch(`${API_URL}/api/tests`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrf.headerName]: csrf.token // ✨ trimitem headerul corect de la Spring
    },
    body: JSON.stringify(testData)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Not allowed: ${res.status} ${text}`);
  }

  return res.json();
}
