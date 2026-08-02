import { useEffect, useMemo, useRef, useState } from "react";
import {
  ProcessedDriver,
  ProcessedPositionData,
  ProcessedTiming,
} from "@/processors";
import {
  fetchMap,
  buildTrackProgressIndex,
  getTrackProgress,
  TrackProgressIndex,
} from "@/processors/map-processor";

type LinealDriverPositionsProps = {
  positions: ProcessedPositionData[];
  drivers: (ProcessedDriver | undefined)[];
  timing: (ProcessedTiming | undefined)[];
  circuitKey: number;
  favoriteDrivers?: ProcessedDriver[];
  onReady?: () => void;
};

type DriverProgress = {
  driver: ProcessedDriver;
  timing: ProcessedTiming | undefined;
  progress: number;
};

export default function LinealDriverPositions({
  positions,
  drivers,
  timing,
  circuitKey,
  favoriteDrivers,
  onReady,
}: LinealDriverPositionsProps) {
  const [progressIndex, setProgressIndex] =
    useState<TrackProgressIndex | null>(null);

  const favorites = new Set(
    favoriteDrivers?.map((d) => d.driver_number) || []
  );

  useEffect(() => {
    (async () => {
      if (!circuitKey) return;
      try {
        const mapJson = await fetchMap(circuitKey);
        if (!mapJson) return;
        setProgressIndex(buildTrackProgressIndex(mapJson));
      } finally {
        onReady?.();
      }
    })();
  }, [circuitKey]);

  const driverProgress = useMemo<DriverProgress[]>(() => {
    if (!progressIndex || !positions?.length) return [];

    const result: DriverProgress[] = [];

    for (const pos of positions) {
      const driver = drivers?.find((d) => d?.driver_number === pos.driver_number);
      if (!driver) continue;
      const tim = timing.find((t) => t?.driver_number === pos.driver_number);
      // Only running cars belong on the line: drivers that have retired,
      // stopped, or been knocked out are no longer part of the field.
      if (tim?.retired || tim?.stopped || tim?.knockedOut) continue;
      const progress = getTrackProgress(pos.X, pos.Y, progressIndex);
      result.push({ driver, timing: tim, progress });
    }

    return result.sort((a, b) => a.progress - b.progress);
  }, [progressIndex, positions, drivers, timing]);

  // A driver crossing the start/finish line jumps from progress ~1 back to
  // ~0. Left this as a normal CSS transition and the dot visibly flies
  // backwards across the whole line instead of teleporting. Detect that
  // wrap-around per driver (a large backward jump vs. its last known
  // progress) and drop the transition for just that one render.
  const prevProgressRef = useRef<Map<number, number>>(new Map());

  const driverLayout = useMemo(() => {
    return driverProgress.map((entry) => {
      const prev = prevProgressRef.current.get(entry.driver.driver_number);
      const wrapped = prev !== undefined && entry.progress < prev - 0.5;
      return { ...entry, wrapped };
    });
  }, [driverProgress]);

  useEffect(() => {
    const prevProgress = prevProgressRef.current;
    for (const { driver, progress } of driverProgress) {
      prevProgress.set(driver.driver_number, progress);
    }
  }, [driverProgress]);

  if (!progressIndex) return null;

  return (
    <div className="w-full h-full flex items-center justify-center px-8">
      <div className="relative w-full h-12">
        <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-gray-700 -translate-y-1/2 rounded-full" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[4px] h-5 rounded-sm"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, #fff 0px, #fff 4px, #000 4px, #000 8px)",
          }}
        />

        {driverLayout.map(({ driver, progress, wrapped }) => {
          const isFavorite = favorites.size === 0 || favorites.has(driver.driver_number);

          return (
            <div
              key={`lineal.driver.${driver.driver_number}`}
              className="absolute flex flex-col items-center transition-all duration-1000 ease-linear"
              style={{
                left: `${progress * 100}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                opacity: isFavorite ? 1 : 0.5,
                transitionProperty: wrapped ? "none" : undefined,
              }}
            >
              <span
                className="w-3 h-3 rounded-full border border-black"
                style={{
                  background: driver.team_colour
                    ? `radial-gradient(circle at 35% 35%, #${driver.team_colour}, #${driver.team_colour} 60%, rgba(0,0,0,0.3) 100%)`
                    : "#666",
                  filter: "drop-shadow(0 0 4px rgba(0,0,0,0.8))",
                }}
              />
              <span
                className="text-[10px] font-bold font-f1-regular mt-1 whitespace-nowrap"
                style={{
                  color: driver.team_colour
                    ? `#${driver.team_colour}`
                    : "#e5e7eb",
                }}
              >
                {driver.name_acronym}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
