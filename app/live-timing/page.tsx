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
import SessionAudios from "@/components/SessionAudios";
import RaceControlList from "@/components/RaceControlList";
import CircleOfDoom from "@/components/CircleOfDoom";
import { usePreferences } from "@/context/preferences";
import { CircleCarData } from "@/components/CircleCarData";

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
    teamRadioCaptures,
    currentPositions,
    yellowSectors,
    pinnedDriver,
    handlePinnedDriver,
    mapFullscreen,
    handleMapFullscreen,
    delayed,
  } = useTelemetryManager();

  const { preferences } = usePreferences();
  const audioLog = preferences.audioLog;
  const raceControlLog = preferences.raceControlLog;
  const circleOfDoom = preferences.circleOfDoom;
  const circleCarData = preferences.circleCarData;

  if (delayed || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warmBlack to-warmBlack2 px-2">
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-warmBlack/40 backdrop-blur-sm">
          <div
            className="rounded-xl text-white text-xl text-center shadow-2xl animate-pulse"
            style={mediumGeist.style}
          >
            Getting things ready...
          </div>
        </div>
        <div className="max-w-8xl mx-auto space-y-4 h-full">
          <SkeletonTheme baseColor="#151515ff" highlightColor="#444">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center w-full px-6 py-4 mb-4">
              <Skeleton
                height={60}
                width="20rem"
                className="w-[40vw] md:w-[20vw]"
              />
              <Skeleton height={60} width="15rem" />
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
              <Card className="lg:col-span-4 bg-warmBlack1 border-none flex flex-col md:mt-8 p-0 m-0">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
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
            <div className="flex flex-col md:flex-row gap-8 md:px-0 py-[2rem] md:mx-[1rem] justify-between md:mr-[6rem]">
              <div className="flex flex-col md:flex-row gap-8 justify-around">
                {Array.from({ length: 2 }).map((_, idx) => (
                  <Skeleton
                    key={idx}
                    className="gap-2"
                    width={400}
                    height={250}
                  />
                ))}
              </div>
              <Skeleton className="md:ml-2" height={250} width={400} />
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
    <div className="min-h-screen bg-warmBlack px-2">
      <div className="max-w-8xl mx-auto space-y-4 h-full">
        {/* Header */}
        <Header telemetryData={telemetryData} />
        {/* Cards */}
        <div
          className={`!mt-0 grid grid-cols-1 lg:grid-cols-11 pb-4 border-none rounded-lg transition-all duration-500 ease-in-out`}
        >
          {/* Posiciones Actuales */}
          <DriverPositions
            positions={currentPositions}
            driverInfos={driverInfos}
            driverTimings={driverTimings}
            driverTimingStats={driverTimingStats}
            driverCarData={driverCarData}
            driverStints={driverStints}
            lastCapture={teamRadioCaptures?.captures.findLast((c) => c)}
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
        <div className="flex flex-col-reverse md:flex-row items-center justify-evenly md:py-[2rem] gap-4 w-full">
          <div
            className={`flex flex-col md:flex-row justify-center md:justify-evenly items-center ${
              audioLog || raceControlLog ? "w-full" : "hidden"
            }`}
          >
            {audioLog && (
              <SessionAudios
                teamRadio={teamRadioCaptures}
                drivers={driverInfos}
                session={session}
              />
            )}
            {raceControlLog && (
              <RaceControlList raceControl={telemetryData?.raceControl} />
            )}
          </div>

          <div className="flex md:flex-row flex-col gap-12 md:gap-0 w-full justify-evenly">
            {circleOfDoom && (
              <CircleOfDoom
                currentLap={session?.current_lap}
                driverInfos={driverInfos}
                timings={driverTimings}
                currentPositions={currentPositions}
                refDriver={
                  pinnedDriver
                    ? pinnedDriver
                    : currentPositions.at(0)?.driver_number
                }
              />
            )}

            {circleCarData && (
              <CircleCarData
                carData={
                  pinnedDriver
                    ? telemetryData?.carData.find(
                        (c) => c.driver_number === pinnedDriver
                      )
                    : telemetryData?.carData.find(
                        (c) =>
                          c.driver_number ===
                          currentPositions.at(0)?.driver_number
                      )
                }
                driverInfo={driverInfos}
              />
            )}
          </div>
        </div>
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
