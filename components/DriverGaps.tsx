"use client";

import { Geist, Anta } from "next/font/google";
import type { ProcessedTiming } from "@/processors";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const regularAnta = Anta({ subsets: ["latin"], weight: "400" });

interface DriverGapsProps {
  timing: ProcessedTiming | undefined;
}

export default function DriverGaps({ timing }: DriverGapsProps) {
  return (
    <div className="flex flex-col items-start min-w-[8rem]">
      {timing?.gap_to_leader ? (
        <div
          className="flex items-center flex-row gap-2 text-xs text-white"
          style={regularAnta.style}
        >
          <span className="text-xxs text-gray-300">
            GAP LEADER
          </span>
          <p style={mediumGeist.style}>
            {timing?.gap_to_leader}
          </p>
        </div>
      ) : (
        <></>
      )}
      {timing?.interval_to_ahead ? (
        <div
          className="flex items-center flex-row gap-2 text-xs text-white"
          style={regularAnta.style}
        >
          <span className="text-xxs text-gray-300">
            GAP AHEAD
          </span>
          <p style={mediumGeist.style}>
            {timing?.interval_to_ahead}
          </p>
        </div>
      ) : (
        <></>
      )}
      {timing?.time_diff_to_ahead ? (
        <div
          className="flex items-center flex-row gap-2 text-xs text-white"
          style={regularAnta.style}
        >
          <span className="text-xxs text-gray-300">
            TIME AHEAD
          </span>
          <p style={mediumGeist.style}>
            {timing?.time_diff_to_ahead}
          </p>
        </div>
      ) : (
        <></>
      )}
      {timing?.time_diff_to_fastest ? (
        <div
          className="flex items-center flex-row gap-2 text-xs text-white"
          style={regularAnta.style}
        >
          <span className="text-xxs text-gray-300">
            TIME FASTEST
          </span>
          <p style={mediumGeist.style}>
            {timing?.time_diff_to_fastest}
          </p>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
