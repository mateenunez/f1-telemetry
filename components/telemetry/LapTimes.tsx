"use client";

import type { ProcessedTiming, ProcessedTimingStats } from "@/processors";

interface LapTimesProps {
  timing: ProcessedTiming | undefined;
  timingStats: ProcessedTimingStats | undefined;
}

export default function LapTimes({ timing, timingStats }: LapTimesProps) {
  return (
    <div className="flex items-center flex-col text-white">
      {/* Último tiempo de vuelta */}
      <div className="flex items-center flex-row gap-1 text-sm text-white">
        <p className="font-inter">{timing?.last_lap_time || "--.---"}</p>
      </div>
      {/* Mejor tiempo de vuelta */}
      <div className="flex flex-row gap-0">
        <div className="flex items-center flex-row gap-1 text-white">
          <p
            className={`font-inter ${
              timingStats?.personal_best_lap_time.Value
                ? timingStats?.personal_best_lap_time.Position === 1
                  ? "text-purple-500 text-sm"
                  : "text-green-400 text-sm"
                : "text-white text-sm"
            }`}
          >
            {timingStats?.personal_best_lap_time.Value || "--.---"}
          </p>
        </div>
      </div>
    </div>
  );
}
