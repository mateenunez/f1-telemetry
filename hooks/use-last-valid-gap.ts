import { useRef } from "react";
import type { ProcessedSession, ProcessedTiming, TimingStat } from "@/processors";

export function useLastValidGap(
  timing: ProcessedTiming | undefined,
  session: ProcessedSession | null | undefined,
  validityFields: (keyof TimingStat)[],
): TimingStat | undefined {
  const lastValidGapRef = useRef<TimingStat | undefined>(undefined);

  const qualifyingPartIndex = session?.series?.findLast(
    (q) => q,
  )?.QualifyingPart;

  let lastGap: TimingStat | undefined;

  if (
    timing?.stats &&
    timing.stats.length > 0 &&
    qualifyingPartIndex !== undefined
  ) {
    const candidate = timing.stats[qualifyingPartIndex - 1];
    if (
      candidate &&
      validityFields.some((field) => candidate[field] !== "")
    ) {
      lastValidGapRef.current = candidate;
    }
    lastGap = candidate;
  } else {
    lastGap = lastValidGapRef.current;
  }

  return lastGap;
}
