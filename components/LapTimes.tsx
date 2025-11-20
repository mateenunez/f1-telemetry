"use client";

import type { ProcessedTiming, ProcessedTimingStats } from "@/processors";
import { cn } from "@/lib/utils";

interface LapTimesProps {
  timing: ProcessedTiming | undefined;
  timingStats: ProcessedTimingStats | undefined;
}

export default function LapTimes({ timing, timingStats }: LapTimesProps) {
  return (
    <div className="flex items-center flex-col text-white w-[5rem]">
      {/* Último tiempo de vuelta */}
      <div className="flex items-center flex-row gap-1 text-xs text-white font-f1-regular">
        <p className="font-f1-regular">{timing?.last_lap_time || ""}</p>
      </div>
      {/* Mejor tiempo de vuelta */}
      <div className="flex flex-row gap-0">
        <div className="flex items-center flex-row gap-1 text-white font-f1-regular">
          {" "}
          <span className="text-xxs text-gray-500">
            {timingStats?.personal_best_lap_time.Lap}
          </span>
          <p
            className={cn(
              "font-f1-regular text-[10px]",
              timingStats?.personal_best_lap_time.Position === 1
                ? "text-purple-500"
                : "text-green-400"
            )}
          >
            {timingStats?.personal_best_lap_time.Value || ""}
          </p>
        </div>
      </div>
    </div>
  );
}
