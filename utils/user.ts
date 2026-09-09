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
  if (expiryMs === null) return true;
  return expiryMs <= Date.now();
}

export const AD_FREE_ROLE_IDS = [2, 3] as const;

/**
 * Returns true if the given role or role ID corresponds to a role that does not receive ads.
 * Evaluated strictly by role ID:
 * - 1: base (receives ads)
 * - 2: premium (no ads)
 * - 3: admin (no ads)
 */
export function isAdFreeRole(
  role?: Role | { id?: number } | number | null,
): boolean {
  if (role == null) return false;
  const roleId = typeof role === "number" ? role : role.id;
  return roleId === 2 || roleId === 3;
}

/**
 * Decodes the JWT payload client-side to inspect the user's role ID without waiting for network verification.
 */
export function getTokenRoleId(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(base64));
    if (typeof json.role_id === "number") {
      return json.role_id;
    }
    if (typeof json.role === "string") {
      const name = json.role.toLowerCase().trim();
      if (name === "admin") return 3;
      if (name === "premium") return 2;
      if (name === "base") return 1;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * @deprecated Use getTokenRoleId instead
 */
export function getTokenRole(
  token: string,
): { id?: number; name?: string } | null {
  const roleId = getTokenRoleId(token);
  return roleId ? { id: roleId } : null;
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

  async requestPasswordReset(
    email: string,
    locale?: string,
  ): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}users/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, locale }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error ?? "FORGOT_PASSWORD_FAILED");
    }

    return data;
  },

  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}users/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error ?? "RESET_PASSWORD_FAILED");
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
