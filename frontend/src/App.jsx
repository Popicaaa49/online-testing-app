import React, { useEffect, useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import { logout, me } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const data = await me();
    setUser(data);
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 24 }}>Se incarca...</p>;

  if (!user?.authenticated) {
    return <Login onLogin={refreshUser} />;
  }

  const handleLogout = async () => {
    await logout();
    await refreshUser();
  };

  return <Dashboard user={user} onLogout={handleLogout} />;
}
