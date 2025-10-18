"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { ProcessedDriver } from "@/processors";

export interface Preferences {
  sectors: boolean;
  corners: boolean;
  audio: boolean;
  headshot: boolean;
  audioLog: boolean;
  raceControlLog: boolean;
  circleOfDoom: boolean;
  circleCarData: boolean;
  favoriteDrivers: ProcessedDriver[];
  delay: number;
  translate: boolean;
}

const DEFAULT_CONFIG: Preferences = {
  sectors: false,
  corners: false,
  audio: true,
  headshot: false,
  audioLog: true,
  raceControlLog: true,
  circleOfDoom: true,
  circleCarData: true,
  favoriteDrivers: [],
  delay: 0,
  translate: false,
};

interface PreferencesContextValue {
  preferences: Preferences;
  getPreference: <K extends keyof Preferences>(key: K) => Preferences[K];
  setPreference: <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

interface ProviderProps {
  children: ReactNode;
}

function isPreferences(obj: any): obj is Preferences {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const requiredKeys: Array<keyof Preferences> = [
    "sectors",
    "corners",
    "audio",
    "headshot",
    "audioLog",
    "raceControlLog",
    "circleOfDoom",
    "circleCarData",
    "favoriteDrivers",
    "delay",
  ];

  for (const key of requiredKeys) {
    if (!(key in obj) || obj[key] === undefined) {
      return false;
    }

    if (
      [
        "sectors",
        "corners",
        "audio",
        "headshot",
        "audioLog",
        "raceControlLog",
        "circleOfDoom",
        "circleCarData",
      ].includes(key)
    ) {
      if (typeof obj[key] !== "boolean") return false;
    }

    if (key === "favoriteDrivers" && !Array.isArray(obj[key])) {
      return false;
    }

    if (key === "delay" && typeof obj[key] !== "number") {
      return false;
    }
  }

  return true;
}

export const PreferencesProvider: React.FC<ProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const cookie = Cookies.get("f1t_config");
    try {
      if (cookie) {
        const cookieJson = JSON.parse(cookie);
        const cookieUpdated = isPreferences(cookieJson);
        return cookieUpdated ? cookieJson : DEFAULT_CONFIG;
      }
      return DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const getPreference = useCallback(
    <K extends keyof Preferences>(key: K): Preferences[K] => preferences[key],
    [preferences]
  );

  const setPreference = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      setPreferences((prev) => {
        const updated = { ...prev, [key]: value };
        Cookies.set("f1t_config", JSON.stringify(updated), { expires: 365 });
        return updated;
      });
    },
    []
  );

  // Optional: sync cookie changes (multi-tab)
  useEffect(() => {
    const handleStorage = () => {
      const cookie = Cookies.get("f1t_config");
      if (!cookie) return;
      try {
        const parsed = JSON.parse(cookie);
        if (JSON.stringify(parsed) !== JSON.stringify(preferences)) {
          setPreferences(parsed);
        }
      } catch {}
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [preferences]);

  const contextValue = useMemo(
    () => ({ preferences, getPreference, setPreference }),
    [preferences, getPreference, setPreference]
  );

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
};

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error(
      "usePreferences must be used within a PreferencesProvider."
    );
  }
  return context;
}
