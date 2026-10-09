export type UserRole = "student" | "recruiter";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  role: UserRole;
  user: UserResponse;
}
