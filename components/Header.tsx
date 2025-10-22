"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudRain, Sun, Wind, Droplets, CloudSun } from "lucide-react";
import { Geist, Orbitron } from "next/font/google";
import F1Calendar from "@/components/Calendar";
import type { TelemetryData } from "@/telemetry-manager";
import { useEffect, useState } from "react";
import {
  ensureUtc,
  formatTime,
  parseTimeOffset,
  translateSessionName,
  translateSessionStatus,
} from "@/utils/calendar";
import PreferencesPanel from "./PreferencesPanel";
import { usePreferences } from "@/context/preferences";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const orbitron = Orbitron({ subsets: ["latin"], weight: "400" });

interface HeaderProps {
  telemetryData: TelemetryData | null;
  dict: any;
}

export default function Header({ telemetryData, dict }: HeaderProps) {
  const session = telemetryData?.session;
  const weather = telemetryData?.weather;
  const [sessionTime, setSessionTime] = useState<number>();

  const { preferences } = usePreferences();

  const getWeatherIcon = () => {
    if (!weather) return <Sun className="h-6 w-6 text-gray-300" />;
    if (weather.rainfall > 0)
      return <CloudRain className="h-6 w-6 text-gray-300" />;
    if (weather.humidity >= 60)
      return <CloudSun className="h-6 w-6 text-gray-300" />;
    return <Sun className="h-6 w-6 text-gray-300" />;
  };

  useEffect(() => {
    if (!session?.date_end) return;

    const offset = parseTimeOffset(session.gmt_offset);
    const endTime = new Date(ensureUtc(session.date_end)).getTime() - offset;
    if (session.session_status === "Finalised") return;

    const update = () => {
      const now = telemetryData?.lastUpdateTime.getTime();
      if (!now) return;
      const remaining = Math.max(0, endTime - now);
      setSessionTime(remaining);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [session?.session_status, telemetryData?.lastUpdateTime]);

  return (
    <Card className="bg-warmBlack1 text-white border-none relative">
      <CardHeader>
        <div className="flex flex-col md:flex-row lg:flex-row items-center justify-between gap-1">
          <div className="flex flex-row md:justify-start items-center ">
            <div className="flex flex-row md:gap-[1rem] w-screen md:w-full px-4 justify-between items-center">
              <PreferencesPanel driverInfo={telemetryData?.drivers} />
              <div className="flex flex-col md:flex-row items-center md:justify-between justify-center">
                <div className="flex items-center flex-col">
                  <CardTitle
                    className="flex flex-row items-center gap-4 text-xl sm:text-2xl"
                    style={orbitron.style}
                  >
                    {preferences.translate
                      ? translateSessionName(session?.session_name)
                      : session?.session_name}
                    :{" "}
                    {preferences.translate
                      ? translateSessionStatus(session?.session_status)
                      : session?.session_status}
                  </CardTitle>
                  <div
                    className="text-gray-600 text-sm flex flex-col justify-center items-center"
                    style={mediumGeist.style}
                  ></div>
                </div>
              </div>
              <div></div>
            </div>
          </div>
          {session?.session_status !== "Finalised" && (
            /* Countdown */
            <div className="flex items-center py-1 text-offWhite flex-row text-xl sm:text-2xl">
              <span className="text-xl font-mono" style={orbitron.style}>
                {sessionTime !== undefined ? formatTime(sessionTime) : null}
              </span>
            </div>
          )}
          <div
            className="flex items-center text-nowrap flex-col md:flex-row text-xs md:text-sm"
            style={mediumGeist.style}
          >
            {session?.session_status === "Finalised" ? (
              <F1Calendar dict={dict} />
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
