"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Geist } from "next/font/google";
import Map from "@/components/Map";
import Header from "@/components/Header";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DriverPositions from "@/components/DriverPositions";
import MapAndMessages from "@/components/MapAndMessages";
import { useTelemetryManager } from "@/hooks/use-telemetry";
import Footer from "@/components/Footer";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

export default function F1Dashboard() {
  const {
    telemetryData,
    loading,
    driverInfos,
    driverCarData,
    driverTimings,
    driverStints,
    driverTimingStats,
    lastCaptures,
    currentPositions,
    yellowSectors,
    pinnedDriver,
    handlePinnedDriver,
    mapFullscreen,
    handleMapFullscreen,
    safetyCarActive,
  } = useTelemetryManager();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warmBlack to-warmBlack2 px-2">
        <div className="max-w-8xl mx-auto space-y-4 h-full">
          <SkeletonTheme baseColor="#151515ff" highlightColor="#444">
            {/* Header Skeleton */}
            <div className="flex flex-row justify-between items-center w-full px-6 py-4 mb-4">
              <Skeleton height={60} width="40vw" />
              <Skeleton height={60} width="25vw" />
            </div>
            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 pb-4">
              {/* Posiciones Skeleton */}
              <Card className="lg:col-span-6 bg-warmBlack1 border-none max-h-screen px-2">
                <CardContent className="overflow-x-auto flex-1 max-h-[90vh] h-full p-0">
                  <div className="space-y-2">
                    {Array.from({ length: 20 }).map((_, idx) => (
                      <Skeleton key={idx} height={60} width="100%" />
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Mapa y Race Control Skeleton */}
              <Card className="lg:col-span-4 bg-warmBlack1 border-none border-2 flex flex-col mt-8">
                <CardHeader className="pb-3 flex flex-row items-center justify-between ml-4">
                  <Skeleton height={32} width={180} />
                  <Skeleton height={32} width={120} />
                </CardHeader>
                <CardContent className="flex flex-col justify-center h-full">
                  <div className="overflow-hidden h-fit">
                    <Skeleton height={400} width="100%" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </SkeletonTheme>
        </div>
      </div>
    );
  }

  const session = telemetryData?.session;

  if (
    mapFullscreen &&
    telemetryData?.session?.circuit_key &&
    telemetryData.session
  ) {
    return (
      <div
        className="fixed inset-0 bg-warmBlack z-50 bg-flex items-center justify-center"
        onDoubleClick={handleMapFullscreen}
      >
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-warmBlack to-warmBlack2 px-2">
      <div className="max-w-8xl mx-auto space-y-4 h-full">
        {/* Header */}
        <Header telemetryData={telemetryData} />
        {/* Safety Car Alert*/}
        <div
          className="text-f1Yellow text-sm trasition-all flex h-4 justify-center duration-500 text-center"
          style={mediumGeist.style}
        >
          {safetyCarActive}
        </div>
        {/* Cards */}
        <div
          className={`!mt-0 grid grid-cols-1 lg:grid-cols-10 pb-4 border-2 rounded-lg transition-all duration-500 ease-in-out ${
            safetyCarActive ? "border-f1Yellow" : "border-transparent"
          }`}
        >
          {/* Posiciones Actuales */}
          <DriverPositions
            positions={currentPositions}
            driverInfos={driverInfos}
            driverTimings={driverTimings}
            driverTimingStats={driverTimingStats}
            driverCarData={driverCarData}
            driverStints={driverStints}
            lastCaptures={lastCaptures}
            pinnedDriver={pinnedDriver}
            handlePinnedDriver={handlePinnedDriver}
            session={session}
          />

          {/* Mapa en tiempo real y race control */}
          <MapAndMessages
            telemetryData={telemetryData}
            session={session}
            yellowSectors={yellowSectors}
            handleMapFullscreen={handleMapFullscreen}
          />
        </div>
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
