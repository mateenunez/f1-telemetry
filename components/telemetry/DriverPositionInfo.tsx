"use client";

import { Badge } from "@/components/ui/badge";
import type { ProcessedPosition, ProcessedDriver } from "@/processors";
import SoundWave from "./SoundWave";
import { usePreferences } from "@/context/preferences";
import { config } from "@/lib/config";
interface DriverPositionInfoProps {
  position: ProcessedPosition;
  driver: ProcessedDriver | undefined;
  isPlaying: number | undefined;
  driverHeadshot?: boolean;
}

export default function DriverPositionInfo({
  position,
  driver,
  isPlaying,
  driverHeadshot,
}: DriverPositionInfoProps) {
  const { preferences } = usePreferences();
  let headshot = driverHeadshot;

  if (headshot === null) {
    headshot = preferences.headshot;
  }

  let posDiff = 0;
  if (driver?.grid_position)
    posDiff = position.position - driver?.grid_position;

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
          className="w-[2rem] text-[1rem] items-center font-bold pr-[0px] pl-4 font-aldrich"
          style={{
            backgroundColor: `transparent`,
          }}
        >
          {position.position}
        </Badge>

        {headshot && (
          <div>
            {driver && (
              <img
                src={driver?.headshot_url || config.public.assets.driver}
                className="object-cover h-[60px]"
                alt={`${driver.name_acronym} headshot f1 telemetry`}
              />
            )}
          </div>
        )}
      </div>

      {/* Info del piloto */}
      <div className="flex justify-evenly flex-row font-f1-regular">
        <div className="flex flex-col self-start">
          <div className="flex items-center gap-1">
            <span className="text-xs text-white flex flex-row items-center font-f1-regular gap-2">
              {driver?.name_acronym}{" "}
              <span
                className={`text-xs self-center font-geist ${
                  posDiff > 0
                    ? "text-f1Red"
                    : posDiff < 0
                      ? "text-f1Green"
                      : "text-white/75"
                }`}
              >
                {posDiff > 0 && `▼${posDiff}`}
                {posDiff < 0 && `▲${Math.abs(posDiff)}`}
                {posDiff === 0 && ""}
              </span>
              {isPlaying === driver?.driver_number && (
                <span>
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
