import { createContext, useContext, useState, useEffect } from 'react';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('ww_token');
    const u = localStorage.getItem('ww_user');
    if (t && u) setUser(JSON.parse(u));
    setReady(true);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('ww_token', token);
    localStorage.setItem('ww_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('ww_token');
    localStorage.removeItem('ww_user');
    setUser(null);
  };

  return <Ctx.Provider value={{ user, login, logout, ready }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
