import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

import {
  PositionData,
  ProcessedDriver,
  ProcessedPositionData,
  ProcessedTiming,
} from "@/processors";
import {
  TrackPosition,
  CandidateLap,
  MapSector,
} from "@/processors/map-processor";
import {
  fetchMap,
  createSectors,
  rotate,
  rad,
} from "@/processors/map-processor";
import { iMap } from "@/processors/map-processor";

// This is basically fearlessly copied from
// https://github.com/tdjsnelling/monaco

const SPACE = 1000;
const ROTATION_FIX = 90;

type Corner = {
  number: number;
  pos: TrackPosition;
  labelPos: TrackPosition;
};

type MapProps = {
  positions: ProcessedPositionData[];
  drivers: Record<number, ProcessedDriver>;
  timing: ProcessedTiming[];
  circuitKey: number;
};

export default function Map({
  positions,
  drivers,
  timing,
  circuitKey,
}: MapProps) {
  const [[minX, minY, widthX, widthY], setBounds] = useState<(null | number)[]>(
    [null, null, null, null]
  );
  const [[centerX, centerY], setCenter] = useState<(null | number)[]>([
    null,
    null,
  ]);

  const [points, setPoints] = useState<null | { x: number; y: number }[]>(null);
  const [sectors, setSectors] = useState<MapSector[]>([]);
  const [rotation, setRotation] = useState<number>(0);
  const [finishLine, setFinishLine] = useState<null | {
    x: number;
    y: number;
    startAngle: number;
  }>(null);

  useEffect(() => {
    (async () => {
      if (!circuitKey) return;
      const mapJson = await fetchMap(circuitKey);

      if (!mapJson) return;

      const centerX = (Math.max(...mapJson.x) - Math.min(...mapJson.x)) / 2;
      const centerY = (Math.max(...mapJson.y) - Math.min(...mapJson.y)) / 2;

      const fixedRotation = mapJson.rotation + ROTATION_FIX;

      const sectors = createSectors(mapJson).map((s) => ({
        ...s,
        start: rotate(s.start.x, s.start.y, fixedRotation, centerX, centerY),
        end: rotate(s.end.x, s.end.y, fixedRotation, centerX, centerY),
        points: s.points.map((p) =>
          rotate(p.x, p.y, fixedRotation, centerX, centerY)
        ),
      }));

      const rotatedPoints = mapJson.x.map((x, index) =>
        rotate(x, mapJson.y[index], fixedRotation, centerX, centerY)
      );

      const pointsX = rotatedPoints.map((item) => item.x);
      const pointsY = rotatedPoints.map((item) => item.y);

      const cMinX = Math.min(...pointsX) - SPACE;
      const cMinY = Math.min(...pointsY) - SPACE;
      const cWidthX = Math.max(...pointsX) - cMinX + SPACE * 2;
      const cWidthY = Math.max(...pointsY) - cMinY + SPACE * 2;

      const rotatedFinishLine = rotate(
        mapJson.x[0],
        mapJson.y[0],
        fixedRotation,
        centerX,
        centerY
      );

      const dx = rotatedPoints[3].x - rotatedPoints[0].x;
      const dy = rotatedPoints[3].y - rotatedPoints[0].y;
      const startAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      setCenter([centerX, centerY]);
      setBounds([cMinX, cMinY, cWidthX, cWidthY]);
      setSectors(sectors);
      setPoints(rotatedPoints);
      setRotation(fixedRotation);
      setFinishLine({
        x: rotatedFinishLine.x,
        y: rotatedFinishLine.y,
        startAngle,
      });
    })();
  }, [circuitKey]);

  const renderedSectors = useMemo(() => {
    return sectors.map((sector) => {
      const color = "stroke-white";
      return {
        color,
        number: sector.number,
        strokeWidth: color === "stroke-white" ? 60 : 120,
        d: `M${sector.points[0].x},${sector.points[0].y} ${sector.points
          .map((point) => `L${point.x},${point.y}`)
          .join(" ")}`,
      };
    });
  }, [sectors]);

  if (!points || !minX || !minY || !widthX || !widthY) {
    return (
      <div className="h-full w-full p-2" style={{ minHeight: "35rem" }}>
        <div className="h-full w-full animate-pulse rounded-lg bg-zinc-800" />
      </div>
    );
  }

  return (
    <svg
      viewBox={`${minX} ${minY} ${widthX} ${widthY}`}
      className="h-full w-full xl:max-h-screen cursor-pointer"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="stroke-gray-800"
        strokeWidth={300}
        strokeLinejoin="round"
        fill="transparent"
        d={`M${points[0].x},${points[0].y} ${points
          .map((point) => `L${point.x},${point.y}`)
          .join(" ")}`}
      />

      {renderedSectors.map((sector) => {
        return (
          <path
            key={`map.sector.${sector.number}`}
            className={sector.color}
            strokeWidth={sector.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="transparent"
            d={sector.d}
          />
        );
      })}

      {finishLine && (
        <rect
          x={finishLine.x - 75}
          y={finishLine.y}
          width={240}
          height={20}
          fill="red"
          stroke="red"
          strokeWidth={70}
          transform={`rotate(${finishLine.startAngle + 90}, ${
            finishLine.x + 25
          }, ${finishLine.y})`}
        />
      )}

      {centerX && centerY && positions && drivers && (
        <>
          {Object.values(drivers)
            .reverse()
            .map((driver) => {
              const pos = positions.find(
                (p) => p.driver_number === driver.driver_number
              );
              const tim = timing.find(
                (t) => t.driver_number === driver.driver_number
              );
              if (!pos || !tim) return null;
              return (
                <CarDot
                  key={`map.driver.${driver.driver_number}`}
                  name={driver.name_acronym}
                  color={driver.team_colour}
                  pos={pos}
                  timing={tim}
                  rotation={rotation}
                  centerX={centerX}
                  centerY={centerY}
                />
              );
            })}
        </>
      )}
    </svg>
  );
}

type CornerNumberProps = {
  number: number;
  x: number;
  y: number;
};

type PositionCar = {
  Status: string;
  X: number;
  Y: number;
  Z: number;
};

const CornerNumber: React.FC<CornerNumberProps> = ({ number, x, y }) => {
  return (
    <text
      x={x}
      y={y}
      className="fill-zinc-700"
      fontSize={300}
      fontWeight="semibold"
    >
      {number}
    </text>
  );
};

type CarDotProps = {
  name: string;
  color: string | undefined;

  pos: PositionCar;
  rotation: number;

  centerX: number;
  centerY: number;

  timing: ProcessedTiming;
};

const CarDot = ({
  pos,
  name,
  color,
  rotation,
  centerX,
  centerY,
  timing,
}: CarDotProps) => {
  const rotatedPos = rotate(pos.X, pos.Y, rotation, centerX, centerY);
  const transform = [
    `translateX(${rotatedPos.x}px)`,
    `translateY(${rotatedPos.y}px)`,
  ].join(" ");
  const isRetired = timing.retired || false;

  return (
    <g
      className={clsx("fill-zinc-700")}
      style={{
        transition: "all 1s linear",
        transform,
        ...(color && { fill: `#${color}` }),
        opacity: isRetired ? 0.4 : 1,
        stroke: "white",
        strokeWidth: "2",
        filter: "drop-shadow(0 0 4px rgba(0,0,0,0.8))",
      }}
    >
      <circle id={`map.driver.circle`} r={120} />
      <text
        id={`map.driver.text`}
        fontWeight="bold"
        fontSize={120 * 3}
        style={{
          transform: "translateX(150px) translateY(-120px)",
        }}
      >
        {name}
      </text>
    </g>
  );
};
