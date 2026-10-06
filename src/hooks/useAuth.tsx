import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, clearToken, getToken, type ApiUser } from "@/lib/api";

export type Profile = ApiUser;
export type AuthUser = ApiUser;

type AuthContextValue = {
  user: AuthUser | null;
  session: { access_token: string } | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  setAuthenticatedUser: (user: AuthUser) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadCurrentUser() {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const { user: currentUser } = await authApi.me();
      setUser(currentUser);
    } catch {
      clearToken();
      setUser(null);
    }
  }

  useEffect(() => {
    void loadCurrentUser().finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session: getToken() ? { access_token: getToken() ?? "" } : null,
      profile: user,
      isAdmin: user?.role === "admin",
      loading,
      refreshProfile: async () => {
        await loadCurrentUser();
      },
      setAuthenticatedUser: setUser,
      signOut: async () => {
        clearToken();
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
