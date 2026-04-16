import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  // 2FA state
  pending2FA: boolean;
  userIdPending2FA: string | null;
  loginEmail: string | null;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  setHasHydrated: (v: boolean) => void;
  setPending2FA: (userId: string, email: string) => void;
  clearPending2FA: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      pending2FA: false,
      userIdPending2FA: null,
      loginEmail: null,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true, pending2FA: false, userIdPending2FA: null, loginEmail: null }),

      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false, pending2FA: false, userIdPending2FA: null, loginEmail: null }),

      setHasHydrated: (v) => set({ hasHydrated: v }),

      setPending2FA: (userId, email) =>
        set({ pending2FA: true, userIdPending2FA: userId, loginEmail: email }),

      clearPending2FA: () =>
        set({ pending2FA: false, userIdPending2FA: null, loginEmail: null }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
