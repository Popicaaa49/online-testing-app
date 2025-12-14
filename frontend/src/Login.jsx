import React, { useState } from 'react';
import { login, register } from './api';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // login | register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    const trimmedUsername = username.trim();
    try {
      if (mode === 'register') {
        await register(trimmedUsername, password);
        await login(trimmedUsername, password); // auto-login pe rol de USER
        setInfo('Cont creat. Te-am logat automat.');
      } else {
        await login(trimmedUsername, password);
      }
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setError('');
    setInfo('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #e0ecff, #f4f7fb)' }}>
      <form
        onSubmit={submit}
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          padding: '28px',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>{mode === 'login' ? 'Autentificare' : 'Creeaza cont'}</h2>
            <p style={{ margin: 0, color: '#475569' }}>
              Inregistrarea creeaza un cont de participant (ROLE_USER).
            </p>
          </div>
          <button
            type="button"
            onClick={switchMode}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 12px',
              background: '#f8fafc',
              cursor: 'pointer'
            }}
          >
            {mode === 'login' ? 'Cont nou' : 'Am cont'}
          </button>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontWeight: 600 }}>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="ex: student01"
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1'
            }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontWeight: 600 }}>Parola</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="••••••"
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1'
            }}
          />
        </label>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: '10px' }}>
            {error}
          </div>
        )}
        {info && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 12px', borderRadius: '10px' }}>
            {info}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {loading ? 'Se proceseaza...' : mode === 'login' ? 'Intra in cont' : 'Creeaza cont'}
        </button>
      </form>
    </div>
  );
}
