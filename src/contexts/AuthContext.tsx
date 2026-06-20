import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserAccount } from '../types/models';
import { USERS } from '../data/users';

interface AuthState {
  user: UserAccount | null;
  isLoading: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  login: () => false,
  logout: () => {},
});

const CREDENTIALS: Record<string, { password: string; userId: string }> = {
  'alex@opal.salon': { password: 'owner123', userId: 'alex' },
  // West Village
  'naomi@opal.salon': { password: 'front123', userId: 'naomi' },
  'sofia@opal.salon': { password: 'staff123', userId: 'sofia' },
  'mia@opal.salon': { password: 'staff123', userId: 'mia' },
  'jade@opal.salon': { password: 'staff123', userId: 'jade' },
  // Upper East Side
  'elena@opal.salon': { password: 'front123', userId: 'elena' },
  'nina@opal.salon': { password: 'staff123', userId: 'nina' },
  // Brooklyn
  'keiko@opal.salon': { password: 'front123', userId: 'keiko' },
  'tamara@opal.salon': { password: 'staff123', userId: 'tamara' },
};

const STORAGE_KEY = 'opal-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val);
          const found = USERS.find((u) => u.id === parsed.id);
          if (found) setUser(found);
        } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    const cred = CREDENTIALS[email.toLowerCase().trim()];
    if (!cred || cred.password !== password) return false;
    const found = USERS.find((u) => u.id === cred.userId);
    if (!found) return false;
    setUser(found);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ id: found.id }));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
