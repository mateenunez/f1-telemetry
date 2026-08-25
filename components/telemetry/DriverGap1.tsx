"use client";

import type { ProcessedSession, ProcessedTiming } from "@/processors";
import { useLastValidGap } from "@/hooks/use-last-valid-gap";

interface DriverGap1Props {
  timing: ProcessedTiming | undefined;
  session: ProcessedSession | null | undefined;
}

export default function DriverGap1({ timing, session }: DriverGap1Props) {
  const lastGap = useLastValidGap(timing, session, [
    "TimeDiffToFastest",
    "GapToLeader",
  ]);

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
