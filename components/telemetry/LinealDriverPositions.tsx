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

// Minimum horizontal gap (px) between two driver dots so their acronym
// labels never overlap, regardless of how close their track progress is.
const MIN_GAP_PX = 26;

function spreadPositions(rawX: number[], maxX: number): number[] {
  const x = [...rawX];

  for (let i = 1; i < x.length; i++) {
    if (x[i] < x[i - 1] + MIN_GAP_PX) x[i] = x[i - 1] + MIN_GAP_PX;
  }

  if (x.length && x[x.length - 1] > maxX) {
    x[x.length - 1] = maxX;
    for (let i = x.length - 2; i >= 0; i--) {
      if (x[i] > x[i + 1] - MIN_GAP_PX) x[i] = x[i + 1] - MIN_GAP_PX;
    }
  }

  return x;
}

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
  const lineRef = useRef<HTMLDivElement>(null);
  const [lineWidth, setLineWidth] = useState(0);

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

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setLineWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [progressIndex]);

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

  const driverLayout = useMemo(() => {
    if (!lineWidth) return [];

    const rawX = driverProgress.map(({ progress }) => progress * lineWidth);
    const x = spreadPositions(rawX, lineWidth);

    return driverProgress.map((entry, idx) => ({ ...entry, x: x[idx] }));
  }, [driverProgress, lineWidth]);

  if (!progressIndex) return null;

  return (
    <div className="w-full h-full flex items-center justify-center px-8">
      <div ref={lineRef} className="relative w-full h-12">
        <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-gray-700 -translate-y-1/2 rounded-full" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[3px] h-4 bg-white rounded-full" />

        {driverLayout.map(({ driver, x }) => {
          const isFavorite = favorites.size === 0 || favorites.has(driver.driver_number);

          return (
            <div
              key={`lineal.driver.${driver.driver_number}`}
              className="absolute flex flex-col items-center transition-all duration-1000 ease-linear"
              style={{
                left: `${x}px`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                opacity: isFavorite ? 1 : 0.5,
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
