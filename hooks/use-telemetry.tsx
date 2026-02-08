import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { type TelemetryData } from "../telemetry-manager";
import { getTelemetryManager } from "../telemetry-manager-singleton";
import { findYellowSectors } from "@/hooks/use-raceControl";
import { usePreferences } from "@/context/preferences";
import { getAboutToBeEliminatedDrivers } from "@/utils/telemetry";
import { config } from "@/lib/config";
import { useAuth } from "./use-auth";

const tyres = config.public.assets.tyres;

interface QueuedMessage {
  data: TelemetryData;
  releaseTime: number;
}

export const getCompoundSvg = (
  compound: string,
  idx: number,
  iconSize: number,
) => {
  const iconMap: Record<string, string> = {
    SOFT: tyres.soft,
    MEDIUM: tyres.medium,
    HARD: tyres.hard,
    INTERMEDIATE: tyres.intermediate,
    WET: tyres.wet,
  };
  const key = (compound || "").toUpperCase();
  const src = iconMap[key] || tyres.unknown;

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
    null,
  );
  const [loading, setLoading] = useState(true);
  const { preferences } = usePreferences();
  const {token} = useAuth();
  const [telemetryManager] = useState(() => getTelemetryManager());
  const [pinnedDriver, setPinnedDriver] = useState<number | null>(null);
  const [delayed, setDelayed] = useState(false);
  const delayedRef = useRef(false);
  const messageQueue = useRef<QueuedMessage[]>([]);
  const telemetryDataCallback = useRef(setTelemetryData);
  const previousDelay = useRef<number>(0);
  const PROCESS_INTERVAL_MS = 100;
  const isSessionFinalisedRef = useRef(false);

  const deltaDelay = useMemo(() => {
    return (previousDelay.current - preferences.delay) * 1000;
  }, [preferences.delay]);

  useEffect(() => {
    delayedRef.current = delayed;
  }, [delayed]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const emptyQueue = messageQueue.current.length === 0;

    if (!emptyQueue && deltaDelay !== 0) updateMessagesQueue();

    telemetryManager.connect(
      config.public.websocket || "",
      (data: TelemetryData) => {
        const sessionFinalised = data?.session?.session_status === "Finalised";
        if (sessionFinalised && !isSessionFinalisedRef.current) {
          isSessionFinalisedRef.current = true;
        }

        if (preferences.delay === 0 || isSessionFinalisedRef.current) {
          if (delayedRef.current) {
            delayedRef.current = false;
            setDelayed(false);
          }
          telemetryDataCallback.current(data);
          if (loading) setLoading(false);
          return;
        }

        const releaseTime = Date.now() + preferences.delay * 1000;
        messageQueue.current.push({ data: data, releaseTime: releaseTime });
      },
      token ? token : "",
    );

    if (
      deltaDelay < 0 &&
      !delayedRef.current &&
      !isSessionFinalisedRef.current
    ) {
      delayedRef.current = true;
      setDelayed(true);
    }

    if (preferences.delay === 0) {
      messageQueue.current = [];
      if (delayedRef.current) {
        delayedRef.current = false;
        setDelayed(false);
      }
    }

    intervalId = setInterval(processQueue, PROCESS_INTERVAL_MS);

    if (delayedRef.current) {
      timeoutId = setTimeout(() => {
        if (delayedRef.current) {
          delayedRef.current = false;
          setDelayed(false);
        }
      }, deltaDelay * -1);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
      telemetryManager.disconnect();
    };
  }, [telemetryManager, deltaDelay]);

  useEffect(() => {
    previousDelay.current = preferences.delay;
  }, [preferences.delay]);

  const processQueue = useCallback(() => {
    const now = Date.now();
    const queue = messageQueue.current;

    while (queue.length > 0 && queue[0].releaseTime <= now) {
      const message = queue.shift();
      if (message) {
        telemetryDataCallback.current(message.data);
        if (loading) setLoading(false);
      }
    }
  }, []);

  const currentPositions = useMemo(() => {
    if (!telemetryData?.positions) return [];
    return telemetryData.positions.sort((a, b) => {
      return a.position - b.position;
    });
  }, [telemetryData?.positions, pinnedDriver]);

  const handlePinnedDriver = useMemo(
    () => (driverNumber: number | null) => {
      setPinnedDriver(pinnedDriver === driverNumber ? null : driverNumber);
    },
    [pinnedDriver],
  );

  const driverInfos = useMemo(
    () =>
      currentPositions.map((pos) =>
        telemetryData?.drivers.find(
          (d) => d.driver_number === pos.driver_number,
        ),
      ),
    [currentPositions, telemetryData?.drivers],
  );

  const driverTimings = useMemo(
    () =>
      currentPositions.map((pos) =>
        telemetryData?.timing.find(
          (t) => t.driver_number === pos.driver_number,
        ),
      ),
    [currentPositions, telemetryData?.timing],
  );

  const driverCarData = useMemo(
    () =>
      currentPositions.map((pos) =>
        telemetryData?.carData.find(
          (c) => c.driver_number === pos.driver_number,
        ),
      ),
    [currentPositions, telemetryData?.carData],
  );

  const driverTimingStats = useMemo(
    () =>
      currentPositions.map((pos) =>
        telemetryData?.timingStats.find(
          (c) => c.driver_number === pos.driver_number,
        ),
      ),
    [currentPositions, telemetryData?.timingStats],
  );

  const driverStints = useMemo(
    () =>
      currentPositions.map((pos) =>
        telemetryManager.getDriverStints(pos.driver_number),
      ),
    [currentPositions, telemetryManager],
  );

  const teamRadioCaptures = useMemo(
    () => telemetryManager.getTeamRadioCaptures(),
    [currentPositions, telemetryManager],
  );

  const yellowSectors = useMemo(
    () => findYellowSectors(telemetryData?.raceControl),
    [telemetryData?.raceControl],
  );

  const aboutToBeEliminated = useMemo(
    () =>
      getAboutToBeEliminatedDrivers(
        currentPositions,
        telemetryData?.session,
        telemetryData?.timing,
      ),
    [
      telemetryData?.positions,
      telemetryData?.session,
      telemetryData?.session?.track_status,
    ],
  );

  const updateMessagesQueue = () => {
    messageQueue.current.forEach((obj) => {
      obj.releaseTime -= deltaDelay;
    });
  };

  return {
    telemetryManager,
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
    delayed,
    deltaDelay,
    aboutToBeEliminated,
  };
}
