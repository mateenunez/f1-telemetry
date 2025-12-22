"use client";

import { ProcessedStint } from "@/processors";
import { getCompoundSvg } from "@/hooks/use-telemetry";

interface TyresProps {
  driverStints: ProcessedStint[] | undefined;
}

export default function Tyres({ driverStints }: TyresProps) {
  const currentStint = driverStints
    ? driverStints[driverStints.length - 1]
    : undefined;

  return (
    <div className="flex items-center flex-row text-xs gap-2 lg:p-0 min-w-[3rem] justify-center font-geist">
      {currentStint && (
        <div className="flex flex-col items-center justify-center text-gray-500">
          {getCompoundSvg(currentStint.compound, 0, 30)}
          <p>{currentStint.total_laps} L</p>
        </div>
      )}
    </div>
  );
}
