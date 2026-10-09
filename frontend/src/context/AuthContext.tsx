import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/services/auth.service";
import { TOKEN_KEY } from "@/services/http";
import { profileStore } from "@/lib/storage";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    authService
      .me()
      .then((me) => {
        const profile = profileStore.get();
        setUser({
          ...me,
          name: me.name || profile.name,
          email: me.email || profile.email,
        });
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<AuthUser> => {
    const res = await authService.login(payload);
    localStorage.setItem(TOKEN_KEY, res.token);
    profileStore.save({
      email: res.user?.email ?? payload.email,
      ...(res.user?.name ? { name: res.user.name } : {}),
    });
    const profile = profileStore.get();
    const nextUser: AuthUser = {
      id: res.user?.id ?? "user_001",
      role: res.role,
      email: res.user?.email ?? payload.email,
      name: res.user?.name || profile.name || payload.email.split("@")[0],
    };
    setUser(nextUser);
    return nextUser;
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<void> => {
    const res = await authService.register(payload);
    profileStore.save({ name: res.name || payload.name, email: res.email || payload.email });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
