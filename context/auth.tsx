"use client";
import React, { createContext, useState, useCallback, useEffect, useRef } from "react";
import { User, userEndpoints, getTokenExpiryMs, isTokenExpired } from "../utils/user";
import Cookies from "js-cookie";
import { getTelemetryManager } from "@/telemetry-manager-singleton";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const telemetryManager = getTelemetryManager();
  const tokenName = "f1t_auth";
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearExpiryTimer = () => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  };

  // Schedules an automatic logout for the moment the token's own `exp`
  // claim elapses, so a tab left open past the 7-day session length gets
  // logged out without needing a page reload to notice the expiry.
  const scheduleExpiryLogout = (tokenToSchedule: string) => {
    clearExpiryTimer();
    const expiryMs = getTokenExpiryMs(tokenToSchedule);
    if (expiryMs === null) return;

    const remainingMs = expiryMs - Date.now();
    if (remainingMs <= 0) {
      handleAuthError();
      return;
    }
    expiryTimerRef.current = setTimeout(() => {
      handleAuthError();
    }, remainingMs);
  };

  const verifyToken = useCallback(async (tokenToVerify: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await userEndpoints.verifyToken(tokenToVerify);
      if (userData.success) {
        handleAuthSuccess(userData.user, userData.token || tokenToVerify);
      }
    } catch (err) {
     handleAuthError();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAuthError = () => {
    clearExpiryTimer();
    setUser(null);
    setToken(null);
    Cookies.remove(tokenName);
    localStorage.removeItem(tokenName);
    telemetryManager.updateToken("");
  };

  const handleAuthSuccess = (userData: User, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    Cookies.set(tokenName, newToken, { expires: 7 });
    localStorage.setItem(tokenName, newToken);
    telemetryManager.updateToken(newToken);
    scheduleExpiryLogout(newToken);
  };

  useEffect(() => {
    const storedToken = Cookies.get(tokenName);
    if (!storedToken) return;

    if (isTokenExpired(storedToken)) {
      handleAuthError();
      return;
    }

    verifyToken(storedToken);
  }, [verifyToken, tokenName]);

  useEffect(() => clearExpiryTimer, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const { user: userData, token: newToken } = await userEndpoints.login(
          email,
          password,
        );
        handleAuthSuccess(userData, newToken);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "User login failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [tokenName],
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const { user: userData, token: newToken } =
          await userEndpoints.register(username, email, password);
        handleAuthSuccess(userData, newToken);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "User registration failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [tokenName],
  );

  const logout = useCallback(() => {
    handleAuthError();
  }, [tokenName]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    clearError,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
