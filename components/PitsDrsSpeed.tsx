"use client";

import { Geist, Orbitron } from "next/font/google";
import type { ProcessedTiming, ProcessedCarData } from "@/processors";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const orbitron = Orbitron({ subsets: ["latin"], weight: "400" });

interface PitsDrsSpeedProps {
  timing: ProcessedTiming | undefined;
  carData: ProcessedCarData | undefined;
}

export default function PitsDrsSpeed({ timing, carData }: PitsDrsSpeedProps) {
  const getSpeedColor = (speed: number | undefined) => {
    if (speed === undefined) return "";
    if (speed > 330) return "text-red-500";
    if (speed > 300) return "text-yellow-300";
    return "";
  };

  return (
    <div className="flex flex-row gap-4">
      {/* DRS & Speed */}
      <div className="flex flex-col">
        <span
          className="text-xs text-white self-center"
          style={mediumGeist.style}
        >
          {carData?.drs ? (
            <p className="text-green-400">DRS</p>
          ) : (
            <p className="text-gray-500">DRS</p>
          )}
        </span>

        {/* Velocidad */}
        <p
          style={mediumGeist.style}
          className={`text-[0.6rem] text-white ${getSpeedColor(
            carData?.speed
          )}`}
        >
          {(carData?.speed !== undefined && carData.speed !== 0) ? `${carData.speed} km/h` : ""}
        </p>
      </div>
      {/* En PIT */}
      <p
        className="text-xs text-white self-center m-0 p-0"
        style={orbitron.style}
      >
        {timing?.in_pit ? (
          <span className="text-f1Blue flex flex-col" style={mediumGeist.style}>
            IN PIT
            <span
              style={mediumGeist.style}
              className="text-[0.6rem] text-white text-center"
            >
              {timing?.number_of_pit_stops} PIT
            </span>
          </span>
        ) : (
          <span style={mediumGeist.style}>
            {timing?.number_of_pit_stops} PIT
          </span>
        )}
      </p>
    </div>
  );
}
