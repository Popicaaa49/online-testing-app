import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

async function handleResponse(res) {
  if (res.status === 204) {
    return null;
  }
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return text ? JSON.parse(text) : null;
}

export async function getCsrf() {
  const res = await fetch(`${API_URL}/api/auth/csrf`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Nu am putut obtine tokenul CSRF');
  return res.json();
}

async function sendJson(path, method, body) {
  const csrf = await getCsrf();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrf.headerName]: csrf.token
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return handleResponse(res);
}

export async function login(username, password) {
  const csrf = await getCsrf();
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);

  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      [csrf.headerName]: csrf.token
    },
    body: form
  });

  if (!res.ok) {
    throw new Error('Credentiale invalide');
  }
}

export async function logout() {
  const csrf = await getCsrf();
  await fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      [csrf.headerName]: csrf.token
    }
  });
}

export async function me() {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    credentials: 'include'
  });
  if (!res.ok) {
    return { authenticated: false };
  }
  return res.json();
}

export const fetchTests = () =>
  fetch(`${API_URL}/api/tests`, { credentials: 'include' }).then(handleResponse);

export const fetchTest = (id) =>
  fetch(`${API_URL}/api/tests/${id}`, { credentials: 'include' }).then(handleResponse);

export const createTest = (payload) => sendJson('/api/tests', 'POST', payload);

export const updateTest = (id, payload) =>
  sendJson(`/api/tests/${id}`, 'PUT', payload);

export const deleteTest = (id) =>
  sendJson(`/api/tests/${id}`, 'DELETE');

export const submitTest = (id, payload) =>
  sendJson(`/api/tests/${id}/submit`, 'POST', payload);

export function connectLiveUpdates({ onTestEvent, onSubmission }) {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${API_URL}/ws`),
    reconnectDelay: 5000,
    debug: () => {}
  });

  const subscriptions = [];

  client.onConnect = () => {
    if (onTestEvent) {
      subscriptions.push(
        client.subscribe('/topic/tests', (message) => {
          const body = JSON.parse(message.body);
          onTestEvent(body);
        })
      );
    }
    if (onSubmission) {
      subscriptions.push(
        client.subscribe('/topic/submissions', (message) => {
          const body = JSON.parse(message.body);
          onSubmission(body);
        })
      );
    }
  };

  client.activate();

  return () => {
    subscriptions.forEach((sub) => sub.unsubscribe());
    client.deactivate();
  };
}
