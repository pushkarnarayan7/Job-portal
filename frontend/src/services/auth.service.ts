import { http } from "./http";
import type {
  ApiSuccess,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  UserRole,
} from "@/types";

interface LoginResult {
  token: string;
  role: UserRole;
}

interface RegisterResult {
  id: string;
  name: string;
  email: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResult> {
    const res = await http.post<ApiSuccess<LoginResult>>("/auth/login", payload);
    return res.data.data;
  },

  async register(payload: RegisterPayload): Promise<RegisterResult> {
    const res = await http.post<ApiSuccess<RegisterResult>>("/auth/register", payload);
    return res.data.data;
  },

  async me(): Promise<AuthUser> {
    const res = await http.get<ApiSuccess<AuthUser>>("/auth/me");
    return res.data.data;
  },
};
