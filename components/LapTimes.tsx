"use client";

import { Geist, Anta } from "next/font/google";
import type { ProcessedTiming } from "@/processors";
import { ProcessedTimingStats } from "@/processors/timing-stats-processor";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const regularAnta = Anta({ subsets: ["latin"], weight: "400" });

interface LapTimesProps {
  timing: ProcessedTiming | undefined;
  timingStats: ProcessedTimingStats | undefined;
}

export default function LapTimes({ timing, timingStats }: LapTimesProps) {
  return (
    <div className="flex items-start flex-col text-white">
      {/* Último tiempo de vuelta */}
      <div
        className="flex items-center flex-row gap-2 text-xs text-white"
        style={regularAnta.style}
      >
        <span className="text-xxs text-gray-300">
          LAP {timing?.number_of_laps}
        </span>
        <p style={mediumGeist.style}>
          {timing?.last_lap_time || "---:---"}
        </p>
      </div>

      {/* Mejor tiempo de vuelta */}
      <div className="flex flex-row gap-2">
        <div
          className="flex items-center flex-row gap-2 text-xs text-white"
          style={regularAnta.style}
        >
          <span className="text-xxs text-gray-300">
            LAP {timingStats?.personal_best_lap_time.Lap}
          </span>
          <p
            className={
              timingStats?.personal_best_lap_time.Position === 1
                ? "text-purple-500"
                : "text-green-400"
            }
            style={mediumGeist.style}
          >
            {timingStats?.personal_best_lap_time.Value || "---:---"}
          </p>
        </div>
      </div>
    </div>
  );
}
