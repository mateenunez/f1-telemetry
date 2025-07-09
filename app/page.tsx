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
import {
  Clock,
  Flag,
  Trophy,
  AlertTriangle,
  CloudRain,
  Sun,
  Cloud,
  Zap,
  Wind,
} from "lucide-react";
import { Geist } from "next/font/google";
import { Anta } from "next/font/google";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const regularAnta = Anta({ subsets: ["latin"], weight: "400" });

export default function F1Dashboard() {
  const [telemetryData, setTelemetryData] = useState<TelemetryData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [pinnedDriver, setPinnedDriver] = useState<number | null>(null);
  const [telemetryManager] = useState(() => new TelemetryManager());

  useEffect(() => {
    // Conectar al WebSocket de telemetría

    // Reemplaza esta URL con tu WebSocket real
    const wsUrl = "ws://localhost:4000";

    const handleConnection = async () => {
      await telemetryManager.connect(wsUrl, (data: TelemetryData) => {
        console.log("Datos: " + data);

        setTelemetryData(data);
        setLastUpdate(new Date());
      });
    };

    handleConnection();
    setLoading(false);

    return () => {
      telemetryManager.disconnect();
    };
  }, [telemetryManager]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
        <div className="text-center">
          <img
            src="/logo-girando.gif"
            alt="Al Angulo Tv Cargando..."
            className="h-12 w-12 mx-auto flex align-center"
          />
          <p className="text-white">Cargando datos de F1...</p>
        </div>
      </div>
    );
  }

  const session = telemetryData?.session;
  const weather = telemetryData?.weather;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-2 sm:p-4">
      <div className="max-w-8xl mx-auto space-y-4 h-full">
        {/* Header */}
        <Card className="bg-gradient-to-r from-red-600 to-red-800 text-white border-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flag className="h-6 w-6" />
                <div>
                  <CardTitle
                    className="text-xl sm:text-2xl"
                    style={regularAnta.style}
                  >
                    {session?.session_type} - {session?.location}
                  </CardTitle>
                  <p className="text-red-100 text-sm">
                    {session?.circuit_short_name} • {session?.country_name} •{" "}
                    {session?.year}
                  </p>
                </div>
              </div>
              <div
                className="flex items-center justify-between text-sm flex-col "
                style={mediumGeist.style}
              >
                <div className="flex items-center gap-1 text-xs ">
                  <a
                    href="https://cafecito.app/skoncito"
                    className="hover:underline"
                  >
                    Apoyanos!
                  </a>
                  🎁
                </div>
              </div>
              <div className="flex items-center gap-4 flex-col md:flex-row text-xs md:text-sm">
                {/* Weather Info */}
                {weather && (
                  <div className="flex items-center gap-2 text-red-100">
                    {getWeatherIcon()}
                    <div className="text-sm">
                      <div>{Math.round(weather.air_temperature)}°C</div>
                      <div className="text-xs">
                        Pista: {Math.round(weather.track_temperature)}°C
                      </div>
                    </div>
                  </div>
                )}
                <Separator orientation="vertical" className="h-8 bg-red-400 hidden md:block" />
                <div className="text-right ">
                  <div className="flex items-center gap-1 text-red-100">
                    <Clock className="h-4 w-4" />
                    {lastUpdate.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
          {/* Posiciones Actuales */}
          <Card className="lg:col-span-1 bg-gray-700 border-gray-900 ">
            <CardHeader className="pb-3">
              <CardTitle
                className="flex items-center gap-2 text-white"
                style={regularAnta.style}
              >
                <Trophy className="h-5 w-5 text-red-600" />
                Telemetría
                <div className="border border-white rounded-md px-3 py-1 bg-white/10 text-white text-xs shadow-sm">
                  Beta
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <ScrollArea className="overflow-x-auto min-w-max h-90">
                <div className="space-y-2">
                  {getCurrentPositions().map((pos) => {
                    const driver = getDriverInfo(pos.driver_number);
                    const timing = getDriverTiming(pos.driver_number);
                    const carData = getDriverCarData(pos.driver_number);
                    const currentStint = telemetryManager.getCurrentStint(
                      pos.driver_number
                    );

                    return (
                      <div
                        key={pos.driver_number}
                        className={`flex items-center gap-5 p-1.5 rounded-lg bg-gray-600 transition-opacity ${
                          pinnedDriver === pos.driver_number
                            ? "border-2 border-red-500 sticky top-0 z-10"
                            : ""
                        } max-w-full overflow-x-auto min-w-0`}
                        onDoubleClick={() =>
                          setPinnedDriver(
                            pinnedDriver === pos.driver_number
                              ? null
                              : pos.driver_number
                          )
                        }
                      >
                        {/* Posición */}
                        <Badge
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{
                            backgroundColor: `#${driver?.team_colour}`,
                            fontFamily: regularAnta.style.fontFamily,
                          }}
                        >
                          {pos.position}
                        </Badge>

                        {/* Info del piloto */}
                        <div
                          className="flex-1 justify-evenly"
                          style={mediumGeist.style}
                        >
                          <div className="flex items-center gap-1">
                            <span
                              className="text-xs text-white self-center opacity-80"
                              style={mediumGeist.style}
                            >
                              #{pos.driver_number}
                            </span>
                            <span className="font-semibold text-sm text-white">
                              {driver?.name_acronym}
                            </span>
                          </div>
                          <p className="text-xs text-gray-100 truncate">
                            {driver?.team_name}
                          </p>
                        </div>

                        {/* DRS, RPM, Velocidad */}
                        <div>
                          <span
                            className="text-xs text-white self-center opacity-80 "
                            style={regularAnta.style}
                          >
                            {carData?.drs ? (
                              <span className="border rounded-sm border-green-500 p-0.5 text-green-300">
                                DRS ON
                              </span>
                            ) : (
                              <span>DRS OFF</span>
                            )}
                          </span>

                          <p
                            className="text-xs text-gray-300"
                            style={mediumGeist.style}
                          >
                            RPM: {carData?.rpm || "--"}{" "}
                            <span className="text-red-400">
                              {carData?.gear ? `G: ${carData.gear}` : ""}
                            </span>
                          </p>
                        </div>

                        {/* Minisectores */}
                        <div className="text-xs text-white">
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
                                      if (s === 2048) bg = "#ffe066"; // Amarillo
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
                              const sector = timing?.sector_times[sectorKey];
                              let color = "text-yellow-300";
                              if (sector?.OverallFastest)
                                color = "text-purple-500";
                              else if (sector?.PersonalFastest)
                                color = "text-green-400";
                              return (
                                <div
                                  className="flex flex-row gap-1"
                                  key={sectorKey}
                                >
                                  <span className={color}>
                                    {sector?.Value ?? "--:--"}
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>

                        {/* Tiempo de vuelta */}
                        <div
                          className="flex items-center flex-col text-xs text-white"
                          style={mediumGeist.style}
                        >
                          <span className="text-xxs text-gray-300">LAP</span>
                          <p>{timing?.last_lap_time || "---:---"}</p>
                        </div>

                        {/* Gap */}
                        <div
                          className="flex items-center flex-col text-xs text-white"
                          style={mediumGeist.style}
                        >
                          <span className="text-xxs text-gray-300">GAP</span>
                          <p>{timing?.gap_to_leader || ""}</p>
                        </div>

                        {/* Neumático */}
                        <div
                          className="flex items-center flex-row text-xs gap-2"
                          style={mediumGeist.style}
                        >
                          {currentStint && (
                            <div>
                              {getCompoundSvg(currentStint.compound, 30)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Mapa en tiempo real */}
          <Card className="lg:col-span-1 bg-gray-700 border-gray-900">
            <CardHeader className="pb-3">
              <CardTitle
                className="flex items-center gap-2 text-white"
                style={regularAnta.style}
              >
                <Clock className="h-5 w-5 text-red-600" />
                Mapa
                <div className="border border-white rounded-md px-3 py-1 bg-white/10 text-white text-xs shadow-sm">
                  Beta
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ScrollArea className="overflow-hidden">
                <iframe
                  src="https://mateenunez.github.io/f1-map/"
                  className="w-full h-80 border rounded-lg overflow-hidden"
                  style={{
                    transform:
                      typeof window !== "undefined" && window.innerWidth <= 768
                        ? "scale(1.3)"
                        : "scale(1.15)",
                    height:
                      typeof window !== "undefined" && window.innerWidth <= 768
                        ? "30vh"
                        : "20rem",
                  }}
                  title="F1 Frameable Map"
                  scrolling="no"
                />
              </ScrollArea>

              {/* Race Control */}
              <Card className="bg-gradient-to-r from-red-900 to-gray-900 text-white border-none">
                <CardHeader className="pb-2">
                  <CardTitle
                    className="text-lg flex items-center gap-2"
                    style={regularAnta.style}
                  >
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Avisos de Carrera
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <ScrollArea className="h-28">
                    <div className="space-y-1">
                      {telemetryData?.raceControl.map((control, index) => (
                        <div className="flex gap-3 flex-col" key={index}>
                          <div className="flex items-center gap-3 text-sm text-gray-100">
                            <Flag className="h-4 w-4 text-red-400" />
                            <span className="flex-1">{control.message}</span>
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs text-gray-400">
                                {new Date(control.date).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <Separator className="opacity-40 bg-red-400" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
