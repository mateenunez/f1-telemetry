"use client";

import {
  ProcessedDriver,
  ProcessedPosition,
  ProcessedStint,
} from "@/processors";
import { getCompoundSvg } from "@/hooks/use-telemetry";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { getCompoundColor, parseLapTime } from "@/utils/telemetry";

interface TyresListProps {
  positions: ProcessedPosition[] | undefined;
  driverStints: (ProcessedStint[] | undefined)[];
  driverInfos: (ProcessedDriver | undefined)[];
  totalLaps: number | undefined;
  sessionType?: string | null;
  dict?: any;
  translate?: boolean;
  favoriteDrivers?: ProcessedDriver[];
}

export default function TyresList({
  positions,
  driverStints,
  driverInfos,
  totalLaps = 52,
  sessionType,
  translate,
  favoriteDrivers,
}: TyresListProps) {
  const isRace = String(sessionType ?? "")
    .toLowerCase()
    .includes("race");
  const noRaceMessage = translate
    ? "Historial de compuestos solo disponible en carreras."
    : "Tyres compound history is available on a Race.";
  const noDataMessage = translate
    ? "No hay datos de neumáticos disponibles."
    : "No tyre data available.";

  if (!positions || !totalLaps || !isRace) {
    const message = !isRace ? noRaceMessage : noDataMessage;
    return (
      <Card className="flex w-full h-full bg-warmBlack border-none">
        <CardContent className="overflow-x-hidden w-full px-6 my-4 h-full">
          <div className="min-h-[15rem] items-center justify-center flex">
            <p className="text-xs text-gray-400 font-geist font-medium">
              {message}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  let bestLapTimeValue = Number.POSITIVE_INFINITY;
  let bestLapTimeString = "99:99.999";
  const compoundUsage: Record<string, number> = {};
  let totalLapsAllStints = 0;
  let totalStintsCount = 0;
  const totalDrivers = driverStints.length;
  let totalPitStops = 0;

  for (const driverStintsList of driverStints) {
    if (!driverStintsList) return;
    totalPitStops += driverStintsList.length - 1;

    for (const stint of driverStintsList) {
      const currentLapTime = parseLapTime(stint.lap_time);
      if (currentLapTime < bestLapTimeValue) {
        bestLapTimeValue = currentLapTime;
        bestLapTimeString = stint.lap_time;
      }
      compoundUsage[stint.compound] =
        (compoundUsage[stint.compound] || 0) + stint.total_laps;
      totalLapsAllStints += stint.total_laps;
      totalStintsCount++;
    }
  }

  const mostUsedCompound = Object.entries(compoundUsage).reduce(
    (most, [compound, laps]) => {
      return laps > most.laps ? { compound, laps } : most;
    },
    { compound: "", laps: 0 },
  );

  const averageCompoundAge = Math.floor(totalLapsAllStints / totalStintsCount);

  const averagePitStops = Math.max(
    Math.round((totalPitStops / totalDrivers) * 100) / 100,
    0,
  );
  return (
    <Card className="flex w-full h-full bg-warmBlack border-none">
      <CardContent className="overflow-x-hidden w-full px-6 my-4 h-full">
        <ScrollArea
          className="overflow-x-auto h-[18rem] lg:h-[80%] p-0"
          type="scroll"
        >
          {positions.map((pos, idx) => {
            const driver = driverInfos[idx];
            const stints = driverStints[idx];
            const isFavorite =
              driver?.driver_number &&
              favoriteDrivers?.some(
                (d) => d.driver_number === driver.driver_number,
              );
            const personalBestStint = stints?.reduce(
              (best, stint) => {
                return !best || stint.lap_time < best.lap_time ? stint : best;
              },
              undefined as ProcessedStint | undefined,
            );
            return (
              <div
                className="flex flex-row gap-2 py-1 w-full items-center justify-center mb-4"
                style={{
                  background: isFavorite
                    ? "#" + driver?.team_colour + "30"
                    : "#0a0a0a",
                }}
                key={idx}
              >
                <div className={`flex flex-row gap-2 items-center`}>
                  <div
                    className={`flex flex-row gap-1 items-center min-w-[3rem]`}
                  >
                    <Badge
                      className="w-[2rem] text-sm items-center font-bold pr-[0px] font-aldrich"
                      style={{
                        backgroundColor: `transparent`,
                      }}
                    >
                      {pos.position}
                    </Badge>

                    <div className="w-[2rem]">
                      <p
                        className="text-xs text-gray-100 flex items-center font-f1-regular"
                        style={{
                          color: "#" + driver?.team_colour,
                        }}
                      >
                        {driver?.name_acronym}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-full items-center mr-6">
                  <div
                    className={`flex w-full h-[5px] bg-warmBlack rounded-sm`}
                  >
                    {stints &&
                      stints.map((stint, index) => {
                        const widthPercentage =
                          (stint.total_laps / totalLaps) * 100;
                        const backgroundColor = getCompoundColor(
                          stint.compound,
                        );
                        const accumulatedLaps = stints
                          .slice(0, index + 1)
                          .reduce((sum, s) => sum + s.total_laps, 0);
                        const isPersonalBestStint =
                          stint.lap_time === personalBestStint?.lap_time;
                        const isBestStint =
                          stint.lap_time === bestLapTimeString;
                        return (
                          <div
                            key={index}
                            className="relative rounded-sm"
                            style={{
                              width: `${widthPercentage}%`,
                              backgroundColor,
                              borderRight:
                                index < stints.length - 1
                                  ? `4px solid ${isFavorite ? "#" + driver?.team_colour : "#000"}`
                                  : "none",
                              borderLeft:
                                index !== 0
                                  ? `4px solid ${isFavorite ? "#" + driver?.team_colour : "#000"}`
                                  : "none",
                              borderRadius: "0px",
                            }}
                          >
                            <div
                              className="absolute"
                              style={{
                                left: "50%",
                                top: "-1.5rem",
                                transform: "translateX(-50%)",
                              }}
                            >
                              <span
                                className={`text-xs font-oxanium whitespace-nowrap ${
                                  isPersonalBestStint
                                    ? isBestStint
                                      ? "text-f1Purple"
                                      : "text-f1Green"
                                    : "text-white"
                                }`}
                              >
                                {stint.lap_time}
                              </span>
                            </div>
                            <div
                              className="absolute"
                              style={{
                                right: index < stints.length - 1 ? "-2px" : "0",
                                top: "4px",
                                transform: "translateX(50%)",
                              }}
                            >
                              <span
                                className="text-xs text-white mt-1 font-geist text-center px-4 whitespace-nowrap"
                                style={{
                                  display:
                                    stint.lap_number === totalLaps ||
                                    stint.total_laps === 0
                                      ? "none"
                                      : "block",
                                }}
                              >
                                {accumulatedLaps} L
                              </span>
                            </div>
                            {index === 0 && (
                              <div
                                className="absolute"
                                style={{
                                  left: "0",
                                  top: "4px",
                                  transform: "translateX(-50%)",
                                }}
                              >
                                <span className="text-xs mt-1 ml-5 text-white font-geist block text-center whitespace-nowrap">
                                  0 L
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollArea>
        <div className="flex flex-row gap-2 items-center w-full justify-evenly pt-4">
          <div className="flex flex-col gap-1 h-[2rem] items-center">
            <span className="text-xs lg:text-md font-geist font-medium text-offWhite">
              {translate ? "MÁS USADO" : "MOST USED"}
            </span>
            {getCompoundSvg(mostUsedCompound.compound, 9, 30)}
          </div>
          <div className="flex flex-col gap-1 h-[2rem] items-center">
            <span className="text-xs font-geist font-medium text-offWhite">
              {translate ? "PROM. VUELTAS" : "AVG. LAP AGE"}
            </span>
            <span className="text-xl font-geist font-medium text-offWhite">
              {averageCompoundAge || 0}
            </span>
          </div>
          <div className="flex flex-col gap-1 h-[2rem] items-center">
            <span className="text-xs font-geist font-medium text-offWhite">
              {translate ? "PROM. PITS" : "AVG. PIT STOPS"}
            </span>
            <span className="text-xl font-geist font-medium text-offWhite">
              {averagePitStops || 0}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
