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

  return (
    <div className="flex flex-row justify-between min-w-[8rem] items-center">
      {timing?.gap_to_leader ||
      (lastGap?.GapToLeader && lastGap?.GapToLeader !== "") ? (
        <div
          className="flex items-center flex-row gap-2 text-sm text-white"
          style={aldrich.style}
        >
          <p style={oxanium.style}>
            {timing?.gap_to_leader || lastGap?.GapToLeader || "-.---"}
          </p>
        </div>
      ) : (
        <></>
      )}
      {timing?.time_diff_to_fastest ||
      (lastGap?.TimeDiffToFastest && lastGap?.TimeDiffToFastest !== "") ? (
        <div
          className="flex items-center flex-row gap-2 text-sm text-white"
          style={aldrich.style}
        >
          <p style={oxanium.style}>
            {timing?.time_diff_to_fastest || lastGap?.TimeDiffToFastest}
          </p>
        </div>
      ) : (
        <></>
      )}
      {timing?.interval_to_ahead ||
      (lastGap?.IntervalToPositionAhead &&
        lastGap?.IntervalToPositionAhead !== "") ? (
        <div
          className="flex items-center flex-row gap-2 text-sm text-white "
          style={aldrich.style}
        >
          <p style={oxanium.style}>
            {timing?.interval_to_ahead || lastGap?.IntervalToPositionAhead}
          </p>
        </div>
      ) : (
        <></>
      )}
      {timing?.time_diff_to_ahead ||
      (lastGap?.TimeDiffToPositionAhead &&
        lastGap?.TimeDiffToPositionAhead !== "") ? (
        <div
          className="flex items-center flex-row gap-2 text-sm text-white"
          style={aldrich.style}
        >
          <p style={oxanium.style}>
            {timing?.time_diff_to_ahead || lastGap?.TimeDiffToPositionAhead}
          </p>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
