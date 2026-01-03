"use client";

import type { ProcessedCarData } from "@/processors";

interface DrsSpeedProps {
  carData: ProcessedCarData | undefined;
}

export default function DrsSpeed({ carData }: DrsSpeedProps) {
  const getSpeedColor = (speed: number | undefined) => {
    if (speed === undefined) return "";
    if (speed > 330) return "text-red-500";
    if (speed > 300) return "text-yellow-300";
    return "";
  };

  return (
    <div className="flex flex-row gap-2 justify-around w-full">
      {/* DRS */}
      <div className="flex flex-col min-w-[3rem] w-full items-center">
        <span className="text-xs text-white self-center font-f1-regular">
          {carData?.drs ? (
            <p className="text-green-400">DRS</p>
          ) : (
            <p className="text-gray-500">DRS</p>
          )}
        </span>

        {/* Speed */}
        <p
          className={`text-[0.6rem] text-white font-geist ${getSpeedColor(
            carData?.speed
          )}`}
        >
          {carData?.speed !== undefined && carData.speed !== 0
            ? `${carData.speed} km/h`
            : "0 km/h"}
        </p>
      </div>
    </div>
  );
}
