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
      <div className="bg-warmBlack">
        <Header telemetryData={telemetryData} dict={dict} />
        <div className="flex flex-row w-full h-full">
          {/* Left list - 30% width */}
          <div className="w-25%] max-h-screen overflow-y-auto px-2 py-3">
            <div className="flex flex-col gap-2">
              {currentPositions.map((pos, idx) => {
                const driver = driverInfos[idx];
                const timing = driverTimings[idx];
                return (
                  <div
                    key={pos.driver_number}
                    className="rounded-md bg-[#0d0d0d] px-2 py-2"
                  >
                    <div className="flex flex-row items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <DriverPositionInfo
                          position={pos}
                          driver={driver}
                          isPlaying={undefined}
                        />
                      </div>
                      <div className="w-[7.5rem] shrink-0">
                        <DriverGaps
                          timing={timing}
                          session={telemetryData.session}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Map - 70% width */}
          <div className="w-[75%] flex items-center justify-center">
            <Map
              positions={telemetryData.positionData}
              drivers={telemetryData.drivers}
              timing={telemetryData.timing}
              circuitKey={telemetryData.session.circuit_key}
              yellowSectors={yellowSectors}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default LiveMapContent;
