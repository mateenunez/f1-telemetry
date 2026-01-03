"use client";

import { ProcessedStint } from "@/processors";
import { getCompoundSvg } from "@/hooks/use-telemetry";

interface TyresProps {
  driverStints: ProcessedStint[] | undefined;
  width?: number;
  iconSize?: number;
}

export default function Tyres({
  driverStints,
  width = 3,
  iconSize = 30,
}: TyresProps) {
  const currentStint = driverStints
    ? driverStints[driverStints.length - 1]
    : undefined;

  return (
    <div
      className={`flex items-center flex-row text-xs gap-2 lg:p-0 min-w-[${width}rem] justify-center font-geist`}
    >
      {currentStint && (
        <div className="flex flex-col items-center justify-center text-white">
          {getCompoundSvg(currentStint.compound, 0, iconSize)}
          <p>{currentStint.total_laps} L</p>
        </div>
      )}
    </div>
  );
}
