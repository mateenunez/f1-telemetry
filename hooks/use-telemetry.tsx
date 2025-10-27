import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { TelemetryManager, type TelemetryData } from "../telemetry-manager";
import { findYellowSectors } from "@/hooks/use-raceControl";
import { usePreferences } from "@/context/preferences";
import { getAboutToBeEliminatedDrivers } from "@/utils/telemetry";

interface QueuedMessage {
  data: TelemetryData;
  releaseTime: number;
}

export const getCompoundSvg = (
  compound: string,
  idx: number,
  iconSize: number
) => {
  const iconMap: Record<string, string> = {
    SOFT: "/soft.svg",
    MEDIUM: "/medium.svg",
    HARD: "/hard.svg",
    INTERMEDIATE: "/intermediate.svg",
    WET: "/wet.svg",
  };
  const key = (compound || "").toUpperCase();
  const src = iconMap[key] || "/unknown.svg";
  if (src === "unknown.svg") console.log("Unknown compound type: ", compound);
  return (
    <img
      src={src}
      alt={key}
      key={key + idx}
      width={iconSize}
      height={iconSize}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    />
  );
};

export function useTelemetryManager() {
  const [telemetryData, setTelemetryData] = useState<TelemetryData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { preferences } = usePreferences();
  const [telemetryManager] = useState(() => new TelemetryManager());
  const [pinnedDriver, setPinnedDriver] = useState<number | null>(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [delayed, setDelayed] = useState(true);
  const messageQueue = useRef<QueuedMessage[]>([]);
  const telemetryDataCallback = useRef(setTelemetryData);
  const delayDurationMs = preferences.delay * 1000;
  const PROCESS_INTERVAL_MS = 100;

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "";

    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    messageQueue.current = [];
    setDelayed(true);

    telemetryManager.connect(wsUrl, (data: TelemetryData) => {
      if (delayDurationMs === 0) {
        if (delayed) setDelayed(false);
        telemetryDataCallback.current(data);
        return;
      }

      const releaseTime = Date.now() + delayDurationMs;
      messageQueue.current.push({ data: data, releaseTime: releaseTime });
    });

    intervalId = setInterval(processQueue, PROCESS_INTERVAL_MS);
    timeoutId = setTimeout(() => {
      setDelayed(false);
    }, delayDurationMs);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
      telemetryManager.disconnect();
    };
  }, [telemetryManager, delayDurationMs]);

  useEffect(() => {
    if (telemetryData) setLoading(false);
  }, [telemetryData]);

  const processQueue = useCallback(() => {
    const now = Date.now();
    const queue = messageQueue.current;

    while (queue.length > 0 && queue[0].releaseTime <= now) {
      const message = queue.shift();
      if (message) {
        telemetryDataCallback.current(message.data);
      }
    }
  }, []);

  const currentPositions = useMemo(() => {
    if (!telemetryData?.positions) return [];
    return telemetryData.positions
      .filter((p) => p.position >= 1 && p.position <= 20)
      .sort((a, b) => {
        return a.position - b.position;
      });
  }, [telemetryData?.positions, pinnedDriver]);

  const handlePinnedDriver = useMemo(
    () => (driverNumber: number | null) => {
      setPinnedDriver(pinnedDriver === driverNumber ? null : driverNumber);
    },
    [pinnedDriver]
  );

  const handleMapFullscreen = useMemo(
    () => () => {
      setMapFullscreen((prev) => !prev);
    },
    []
  );

  const driverInfos = useMemo(
    () =>
      currentPositions.map((pos) =>
        telemetryData?.drivers.find(
          (d) => d.driver_number === pos.driver_number
        )
      ),
    [currentPositions, telemetryData?.drivers]
  );

  const driverTimings = useMemo(
    () =>
      currentPositions.map((pos) =>
        telemetryData?.timing.find((t) => t.driver_number === pos.driver_number)
      ),
    [currentPositions, telemetryData?.timing]
  );

  const driverCarData = useMemo(
    () =>
      currentPositions.map((pos) =>
        telemetryData?.carData.find(
          (c) => c.driver_number === pos.driver_number
        )
      ),
    [currentPositions, telemetryData?.carData]
  );

  const driverTimingStats = useMemo(
    () =>
      currentPositions.map((pos) =>
        telemetryData?.timingStats.find(
          (c) => c.driver_number === pos.driver_number
        )
      ),
    [currentPositions, telemetryData?.timingStats]
  );

  const driverStints = useMemo(
    () =>
      currentPositions.map((pos) =>
        telemetryManager.getDriverStints(pos.driver_number)
      ),
    [currentPositions, telemetryManager]
  );

  const teamRadioCaptures = useMemo(
    () => telemetryManager.getTeamRadioCaptures(),
    [currentPositions, telemetryManager]
  );

  const yellowSectors = useMemo(
    () => findYellowSectors(telemetryData?.raceControl),
    [telemetryData?.raceControl]
  );

  const aboutToBeEliminated = useMemo(() => getAboutToBeEliminatedDrivers(currentPositions, telemetryData?.session, telemetryData?.timing), [telemetryData?.positions])


  return {
    telemetryData,
    loading,
    driverInfos,
    driverCarData,
    driverTimings,
    driverStints,
    driverTimingStats,
    teamRadioCaptures,
    currentPositions,
    yellowSectors,
    pinnedDriver,
    handlePinnedDriver,
    mapFullscreen,
    handleMapFullscreen,
    delayed,
    aboutToBeEliminated
  };
}
