import axios, { AxiosError } from "axios";
import type { ApiFailure } from "@/types";

export const TOKEN_KEY = "jobportal.token";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Extracts a human-readable message from any thrown API error. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiFailure | undefined;
    if (data?.message) return data.message;
    if (error.code === "ECONNABORTED") return "Request timed out. Please try again.";
    if (!error.response) return "Cannot reach the server. Is the backend running?";
    return `Request failed (${error.response.status})`;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
