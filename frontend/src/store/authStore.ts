import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, UserRole } from '../types';

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

        // Resolve the actual email to send to backend
        const emailToSend = resolveEmail(roleOrEmail);
        const passwordToSend = password || resolveDefaultPassword(roleOrEmail);

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailToSend, password: passwordToSend }),
          });

          if (res.ok) {
            const data = await res.json() as { user: AuthUser; token: string };
            const user: AuthUser = {
              ...data.user,
              // ensure token is on the user object for compatibility
              token: data.token,
            };
            set({
              user,
              token: data.token,
              isAuthenticated: true,
              failedAttempts: 0,
              lockoutUntil: null,
              isLockedOut: false,
              lockoutTimeRemaining: 0,
            });
            return { success: true };
          } else {
            const errData = await res.json().catch(() => ({})) as Record<string, string>;
            const { locked, remainingSeconds } = get().recordFailedAttempt();
            if (locked) {
              return { success: false, error: `Security Lockout: 5 failed attempts reached. System locked for ${remainingSeconds}s.` };
            }
            return { success: false, error: errData.error || errData.message || 'Invalid credentials' };
          }
        } catch {
          return { success: false, error: 'Network error: Backend server is not running. Please start the Spring Boot backend on port 8000.' };
        }
      },

      // Quick role-switch convenience (maps role string → demo user)
      switchRole: (role: UserRole) => {
        get().login(role);
      },

      logout: () => {
        const token = get().token;
        if (token) {
          fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
        }
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

// ─── Helper: map role shortcut → real backend email ───────────────────────────
function resolveEmail(roleOrEmail: string): string {
  switch (roleOrEmail.toLowerCase()) {
    case 'rm':       return 'rm.anita@bank.com';
    case 'manager':  return 'manager.vikram@bank.com';
    case 'admin':    return 'admin@bank.com';
    default:         return roleOrEmail; // assume it's already an email
  }
}

function resolveDefaultPassword(roleOrEmail: string): string {
  const lower = roleOrEmail.toLowerCase();
  if (lower === 'admin' || lower === 'admin@bank.com') return 'Admin123!';
  return 'Password123!';
}
