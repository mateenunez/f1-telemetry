"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import F1Calendar from "@/components/calendar/Calendar";
import type { TelemetryData } from "@/telemetry-manager";
import { useEffect, useState } from "react";
import {
  ensureUtc,
  formatTime,
  getCountryCode,
  parseTimeOffset,
  translateSessionName,
  translateSessionStatus,
} from "@/utils/calendar";
import PreferencesPanel from "./PreferencesPanel";
import { usePreferences } from "@/context/preferences";
import Weather from "./Weather";
import { config } from "@/lib/config";

interface HeaderProps {
  telemetryData: TelemetryData | null;
  dict: any;
}

export default function Header({ telemetryData, dict }: HeaderProps) {
  const session = telemetryData?.session;
  const weather = telemetryData?.weather;
  const [sessionTime, setSessionTime] = useState<number>();

  const { preferences } = usePreferences();

  useEffect(() => {
    if (!session?.date_end) return;

    const offset = parseTimeOffset(session.gmt_offset);
    const endTime = new Date(ensureUtc(session.date_end)).getTime() - offset;

    if (session.session_status === "Finalised") return;

    const update = () => {
      const now = telemetryData?.lastUpdateTime.getTime();
      if (!now) return;

      // Qualy
      if (session.series && session.series.length > 0) {
        const activePart = session.series.slice(-1)[0];
        if (activePart) {
          const partNumber = activePart.QualifyingPart;
          let durationMinutes: number;
          switch (partNumber) {
            case 1: // Q1
              durationMinutes = 18;
              break;
            case 2: // Q2
              durationMinutes = 15;
              break;
            case 3: // Q3
              durationMinutes = 12;
              break;
            default:
              durationMinutes = 60;
              return;
          }

          const partStartTime =
            new Date(ensureUtc(activePart.Utc)).getTime() - offset;
          const partEndTime = partStartTime + durationMinutes * 60 * 1000;
          const remaining = Math.max(0, partEndTime - now);
          setSessionTime(remaining);
        } else {
          setSessionTime(0);
        }
      } else {
        // Race
        const remaining = Math.max(0, endTime - now);
        setSessionTime(remaining);
      }
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [session?.session_status, telemetryData?.lastUpdateTime]);

  return (
    <Card className="bg-warmBlack1 text-white border-b-2 border-t-0 border-l-0 border-r-0 rounded-none border-gray-800 relative fourth-step">
      <CardHeader className="p-2">
        <div className="flex flex-col md:flex-row lg:flex-row items-center justify-between gap-1">
          <div className="flex flex-row md:justify-start items-center mx-4">
            <div className="flex flex-row gap-4 w-full justify-center items-center">
              <PreferencesPanel driverInfo={telemetryData?.drivers} dict={dict} />
              <div className="flex flex-col md:flex-row items-center justify-center">
                <div className="flex items-center flex-col">
                  <CardTitle className="flex flex-row items-center gap-4 text-md sm:text-xl font-orbitron font-normal">
                    <img
                      src={`https://flagsapi.com/${getCountryCode(
                        session?.location || ""
                      )}/flat/64.png`}
                      alt={`Flag of ${session?.location}`}
                      className="w-[25%]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = config.public.assets.chequered_flag;
                        target.onerror = null;
                      }}
                    />
                    <div className="flex flex-col">
                      <div className="flex flex-row items-center gap-2 w-full md:text-nowrap md:flex-nowrap">
                        {preferences.translate
                          ? "Gran Premio de " + session?.circuit_short_name
                          : session?.circuit_short_name + " Grand Prix"}
                        {": "}
                        {preferences.translate
                          ? translateSessionName(session?.session_name)
                          : session?.session_name}
                        {" " +
                          (session?.series.slice(-1)[0]?.QualifyingPart || "")}
                      </div>
                      <div className="flex flex-row items-center gap-4 text-md tracking-wide">
                        <span className="font-orbitron">
                          {preferences.translate
                            ? translateSessionStatus(session?.session_status)
                            : session?.session_status}
                        </span>
                        {session?.session_status !== "Finalised" &&
                          sessionTime !== undefined && (
                            <span className="text-xl text-offWhite font-orbitron">
                              {formatTime(sessionTime)}
                            </span>
                          )}
                      </div>
                    </div>
                  </CardTitle>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center text-nowrap flex-col md:flex-row text-xs md:text-sm font-orbitron">
            {session?.session_status === "Finalised" ? (
              <F1Calendar dict={dict} />
            ) : (
              weather && <Weather weather={weather} dict={dict} />
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
