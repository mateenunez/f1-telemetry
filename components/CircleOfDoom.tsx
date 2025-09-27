import {
  ProcessedDriver,
  ProcessedPosition,
  ProcessedTiming,
} from "@/processors";
import { Geist } from "next/font/google";
import { useEffect, useMemo, useState } from "react";

interface CircleOfDoomProps {
  currentPositions: (ProcessedPosition | undefined)[];
  timings: (ProcessedTiming | undefined)[];
  driverInfos: (ProcessedDriver | undefined)[];
  currentLap: number | undefined;
  refDriver: number | null;
}

const ANGLE_OFFSET = 90;
const CLOCKWISE = true;
const tickLength = 3;
const strokeWidth = 2;
const cx = 50;
const cy = 50;
const r = 50 - strokeWidth / 2;

const deg2rad = (deg: number) => (deg * Math.PI) / 180;

const polarToCartesian = (angleDeg: number, radius = r) => {
  const rad = deg2rad(angleDeg);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy - radius * Math.sin(rad),
  };
};

const polar = (deg: number, radius: number) => {
  const rad = deg2rad(deg);
  return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
};

const getAngularPos = (ref: number, dri: number, lastLap: number) => {
  const angularPos = (dri - ref) / lastLap;
  return angularPos * 360;
};

const gapToNumber = (gap: string | undefined): number => {
  if (gap === undefined) return 0;
  const string = gap.slice(1);
  const number = Number(string);
  return number;
};

const laptimeToNumber = (laptime: string): number => {
  const parts = laptime.trim().split(":");
  if (parts.length !== 2) throw new Error("Formato inválido. Esperado M:SS:ms");

  const [mStr, sStr] = parts;
  const m = parseInt(mStr, 10);
  const sec = Number(sStr);

  if (Number.isNaN(m) || Number.isNaN(sec)) {
    throw new Error("Formato inválido. Usa números en M:SS:ms");
  }

  return m * 60 + sec;
};
const adjusted = (deg: number) => (CLOCKWISE ? -deg : deg) + ANGLE_OFFSET;

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

export default function CircleOfDoom({
  currentPositions,
  timings,
  driverInfos,
  currentLap,
  refDriver = 1,
}: CircleOfDoomProps) {
  const cleanTimings = useMemo(
    () => (timings ?? []).filter((t): t is ProcessedTiming => !!t),
    [timings]
  );

  const pilotRef = useMemo(() => {
    const info = driverInfos.find((d) => d?.driver_number === refDriver);
    const timing = cleanTimings.find((d) => d.driver_number === refDriver);
    return {
      name_acronym: info?.name_acronym,
      team_colour: info?.team_colour,
      last_lap_time: timing?.last_lap_time,
    };
  }, [driverInfos, cleanTimings, refDriver]);

  const markersDeg = useMemo(() => {
    const map = new Map<number, number>();
    const refPilot = cleanTimings.find((d) => d.driver_number === refDriver);
    if (
      !refPilot ||
      refPilot?.retired ||
      refPilot?.knockedOut ||
      refPilot.stopped
    )
      return map;
    const lastLapTime = laptimeToNumber(refPilot.last_lap_time);
    const refTime = gapToNumber(refPilot.gap_to_leader);
    if (!lastLapTime) return map;

    for (const dri of cleanTimings) {
      if (!(dri.retired || dri.knockedOut || dri.stopped)) {
        if (
          dri.gap_to_leader?.includes("L") ||
          dri.time_diff_to_fastest?.includes("L")
        )
          return map;
        const gapTime = gapToNumber(
          dri.gap_to_leader || dri.time_diff_to_fastest
        );
        const angularPos = getAngularPos(refTime, gapTime, lastLapTime);
        map.set(dri.driver_number, angularPos);
      }
    }
    return map;
  }, [cleanTimings, refDriver]);

  return (
    <div
      className={`col-span-5 max-h-[40vh] items-center flex justify-center w-full`}
    >
      <div className="w-[50%] flex justify-center aspect-square">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <circle
            cx={50}
            cy={50}
            r={50 - strokeWidth / 2}
            fill={"transparent"}
            stroke={"#4a4a4ad1"}
            strokeWidth={strokeWidth}
          />

          <g transform={`translate(${50}, ${50})`}>
            {currentLap && (
              <text
                x={0}
                y={-2} // pequeño ajuste vertical
                fontSize={8} // más grande
                fill="#e5e7eb" // gray-200
                textAnchor="middle"
                dominantBaseline="middle"
                style={mediumGeist.style}
              >
                LAP {currentLap}
              </text>
            )}
            <text
              x={0}
              y={8} // debajo de "LAP"
              fontSize={3} // más pequeño
              fill="#9ca3af" // gray-400
              textAnchor="middle"
              dominantBaseline="middle"
              style={mediumGeist.style}
            >
              LAST LAP TIME
            </text>
            <text
              x={0}
              y={12} // debajo de "LAST LAP TIME"
              fontSize={4} // más pequeño
              fill="#e5e7eb"
              textAnchor="middle"
              dominantBaseline="middle"
              style={mediumGeist.style}
            >
              {pilotRef?.last_lap_time}
            </text>
            <text
              x={0}
              y={18} // debajo de laptime
              fontSize={4} // más pequeño
              fill={"#" + (pilotRef?.team_colour || "e5e7eb")}
              textAnchor="middle"
              dominantBaseline="middle"
              style={mediumGeist.style}
            >
              {pilotRef?.name_acronym ? pilotRef.name_acronym : "Pick a Driver"}
            </text>
          </g>

          {currentPositions.map((dri, i) => {
            if (!dri) return;
            const deg = markersDeg?.get(dri?.driver_number);
            const driverInfo = driverInfos.find(
              (driver) => driver?.driver_number === dri.driver_number
            );
            if (deg === undefined) return;
            const outer = polarToCartesian(adjusted(deg), r);
            const inner = polarToCartesian(adjusted(deg), r - tickLength);
            const labelPos = polar(adjusted(deg), r - 10);

            return (
              <g key={i}>
                <line
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={"#" + driverInfo?.team_colour}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fontSize={4}
                  fill={"#" + driverInfo?.team_colour}
                  textAnchor="middle" // centra horizontalmente
                  dominantBaseline="middle" // centra verticalmente
                  style={mediumGeist.style}
                >
                  {driverInfo?.name_acronym}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
