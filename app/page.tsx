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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Flag, CloudRain, Sun, Cloud, Info } from "lucide-react";
import { Geist } from "next/font/google";
import { Anta } from "next/font/google";
import Map from "@/components/Map";
import { ProcessedTimingStats } from "@/processors/timing-stats-processor";
import F1Calendar from "@/components/Calendar";
import RaceControl from "@/components/RaceControl";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const regularAnta = Anta({ subsets: ["latin"], weight: "400" });

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

  const getWeatherIcon = () => {
    const weather = telemetryData?.weather;
    if (!weather) return <Sun className="h-4 w-4" />;
    if (weather.rainfall > 0) return <CloudRain className="h-4 w-4" />;
    if (weather.humidity > 80) return <Cloud className="h-4 w-4" />;
    return <Sun className="h-4 w-4" />;
  };

  const getCompoundSvg = (compound: string, iconSize: number) => {
    const iconMap: Record<string, string> = {
      SOFT: "/soft.svg",
      MEDIUM: "/medium.svg",
      HARD: "/hard.svg",
    };
    const key = (compound || "").toUpperCase();
    const src = iconMap[key] || "/unknown.svg";
    return (
      <img
        src={src || "/placeholder.svg"}
        alt={key}
        width={iconSize}
        height={iconSize}
        style={{ display: "inline-block", verticalAlign: "middle" }}
      />
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
          <p className="text-white" style={mediumGeist.style}>
            Cargando datos de F1...
          </p>
        </div>
      </div>
    );
  }

  const session = telemetryData?.session;
  const weather = telemetryData?.weather;

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
    <div className="min-h-screen bg-gradient-to-br from-warmBlack to-warmBlack2 p-2 sm:p-4">
      <div className="max-w-8xl mx-auto space-y-4 h-full">
        {/* Header */}
        <Card className="bg-warmBlack1 text-white border-none mx-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle
                    className="text-xl sm:text-2xl"
                    style={regularAnta.style}
                  >
                    {session?.session_type} - {session?.location}:{" "}
                    {session?.session_status}
                  </CardTitle>
                  <div className="text-gray-500 text-sm flex flex-col md:flex-row md:gap-1 lg:gap-1 lg:flex-row" style={mediumGeist.style}>
                    <p>{session?.circuit_short_name} • </p>
                    <p>{session?.country_name} • {session?.year}</p>
                  </div>
                </div>
              </div>
              <div
                className="flex items-center justify-between text-sm flex-col "
                style={mediumGeist.style}
              ></div>
              <div
                className="flex items-center gap-4 text-nowrap flex-col md:flex-row text-xs md:text-sm"
                style={mediumGeist.style}
              >
                {session?.date_end &&
                new Date(session?.date_end) < new Date() ? (
                  <F1Calendar />
                ) : (
                  <>
                    {" "}
                    {/* Weather Info */}
                    {weather && (
                      <div className="flex items-center gap-2 text-offWhite">
                        {getWeatherIcon()}
                        <div className="text-sm">
                          <div>{Math.round(weather.air_temperature)}°C</div>
                          <div className="text-xs">
                            Pista: {Math.round(weather.track_temperature)}°C
                          </div>
                        </div>
                      </div>
                    )}
                    <Separator
                      orientation="vertical"
                      className="h-8 bg-gray-600 hidden md:block"
                    />
                    <div className="text-right ">
                      <div className="flex items-center gap-1 text-offWhite flex-row">
                        <Clock className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span>
                            {telemetryData?.lastUpdateTime.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-2 m-2">
          {/* Posiciones Actuales */}
          <Card className="lg:col-span-7 bg-warmBlack1 border-none max-h-screen">
            <CardHeader className="pb-4">
              <CardTitle
                className="flex items-center gap-2 text-white text-lg font-light "
                style={mediumGeist.style}
              >
                <div className="relative group flex items-center text-nowrap">
                  <Info className="h-4 w-4 text-offWhite cursor-pointer" />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 bg-transparent text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Doble click para fijar un piloto.
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto flex-1 max-h-[90vh] h-full">
              <ScrollArea className="overflow-x-auto min-w-max h-full " type="scroll">
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
                        className={`flex items-center gap-3 rounded-md transition-opacity border-2 border-darkBlue/50 ${
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
                        {/* Posición e Info de Piloto */}
                        <div className="flex flex-row items-center min-w-[11.5rem]">
                        {/* Posición */}
                        <div className="flex flex-row items-center min-w-[5.75rem]">
                          <Badge
                            className="w-8 h-8 rounded-full flex items-center justify-center text-md font-bold pr-0 min-w-[2rem]"
                            style={{
                              backgroundColor: `transparent`,
                              fontFamily: regularAnta.style.fontFamily,
                            }}
                          >
                            {pos.position}
                          </Badge>

                          {driver?.headshot_url && (
                            <img
                              src={driver?.headshot_url}
                              className="obect-cover h-[60px]"
                            />
                          )}
                          {driver?.driver_number === 43 && (
                            <img
                              src="/franco-colapinto.png"
                              className="obect-cover h-[60px]"
                            />
                          )}
                        </div>

                        {/* Info del piloto */}
                        <div
                          className="flex justify-evenly flex-row "
                          style={regularAnta.style}
                        >
                          <div className="flex flex-col self-start">
                            <div className="flex items-center gap-1">
                              <span
                                className="text-xs text-white self-center opacity-80"
                                style={mediumGeist.style}
                              >
                                #{pos.driver_number}
                              </span>
                              <span
                                className="font-semibold text-sm text-white"
                                style={mediumGeist.style}
                              >
                                {driver?.name_acronym}
                              </span>
                            </div>
                            <p className="text-xs text-gray-100 truncate">
                              {driver?.team_name}
                            </p>
                          </div>
                        </div>
                        </div>

                        {/* Estadísticas */}
                        <div className="flex flex-row items-center justify-around w-full py-1.5 gap-4 md:gap-2 lg:gap-2">
                          {/* PITS, DRS y */}
                          <div>
                            {/* En PIT */}
                            <p
                              className="text-xs text-white self-center m-0 p-0"
                              style={regularAnta.style}
                            >
                              {timing?.in_pit ? (
                                <span
                                  className="text-f1Blue"
                                  style={mediumGeist.style}
                                >
                                  IN PIT
                                </span>
                              ) : (
                                <span style={mediumGeist.style}>
                                  {timing?.number_of_pit_stops} PIT
                                </span>
                              )}
                            </p>
                            {/* DRS */}
                            <span
                              className="text-xs text-white self-center"
                              style={mediumGeist.style}
                            >
                              {carData?.drs ? (
                                <p className=" text-green-400">DRS ON</p>
                              ) : (
                                <p className="opacity-80">DRS OFF</p>
                              )}
                            </span>
                            {/* Velocidad */}
                            <p
                              style={mediumGeist.style}
                              className={`text-xs text-white ${
                                carData?.speed !== undefined
                                  ? carData.speed > 330
                                    ? "text-red-500"
                                    : carData.speed > 300
                                    ? "text-yellow-300"
                                    : ""
                                  : ""
                              }`}
                            >
                              {carData?.speed !== undefined
                                ? `${carData.speed} km/h`
                                : "-- km/h"}
                            </p>
                          </div>

                          {/* Minisectores y Tiempos de sector */}
                          <div className="flex flex-row gap-2 ">
                            {/* Minisectores */}
                            <div
                              className="text-xs text-white"
                              style={regularAnta.style}
                            >
                              {(["sector1", "sector2", "sector3"] as const).map(
                                (sectorKey, sectorIdx) => {
                                  const minisectors =
                                    timing?.sector_segments[sectorKey] || [];
                                  return (
                                    <div
                                      key={sectorKey}
                                      className="flex gap-1 items-center text-xs text-gray-300"
                                    >
                                      S{sectorIdx + 1}
                                      {minisectors.map(
                                        (s: number, sIdx: number) => {
                                          let bg = "#cccccc";
                                          if (s === 2048)
                                            bg = "#ffe066"; // Amarillo
                                          else if (s === 2049)
                                            bg = "#51cf66"; // Verde
                                          else if (s === 2051) bg = "#b197fc"; // Violeta

                                          return (
                                            <span
                                              key={`${sectorKey}-${sIdx}`}
                                              style={{
                                                backgroundColor: bg,
                                                width: 10,
                                                height: 6,
                                                borderRadius: 2,
                                                padding: 2,
                                                display: "inline-block",
                                                marginLeft: 2,
                                                opacity: 1,
                                              }}
                                            ></span>
                                          );
                                        }
                                      )}
                                    </div>
                                  );
                                }
                              )}
                            </div>

                            {/* Tiempos de sector */}
                            <div
                              className="flex items-center flex-col text-xs text-white"
                              style={mediumGeist.style}
                            >
                              {(["sector1", "sector2", "sector3"] as const).map(
                                (sectorKey, idx) => {
                                  const sector =
                                    timing?.sector_times[sectorKey];
                                  let color = "text-f1Yellow";
                                  const displayValue =
                                    sector?.Value ??
                                    sector?.PreviousValue ??
                                    "--:--";
                                  if (sector?.OverallFastest)
                                    color = "text-f1Purple";
                                  else if (sector?.PersonalFastest)
                                    color = "text-f1Green";
                                  return (
                                    <div
                                      className="flex flex-row gap-1"
                                      key={sectorKey}
                                    >
                                      <span className={color}>
                                        {sector && displayValue}
                                      </span>
                                    </div>
                                  );
                                }
                              )}
                            </div>

                            {/* Mejores tiempos de sector */}
                            <div
                              className="flex items-center flex-col text-xs text-white"
                              style={mediumGeist.style}
                            >
                              {timingStats?.best_sectors.map(
                                (sectorKey, idx) => {
                                  const sector = timingStats.best_sectors[idx];
                                  let color = "text-yellow-300";
                                  const displayValue = sector?.Value ?? "--:--";
                                  if (sector?.Position === 1)
                                    color = "text-purple-500";
                                  else color = "text-green-400";
                                  return (
                                    <div
                                      className="flex flex-row gap-1"
                                      key={sectorKey.Value}
                                    >
                                      <span className={color}>
                                        {sector && displayValue}
                                      </span>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>

                          {/* Tiempos de vuelta */}
                          <div className="flex items-start flex-col text-white">
                            {/* Último tiempo de vuelta */}
                            <div
                              className="flex items-center flex-row gap-2 text-xs text-white"
                              style={regularAnta.style}
                            >
                              <span className="text-xxs text-gray-300">
                                LAP {timing?.number_of_laps}
                              </span>
                              <p style={mediumGeist.style}>
                                {timing?.last_lap_time || "---:---"}
                              </p>
                            </div>

                            {/* Mejor tiempo de vuelta */}
                            <div className="flex flex-row gap-2">
                              <div
                                className="flex items-center flex-row gap-2 text-xs text-white"
                                style={regularAnta.style}
                              >
                                <span className="text-xxs text-gray-300">
                                  LAP {timingStats?.personal_best_lap_time.Lap}
                                </span>
                                <p
                                  className={
                                    timingStats?.personal_best_lap_time
                                      .Position === 1
                                      ? "text-purple-500"
                                      : "text-green-400"
                                  }
                                  style={mediumGeist.style}
                                >
                                  {timingStats?.personal_best_lap_time.Value ||
                                    "---:---"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Gaps */}
                          <div className="flex flex-col items-start min-w-[8rem]">
                            {timing?.gap_to_leader ? (
                              <div
                                className="flex items-center flex-row gap-2 text-xs text-white"
                                style={regularAnta.style}
                              >
                                <span className="text-xxs text-gray-300">
                                  GAP LEADER
                                </span>
                                <p style={mediumGeist.style}>
                                  {timing?.gap_to_leader}
                                </p>
                              </div>
                            ) : (
                              <></>
                            )}
                            {timing?.interval_to_ahead ? (
                              <div
                                className="flex items-center flex-row gap-2 text-xs text-white"
                                style={regularAnta.style}
                              >
                                <span className="text-xxs text-gray-300">
                                  GAP AHEAD
                                </span>
                                <p style={mediumGeist.style}>
                                  {timing?.interval_to_ahead}
                                </p>
                              </div>
                            ) : (
                              <></>
                            )}
                            {timing?.time_diff_to_ahead ? (
                              <div
                                className="flex items-center flex-row gap-2 text-xs text-white"
                                style={regularAnta.style}
                              >
                                <span className="text-xxs text-gray-300">
                                  TIME AHEAD
                                </span>
                                <p style={mediumGeist.style}>
                                  {timing?.time_diff_to_ahead}
                                </p>
                              </div>
                            ) : (
                              <></>
                            )}
                            {timing?.time_diff_to_fastest ? (
                              <div
                                className="flex items-center flex-row gap-2 text-xs text-white"
                                style={regularAnta.style}
                              >
                                <span className="text-xxs text-gray-300">
                                  TIME FASTEST
                                </span>
                                <p style={mediumGeist.style}>
                                  {timing?.time_diff_to_fastest}
                                </p>
                              </div>
                            ) : (
                              <></>
                            )}
                          </div>

                          {/* Neumático */}
                          <div
                            className="flex items-center flex-row text-xs gap-2 p-2 md:p-0 lg:p-0"
                            style={mediumGeist.style}
                          >
                            {currentStint && (
                              <div>
                                {getCompoundSvg(currentStint.compound, 30)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Mapa en tiempo real y race control */}
          <Card className="lg:col-span-3 bg-warmBlack1 border-none border-2 flex flex-col">
            <CardHeader className="pb-3 flex flex-col gap-6">
              <CardTitle
                className="flex items-center gap-2 text-white text-lg"
                style={mediumGeist.style}
              >
                <div className="relative group flex items-center text-nowrap">
                  <Info className="h-4 w-4 text-offWhite cursor-pointer" />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 bg-transparent text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Doble click para pantalla completa.
                  </span>
                </div>
              </CardTitle>
              <div className="flex flex-row gap-2 items-center justify-between">
                <CardTitle
                  className="text-lg font-thin text-white"
                  style={mediumGeist.style}
                ></CardTitle>
                <CardTitle
                  className=" text-xlg font-bold text-white tracking-wider"
                  style={regularAnta.style}
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

              {/* Race Control */}
              <div className="mt-3">
                <RaceControl raceControl={telemetryData?.raceControl || []} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
