"use client";

import React from "react";
import Map from "./Map";
import { useTelemetryManager } from "@/hooks/use-telemetry";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import DriverPositionInfo from "./DriverPositionInfo";
import DriverGaps from "./DriverGaps";
import Header from "./Header";

export function LiveMapContent({ dict }: { dict: any }) {
  const {
    telemetryData,
    yellowSectors,
    loading,
    currentPositions,
    driverInfos,
    driverTimings,
  } = useTelemetryManager();

  if (loading || !telemetryData?.session?.circuit_key) {
    return (
      <SkeletonTheme baseColor="#151515ff" highlightColor="#444">
        <div className="bg-warmBlack flex items-center justify-center min-h-[calc(100vh-200px)] blur-sm">
          <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <Skeleton className="rounded-lg" width="100%" height={700} />
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  if (telemetryData.session) {
    return (
      <div className="bg-warmBlack min-h-screen">
        <Header telemetryData={telemetryData} dict={dict} />
        <div className=" w-full flex items-center justify-center">
          <Map
            positions={telemetryData.positionData}
            drivers={telemetryData.drivers}
            timing={telemetryData.timing}
            circuitKey={telemetryData.session.circuit_key}
            yellowSectors={yellowSectors}
          />
        </div>
      </div>
    );
  }
}

export default LiveMapContent;
