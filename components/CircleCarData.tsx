import { usePreferences } from "@/context/preferences";
import {
  ProcessedCarData,
  ProcessedDriver,
  ProcessedPosition,
  ProcessedTiming,
} from "@/processors";
import { Geist } from "next/font/google";
import { useEffect, useMemo, useState } from "react";

interface CircleCarDataProps {
  driverInfo: (ProcessedDriver | undefined)[];
  carData: ProcessedCarData | undefined;
  size?: number;
}

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

export function CircleCarData({
  driverInfo,
  carData,
  size = 100,
}: CircleCarDataProps) {
  const { preferences } = usePreferences();

  const cx = 50;
  const cy = 50;
  const r = 50 - 5 / 2;

  const deg2rad = (deg: number) => (deg * Math.PI) / 180;

  const polar = (deg: number, radius: number) => {
    const rad = deg2rad(deg);
    return { x: cx - radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
  };
  const strokeWidth = 4;
  const outerRadius = (size - strokeWidth) / 2;
  const outerCircumference = 2 * Math.PI * outerRadius;

  const blueArcLength = (270 / 360) * outerCircumference; // 270 degrees arc
  const speed = carData?.speed || 0;
  const speedFraction = Math.min(Math.max(speed, 0), 360) / 360;
  const speedProgressDistance = speedFraction * blueArcLength;
  const speedStrokeDashoffset = blueArcLength - speedProgressDistance;

  const innerRadius = outerRadius - strokeWidth - 0.5;
  const innerCircumference = 2 * Math.PI * innerRadius;

  const throttleArcLength = (1 / 2) * innerCircumference;
  const throttle = carData?.throttle || 0;
  const throttleProgress = Math.min(Math.max(throttle, 0), 100) / 100;
  const throttleDistance = throttleProgress * throttleArcLength;
  const throttleStrokeDashoffset = throttleArcLength - throttleDistance;

  const brakes = carData?.brake || 0;
  const brakesArcLength = (88 / 360) * innerCircumference;
  const brakesProgress = Math.min(Math.max(brakes, 0), 100) / 100;
  const brakesDistance = brakesProgress * brakesArcLength;
  const brakesStrokeDashoffset = brakesArcLength - brakesDistance;

  const drs = carData?.drs || false;
  const rpm = carData?.rpm || 0;
  const driver = driverInfo.find(
    (d) => d?.driver_number === carData?.driver_number
  );
  const gear = carData?.gear || 0;

  const speedMarks = [0, 60, 120, 180, 240, 300, 360];

  return (
    <div className="flex items-center flex justify-center w-full eighth-step">
      <div>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Outer speed circle background */}
          <circle
            cx={50}
            cy={50}
            r={outerRadius}
            fill={"transparent"}
            stroke={"rgb(40, 40, 40)"}
            strokeWidth={strokeWidth}
            strokeDasharray={`${blueArcLength} ${outerCircumference}`}
            transform={`rotate(135 ${size / 2} ${size / 2})`}
          />
          {/* Outer speed circle progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={outerRadius}
            fill="none"
            stroke="#3B82F6"
            strokeWidth={strokeWidth}
            strokeDasharray={`${blueArcLength} ${outerCircumference}`}
            strokeDashoffset={speedStrokeDashoffset}
            transform={`rotate(135 ${size / 2} ${size / 2})`}
            className="transition-all duration-300 ease-out"
          />
          {/* Throttle background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            fill="none"
            stroke="rgb(40, 40, 40)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${throttleArcLength} ${innerCircumference}`}
            transform={`rotate(135 ${size / 2} ${size / 2})`}
          />
          {/* Throttle progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            fill="none"
            stroke="#51cf66"
            strokeWidth={strokeWidth}
            strokeDasharray={`${throttleArcLength} ${innerCircumference}`}
            strokeDashoffset={throttleStrokeDashoffset}
            transform={`rotate(135 ${size / 2} ${size / 2})`}
            className="transition-all duration-300 ease-out"
          />
          {/* Brakes background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            fill="none"
            stroke="rgb(40, 40, 40)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${brakesArcLength} ${innerCircumference}`}
            transform={`rotate(225 ${size / 2} ${
              size / 2
            }) scale(-1, 1) translate(-${size}, 0)`}
          />
          {/* Brakes progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            fill="none"
            stroke="#A6051A"
            strokeWidth={strokeWidth}
            strokeDasharray={`${brakesArcLength} ${innerCircumference}`}
            strokeDashoffset={brakesStrokeDashoffset}
            transform={`rotate(225 ${size / 2} ${
              size / 2
            }) scale(-1, 1) translate(-${size}, 0)`}
            className="transition-all duration-300 ease-out"
          />
          {/* Centered text (Speed, RPM, DRS) */}
          <g>
            <text
              x={50}
              y={25}
              fill="rgb(255, 255, 255)"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
              dominantBaseline="middle"
              style={mediumGeist.style}
            >
              {speed}
            </text>
            <text
              x={50}
              y={33}
              fill="rgb(201, 199, 199)"
              fontSize="4"
              fontFamily="monospace"
              textAnchor="middle"
              dominantBaseline="middle"
              style={mediumGeist.style}
            >
              km/h
            </text>
            <text
              x={50}
              y={43}
              fill="rgb(255, 255, 255)"
              fontSize="5"
              fontFamily="monospace"
              textAnchor="middle"
              dominantBaseline="middle"
              style={mediumGeist.style}
            >
              {preferences.translate ? "MARCHA" : "GEAR"} {gear}
            </text>
            <text
              x={50}
              y={53}
              fontSize="6"
              fontFamily="monospace"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontFamily: mediumGeist.style.fontFamily,
                fill: driver ? "#" + driver.team_colour : "rgb(201, 199, 199)",
              }}
            >
              {driver ? (
                driver.name_acronym
              ) : (
                <>{preferences ? "ELEGIR PILOTO" : "PICK DRIVER"}</>
              )}
            </text>
            <text
              x={50}
              y={65}
              fill="rgb(255, 255, 255)"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
              dominantBaseline="middle"
              style={mediumGeist.style}
            >
              {rpm}
            </text>
            <text
              x={50}
              y={73}
              fill="rgb(201, 199, 199)"
              fontSize="4"
              fontFamily="monospace"
              textAnchor="middle"
              dominantBaseline="middle"
              style={mediumGeist.style}
            >
              RPM
            </text>
            <text
              x={50}
              y={85}
              fontSize="10"
              fontWeight={"bold"}
              fontFamily="monospace"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontFamily: mediumGeist.style.fontFamily,
                fill: drs ? "#51cf66" : "rgb(40,40,40)",
              }}
            >
              DRS
            </text>
          </g>

          {/* Speed units */}
          {speedMarks.map((mark, idx) => {
            const speed = mark;
            const speedFraction = Math.min(Math.max(speed, 0), 360) / 300;
            const speedProgressDistance = speedFraction * blueArcLength;
            const speedStrokeDashoffset = blueArcLength - speedProgressDistance;
            const labelPos = polar(-speedStrokeDashoffset, -r+10);
            return (
              <g key={idx}>
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fontSize={3.5}
                  fill={"rgb(201, 199, 199)"}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={mediumGeist.style}
                >
                  {mark}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
