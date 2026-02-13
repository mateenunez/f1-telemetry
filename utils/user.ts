import { config } from "@/lib/config";

const API_BASE_URL = config.public.apiUrl;

// Interfaz Role no se usa x ahora

export interface Role {
  name: string;
  cooldown_ms: number;
}

export interface VerifiyTokenResponse {
  success: boolean;
  user: User;
}

export interface User {
  id: number;
  username: string;
  role: Role;
}

export interface AuthResponse {
  user: User;
  token: string;
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
