"use client";

import type { ProcessedSession, ProcessedTiming } from "@/processors";
import { useRef } from "react";

interface DriverGap1Props {
  timing: ProcessedTiming | undefined;
  session: ProcessedSession | null | undefined;
}

export default function DriverGap1({ timing, session }: DriverGap1Props) {
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
      (lastGap.TimeDiffToFastest !== "" || lastGap.GapToLeader !== "")
    ) {
      lastValidGapRef.current = lastGap;
    }
  } else {
    lastGap = lastValidGapRef.current;
  }

  const isRace = session?.session_type === "Race";

  const gap1Value = isRace
    ? timing?.gap_to_leader || lastGap?.GapToLeader || ""
    : timing?.time_diff_to_fastest || lastGap?.TimeDiffToFastest || "";

  return (
    <div className="flex flex-row text-sm text-white w-[3rem] justify-center w-full">
      <p className="font-inter text-center w-full">
        {gap1Value || "-.---"}
      </p>
    </div>
  );
}
