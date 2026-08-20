import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, UserRole } from '../types';
import { INITIAL_USERS } from '../lib/seedData';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  failedAttempts: number;
  lockoutUntil: number | null; // timestamp in ms
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
      user: INITIAL_USERS[0], // default to RM for demo or first session
      token: INITIAL_USERS[0].token,
      isAuthenticated: true,
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
          return {
            success: false,
            error: `Security Lockout Active: Account locked for ${remainingSeconds}s due to 5 consecutive failed attempts.`,
          };
        }

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: roleOrEmail, email: roleOrEmail, password }),
          });

          if (res.ok) {
            const data = await res.json();
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
              failedAttempts: 0,
              lockoutUntil: null,
              isLockedOut: false,
              lockoutTimeRemaining: 0,
            });
            return { success: true };
          } else {
            const errData = await res.json().catch(() => ({}));
            const { locked, remainingSeconds } = get().recordFailedAttempt();
            if (locked) {
              return {
                success: false,
                error: `Security Lockout: 5 failed attempts reached. System locked for ${remainingSeconds}s.`,
              };
            }
            return {
              success: false,
              error: errData.error || 'Invalid credentials or role',
            };
          }
        } catch {
          // Fallback offline mock login
          const target = INITIAL_USERS.find(
            (u) => u.role === roleOrEmail || u.email.toLowerCase() === roleOrEmail.toLowerCase()
          );
          if (target) {
            set({
              user: target,
              token: target.token,
              isAuthenticated: true,
              failedAttempts: 0,
              lockoutUntil: null,
              isLockedOut: false,
              lockoutTimeRemaining: 0,
            });
            return { success: true };
          }

          const { locked, remainingSeconds } = get().recordFailedAttempt();
          return {
            success: false,
            error: locked
              ? `Security Lockout: System locked for ${remainingSeconds}s.`
              : 'Invalid credentials or user role.',
          };
        }
      },

      switchRole: (role: UserRole) => {
        const target = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
        set({
          user: target,
          token: target.token,
          isAuthenticated: true,
          failedAttempts: 0,
          lockoutUntil: null,
          isLockedOut: false,
          lockoutTimeRemaining: 0,
        });
      },

      logout: () => {
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${get().token || ''}`,
          },
        }).catch(() => {});

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      recordFailedAttempt: () => {
        const current = get().failedAttempts + 1;
        let lockoutUntil: number | null = null;
        let locked = false;
        let remainingSeconds = 0;

        if (current >= 5) {
          locked = true;
          lockoutUntil = Date.now() + 60000; // 60s lockout
          remainingSeconds = 60;
        }

        set({
          failedAttempts: current,
          lockoutUntil,
          isLockedOut: locked,
          lockoutTimeRemaining: remainingSeconds,
        });

        return { locked, remainingSeconds };
      },

      resetLockout: () => {
        set({
          failedAttempts: 0,
          lockoutUntil: null,
          isLockedOut: false,
          lockoutTimeRemaining: 0,
        });
      },
    }),
    {
      name: 'c360_auth_session',
    }
  )
);
