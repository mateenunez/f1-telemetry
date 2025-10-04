import { useState, useEffect, useMemo } from "react";
import { TelemetryManager, type TelemetryData } from "../telemetry-manager";
import { findYellowSectors } from "@/hooks/use-raceControl";

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
  const [telemetryManager] = useState(() => new TelemetryManager());
  const [pinnedDriver, setPinnedDriver] = useState<number | null>(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "";
    telemetryManager.connect(wsUrl, (data: TelemetryData) => {
      setTelemetryData(data);
    });
    return () => {
      telemetryManager.disconnect();
    };
  }, [telemetryManager]);

  useEffect(() => {
    if (telemetryData) setLoading(false);
  }, [telemetryData]);

  // Utilidades memoizadas
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

  const safetyCarActive = useMemo(() => {
    const latestMessage = telemetryData?.raceControl?.[0];
    if (!latestMessage) return null;
    if (
      latestMessage.category === "SafetyCar" &&
      latestMessage.status === "Deployed"
    ) {
      if (latestMessage.mode === "VIRTUAL SAFETY CAR") return "VSC";
      else return "SC";
    } else return null;
  }, [telemetryData?.raceControl]);

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
    safetyCarActive,
  };
}
