"use client";

import type { ProcessedSession, ProcessedTiming } from "@/processors";
import { useLastValidGap } from "@/hooks/use-last-valid-gap";

interface DriverGap2Props {
  timing: ProcessedTiming | undefined;
  session: ProcessedSession | null | undefined;
}

export default function DriverGap2({ timing, session }: DriverGap2Props) {
  const lastGap = useLastValidGap(timing, session, [
    "IntervalToPositionAhead",
    "TimeDiffToPositionAhead",
  ]);

  const gap2Value =
    timing?.interval_to_ahead || lastGap?.IntervalToPositionAhead || "";

  return (
    <div className="flex text-sm text-white w-[3rem] justify-center w-full">
      <p className="font-inter text-center w-full">
        {gap2Value || "-.---"}
      </p>
    </div>
  );
}
