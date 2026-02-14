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
  | "circle-car-data"
  | "tyres-list"
  | "chat";

export type Widget = {
  id: WidgetId;
  enabled: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  widthPct?: number;
  heightPct?: number;
  index?: number;
};

export interface WidgetConfig {
  enabled: boolean;
  x?: number;
  y?: number;
  xPct?: number;
  yPct?: number;
  width: number;
  height: number;
  widthPct?: number;
  heightPct?: number;
  index?: number;
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
  tyresList: WidgetConfig;
  chat: WidgetConfig;
  favoriteDrivers: ProcessedDriver[];
  delay: number;
  translate: boolean;
  hasSeenTour: boolean;
  weatherDetailed: boolean;
}

export const DEFAULT_CONFIG: Preferences = {
  sectors: false,
  corners: false,
  audio: true,
  headshot: false,
  driverPositions: {
    enabled: true,
    xPct: 0,
    yPct: 0,
    widthPct: 800 / 1526,
    heightPct: 1000 / 1094,
    width: 800,
    height: 1000,
    index: 0,
  },
  mapAndMessages: {
    enabled: true,
    xPct: 890 / 1526,
    yPct: 0,
    widthPct: 500 / 1526,
    heightPct: 450 / 1094,
    width: 500,
    height: 450,
    index: 1,
  },
  chat: {
    enabled: true,
    xPct: 880 / 1526,
    yPct: 720 / 1094,
    widthPct: 500 / 1526,
    heightPct: 300 / 1094,
    width: 600,
    height: 300,
    index: 2,
  },
  audioLog: {
    enabled: true,
    xPct: 0,
    yPct: 1094 / 1094,
    widthPct: 370 / 1526,
    heightPct: 500 / 1094,
    width: 370,
    height: 500,
    index: 3,
  },
  raceControlLog: {
    enabled: true,
    xPct: 400 / 1526,
    yPct: 1094 / 1094,
    widthPct: 400 / 1526,
    heightPct: 500 / 1094,
    width: 400,
    height: 500,
    index: 4,
  },
  circleOfDoom: {
    enabled: true,
    xPct: 850 / 1526,
    yPct: 1094 / 1094,
    widthPct: 300 / 1526,
    heightPct: 450 / 1094,
    width: 300,
    height: 450,
    index: 5,
  },
  circleCarData: {
    enabled: true,
    xPct: 1200 / 1526,
    yPct: 1094 / 1094,
    widthPct: 300 / 1526,
    heightPct: 450 / 1094,
    width: 300,
    height: 450,
    index: 6,
  },
  tyresList: {
    enabled: false,
    xPct: 0,
    yPct: 1620 / 1094,
    widthPct: 1500 / 1526,
    heightPct: 400 / 1094,
    width: 1500,
    height: 400,
    index: 7,
  },
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
    value: Preferences[K],
  ) => void;
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  isResizing: boolean;
  setIsResizing: (value: boolean) => void;
  widgets: Widget[];
  updateWidget: (id: WidgetId, updates: Partial<Widget>) => void;
  updateWidgets: (updates: Widget[]) => void;
  setWidgetsPreferences: (widgets: Widget[]) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

interface ProviderProps {
  children: ReactNode;
}

function isPreferences(obj: any): obj is Preferences {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const requiredKeys = Object.keys(DEFAULT_CONFIG) as Array<keyof Preferences>;

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
        "weatherDetailed",
        "hasSeenTour",
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
        "tyresList",
        "chat",
      ].includes(key)
    ) {
      const widgetConfig = obj[key];
      if (
        typeof widgetConfig !== "object" ||
        typeof widgetConfig.enabled !== "boolean"
      ) {
        return false;
      }

      const isNum = (v: any) => typeof v === "number" && !Number.isNaN(v);

      const hasX = isNum(widgetConfig.x) || isNum(widgetConfig.xPct);
      const hasY = isNum(widgetConfig.y) || isNum(widgetConfig.yPct);
      const hasWidth =
        isNum(widgetConfig.width) || isNum(widgetConfig.widthPct);
      const hasHeight =
        isNum(widgetConfig.height) || isNum(widgetConfig.heightPct);

      if (!hasX || !hasY || !hasWidth || !hasHeight) {
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
  const cookieName = "f1t_pref";
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const cookie = Cookies.get(cookieName);
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

  const [isResizing, setIsResizing] = useState(false);

  const buildWidgetsFromPreferences = useCallback(
    (prefs: Preferences): Widget[] => {
      // convertir porcentajes guardados en preferences a valores absolutos
      const BASE_W = typeof window !== "undefined" ? window.innerWidth : 1526;
      const BASE_H = typeof window !== "undefined" ? window.innerHeight : 1094;

      const toAbs = (cfg: WidgetConfig, id: WidgetId) => {
        const x =
          cfg.xPct !== undefined
            ? Math.round(cfg.xPct * BASE_W)
            : ((cfg as any).x ?? 0);
        const y =
          cfg.yPct !== undefined
            ? Math.round(cfg.yPct * BASE_H)
            : ((cfg as any).y ?? 0);
        const width =
          cfg.widthPct !== undefined
            ? Math.round(cfg.widthPct * BASE_W)
            : (cfg.width ?? 0);
        const height =
          cfg.heightPct !== undefined
            ? Math.round(cfg.heightPct * BASE_H)
            : (cfg.height ?? 0);
        return {
          id,
          enabled: cfg.enabled,
          x,
          y,
          width,
          height,
          index: cfg.index,
          widthPct: cfg.widthPct,
          heightPct: cfg.heightPct,
        } as Widget;
      };

      const list: Widget[] = [
        { ...toAbs(prefs.driverPositions, "driver-positions") },
        { ...toAbs(prefs.mapAndMessages, "map-and-messages") },
        { ...toAbs(prefs.audioLog, "session-audios") },
        { ...toAbs(prefs.raceControlLog, "race-control-list") },
        { ...toAbs(prefs.circleOfDoom, "circle-of-doom") },
        { ...toAbs(prefs.circleCarData, "circle-car-data") },
        { ...toAbs(prefs.tyresList, "tyres-list") },
        { ...toAbs(prefs.chat, "chat") },
      ];
      return list.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    },
    [],
  );

  useEffect(() => {
    setWidgets(buildWidgetsFromPreferences(preferences));
  }, [preferences, buildWidgetsFromPreferences]);

  const [widgets, setWidgets] = useState<Widget[]>(() =>
    buildWidgetsFromPreferences(preferences),
  );

  const updateWidgets = useCallback((newWidgets: Widget[]) => {
    setWidgets(newWidgets);
    setWidgetsPreferences(newWidgets);
  }, []);

  const updateWidget = useCallback((id: WidgetId, updates: Partial<Widget>) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    );
  }, []);

  const setWidgetsPreferences = useCallback((widgetsArr: Widget[]) => {
    widgetsArr.forEach((w, idx) => {
      const prefKey = widgetIdToPrefKey(w.id);
      if (prefKey) {
        setPreference(prefKey, {
          enabled: w.enabled,
          x: Math.round(w.x ?? 0),
          y: Math.round(w.y ?? 0),
          width: w.width,
          height: w.height,
          index: idx,
        });
      }
      console.log(widgetsArr);
    });
  }, []);

  function widgetIdToPrefKey(id: WidgetId): keyof Preferences | null {
    const map: Record<WidgetId, keyof Preferences> = {
      "driver-positions": "driverPositions",
      "map-and-messages": "mapAndMessages",
      "session-audios": "audioLog",
      "race-control-list": "raceControlLog",
      "circle-of-doom": "circleOfDoom",
      "circle-car-data": "circleCarData",
      "tyres-list": "tyresList",
      chat: "chat",
    };
    return map[id] ?? null;
  }

  const getPreference = useCallback(
    <K extends keyof Preferences>(key: K): Preferences[K] => preferences[key],
    [preferences],
  );

  const setPreference = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      setPreferences((prev) => {
        const updated = { ...prev, [key]: value };
        Cookies.set(cookieName, JSON.stringify(updated), { expires: 365 });
        return updated;
      });
    },
    [],
  );

  // Optional: sync cookie changes (multi-tab)
  useEffect(() => {
    const handleStorage = () => {
      const cookie = Cookies.get(cookieName);
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
      setWidgetsPreferences,
      isResizing,
      setIsResizing,
    }),
    [
      preferences,
      getPreference,
      setPreference,
      isEditMode,
      widgets,
      updateWidget,
      updateWidgets,
      setWidgetsPreferences,
      isResizing,
      setIsResizing,
    ],
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
      "usePreferences must be used within a PreferencesProvider.",
    );
  }
  return context;
}
