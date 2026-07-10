import { config } from "@/lib/config";

const API_BASE_URL = config.public.apiUrl;

export interface Role {
  id: number;
  name: string;
  cooldown_ms: number;
}

export interface VerifiyTokenResponse {
  success: boolean;
  user: User;
  token?: string;
}

export interface User {
  id: number;
  username: string;
  role: Role;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Reads the `exp` claim (seconds since epoch) out of a JWT without
 * verifying its signature — used client-side only to know when to
 * proactively log the user out; the server always re-validates the
 * signature on every request.
 */
export function getTokenExpiryMs(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(base64));
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const expiryMs = getTokenExpiryMs(token);
  return expiryMs !== null && expiryMs <= Date.now();
}

export const userEndpoints = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error ?? "LOGIN_FAILED");
    }

    return data;
  },

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error ?? "REGISTRATION_FAILED");
    }

    return data;
  },

  async verifyToken(token: string): Promise<VerifiyTokenResponse> {
    const response = await fetch(`${API_BASE_URL}users/verify-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error ?? "INVALID_TOKEN");
    }

    return data;
  },

  async getUser(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    return response.json();
  },
};
