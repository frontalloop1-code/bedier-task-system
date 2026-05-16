import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, tokenStore } from '../api/client.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) {
      setReady(true);
      return;
    }
    try {
      const r = await api.get('/auth/me');
      setUser(r.data.user);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    tokenStore.set(r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthCtx.Provider value={{ user, ready, login, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}
