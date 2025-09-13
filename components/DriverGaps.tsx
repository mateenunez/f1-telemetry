"use client";

import { Aldrich, Oxanium } from "next/font/google";
import type { ProcessedSession, ProcessedTiming } from "@/processors";

const aldrich = Aldrich({ subsets: ["latin"], weight: "400" });
const oxanium = Oxanium({ subsets: ["latin"], weight: "500" });

interface DriverGapsProps {
  timing: ProcessedTiming | undefined;
  session: ProcessedSession | null | undefined;
}

export default function DriverGaps({ timing, session }: DriverGapsProps) {
  const lastGap = timing?.stats?.findLast(stat => stat);
  return (
    <div className="flex flex-col min-w-[8rem] items-center">
      {(timing?.gap_to_leader || (lastGap?.GapToLeader && lastGap?.GapToLeader !== '')) ? (
        <div
          className="flex items-center flex-row gap-2 text-xs text-white"
          style={aldrich.style}
        >
          <span className="text-[0.7rem] text-gray-500">LEADER</span>
          <p style={oxanium.style}>{timing?.gap_to_leader || lastGap?.GapToLeader}</p>
        </div>
      ) : (
        <></>
      )}
      {(timing?.interval_to_ahead || (lastGap?.IntervalToPositionAhead && lastGap?.IntervalToPositionAhead !== '')) ? (
        <div
          className="flex items-center flex-row gap-2 text-xs text-white "
          style={aldrich.style}
        >
          <span className="text-[0.55rem] text-gray-500">POS AHEAD</span>
          <p style={oxanium.style}>{timing?.interval_to_ahead || lastGap?.IntervalToPositionAhead}</p>
        </div>
      ) : (
        <></>
      )}
      {(timing?.time_diff_to_ahead || (lastGap?.TimeDiffToPositionAhead && lastGap?.TimeDiffToPositionAhead !== '')) ? (
        <div
          className="flex items-center flex-row gap-2 text-xs text-white"
          style={aldrich.style}
        >
          <span className="text-[0.55rem] text-gray-500">POS AHEAD</span>
          <p style={oxanium.style}>{timing?.time_diff_to_ahead || lastGap?.TimeDiffToPositionAhead}</p>
        </div>
      ) : (
        <></>
      )}
      {(timing?.time_diff_to_fastest || (lastGap?.TimeDiffToFastest && lastGap?.TimeDiffToFastest !== '')) ? (
        <div
          className="flex items-center flex-row gap-2 text-xs text-white"
          style={aldrich.style}
        >
          <span className="text-[0.55rem] text-gray-500">FASTEST</span>
          <p style={oxanium.style}>{timing?.time_diff_to_fastest || lastGap?.TimeDiffToFastest}</p>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
