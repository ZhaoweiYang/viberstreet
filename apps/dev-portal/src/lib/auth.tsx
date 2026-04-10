import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, setToken, getToken, type User } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokenState, setTokenState] = useState<string | null>(() => getToken());
  const [loading, setLoading] = useState(true);

  const login = useCallback((newToken: string, newUser: User) => {
    if (newUser.role !== 'developer' && newUser.role !== 'admin') {
      throw new Error('Access denied. Developer or admin role required.');
    }
    setToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (tokenState) {
      getMe()
        .then((res: any) => {
          const u = res.data || res;
          if (u.role !== 'developer' && u.role !== 'admin') {
            logout();
          } else {
            setUser(u);
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tokenState, logout]);

  return (
    <AuthContext.Provider value={{ user, token: tokenState, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
