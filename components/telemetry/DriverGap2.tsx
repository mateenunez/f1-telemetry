"use client";

import type { ProcessedSession, ProcessedTiming } from "@/processors";
import { useRef } from "react";

interface DriverGap2Props {
  timing: ProcessedTiming | undefined;
  session: ProcessedSession | null | undefined;
}

export default function DriverGap2({ timing, session }: DriverGap2Props) {
  const lastValidGapRef = useRef<any>(null);

  let lastGap;
  const qualifyingPartIndex = session?.series?.findLast(
    (q) => q
  )?.QualifyingPart;

  if (
    timing?.stats &&
    timing?.stats.length > 0 &&
    qualifyingPartIndex !== undefined
  ) {
    lastGap = timing.stats[qualifyingPartIndex - 1];

    if (
      lastGap &&
      (lastGap.IntervalToPositionAhead !== "" ||
        lastGap.TimeDiffToPositionAhead !== "")
    ) {
      lastValidGapRef.current = lastGap;
    }
  } else {
    lastGap = lastValidGapRef.current;
  }

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
