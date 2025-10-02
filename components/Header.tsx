"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CloudRain,
  Sun,
  Cloud,
  Wind,
  Droplets,
  SunDim,
  CloudSun,
} from "lucide-react";
import { Geist, Orbitron } from "next/font/google";
import F1Calendar from "@/components/Calendar";
import type { TelemetryData } from "@/telemetry-manager";
import { useEffect, useState } from "react";
import { ensureUtc, formatTime, parseTimeOffset } from "@/utils/calendar";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const orbitron = Orbitron({ subsets: ["latin"], weight: "400" });

interface HeaderProps {
  telemetryData: TelemetryData | null;
}

export default function Header({ telemetryData }: HeaderProps) {
  const session = telemetryData?.session;
  const weather = telemetryData?.weather;
  const [sessionTime, setSessionTime] = useState(0);

  const getWeatherIcon = () => {
    if (!weather) return <Sun className="h-6 w-6 text-gray-300" />;
    if (weather.rainfall > 0)
      return <CloudRain className="h-6 w-6 text-gray-300" />;
    if (weather.humidity >= 60)
      return <CloudSun className="h-6 w-6 text-gray-300" />;
    return <Sun className="h-6 w-6 text-gray-300" />;
  };

  useEffect(() => {
    if (!session?.date_start || !session?.date_end) return;

    const offset = parseTimeOffset(session.gmt_offset);
    const startTime =
      new Date(ensureUtc(session.date_start)).getTime() - offset;

    if (session.session_status === "Finalised") return;

    const now = Date.now();

    if (now < startTime) return;

    const interval = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = Math.min(currentTime - startTime);
      setSessionTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.date_start, session?.date_end]);

  return (
    <Card className="bg-warmBlack1 text-white border-none mx-2 relative">
      <CardHeader>
        <div className="flex flex-col md:flex-row lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-xl sm:text-2xl" style={orbitron.style}>
                {session?.session_name}: {session?.session_status}
              </CardTitle>
              <div
                className="text-gray-500 text-sm flex flex-col justify-center items-center"
                style={mediumGeist.style}
              >
                <div className="flex flex-row gap-1 justify-center w-full flex-wrap">
                  <p>{session?.circuit_short_name} • </p>
                  <p>
                    {session?.country_name} • {session?.year}
                  </p>
                </div>
                {session?.session_status !== "Finalised" && (
                  /* Countdown */
                  <div>
                    <div className="flex items-center gap-1 py-1 text-offWhite flex-row">
                      <div className="flex flex-col">
                        <span
                          className="text-sm font-mono"
                          style={mediumGeist.style}
                        >
                          {formatTime(sessionTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className="flex items-center text-nowrap flex-col md:flex-row text-xs md:text-sm"
            style={mediumGeist.style}
          >
            {session?.session_status === "Finalised" ? (
              <F1Calendar />
            ) : (
              <>
                {/* Weather Info */}
                {weather && (
                  <div className="flex items-center py-1 text-offWhite">
                    <div className="px-2">{getWeatherIcon()}</div>
                    {/* Air Temperature Bar */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs flex flex-row items-center gap-1 p-1">
                        <Wind width={15} />{" "}
                        {Math.round(weather.air_temperature)}°C
                      </span>
                      <div
                        className="relative w-[4rem] h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                        style={{ perspective: 10 }}
                      >
                        <div
                          className="absolute top-0 w-0.5 h-2 bg-white rounded-full shadow-sm"
                          style={{
                            left: `${Math.max(
                              0,
                              Math.min(
                                100,
                                ((weather.air_temperature - 15) / (40 - 15)) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Track Temperature Bar */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs p-2">
                        Track {Math.round(weather.track_temperature)}°C
                      </span>
                      <div className="relative w-[4rem] h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full">
                        <div
                          className="absolute top-0 w-0.5 h-2 bg-white rounded-full shadow-sm"
                          style={{
                            left: `${Math.max(
                              0,
                              Math.min(
                                100,
                                ((weather.track_temperature - 15) / (60 - 15)) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Humidity Bar */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs flex flex-row gap-1 items-center p-1">
                        <Droplets width={15} /> {Math.round(weather.humidity)}%
                      </span>
                      <div className="relative w-[4rem] h-2 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 rounded-full">
                        <div
                          className="absolute top-0 w-0.5 h-2 bg-white rounded-full shadow-sm"
                          style={{
                            left: `${Math.max(
                              0,
                              Math.min(100, weather.humidity)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    {/* Wind Direction */}
                    <div className="items-center flex justify-center ">
                      <div className="flex items-center justify-center flex-row gap-1 ">
                        <div
                          className={`transform rotate-[${weather.wind_direction}deg]`}
                        >
                          <svg
                            className="h-5 w-5 text-gray-300"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L6 12h5v10h2V12h5L12 2z" />
                          </svg>
                        </div>
                        {weather.wind_speed}m/s
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
