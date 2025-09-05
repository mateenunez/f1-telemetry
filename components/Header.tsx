"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CloudRain, Sun, Cloud } from "lucide-react";
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
  const [endTime, setEndTime] = useState(0);

  const getWeatherIcon = () => {
    if (!weather) return <Sun className="h-8 w-8 text-orange-300" />;
    if (weather.rainfall > 0)
      return <CloudRain className="h-8 w-8 text-f1Blue" />;
    if (weather.humidity > 80) return <Cloud className="h-8 w-8 text-f1Blue" />;
    return <Sun className="h-8 w-8 text-orange-300" />;
  };

  useEffect(() => {
    if (!session?.date_start || !session?.date_end) return;

    const offset = parseTimeOffset(session.gmt_offset);
    const startTime =
      new Date(ensureUtc(session.date_start)).getTime() - offset;
    const endTime = new Date(ensureUtc(session.date_end)).getTime() - offset;
    setEndTime(endTime);

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-xl sm:text-2xl" style={orbitron.style}>
                {session?.session_name} - {session?.location}:{" "}
                {session?.session_status}
              </CardTitle>
              <div
                className="text-gray-500 text-sm flex flex-col md:flex-row md:gap-1 lg:gap-1 lg:flex-row"
                style={mediumGeist.style}
              >
                <p>{session?.circuit_short_name} • </p>
                <p>
                  {session?.country_name} • {session?.year}
                </p>
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
            {endTime &&
            endTime < new Date().getTime() &&
            session?.session_status == "Finalised" ? (
              <F1Calendar />
            ) : (
              <>
                <div className="text-right ">
                  <div className="flex items-center gap-1 text-offWhite flex-row">
                    {/* Countdown */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-offWhite flex-row">
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
                  </div>
                </div>

                <Separator
                  orientation="vertical"
                  className="h-8 bg-gray-600 hidden md:block"
                />

                {/* Weather Info */}
                {weather && (
                  <div className="flex items-center gap-3 text-offWhite">
                    <div className="flex flex-col md:flex-row gap-2">
                      {/* Air Temperature Bar */}
                      <div className="flex flex-col items-center">
                        <span className="text-sm">
                          Air {Math.round(weather.air_temperature)}°C
                        </span>
                        <div className="relative w-[5rem] h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full">
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
                        <span className="text-sm">
                          Track {Math.round(weather.track_temperature)}°C
                        </span>
                        <div className="relative w-[5rem] h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full">
                          <div
                            className="absolute top-0 w-0.5 h-2 bg-white rounded-full shadow-sm"
                            style={{
                              left: `${Math.max(
                                0,
                                Math.min(
                                  100,
                                  ((weather.track_temperature - 15) /
                                    (60 - 15)) *
                                    100
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {getWeatherIcon()}
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
