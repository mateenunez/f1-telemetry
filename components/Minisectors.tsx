"use client";

import { Geist, Aldrich, Oxanium, Michroma } from "next/font/google";
import type { ProcessedTiming } from "@/processors";
import { ProcessedTimingStats } from "@/processors/timing-stats-processor";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const aldrich = Aldrich({ subsets: ["latin"], weight: "400" });
const oxanium = Oxanium({subsets: ["latin"], weight:"500"})

interface MinisectorsProps {
  timing: ProcessedTiming | undefined;
  timingStats: ProcessedTimingStats | undefined;
}

export default function Minisectors({ timing, timingStats }: MinisectorsProps) {
  const getMinisectorColor = (segment: number) => {
    if (segment === 2048) return "#ffe066"; // Amarillo
    if (segment === 2049) return "#51cf66"; // Verde
    if (segment === 2051) return "#b197fc"; // Violeta
    return "#cccccc"; // Gris por defecto
  };

  const getSectorTimeColor = (sector: any) => {
    if (sector?.OverallFastest) return "text-f1Purple";
    if (sector?.PersonalFastest) return "text-green-400";
    return "text-f1Yellow";
  };

  const getBestSectorColor = (sector: any) => {
    if (sector?.Position === 1) return "text-purple-500";
    return "text-green-400";
  };

  return (
    <div className="flex flex-row gap-2">
      {/* Minisectores */}
      <div
        className="text-xs text-white"
        style={aldrich.style}
      >
        {(["sector1", "sector2", "sector3"] as const).map(
          (sectorKey, sectorIdx) => {
            const minisectors =
              timing?.sector_segments[sectorKey] || [];
            return (
              <div
                key={sectorKey}
                className="flex gap-1 items-center text-xs text-gray-400"
              >
                S{sectorIdx + 1}
                {minisectors.map(
                  (s: number, sIdx: number) => {
                    const bg = getMinisectorColor(s);
                    return (
                      <span
                        key={`${sectorKey}-${sIdx}`}
                        style={{
                          backgroundColor: bg,
                          width: 10,
                          height: 6,
                          borderRadius: 1.4,
                          padding: 2,
                          display: "inline-block",
                          marginLeft: 2,
                          opacity: 1,
                        }}
                      ></span>
                    );
                  }
                )}
              </div>
            );
          }
        )}
      </div>

      {/* Tiempos de sector */}
      <div
        className="flex items-center flex-col text-xs text-white"
        style={oxanium.style}
      >
        {(["sector1", "sector2", "sector3"] as const).map(
          (sectorKey, idx) => {
            const sector =
              timing?.sector_times[sectorKey];
            const color = getSectorTimeColor(sector);
            const displayValue =
              sector?.Value ??
              sector?.PreviousValue ??
              "--:--";
            return (
              <div
                className="flex flex-row gap-0"
                key={sectorKey}
              >
                <span className={color}>
                  {sector && displayValue}
                </span>
              </div>
            );
          }
        )}
      </div>

      {/* Mejores tiempos de sector */}
      <div
        className="flex items-center flex-col text-xs text-white"
        style={oxanium.style}
      >
        {timingStats?.best_sectors.map(
          (sectorKey, idx) => {
            const sector = timingStats.best_sectors[idx];
            const color = getBestSectorColor(sector);
            const displayValue = sector?.Value ?? "--:--";
            return (
              <div
                className="flex flex-row gap-1"
                key={sectorKey.Value}
              >
                <span className={color}>
                  {sector && displayValue}
                </span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
