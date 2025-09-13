"use client";

import { Badge } from "@/components/ui/badge";
import { Volume2 } from "lucide-react";
import { Geist, Aldrich } from "next/font/google";
import type {
  ProcessedPosition,
  ProcessedDriver,
} from "@/processors";


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
  isPlaying
}: DriverPositionInfoProps) {

  return (
    <div className="flex flex-row items-center min-w-[11.5rem]">
      {/* Posición */}
      <div className="flex flex-row items-center min-w-[5.75rem]">
        <Badge
          className="w-8 h-8 rounded-full flex items-center justify-center text-md font-bold pr-0 min-w-[2rem]"
          style={{
            backgroundColor: `transparent`,
            fontFamily: aldrich.style.fontFamily,
          }}
        >
          {position.position}
        </Badge>

        {driver?.headshot_url && (
          <img
            src={driver?.headshot_url}
            className="obect-cover h-[60px]"
            alt={`${driver.name_acronym} headshot`}
          />
        )}
        {driver?.driver_number === 43 && (
          <img
            src="/franco-colapinto.png"
            className="obect-cover h-[60px]"
            alt="Franco Colapinto"
          />
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
                <span
                  className="ml-2"
                  style={{ color: "#" + driver?.team_colour }}
                >
                  <Volume2 size={14} />
                </span>
              )}
            </span>
          </div>
          <p className="text-xs text-gray-100 truncate">{driver?.team_name}</p>
        </div>
      </div>
    </div>
  );
}
