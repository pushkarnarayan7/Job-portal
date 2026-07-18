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
        setUser({ ...me, name: profile.name, email: profile.email });
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<AuthUser> => {
    const { token, role } = await authService.login(payload);
    localStorage.setItem(TOKEN_KEY, token);
    profileStore.save({ email: payload.email });
    const profile = profileStore.get();
    const nextUser: AuthUser = {
      id: "user_001",
      role,
      email: payload.email,
      name: profile.name || payload.email.split("@")[0],
    };
    setUser(nextUser);
    return nextUser;
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<void> => {
    await authService.register(payload);
    profileStore.save({ name: payload.name, email: payload.email });
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
