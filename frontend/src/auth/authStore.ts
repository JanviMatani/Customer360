import { create } from 'zustand';
import type { MeResponse } from '../types';

interface AuthState {
  user: MeResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: MeResponse) => void;
  clearAuth: () => void;
}

// Rehydrate from localStorage on load
const storedToken = localStorage.getItem('c360_token');
const storedUser = (() => {
  try {
    const raw = localStorage.getItem('c360_user');
    return raw ? (JSON.parse(raw) as MeResponse) : null;
  } catch {
    return null;
  }
})();

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!(storedToken && storedUser),

  setAuth: (token, user) => {
    localStorage.setItem('c360_token', token);
    localStorage.setItem('c360_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem('c360_token');
    localStorage.removeItem('c360_user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
