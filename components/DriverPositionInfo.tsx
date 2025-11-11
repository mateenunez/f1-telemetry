"use client";

import { Badge } from "@/components/ui/badge";
import { Geist, Aldrich } from "next/font/google";
import type { ProcessedPosition, ProcessedDriver } from "@/processors";
import SoundWave from "./SoundWave";
import { usePreferences } from "@/context/preferences";
import { config } from "@/lib/config";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const aldrich = Aldrich({ subsets: ["latin"], weight: "400" });
interface DriverPositionInfoProps {
  position: ProcessedPosition;
  driver: ProcessedDriver | undefined;
  isPlaying: number | undefined;
}

export default function DriverPositionInfo({
  position,
  driver,
  isPlaying,
}: DriverPositionInfoProps) {
  const { getPreference } = usePreferences();
  const headshot = getPreference("headshot");

  return (
    <div
      className={`flex flex-row items-center ${
        headshot ? "min-w-[11.5rem]" : "min-w-[9rem]"
      }`}
    >
      {/* Posición */}
      <div
        className={`flex flex-row items-center ${
          headshot ? "min-w-[5.75rem]" : "min-w-[3.75rem]"
        }`}
      >
        <Badge
          className="w-[2rem] text-[1rem] items-center font-bold pr-[0px] pl-4"
          style={{
            backgroundColor: `transparent`,
            fontFamily: aldrich.style.fontFamily,
          }}
        >
          {position.position}
        </Badge>

        {headshot && (
          <div>
            {driver && (
              <img
                src={
                  driver.driver_number === 43
                    ? config.public.blobBaseUrl + "/43.png"
                    : driver?.headshot_url || config.public.blobBaseUrl + "/driver.png"
                }
                className="object-cover h-[60px]"
                alt={`${driver.name_acronym} headshot f1 telemetry`}
              />
            )}
          </div>
        )}
      </div>

      {/* Info del piloto */}
      <div className="flex justify-evenly flex-row " style={aldrich.style}>
        <div className="flex flex-col self-start">
          <div className="flex items-center gap-1">
            <span
              className="text-xs text-gray-400 self-center"
              style={mediumGeist.style}
            >
              #{position.driver_number}
            </span>
            <span
              className="font-semibold text-sm text-white flex flex-row items-center"
              style={mediumGeist.style}
            >
              {driver?.name_acronym}{" "}
              {isPlaying === driver?.driver_number && (
                <span className="ml-2">
                  <SoundWave
                    teamColor={driver?.team_colour}
                    width={undefined}
                  />
                </span>
              )}
            </span>
          </div>
          <p
            className="text-xs text-gray-100 truncate"
            style={
              headshot
                ? { color: "white" }
                : { color: "#" + driver?.team_colour }
            }
          >
            {driver?.team_name}
          </p>
        </div>
      </div>
    </div>
  );
}
