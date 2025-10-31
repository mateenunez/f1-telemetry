"use client";

import { Aldrich, Oxanium } from "next/font/google";
import type { ProcessedSession, ProcessedTiming } from "@/processors";
import { useRef } from "react";

const aldrich = Aldrich({ subsets: ["latin"], weight: "400" });
const oxanium = Oxanium({ subsets: ["latin"], weight: "500" });

interface DriverGapsProps {
  timing: ProcessedTiming | undefined;
  session: ProcessedSession | null | undefined;
}

export default function DriverGaps({ timing, session }: DriverGapsProps) {
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
      (lastGap.TimeDiffToFastest !== "" ||
        lastGap.TimeDiffToPositionAhead !== "" ||
        lastGap.GapToLeader !== "" ||
        lastGap.IntervalToPositionAhead !== "")
    ) {
      lastValidGapRef.current = lastGap;
    }
  } else {
    lastGap = lastValidGapRef.current;
  }

  const isRace = session?.session_type === "Race";
  
  const gap1Value = isRace 
    ? (timing?.gap_to_leader || lastGap?.GapToLeader || "")
    : (timing?.time_diff_to_fastest || lastGap?.TimeDiffToFastest || "");
  
  const gap2Value = timing?.interval_to_ahead || lastGap?.IntervalToPositionAhead || "";

  return (
    <div className="flex flex-row justify-around w-full gap-2 items-center">
      <div
        className="flex flex-row text-sm text-white w-[3rem]"
        style={aldrich.style}
      >
        <p style={oxanium.style} className="text-center w-full">
          {gap1Value || "-.---"}
        </p>
      </div>
      
      <div
        className="flex text-sm text-white w-[3rem]"
        style={aldrich.style}
      >
        <p style={oxanium.style} className="text-center w-full">
          {gap2Value || "-.---"}
        </p>
      </div>
    </div>
  );
}