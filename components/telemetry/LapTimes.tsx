"use client";

import { Aldrich, Oxanium } from "next/font/google";
import type { ProcessedTiming, ProcessedTimingStats } from "@/processors";

const aldrich = Aldrich({ subsets: ["latin"], weight: "400" });
const oxanium = Oxanium({ subsets: ["latin"], weight: "500" });

interface LapTimesProps {
  timing: ProcessedTiming | undefined;
  timingStats: ProcessedTimingStats | undefined;
}

export default function LapTimes({ timing, timingStats }: LapTimesProps) {
  return (
    <div className="flex items-center flex-col text-white">
      {/* Último tiempo de vuelta */}
      <div
        className="flex items-center flex-row gap-1 text-sm text-white"
        style={aldrich.style}
      >
        <p style={oxanium.style}>{timing?.last_lap_time || "--.---"}</p>
      </div>
      {/* Mejor tiempo de vuelta */}
      <div className="flex flex-row gap-0">
        <div
          className="flex items-center flex-row gap-1 text-white"
          style={aldrich.style}
        >
          <p
            className={
              timingStats?.personal_best_lap_time.Value
                ? timingStats?.personal_best_lap_time.Position === 1
                  ? "text-purple-500 text-sm"
                  : "text-green-400 text-sm"
                : "text-white text-sm"
            }
            style={oxanium.style}
          >
            {timingStats?.personal_best_lap_time.Value || "--.---"}
          </p>
        </div>
      </div>
    </div>
  );
}
