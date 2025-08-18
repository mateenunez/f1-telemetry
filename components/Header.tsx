"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, CloudRain, Sun, Cloud } from "lucide-react";
import { Geist } from "next/font/google";
import { Anta } from "next/font/google";
import F1Calendar from "@/components/Calendar";
import type { TelemetryData } from "@/telemetry-manager";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const regularAnta = Anta({ subsets: ["latin"], weight: "400" });

interface HeaderProps {
  telemetryData: TelemetryData | null;
}

export default function Header({ telemetryData }: HeaderProps) {
  const session = telemetryData?.session;
  const weather = telemetryData?.weather;

  const getWeatherIcon = () => {
    if (!weather) return <Sun className="h-4 w-4" />;
    if (weather.rainfall > 0) return <CloudRain className="h-4 w-4" />;
    if (weather.humidity > 80) return <Cloud className="h-4 w-4" />;
    return <Sun className="h-4 w-4" />;
  };

  return (
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
  );
}
