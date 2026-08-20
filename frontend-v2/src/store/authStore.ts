import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, UserRole } from '../types';

const INITIAL_USERS: AuthUser[] = [
  { id: 'user-rm-1', email: 'rm1@firm.com', name: 'Arjun Mehta', role: 'rm', rmId: 'rm1', teamName: 'North Metro Wealth & Retail', token: 'jwt_rm_arjun_token_991823' },
  { id: 'user-manager-1', email: 'manager@firm.com', name: 'Sunita Deshmukh', role: 'manager', teamName: 'Western & Northern Regional Division', token: 'jwt_mgr_sunita_token_481029' },
  { id: 'user-admin-1', email: 'admin@firm.com', name: 'Devraj Kapoor', role: 'admin', teamName: 'Core Enterprise Intelligence & Governance', token: 'jwt_adm_devraj_token_773912' },
];

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  failedAttempts: number;
  lockoutUntil: number | null;
  isLockedOut: boolean;
  lockoutTimeRemaining: number;
  login: (roleOrEmail: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  recordFailedAttempt: () => { locked: boolean; remainingSeconds: number };
  resetLockout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      failedAttempts: 0,
      lockoutUntil: null,
      isLockedOut: false,
      lockoutTimeRemaining: 0,

      login: async (roleOrEmail: string, password?: string) => {
        const state = get();
        const now = Date.now();

        if (state.lockoutUntil && now < state.lockoutUntil) {
          const remainingSeconds = Math.ceil((state.lockoutUntil - now) / 1000);
          set({ isLockedOut: true, lockoutTimeRemaining: remainingSeconds });
          return { success: false, error: `Security Lockout Active: Account locked for ${remainingSeconds}s due to 5 consecutive failed attempts.` };
        }

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: roleOrEmail, email: roleOrEmail, password }),
          });

          if (res.ok) {
            const data = await res.json() as { user: AuthUser; token: string };
            set({ user: data.user, token: data.token, isAuthenticated: true, failedAttempts: 0, lockoutUntil: null, isLockedOut: false, lockoutTimeRemaining: 0 });
            return { success: true };
          } else {
            const { locked, remainingSeconds } = get().recordFailedAttempt();
            if (locked) return { success: false, error: `Security Lockout: 5 failed attempts reached. System locked for ${remainingSeconds}s.` };
            return { success: false, error: 'Invalid credentials or role' };
          }
        } catch {
          // Offline fallback
          const target = INITIAL_USERS.find(u => u.role === roleOrEmail || u.email.toLowerCase() === roleOrEmail.toLowerCase());
          if (target) {
            set({ user: target, token: target.token, isAuthenticated: true, failedAttempts: 0, lockoutUntil: null, isLockedOut: false, lockoutTimeRemaining: 0 });
            return { success: true };
          }
          const { locked, remainingSeconds } = get().recordFailedAttempt();
          return { success: false, error: locked ? `Security Lockout: System locked for ${remainingSeconds}s.` : 'Invalid credentials or user role.' };
        }
      },

      switchRole: (role: UserRole) => {
        const target = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
        set({ user: target, token: target.token, isAuthenticated: true, failedAttempts: 0, lockoutUntil: null, isLockedOut: false, lockoutTimeRemaining: 0 });
      },

      logout: () => {
        fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${get().token || ''}` } }).catch(() => {});
        set({ user: null, token: null, isAuthenticated: false });
      },

      recordFailedAttempt: () => {
        const current = get().failedAttempts + 1;
        let lockoutUntil: number | null = null;
        let locked = false;
        let remainingSeconds = 0;
        if (current >= 5) { locked = true; lockoutUntil = Date.now() + 60000; remainingSeconds = 60; }
        set({ failedAttempts: current, lockoutUntil, isLockedOut: locked, lockoutTimeRemaining: remainingSeconds });
        return { locked, remainingSeconds };
      },

      resetLockout: () => set({ failedAttempts: 0, lockoutUntil: null, isLockedOut: false, lockoutTimeRemaining: 0 }),
    }),
    { name: 'c360_v2_auth_session' }
  )
);

export { INITIAL_USERS };
