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
  return (
    <div className="flex flex-col items-start min-w-[8rem]">
      {timing?.gap_to_leader && session?.session_type != "Practice" ? (
        <div
          className="flex items-center flex-row gap-2 text-xs text-white"
          style={aldrich.style}
        >
          <span className="text-[0.7rem] text-gray-400">GAP LEADER</span>
          <p style={oxanium.style}>{timing?.gap_to_leader}</p>
        </div>
      ) : (
        <></>
      )}
      {timing?.interval_to_ahead ? (
        <div
          className="flex items-center flex-row gap-2 text-xs text-white "
          style={aldrich.style}
        >
          <span className="text-[0.55rem] text-gray-400">GAP AHEAD</span>
          <p style={oxanium.style}>{timing?.interval_to_ahead}</p>
        </div>
      ) : (
        <></>
      )}
      {timing?.time_diff_to_ahead && session?.session_type == "Practice" ? (
        <div
          className="flex items-center flex-row gap-2 text-xs text-white"
          style={aldrich.style}
        >
          <span className="text-[0.55rem] text-gray-400">TIME AHEAD</span>
          <p style={oxanium.style}>{timing?.time_diff_to_ahead}</p>
        </div>
      ) : (
        <></>
      )}
      {timing?.time_diff_to_fastest && session?.session_type == "Practice" ? (
        <div
          className="flex items-center flex-row gap-2 text-xs text-white"
          style={aldrich.style}
        >
          <span className="text-[0.55rem] text-gray-400">TIME FASTEST</span>
          <p style={oxanium.style}>{timing?.time_diff_to_fastest}</p>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
