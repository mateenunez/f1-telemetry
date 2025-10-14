import { usePreferences } from "@/context/preferences";
import {
  ProcessedDriver,
  ProcessedPosition,
  ProcessedTiming,
} from "@/processors";
import { Geist } from "next/font/google";
import { useMemo } from "react";

interface CircleOfDoomProps {
  currentPositions: (ProcessedPosition | undefined)[];
  timings: (ProcessedTiming | undefined)[];
  driverInfos: (ProcessedDriver | undefined)[];
  currentLap: number | undefined;
  refDriver: number | undefined;
}

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

export default function CircleOfDoom({
  currentPositions,
  timings,
  driverInfos,
  currentLap,
  refDriver = 1,
}: CircleOfDoomProps) {
  const ANGLE_OFFSET = 90;
  const CLOCKWISE = true;
  const tickLength = 2;
  const strokeWidth = 4.5;
  const cx = 50;
  const cy = 50;
  const r = 50 - strokeWidth / 2;

  const deg2rad = (deg: number) => (deg * Math.PI) / 180;

  const polarToCartesian = (angleDeg: number, radius = r) => {
    const rad = deg2rad(angleDeg);
    return {
      x: cx - radius * Math.cos(rad),
      y: cy - radius * Math.sin(rad),
    };
  };

  const polar = (deg: number, radius: number) => {
    const rad = deg2rad(deg);
    return { x: cx - radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
  };

  const getAngularPos = (ref: number, dri: number, lastLap: number) => {
    const angularPos = (dri - ref) / lastLap;
    return angularPos * 360;
  };

  const gapToNumber = (gap: string | undefined): number => {
    if (gap === undefined || gap.includes("LAP")) return 0;
    const string = gap.slice(1);
    const number = Number(string);
    return number;
  };

  const laptimeToNumber = (laptime: string): number => {
    const parts = laptime.trim().split(":");
    if (parts.length !== 2)
      throw new Error("Formato inválido. Esperado M:SS:ms");

    const [mStr, sStr] = parts;
    const m = parseInt(mStr, 10);
    const sec = Number(sStr);

    if (Number.isNaN(m) || Number.isNaN(sec)) {
      throw new Error("Formato inválido. Usa números en M:SS:ms");
    }

    return m * 60 + sec;
  };
  const adjusted = (deg: number) => (CLOCKWISE ? -deg : deg) + ANGLE_OFFSET;

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
    if (!lastLapTime) return map;

    const pitStopTime = 24; // Segundos que tarda un pit stop promedio
    const pitAngularPos = (pitStopTime / lastLapTime) * 360; // Posición angular del pit
    map.set(924, pitAngularPos); // 924 key arbitraria seleccionada por dejar caer la mano en el teclado.

    let gtl = 0;
    let gapToLeaders = new Map();

    currentPositions.map((d) => {
      const driverTimings = timings.find(
        (dt) => dt?.driver_number === d?.driver_number
      );
      const diffAhead =
        driverTimings?.time_diff_to_ahead || driverTimings?.interval_to_ahead;
      const gapTime = gapToNumber(diffAhead);
      gtl = gtl + gapTime;
      gapToLeaders.set(d?.driver_number, gtl);
    });

    const refTime = gapToLeaders.get(refPilot.driver_number);

    for (const dri of cleanTimings) {
      if (!(dri.retired || dri.knockedOut || dri.stopped)) {
        const gapTime = gapToLeaders.get(dri.driver_number);
        const angularPos = getAngularPos(refTime, gapTime, lastLapTime);
        map.set(dri.driver_number, angularPos);
      }
    }
    return map;
  }, [cleanTimings, refDriver]);

  const pitStopDeg = markersDeg.get(924);
  const pitInner = polarToCartesian(adjusted(pitStopDeg || 60), r);

  return (
    <div className={`flex items-center flex justify-center w-full `}>
      <div>
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
            stroke={"rgb(40, 40, 40)  "}
            strokeWidth={strokeWidth}
          />

          {
            <g>
              <line
                x1={pitInner.x - tickLength}
                y1={pitInner.y}
                x2={pitInner.x + tickLength}
                y2={pitInner.y}
                stroke={"#3B82F6"}
                strokeWidth={2}
                strokeLinecap="round"
              />
              <text
                x={pitInner.x + 10}
                y={pitInner.y}
                fontSize={3}
                fill="#3B82F6"
                textAnchor="middle"
                dominantBaseline="middle"
                strokeLinecap="round"
                style={mediumGeist.style}
              >
                PIT TIME
              </text>
            </g>
          }

          <g transform={`translate(${50}, ${45})`}>
            {refDriver && (
              <g>
                {currentLap && (
                  <text
                    x={0}
                    y={-2} // pequeño ajuste vertical
                    fontSize={10} // más grande
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
                  fontSize={5} // más pequeño
                  fill="#9ca3af" // gray-400
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={mediumGeist.style}
                >
                  LAST LAP TIME
                </text>
                <text
                  x={0}
                  y={16} // debajo de "LAST LAP TIME"
                  fontSize={6} // más pequeño
                  fill="#e5e7eb"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={mediumGeist.style}
                >
                  {pilotRef?.last_lap_time}
                </text>
              </g>
            )}

            <text
              x={0}
              y={24} // debajo de laptime
              fontSize={7} // más pequeño
              fill={"#" + (pilotRef?.team_colour || "e5e7eb")}
              textAnchor="middle"
              dominantBaseline="middle"
              style={mediumGeist.style}
            >
              {pilotRef?.name_acronym ? pilotRef.name_acronym : "PICK DRIVER"}
            </text>
          </g>

          {currentPositions.map((dri, i) => {
            if (!dri) return;
            const deg = markersDeg?.get(dri?.driver_number);
            const driverInfo = driverInfos.find(
              (driver) => driver?.driver_number === dri.driver_number
            );
            if (deg === undefined || Number.isNaN(deg)) return;
            const outer = polarToCartesian(adjusted(deg), r + tickLength);
            const inner = polarToCartesian(adjusted(deg), r - tickLength);
            const labelPos = polar(adjusted(deg), r - 7);

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
                  style={{ opacity: deg > 360 || deg < -360 ? 0.3 : 1 }}
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fontSize={4}
                  fill={"#" + driverInfo?.team_colour}
                  textAnchor="middle" // centra horizontalmente
                  dominantBaseline="middle" // centra verticalmente
                  style={{
                    fontFamily: mediumGeist.style.fontFamily,
                    opacity: deg > 360 ? 0.6 : 1,
                  }}
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
