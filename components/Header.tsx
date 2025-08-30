"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, CloudRain, Sun, Cloud } from "lucide-react";
import { Geist, Orbitron } from "next/font/google";
import F1Calendar from "@/components/Calendar";
import type { TelemetryData } from "@/telemetry-manager";
import { useEffect, useState } from "react";

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
    if (!weather) return <Sun className="h-8 w-8 text-orange-300" />;
    if (weather.rainfall > 0)
      return <CloudRain className="h-8 w-8 text-f1Blue" />;
    if (weather.humidity > 80) return <Cloud className="h-8 w-8 text-f1Blue" />;
    return <Sun className="h-8 w-8 text-orange-300" />;
  };

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
            {session?.date_end && new Date(session?.date_end) < new Date() ? (
              <F1Calendar />
            ) : (
              <>

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
                                ((weather.track_temperature - 15) / (40 - 15)) *
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
