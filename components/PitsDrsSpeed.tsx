"use client";

import { Geist, Orbitron } from "next/font/google";
import type {
  ProcessedTiming,
  ProcessedCarData,
  ProcessedStint,
} from "@/processors";
import { JSX, useMemo } from "react";
import { getCompoundSvg } from "@/hooks/use-telemetry";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const orbitron = Orbitron({ subsets: ["latin"], weight: "400" });

interface PitsDrsSpeedProps {
  timing: ProcessedTiming | undefined;
  carData: ProcessedCarData | undefined;
  driverStints: ProcessedStint[] | undefined;
}

export default function PitsDrsSpeed({
  timing,
  carData,
  driverStints,
}: PitsDrsSpeedProps) {
  const previousStintCompounds = useMemo(() => {
    const arr: JSX.Element[] = [];
    if (!driverStints || driverStints.length < 2) return arr;
    for (let i = 0; i <= driverStints.length - 2; i++) {
      const stint = driverStints[i];
      arr.push(getCompoundSvg(stint.compound, i, 13));
    }
    return arr;
  }, [driverStints]);

  const getSpeedColor = (speed: number | undefined) => {
    if (speed === undefined) return "";
    if (speed > 330) return "text-red-500";
    if (speed > 300) return "text-yellow-300";
    return "";
  };

  return (
    <div className="flex flex-row gap-2">
      {/* DRS & Speed */}
      <div className="flex flex-col min-w-[3rem]">
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
          {carData?.speed !== undefined && carData.speed !== 0
            ? `${carData.speed} km/h`
            : "0 km/h"}
        </p>
      </div>
      {/* En PIT */}
      <div
        className="text-xs text-white self-center m-0 p-0 min-w-[2rem]"
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
            {driverStints && (
              <div className="flex flex-row gap-0 flex-wrap justify-center">
                {previousStintCompounds}
              </div>
            )}
            {timing?.number_of_pit_stops} PIT
          </span>
        )}
      </div>
    </div>
  );
}
