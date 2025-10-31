"use client";

import React from "react";
import Map from "./Map";
import { useTelemetryManager } from "@/hooks/use-telemetry";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

export function LiveMapContent() {
  const { telemetryData, yellowSectors, loading } = useTelemetryManager();
  if (loading || !telemetryData?.session?.circuit_key) {
    return (
      <SkeletonTheme baseColor="#151515ff" highlightColor="#444">
        <div className="bg-warmBlack flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <Skeleton className="rounded-lg" width="100%" height={700} />
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  if (telemetryData.session) {
    return (
      <div className="bg-warmBlack flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Map
          positions={telemetryData.positionData}
          drivers={telemetryData.drivers}
          timing={telemetryData.timing}
          circuitKey={telemetryData.session.circuit_key}
          yellowSectors={yellowSectors}
        />
      </div>
    );
  }
}

export default LiveMapContent;
