"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Geist } from "next/font/google";
import Header from "@/components/Header";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DriverPositions from "@/components/DriverPositions";
import MapAndMessages from "@/components/MapAndMessages";
import { useTelemetryManager } from "@/hooks/use-telemetry";
import SessionAudios from "@/components/SessionAudios";
import RaceControlList from "@/components/RaceControlList";
import CircleOfDoom from "@/components/CircleOfDoom";
import { usePreferences } from "@/context/preferences";
import { CircleCarData } from "@/components/CircleCarData";
import { useEffect, useState } from "react";
import { useTour } from "@reactour/tour";
import { Countdown } from "./Countdown";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

interface TelemetryContentProps {
  dict: any;
}

export function TelemetryContent({ dict }: TelemetryContentProps) {
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
    delayed,
    deltaDelay,
    aboutToBeEliminated,
  } = useTelemetryManager();
  const { setIsOpen } = useTour();
  const { preferences, setPreference } = usePreferences();

  useEffect(() => {
    if (!preferences.hasSeenTour && !loading && !delayed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [preferences.hasSeenTour, loading, delayed, setIsOpen]);

  const audioLog = preferences.audioLog;
  const raceControlLog = preferences.raceControlLog;
  const circleOfDoom = preferences.circleOfDoom;
  const circleCarData = preferences.circleCarData;
  const secondsDelay = (deltaDelay * -1) / 1000;
  const session = telemetryData?.session;

  if (loading || delayed) {
    const LoaderOverlay = () => (
      <div className="fixed inset-0 z-20 flex items-center justify-center bg-warmBlack/40 backdrop-blur-sm">
        {delayed ? (
          <Countdown totalSeconds={Math.max(secondsDelay, 0)} dict={dict} />
        ) : (
          <span
            className="text-white text-xl text-center"
            style={mediumGeist.style}
          >
            {dict.loading}
          </span>
        )}
      </div>
    );

    const HeaderSkeleton = () => (
      <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center w-full px-6 py-4 mb-4">
        <Skeleton height={60} width="20rem" className="w-[40vw] md:w-[20vw]" />
        <Skeleton height={60} width="15rem" />
      </div>
    );

    const PositionsSkeletonList = () => (
      <Card className="lg:col-span-5 bg-warmBlack1 border-none max-h-screen px-2">
        <CardContent className="overflow-x-auto flex-1 max-h-[90vh] h-full p-0">
          <div className="space-y-2">
            {Array.from({ length: 20 }).map((_, idx) => (
              <Skeleton key={idx} height={60} width="100%" />
            ))}
          </div>
        </CardContent>
      </Card>
    );

    const MapAndRaceSkeleton = () => (
      <Card className="lg:col-span-5 bg-warmBlack1 border-none flex flex-col p-0 m-0">
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
    );

    const CardsRowSkeleton = () => (
      <div className="flex flex-col md:flex-row gap-8 md:px-0 py-[2rem] md:mx-[1rem] justify-between md:mr-[6rem]">
        <div className="flex flex-col md:flex-row gap-8 justify-around">
          {Array.from({ length: 2 }).map((_, idx) => (
            <Skeleton key={idx} className="gap-2" width={400} height={250} />
          ))}
        </div>
        <Skeleton className="md:ml-2" height={250} width={400} />
      </div>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-warmBlack to-warmBlack2 px-2">
        <LoaderOverlay />
        <div className="max-w-8xl mx-auto space-y-4 h-full">
          <SkeletonTheme baseColor="#151515ff" highlightColor="#444">
            <HeaderSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 pb-4">
              <PositionsSkeletonList />
              <MapAndRaceSkeleton />
            </div>
            <CardsRowSkeleton />
          </SkeletonTheme>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warmBlack px-2">
      <div className="max-w-8xl mx-auto space-y-4 h-full">
        {/* Header */}
        <Header telemetryData={telemetryData} dict={dict} />
        {/* Cards */}
        <div
          className={`!mt-0 grid grid-cols-1 lg:grid-cols-10 lg:border-b-2 lg:border-t-0 lg:border-l-0 lg:border-r-0 lg:rounded-none lg:border-gray-800 welcome-step`}
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
            aboutToBeEliminated={aboutToBeEliminated}
          />

          {/* Mapa en tiempo real y race control */}
          <MapAndMessages
            telemetryData={telemetryData}
            session={session}
            yellowSectors={yellowSectors}
          />
        </div>
        <div className="flex flex-col-reverse md:flex-row items-center justify-evenly md:py-[2rem] gap-4 w-full">
          <div
            className={`flex flex-col md:flex-row justify-center md:justify-evenly items-center ${
              audioLog || raceControlLog ? "w-full sixth-step" : "hidden"
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
              <RaceControlList
                raceControl={
                  preferences.translate
                    ? telemetryData?.raceControlEs
                    : telemetryData?.raceControl
                }
              />
            )}
          </div>

          <div className="flex md:flex-row flex-col gap-12 md:gap-2 w-full justify-evenly">
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
      </div>
    </div>
  );
}
