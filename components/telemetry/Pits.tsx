"use client";

import type { ProcessedTiming, ProcessedStint } from "@/processors";
import { JSX, useMemo } from "react";
import { getCompoundSvg } from "@/hooks/use-telemetry";

interface PitsProps {
  timing: ProcessedTiming | undefined;
  driverStints: ProcessedStint[] | undefined;
}

export default function Pits({ timing, driverStints }: PitsProps) {
  const previousStintCompounds = useMemo(() => {
    const arr: JSX.Element[] = [];
    if (!driverStints || driverStints.length < 2) return arr;
    for (let i = 0; i <= driverStints.length - 2; i++) {
      const stint = driverStints[i];
      arr.push(getCompoundSvg(stint.compound, i, 13));
    }
    return arr;
  }, [driverStints]);

  return (
    <div className="flex w-full justify-center min-w-[2rem] w-full">
      {/* En PIT */}
      <div className="text-xs text-white self-center m-0 p-0 font-orbitron">
        {timing?.in_pit ? (
          <span className="flex flex-col font-geist">
            <p className="text-f1Blue text-nowrap flex flex-nowrap">IN PIT</p>
            <span className="text-[0.6rem] text-white text-center font-geist">
              {timing?.number_of_pit_stops} PIT
            </span>
          </span>
        ) : (
          <span className="font-geist">
            {driverStints && (
              <div className="flex flex-row gap-0 justify-start flex-wrap">
                {previousStintCompounds}
              </div>
            )}
            {timing?.number_of_pit_stops} PIT
          </span>
        )}
      </div>
    </div>
  );
}
