import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  ProcessedDriver,
  ProcessedPositionData,
  ProcessedTiming,
  TrackPosition,
  MapSector,
} from "@/processors";
import {
  fetchMap,
  createSectors,
  rotate,
  rad,
} from "@/processors/map-processor";
import { Oxanium } from "next/font/google";
import { getSectorColor } from "@/hooks/use-raceControl";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Card, CardContent } from "./ui/card";
import { useCorners, useSectors } from "@/hooks/use-cookies";

// This is basically fearlessly copied from
// https://github.com/tdjsnelling/monaco

const SPACE = 1000;
const ROTATION_FIX = 90;
const oxanium = Oxanium({ subsets: ["latin"], weight: "400" });

type Corner = {
  number: number;
  pos: TrackPosition;
  labelPos: TrackPosition;
  letter?: string;
};

type MapProps = {
  positions: ProcessedPositionData[];
  drivers: Record<number, ProcessedDriver>;
  timing: ProcessedTiming[];
  circuitKey: number;
  yellowSectors: Set<number>;
};

export default function Map({
  positions,
  drivers,
  timing,
  circuitKey,
  yellowSectors,
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
  const [corners, setCorners] = useState<Corner[]>([]);
  const [rotation, setRotation] = useState<number>(0);
  const [finishLine, setFinishLine] = useState<null | {
    x: number;
    y: number;
    startAngle: number;
  }>(null);

  const { corners: cornersCookie } = useCorners();
  const { sectors: sectorsCookie } = useSectors();

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

      const cornerPositions: Corner[] = mapJson.corners.map((corner) => ({
        number: corner.number,
        letter: corner.letter,
        pos: rotate(
          corner.trackPosition.x,
          corner.trackPosition.y,
          fixedRotation,
          centerX,
          centerY
        ),
        labelPos: rotate(
          corner.trackPosition.x + 540 * Math.cos(rad(corner.angle)),
          corner.trackPosition.y + 540 * Math.sin(rad(corner.angle)),
          fixedRotation,
          centerX,
          centerY
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
      setCorners(cornerPositions);

      setFinishLine({
        x: rotatedFinishLine.x,
        y: rotatedFinishLine.y,
        startAngle,
      });
    })();
  }, [circuitKey]);

  const totalSectors = sectors.length;
  const sector1End = Math.floor(totalSectors / 3); // Sector 7 (0-7 = 8 sectores)
  const sector2End = Math.floor((totalSectors * 2) / 3); // Sector 12 (8-12 = 5 sectores)
  const sector3End = totalSectors - 1;

  const renderedSectors = useMemo(() => {
    return sectors.map((sector, idx) => {
      const color = getSectorColor(
        sector,
        yellowSectors,
        sector1End,
        sector2End,
        idx,
        sectorsCookie
      );
      return {
        color,
        number: sector.number,
        strokeWidth:
          color == "stroke-yellow-400" ||
          "stroke-red-500" ||
          "stroke-blue-300" ||
          "stroke-orange-300" ||
          "stroke-white"
            ? 60
            : 120,
        d: `M${sector.points[0].x},${sector.points[0].y} ${sector.points
          .map((point) => `L${point.x},${point.y}`)
          .join(" ")}`,
      };
    });
  }, [sectors, yellowSectors, sectorsCookie]);

  if (!points || !minX || !minY || !widthX || !widthY) {
    return (
      <SkeletonTheme baseColor="#151515ff" highlightColor="#444">
        <Card className="lg:col-span-4 bg-warmBlack1 border-none border-2 flex flex-col mt-8">
          <CardContent className="flex flex-col justify-center h-full">
            <div className="overflow-hidden h-fit">
              <Skeleton height={400} width="100%" />
            </div>
          </CardContent>
        </Card>
      </SkeletonTheme>
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
          x={finishLine.x - 150}
          y={finishLine.y}
          width={300}
          height={50}
          fill="white"
          stroke="black"
          strokeWidth={20}
          transform={`rotate(${finishLine.startAngle + 90}, ${
            finishLine.x + 25
          }, ${finishLine.y})`}
        />
      )}

      {!sectorsCookie &&
        sectors.map((sector, idx) => {
          const startDx = sector.points[1]?.x - sector.points[0]?.x || 0;
          const startDy = sector.points[1]?.y - sector.points[0]?.y || 0;
          const startAngle = Math.atan2(startDy, startDx) * (180 / Math.PI);

          const endDx =
            sector.points[sector.points.length - 1]?.x -
              sector.points[sector.points.length - 2]?.x || 0;
          const endDy =
            sector.points[sector.points.length - 1]?.y -
              sector.points[sector.points.length - 2]?.y || 0;
          const endAngle = Math.atan2(endDy, endDx) * (180 / Math.PI);

          return (
            <g key={`sector-markers-${sector.number}`}>
              {idx == sector1End && (
                <g key={"sector-1"}>
                  <rect
                    x={sector.end.x - 150}
                    y={sector.end.y}
                    width={300}
                    height={40}
                    fill="red"
                    stroke="red"
                    opacity={0.8}
                    strokeWidth={20}
                    transform={`rotate(${endAngle + 90}, ${sector.end.x}, ${
                      sector.end.y
                    })`}
                  />
                </g>
              )}

              {idx == sector2End && (
                <g key={"sector-1"}>
                  <rect
                    x={sector.end.x - 150}
                    y={sector.end.y}
                    width={300}
                    height={40}
                    fill="blue"
                    stroke="blue"
                    opacity={0.8}
                    strokeWidth={20}
                    transform={`rotate(${endAngle + 90}, ${sector.end.x}, ${
                      sector.end.y
                    })`}
                  />
                </g>
              )}

              {idx == sector3End && (
                <g key={"sector-1"}>
                  <rect
                    x={sector.end.x - 150}
                    y={sector.end.y}
                    width={300}
                    height={40}
                    fill="orange"
                    stroke="orange"
                    opacity={0.8}
                    strokeWidth={20}
                    transform={`rotate(${endAngle + 90}, ${sector.end.x}, ${
                      sector.end.y
                    })`}
                  />
                </g>
              )}
            </g>
          );
        })}

      {cornersCookie &&
        corners.map((corner) => (
          <CornerNumber
            key={`corner.${corner.number}.${corner.letter && corner.letter}`}
            number={corner.number}
            x={corner.labelPos.x}
            y={corner.labelPos.y}
          />
        ))}

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
      className="fill-gray-600"
      fontSize={200}
      fontWeight="semibold"
      style={oxanium.style}
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
        stroke: "black",
        strokeWidth: "2",
        filter: "drop-shadow(0 0 4px rgba(0,0,0,0.8))",
      }}
    >
      {" "}
      <circle r={140} fill={color ? `#${color}44` : "#fff2"} stroke="none" />
      <circle id={`map.driver.circle`} r={120} />
      <circle r={90} fill="#0002" stroke="none" />
      <text
        id={`map.driver.text`}
        fontWeight="bold"
        fontSize={120 * 3}
        strokeWidth={0}
        style={{
          fontFamily: "Arial, sans-serif",
          transform: "translateX(100px) translateY(-160px)",
          textAnchor: "middle",
          dominantBaseline: "middle",
        }}
      >
        {name}
      </text>
    </g>
  );
};
