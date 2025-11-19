import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import DriverPositionInfo from "@/components/DriverPositionInfo";
import PitsDrsSpeed from "@/components/PitsDrsSpeed";
import Minisectors from "@/components/Minisectors";
import LapTimes from "@/components/LapTimes";
import DriverGaps from "@/components/DriverGaps";
import Tyres from "@/components/Tyres";
import {
  ProcessedPosition,
  ProcessedDriver,
  ProcessedTiming,
  ProcessedTimingStats,
  ProcessedCarData,
  ProcessedStint,
  ProcessedCapture,
  ProcessedSession,
} from "@/processors";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Orbitron } from "next/font/google";
import { audioUrl, useTelemetryAudio } from "@/hooks/use-raceControl";
import { usePreferences } from "@/context/preferences";

interface DriverPositionsProps {
  positions: ProcessedPosition[];
  driverInfos: (ProcessedDriver | undefined)[];
  driverTimings: (ProcessedTiming | undefined)[];
  driverTimingStats: (ProcessedTimingStats | undefined)[];
  driverCarData: (ProcessedCarData | undefined)[];
  driverStints: (ProcessedStint[] | undefined)[];
  lastCapture: ProcessedCapture | undefined;
  handlePinnedDriver: (driverNumber: number) => void;
  session: ProcessedSession | null | undefined;
  aboutToBeEliminated: number[];
}

const orbitron = Orbitron({ subsets: ["latin"], weight: "400" });

const DriverPositions = memo(function DriverPositions({
  positions,
  driverInfos,
  driverTimings,
  driverTimingStats,
  driverCarData,
  driverStints,
  lastCapture,
  handlePinnedDriver,
  session,
  aboutToBeEliminated,
}: DriverPositionsProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState<number | undefined>();
  const lastPlayedUtcRef = useRef<string | undefined>(
    lastCapture ? lastCapture.utc : undefined
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPosition = useRef(0);
  const { playNotificationSound } = useTelemetryAudio();
  const { playTeamRadioSound, radioAudioRef } = useTelemetryAudio();
  const { getPreference, preferences } = usePreferences();
  const headshot = getPreference("headshot");

  useEffect(() => {
    if (!lastCapture) return;
    if (session?.session_status === "Finalised") return;
    if (lastPlayedUtcRef.current !== lastCapture.utc) {
      const url = audioUrl + session?.path + lastCapture.path;
      playNotificationSound();
      playTeamRadioSound(url);
      lastPlayedUtcRef.current = lastCapture.utc;
    }
  }, [lastCapture]);

  useEffect(() => {
    if (!radioAudioRef.current || !lastCapture) return;

    const handlePlay = () => setIsPlayingAudio(lastCapture.racingNumber);
    const handleEnded = () => setIsPlayingAudio(undefined);

    radioAudioRef.current.addEventListener("play", handlePlay);
    radioAudioRef.current.addEventListener("ended", handleEnded);

    return () => {
      radioAudioRef.current?.removeEventListener("play", handlePlay);
      radioAudioRef.current?.removeEventListener("ended", handleEnded);
    };
  }, [radioAudioRef.current, lastCapture]);

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollPosition.current = scrollRef.current.scrollTop;
    }
  }, [positions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollPosition.current;
    }
  });

  return (
    <Card className="lg:col-span-5 bg-warmBlack border-none max-h-screen">
      <CardContent className="overflow-x-auto flex-1 max-h-[90vh] h-full p-0 first-step">
        <ScrollArea
          className="overflow-x-auto min-w-max h-full"
          type="scroll"
          ref={scrollRef}
        >
          <table
            className="table-auto min-w-max w-full text-[0.6rem] text-gray-500"
            style={{ borderCollapse: "separate", borderSpacing: "0 0.5rem" }}
          >
            <thead
              style={orbitron.style}
              className="sticky top-0 z-30 bg-warmBlack h-[2rem]"
            >
              <tr className="text-center">
                <th
                  className={`text-center ${
                    headshot ? "min-w-[11.5rem]" : "min-w-[9rem]"
                  }`}
                >
                  {preferences.translate ? "PILOTO" : "DRIVER"}
                </th>
                <th className="min-w-[3rem] font-normal">
                  {preferences.translate ? "NEUM." : "TYRES"}
                </th>
                <th className="w-[6rem] font-normal">
                  <div className="flex flex-row justify-around">
                    <div className="min-w-[3rem] text-center">
                      {preferences.translate ? "DRS" : "SPEED"}
                    </div>
                    <div className="min-w-[3rem] text-center">PITS</div>
                  </div>
                </th>
                <th className="w-[7rem] font-normal">
                  <div className="flex flex-row items-center gap-4 justify-around">
                    <div className="text-center min-w-[2.5rem]">
                      {session?.session_type === "Race"
                        ? preferences.translate
                          ? "LÍDER"
                          : "LEADER"
                        : preferences.translate
                        ? "MEJOR VUELTA"
                        : "FASTEST"}
                    </div>
                    <div className="text-start min-w-[2.5rem]">
                      {session?.session_type === "Race" ? "POS" : "INT"}
                    </div>
                  </div>
                </th>
                <th className="w-[5rem] text-center font-normal">
                  {preferences.translate ? "VUELTAS" : "LAP TIMES"}
                </th>
                <th className="min-w-[13rem] text-center font-normal">
                  {preferences.translate
                    ? "MINISECTORES Y TIEMPOS"
                    : "MINISECTORS & TIMES"}
                </th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos, idx) => {
                const driver = driverInfos[idx];
                const timing = driverTimings[idx];
                const timingStats = driverTimingStats[idx];
                const carData = driverCarData[idx];
                const currentStints = driverStints[idx];
                const isFavorite =
                  driver?.driver_number &&
                  preferences.favoriteDrivers.some(
                    (d) => d.driver_number === driver.driver_number
                  );
                const isAboutToBeEliminated =
                  driver?.driver_number &&
                  aboutToBeEliminated.includes(driver?.driver_number);

                const baseStyle =
                  timing?.knockedOut || timing?.retired || timing?.stopped
                    ? {
                        opacity: 0.4,
                        background: `linear-gradient(-90deg, #0d0d0d ${
                          headshot ? "90%" : "100%"
                        }, #${driver?.team_colour} 100%)`,
                      }
                    : {
                        opacity: 1,
                        background: `linear-gradient(-90deg, ${
                          isAboutToBeEliminated
                            ? "#6b040447"
                            : isFavorite
                            ? "#" + driver?.team_colour + "30"
                            : "#0d0d0d"
                        } ${
                          headshot && !isAboutToBeEliminated ? "90%" : "100%"
                        }, #${driver?.team_colour} 100%)`,
                      };

                return (
                  <tr
                    key={pos.driver_number}
                    className="transition-all cursor-pointer py-1.5"
                    onDoubleClick={() => handlePinnedDriver(pos.driver_number)}
                    style={baseStyle}
                  >
                    <td className="rounded-l-md">
                      <DriverPositionInfo
                        position={pos}
                        driver={driver}
                        isPlaying={isPlayingAudio}
                      />
                    </td>

                    <td>
                      <Tyres driverStints={currentStints} />
                    </td>

                    <td>
                      <div className="flex flex-row w-[6rem]">
                        <PitsDrsSpeed
                          timing={timing}
                          carData={carData}
                          driverStints={currentStints}
                        />
                      </div>
                    </td>

                    <td>
                      <div className="w-[7.5rem] flex flex-row items-center gap-4 justify-around">
                        <DriverGaps timing={timing} session={session} />
                      </div>
                    </td>

                    <td>
                      <LapTimes timing={timing} timingStats={timingStats} />
                    </td>

                    <td className="rounded-r-md">
                      <div className="min-w-[13rem]">
                        <Minisectors
                          timing={timing}
                          timingStats={timingStats}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

export default DriverPositions;
