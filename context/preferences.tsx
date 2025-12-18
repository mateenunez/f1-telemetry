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

export type WidgetId =
  | "driver-positions"
  | "map-and-messages"
  | "session-audios"
  | "race-control-list"
  | "circle-of-doom"
  | "circle-car-data";

export type Widget = {
  id: WidgetId;
  enabled: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface WidgetConfig {
  enabled: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface Preferences {
  sectors: boolean;
  corners: boolean;
  audio: boolean;
  headshot: boolean;
  audioLog: WidgetConfig;
  raceControlLog: WidgetConfig;
  circleOfDoom: WidgetConfig;
  circleCarData: WidgetConfig;
  driverPositions: WidgetConfig;
  mapAndMessages: WidgetConfig;
  favoriteDrivers: ProcessedDriver[];
  delay: number;
  translate: boolean;
  hasSeenTour: boolean;
  weatherDetailed: boolean;
}

const DEFAULT_CONFIG: Preferences = {
  sectors: false,
  corners: false,
  audio: true,
  headshot: false,
  driverPositions: { enabled: true, x: 0, y: 0, width: 800, height: 400 },
  mapAndMessages: { enabled: true, x: 800, y: 0, width: 700, height: 600 },
  audioLog: { enabled: true, x: 0, y: 700, width: 400, height: 300 },
  raceControlLog: { enabled: true, x: 350, y: 700, width: 450, height: 300 },
  circleOfDoom: { enabled: true, x: 850, y: 700, width: 300, height: 300 },
  circleCarData: { enabled: true, x: 1200, y: 700, width: 300, height: 300 },
  favoriteDrivers: [],
  delay: 0,
  translate: false,
  hasSeenTour: false,
  weatherDetailed: false,
};

interface PreferencesContextValue {
  preferences: Preferences;
  getPreference: <K extends keyof Preferences>(key: K) => Preferences[K];
  setPreference: <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => void;
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  widgets: Widget[];
  updateWidget: (id: WidgetId, updates: Partial<Widget>) => void;
  updateWidgets: (updates: Widget[]) => void;
  syncWidgetsFromPreferences: () => void;
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
    "hasSeenTour",
    "weatherDetailed",
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
        "hasSeenTour",
        "weatherDetailed",
        "translate",
      ].includes(key)
    ) {
      if (typeof obj[key] !== "boolean") return false;
    }

    if (
      [
        "audioLog",
        "raceControlLog",
        "circleOfDoom",
        "circleCarData",
        "driverPositions",
        "mapAndMessages",
      ].includes(key)
    ) {
      const widgetConfig = obj[key];
      if (
        typeof widgetConfig !== "object" ||
        typeof widgetConfig.enabled !== "boolean" ||
        typeof widgetConfig.x !== "number" ||
        typeof widgetConfig.y !== "number" ||
        typeof widgetConfig.width !== "number" ||
        typeof widgetConfig.height !== "number"
      ) {
        return false;
      }
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

  const [isEditMode, setIsEditMode] = useState(false);

  const buildWidgetsFromPreferences = useCallback(
    (prefs: Preferences): Widget[] => {
      return [
        { id: "driver-positions", ...prefs.driverPositions },
        { id: "map-and-messages", ...prefs.mapAndMessages },
        { id: "session-audios", ...prefs.audioLog },
        { id: "race-control-list", ...prefs.raceControlLog },
        { id: "circle-of-doom", ...prefs.circleOfDoom },
        { id: "circle-car-data", ...prefs.circleCarData },
      ];
    },
    []
  );

  useEffect(() => {
    setWidgets(buildWidgetsFromPreferences(preferences));
  }, [preferences, buildWidgetsFromPreferences]);

  const [widgets, setWidgets] = useState<Widget[]>(() =>
    buildWidgetsFromPreferences(preferences)
  );

  const updateWidgets = useCallback((newWidgets: Widget[]) => {
    setWidgets(newWidgets);
  }, []);

  // Función para actualizar un widget específico
  const updateWidget = useCallback((id: WidgetId, updates: Partial<Widget>) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
  }, []);

  const syncWidgetsFromPreferences = useCallback(() => {
    setWidgets(buildWidgetsFromPreferences(preferences));
  }, [preferences, buildWidgetsFromPreferences]);

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
    () => ({
      preferences,
      getPreference,
      setPreference,
      isEditMode,
      setIsEditMode,
      widgets,
      updateWidget,
      updateWidgets,
      syncWidgetsFromPreferences,
    }),
    [
      preferences,
      getPreference,
      setPreference,
      isEditMode,
      widgets,
      updateWidget,
      updateWidgets,
      syncWidgetsFromPreferences,
    ]
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
