import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, TwoFactorMethod } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  // 2FA state
  pending2FA: boolean;
  temporaryToken: string | null;
  twoFactorMethod: TwoFactorMethod | null;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  setHasHydrated: (v: boolean) => void;
  setPending2FA: (temporaryToken: string, method: TwoFactorMethod) => void;
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
      temporaryToken: null,
      twoFactorMethod: null,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true, pending2FA: false, temporaryToken: null, twoFactorMethod: null }),

      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false, pending2FA: false, temporaryToken: null, twoFactorMethod: null }),

      setHasHydrated: (v) => set({ hasHydrated: v }),

      setPending2FA: (temporaryToken, method) =>
        set({ pending2FA: true, temporaryToken, twoFactorMethod: method }),

      clearPending2FA: () =>
        set({ pending2FA: false, temporaryToken: null, twoFactorMethod: null }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
