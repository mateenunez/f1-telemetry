import {
  ProcessedDriver,
  ProcessedPosition,
  ProcessedTiming,
} from "@/processors";
import { useMemo } from "react";

interface CircleOfDoomProps {
  currentPositions: (ProcessedPosition | undefined)[];
  timings: (ProcessedTiming | undefined)[];
  driverInfos: (ProcessedDriver | undefined)[];
  refDriver: number | undefined;
}


export default function CircleOfDoom({
  currentPositions,
  timings,
  driverInfos,
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
    if (gap === undefined || gap.includes("LAP") || !gap) return 0;
    const string = gap.slice(1);
    const number = Number(string) || 0;
    return number;
  };

  const adjusted = (deg: number) => (CLOCKWISE ? -deg : deg) + ANGLE_OFFSET;

  const cleanTimings = useMemo(
    () => (timings ?? []).filter((t): t is ProcessedTiming => !!t),
    [timings]
  );

  const pilotRef = useMemo(() => {
    const info = driverInfos.find((d) => d?.driver_number === refDriver);
    const timing = cleanTimings.find((d) => d.driver_number === refDriver);
    const refIndex = currentPositions.findIndex(
      (pos) => pos?.driver_number === refDriver
    );
    const gapToAhead = timing?.time_diff_to_ahead || timing?.interval_to_ahead;
    return {
      name_acronym: info?.name_acronym,
      team_colour: info?.team_colour,
      last_lap_time: timing?.last_lap_time,
      position: refIndex + 1,
      gapToAhead: gapToAhead,
    };
  }, [driverInfos, cleanTimings, refDriver]);

  const adjacentDrivers = useMemo(() => {
    const refIndex = pilotRef.position;

    if (refIndex === -1) return { ahead: null, behind: null };

    const aheadPosition = currentPositions[refIndex - 2];
    const behindPosition = currentPositions[refIndex];

    const aheadTiming = aheadPosition
      ? timings.find((t) => t?.driver_number === aheadPosition.driver_number)
      : null;

    const behindTiming = behindPosition
      ? timings.find((t) => t?.driver_number === behindPosition.driver_number)
      : null;

    const isAheadOutOfCompetition = aheadTiming
      ? aheadTiming.retired || aheadTiming.knockedOut || aheadTiming.stopped
      : true;

    const isBehindOutOfCompetition = behindTiming
      ? behindTiming.retired || behindTiming.knockedOut || behindTiming.stopped
      : true;

    const aheadGapToRef = pilotRef.gapToAhead?.replace("+", "-");

    const behindGapToRef =
      behindTiming?.time_diff_to_ahead || behindTiming?.interval_to_ahead;

    return {
      ahead:
        aheadPosition && !isAheadOutOfCompetition
          ? {
              position: refIndex,
              driver: aheadPosition,
              driverInfo: driverInfos.find(
                (d) => d?.driver_number === aheadPosition.driver_number
              ),
              gap: aheadGapToRef,
            }
          : null,
      behind:
        behindPosition && !isBehindOutOfCompetition
          ? {
              position: refIndex + 2,
              driver: behindPosition,
              driverInfo: driverInfos.find(
                (d) => d?.driver_number === behindPosition.driver_number
              ),
              gap: behindGapToRef,
            }
          : null,
    };
  }, [currentPositions, timings, driverInfos, refDriver, pilotRef]);

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

    let gtl = 0;
    let gapToLeaders = new Map();

    currentPositions.forEach((d, idx) => {
      const driverTimings = timings.find(
        (dt) => dt?.driver_number === d?.driver_number
      );
      const diffAhead =
        driverTimings?.time_diff_to_ahead || driverTimings?.interval_to_ahead;
      const gapTime = gapToNumber(diffAhead);
      gtl = gtl + gapTime;
      gapToLeaders.set(d?.driver_number, gtl);
    });

    const lastLapTime = gtl + 5; // 5 segundos agregados arbitrariamente.
    if (!lastLapTime) return map;

    const pitStopTime = 24; // Segundos que tarda un pit stop promedio
    const pitAngularPos = (pitStopTime / lastLapTime) * 360; // Posición angular del pit
    map.set(924, pitAngularPos); // 924 key arbitraria seleccionada por dejar caer la mano en el teclado.

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
  const pitOuter = polarToCartesian(adjusted(pitStopDeg || 60), r + tickLength);
  const pitInner = polarToCartesian(adjusted(pitStopDeg || 60), r - tickLength);
  const pitLabelPos = polar(adjusted(pitStopDeg || 60), r - 7);

  return (
    <div className="flex items-center bg-warmBlack  flex justify-center w-full seventh-step">
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

          {pitStopDeg !== undefined && (
            <g>
              <line
                x1={pitInner.x}
                y1={pitInner.y}
                x2={pitOuter.x}
                y2={pitOuter.y}
                stroke={"#b197fc"}
                strokeWidth={4}
              />
              <text
                x={pitLabelPos.x}
                y={pitLabelPos.y}
                fontSize={4}
                fill="#b197fc"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={(() => {
                  const angle = adjusted(pitStopDeg) + 90; // tangent to the circle
                  const finalAngle =
                    angle > 90 && angle < 270 ? angle - 180 : angle; // keep text upright
                  return `rotate(${finalAngle} ${pitLabelPos.x} ${pitLabelPos.y})`;
                })()}
                className="font-f1-regular"
              >
                PIT
              </text>
            </g>
          )}

          <g transform={`translate(${50}, ${45})`}>
            {adjacentDrivers.ahead && (
              <g>
                <text
                  x={0}
                  y={-20}
                  fontSize={6}
                  fill={
                    "#" +
                    (adjacentDrivers.ahead.driverInfo?.team_colour || "e5e7eb")
                  }
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-f1-regular"
                >
                  {"P" +
                    adjacentDrivers.ahead.driver.position +
                    " " +
                    adjacentDrivers.ahead.driverInfo?.name_acronym}
                </text>
                <text
                  x={0}
                  y={-13}
                  fontSize={5}
                  fill={"#e5e7eb"}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-geist font-medium"
                >
                  {adjacentDrivers.ahead.gap}
                </text>
              </g>
            )}

            {refDriver && (
              <g>
                <text
                  x={0}
                  y={0}
                  fontSize={7}
                  fill={"#" + (pilotRef?.team_colour || "e5e7eb")}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-f1-regular"
                >
                  {pilotRef?.name_acronym &&
                    "P" + pilotRef.position + " " + pilotRef.name_acronym}
                </text>
                <text
                  x={0}
                  y={8}
                  fontSize={6}
                  fill="#e5e7eb"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-geist font-medium"
                >
                  {pilotRef?.last_lap_time}
                </text>
              </g>
            )}

            {adjacentDrivers.behind && (
              <g>
                <text
                  x={0}
                  y={20}
                  fontSize={6}
                  fill={
                    "#" +
                    (adjacentDrivers.behind.driverInfo?.team_colour || "e5e7eb")
                  }
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-f1-regular"
                >
                  {"P" +
                    adjacentDrivers.behind.driver.position +
                    " " +
                    adjacentDrivers.behind.driverInfo?.name_acronym}
                </text>
                <text
                  x={0}
                  y={27}
                  fontSize={5}
                  fill={"#e5e7eb"}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-geist font-medium"
                >
                  {adjacentDrivers.behind.gap}
                </text>
              </g>
            )}
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
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={(() => {
                    const angle = adjusted(deg) + 90; // tangent to the circle
                    const finalAngle =
                      angle > 90 && angle < 270 ? angle - 180 : angle; // keep text upright
                    return `rotate(${finalAngle} ${labelPos.x} ${labelPos.y})`;
                  })()}
                  className="font-f1-regular"
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
