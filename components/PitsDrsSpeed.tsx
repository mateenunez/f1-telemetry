"use client";

import { Geist, Orbitron } from "next/font/google";
import type {
  ProcessedTiming,
  ProcessedCarData,
  ProcessedStint,
} from "@/processors";
import { JSX, useMemo } from "react";
import { getCompoundSvg } from "@/hooks/use-telemetry";

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
    <div className="flex flex-row gap-2 w-[6rem] justify-around">
      {/* DRS & Speed */}
      <div className="flex flex-col w-[3rem]">
        <span className="text-xs text-white self-center font-f1-regular">
          {carData?.drs ? (
            <p className="text-green-400">DRS</p>
          ) : (
            <p className="text-gray-500">DRS</p>
          )}
        </span>

        {/* Velocidad */}
        <p
          className={`text-[0.6rem] text-white text-center font-f1-regular ${getSpeedColor(
            carData?.speed
          )}`}
        >
          {carData?.speed !== undefined && carData.speed !== 0
            ? carData.speed
            : 0}
          <span className="text-[8px]">km/h</span>
        </p>
      </div>
      {/* En PIT */}
      <div className="text-[10px] text-white self-center m-0 p-0 min-w-[2rem] font-f1-regular">
        {timing?.in_pit ? (
          <span className="flex flex-col">
            <p className="text-f1Blue text-nowrap flex flex-nowrap">IN PIT</p>
            <span className="text-[0.6rem] text-white text-center font-f1-regular">
              {timing?.number_of_pit_stops} PIT
            </span>
          </span>
        ) : (
          <span className="font-f1-regular">
            {driverStints && (
              <div className="flex flex-row gap-0 justify-start flex-wrap">
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
