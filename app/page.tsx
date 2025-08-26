"use client";

import { useState, useEffect } from "react";
import { TelemetryManager, type TelemetryData } from "../telemetry-manager";
import type {
  ProcessedDriver,
  ProcessedPosition,
  ProcessedTiming,
  ProcessedCarData,
} from "../processors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Geist, Saira } from "next/font/google";
import Map from "@/components/Map";
import { ProcessedTimingStats } from "@/processors/timing-stats-processor";
import RaceControl from "@/components/RaceControl";
import Header from "@/components/Header";
import DriverPositionInfo from "@/components/DriverPositionInfo";
import PitsDrsSpeed from "@/components/PitsDrsSpeed";
import Minisectors from "@/components/Minisectors";
import LapTimes from "@/components/LapTimes";
import DriverGaps from "@/components/DriverGaps";
import Tyres from "@/components/Tyres";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const saira = Saira({ subsets: ["latin"], weight: "400" });

export default function F1Dashboard() {
  const [telemetryData, setTelemetryData] = useState<TelemetryData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [pinnedDriver, setPinnedDriver] = useState<number | null>(null);
  const [telemetryManager] = useState(() => new TelemetryManager());
  const [mapFullscreen, setMapFullscreen] = useState(false);

  useEffect(() => {
    // Conectar al WebSocket de telemetría
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "";

    const handleConnection = async () => {
      await telemetryManager.connect(wsUrl, (data: TelemetryData) => {
        setTelemetryData(data);
      });
    };

    handleConnection();

    return () => {
      telemetryManager.disconnect();
    };
  }, [telemetryManager]);

  useEffect(() => {
    if (telemetryData) {
      setLoading(false);
    }
  }, [telemetryData]);

  const getDriverInfo = (driverNumber: number): ProcessedDriver | undefined => {
    return telemetryData?.drivers.find((d) => d.driver_number === driverNumber);
  };

  const getCurrentPositions = (): ProcessedPosition[] => {
    if (!telemetryData?.positions) return [];

    return telemetryData.positions
      .filter((p) => p.position >= 1 && p.position <= 20)
      .sort((a, b) => {
        if (pinnedDriver !== null) {
          if (a.driver_number === pinnedDriver) return -1;
          if (b.driver_number === pinnedDriver) return 1;
        }
        return a.position - b.position;
      });
  };

  const getDriverTiming = (
    driverNumber: number
  ): ProcessedTiming | undefined => {
    return telemetryData?.timing.find((t) => t.driver_number === driverNumber);
  };

  const getDriverCarData = (
    driverNumber: number
  ): ProcessedCarData | undefined => {
    return telemetryData?.carData.find((c) => c.driver_number === driverNumber);
  };

  const getTimingStats = (
    driverNumber: number
  ): ProcessedTimingStats | undefined => {
    return telemetryData?.timingStats.find(
      (c) => c.driver_number === driverNumber
    );
  };

  const handleMapFullscreen = () => {
    setMapFullscreen(!mapFullscreen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warmBlack p-4 flex items-center justify-center">
        <div className="text-center">
          <img
            src="/logo-girando.gif"
            alt="F1 Dashboard Telemetría Al Angulo TV"
            className="h-12 w-12 mx-auto flex align-center"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  const session = telemetryData?.session;

  if (mapFullscreen && telemetryData && telemetryData.session?.circuit_key) {
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
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warmBlack to-warmBlack2 px-2">
      <div className="max-w-8xl mx-auto space-y-4 h-full">
        {/* Header */}
        <Header telemetryData={telemetryData} />

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-10 ">
          {/* Posiciones Actuales */}
          <Card className="lg:col-span-6 bg-warmBlack1 border-none max-h-screen">
            <CardHeader className="pb-4"></CardHeader>
            <CardContent className="overflow-x-auto flex-1 max-h-[90vh] h-full p-0">
              <ScrollArea
                className="overflow-x-auto min-w-max h-full "
                type="scroll"
              >
                <div className="space-y-2">
                  {getCurrentPositions().map((pos) => {
                    const driver = getDriverInfo(pos.driver_number);
                    const timing = getDriverTiming(pos.driver_number);
                    const timingStats = getTimingStats(pos.driver_number);
                    const carData = getDriverCarData(pos.driver_number);
                    const currentStint = telemetryManager.getCurrentStint(
                      pos.driver_number
                    );

                    return (
                      <div
                        key={pos.driver_number}
                        className={`flex items-center gap-3 rounded-md transition-opacity ${
                          pinnedDriver === pos.driver_number
                            ? `border-offWhite sticky top-0 z-10`
                            : ""
                        } max-w-full overflow-x-auto min-w-0 min-h-full cursor-pointer`}
                        onDoubleClick={() =>
                          setPinnedDriver(
                            pinnedDriver === pos.driver_number
                              ? null
                              : pos.driver_number
                          )
                        }
                        style={
                          timing?.knockedOut
                            ? {
                                opacity: 0.4,
                                background: `linear-gradient(-90deg, #111111 94%, #${driver?.team_colour} 100%)`,
                              }
                            : {
                                opacity: 1,
                                background: `linear-gradient(-90deg, #111111 94%, #${driver?.team_colour}8D 100%)`,
                              }
                        }
                      >
                        {/* Posición y datos del Piloto */}
                        <DriverPositionInfo position={pos} driver={driver} />

                        {/* Estadísticas */}
                        <div className="flex flex-row items-center justify-around w-full py-1.5 gap-4 md:gap-2 lg:gap-2">
                          {/* PITS, DRS y Velocidad*/}
                          <PitsDrsSpeed timing={timing} carData={carData} />

                          {/* Minisectores y Tiempos de sector */}
                          <Minisectors
                            timing={timing}
                            timingStats={timingStats}
                          />

                          {/* Tiempos de vuelta */}
                          <LapTimes timing={timing} timingStats={timingStats} />

                          {/* Gaps */}
                          <DriverGaps timing={timing} />

                          {/* Neumático */}
                          <Tyres currentStint={currentStint} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Mapa en tiempo real y race control */}
          <Card className="lg:col-span-4 bg-warmBlack1 border-none border-2 flex flex-col">
            <CardHeader className="pb-3 flex flex-col gap-6">
              <div className="flex flex-row gap-2 pt-4 items-center justify-between">
                <CardTitle
                  className="text-lg font-thin text-white"
                  style={mediumGeist.style}
                >
                  {" "}
                  {/* Race Control */}
                  <div className="mt-3 flex justify-center p-0">
                    <RaceControl
                      raceControl={telemetryData?.raceControl || []}
                    />
                  </div>
                </CardTitle>
                <CardTitle
                  className=" text-xlg font-bold text-white tracking-wider"
                  style={saira.style}
                >
                  {session?.current_lap}/{session?.total_laps}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col justify-center h-full">
              <div className="overflow-hidden h-fit">
                {/*Mapa en tiempo real */}
                {telemetryData && telemetryData.session?.circuit_key && (
                  <div onDoubleClick={handleMapFullscreen}>
                    <Map
                      positions={telemetryData.positionData}
                      drivers={telemetryData.drivers}
                      timing={telemetryData.timing}
                      circuitKey={telemetryData.session.circuit_key}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
