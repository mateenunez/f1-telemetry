"use client";

import { Geist, Aldrich, Oxanium } from "next/font/google";
import type { ProcessedTiming, ProcessedTimingStats } from "@/processors";

const aldrich = Aldrich({ subsets: ["latin"], weight: "400" });
const oxanium = Oxanium({ subsets: ["latin"], weight: "500" });

interface MinisectorsProps {
  timing: ProcessedTiming | undefined;
  timingStats: ProcessedTimingStats | undefined;
}

export default function Minisectors({ timing, timingStats }: MinisectorsProps) {
  const getMinisectorColor = (segment: number) => {
    if (
      segment === 2048 ||
      segment === 2050 ||
      segment === 2052 ||
      segment === 2068
    )
      return "#ffdd54ff"; // Amarillo
    if (segment === 2049) return "#51cf66"; // Verde
    if (segment === 2051) return "#A855F7"; // Violeta
    if (segment === 2064) return "#2b7fff"; // Azul
    return "#636363"; // Gris por defecto
  };

  const getSectorTimeColor = (sector: any) => {
    if (!sector || !sector.PreviousValue) return "text-f1Yellow";
    if (sector?.OverallFastest) return "text-f1Purple";
    if (sector?.PersonalFastest) return "text-green-400";
    return "text-f1Yellow";
  };

  const getBestSectorColor = (sector: any) => {
    if (!sector) return "text-white";
    if (sector?.Position === 1) return "text-purple-500";
    return "text-green-400";
  };

  return (
    <div className="flex flex-row min-w-[13rem] justify-center gap-2">
      {/* Minisectores */}
      <div className="text-xs text-white" style={aldrich.style}>
        {(["sector1", "sector2", "sector3"] as const).map(
          (sectorKey, sectorIdx) => {
            const minisectors = timing?.sector_segments[sectorKey] || [];
            return (
              <div
                key={sectorKey}
                className="flex gap-1 items-center text-xs text-gray-500 h-[1rem]"
              >
                {minisectors.map((s: number, sIdx: number) => {
                  const bg = getMinisectorColor(s);
                  return (
                    <span
                      key={`${sectorKey}-${sIdx}`}
                      style={{
                        backgroundColor: bg,
                        width: 8,
                        height: 5,
                        borderRadius: 4,
                        stroke: bg,
                        strokeWidth: 4,
                        padding: 2,
                        display: "inline-block",
                        marginLeft: 2,
                        opacity: 1,
                      }}
                    ></span>
                  );
                })}
              </div>
            );
          }
        )}
      </div>

      {/* Tiempos de sector */}
      <div
        className="flex items-center flex-col text-xs text-white min-w-[2.5rem]"
        style={oxanium.style}
      >
        {(["sector1", "sector2", "sector3"] as const).map((sectorKey, idx) => {
          const sector = timing?.sector_times[sectorKey];
          const color = getSectorTimeColor(sector);
          const displayValue =
            sector?.Value ?? sector?.PreviousValue ?? "--.---";
          return (
            <div className="flex flex-row gap-0" key={sectorKey}>
              <span className={color}>{sector && displayValue || "--.---"}</span>
            </div>
          );
        })}
      </div>

      {/* Mejores tiempos de sector */}
      <div
        className="flex items-center flex-col text-xs min-w-[2.5rem]"
        style={oxanium.style}
      >
        {timingStats?.best_sectors.map((sectorKey, idx) => {
          const sector = timingStats.best_sectors[idx];
          const color = getBestSectorColor(sector);
          const displayValue = sector?.Value ?? "--:--";
          return (
            <div className="flex flex-row gap-0" key={idx}>
              <span className={color}>{sector && displayValue || "--.---"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
