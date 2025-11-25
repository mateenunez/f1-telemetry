"use client";

import React from "react";
import Map from "./Map";
import { useTelemetryManager } from "@/hooks/use-telemetry";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import Header from "./Header";
import { Geist } from "next/font/google";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

export function LiveMapContent({ dict }: { dict: any }) {
  const { telemetryData, yellowSectors, loading } = useTelemetryManager();

  if (loading || !telemetryData?.session?.circuit_key) {
    const HeaderSkeleton = () => (
      <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center w-full px-6 py-4 mb-4">
        <Skeleton height={60} width={450} />
        <Skeleton height={60} width={300} />
      </div>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-warmBlack to-warmBlack2 px-2 relative">
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-warmBlack/40 backdrop-blur-sm">
          <span
            className="text-white text-xl text-center"
            style={mediumGeist.style}
          >
            {dict.loading}
          </span>
        </div>
        <SkeletonTheme baseColor="#151515ff" highlightColor="#444">
          <HeaderSkeleton />
          <div className="max-w-6xl mx-auto py-8">
            <Skeleton
              className="rounded-2xl shadow-lg blur-sm"
              height={720}
              width="100%"
            />
          </div>
        </SkeletonTheme>
      </div>
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
