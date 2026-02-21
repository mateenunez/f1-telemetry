import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import DriverPositionInfo from "@/components/telemetry/DriverPositionInfo";
import Minisectors from "@/components/telemetry/Minisectors";
import LapTimes from "@/components/telemetry/LapTimes";
import Tyres from "@/components/telemetry/Tyres";
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
import { audioUrl, useTelemetryAudio } from "@/hooks/use-raceControl";
import { usePreferences } from "@/context/preferences";
import DrsSpeed from "@/components/telemetry/DrsSpeed";
import Pits from "./Pits";
import DriverGap2 from "./DriverGap2";
import DriverGap1 from "@/components/telemetry/DriverGap1";

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
  fullWidth?: boolean;
  isMobile?: boolean;
  translate?: boolean;
  driverHeadshot?: boolean;
  audioEnabled?: boolean;
}

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
  fullWidth,
  isMobile,
  translate,
  driverHeadshot,
  audioEnabled,
}: DriverPositionsProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState<number | undefined>();
  const lastPlayedUtcRef = useRef<string | undefined>(
    lastCapture ? lastCapture.utc : undefined,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPosition = useRef(0);
  const { playNotificationSound } = useTelemetryAudio();
  const { playTeamRadioSound, radioAudioRef } = useTelemetryAudio();
  const { preferences } = usePreferences();
  let headshot = driverHeadshot;
  let popup = audioEnabled;

  if (translate === null) {
    translate = preferences.translate;
  }
  if (headshot === null) {
    headshot = preferences.headshot;
  }
  if (popup === null) {
    popup = preferences.audio;
  }

  useEffect(() => {
    if (!lastCapture || !popup) return;
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
    <Card className="w-full h-full bg-warmBlack border-none">
      <CardContent className="flex-1 h-full p-0 overflow-x-auto">
        <ScrollArea
          className={`${
            fullWidth && !isMobile ? "w-full" : "w-max"
          } h-full overflow-x-auto`}
          type="scroll"
          ref={scrollRef}
        >
          <table className="table-auto min-w-max w-full text-[0.6rem] text-gray-500">
            <thead className="sticky top-0 z-30 bg-warmBlack h-[2rem] font-orbitron">
              <tr className="text-center">
                <th
                  className={`text-center ${
                    headshot ? "w-[11.5rem]" : "w-[9rem]"
                  }`}
                >
                  {translate ? "PILOTO" : "DRIVER"}
                </th>
                <th className="w-[3rem] font-normal">
                  {translate ? "NEUM." : "TYRES"}
                </th>
                <th className="w-[3rem] font-normal">
                  {translate ? "DRS" : "SPEED"}
                </th>
                <th className="w-[3rem] font-normal">PITS</th>
                <th className="w-[3rem] font-normal">
                  {session?.session_type === "Race"
                    ? translate
                      ? "LÍDER"
                      : "LEADER"
                    : translate
                      ? "MEJOR VUELTA"
                      : "FASTEST"}
                </th>
                <th className="w-[3rem] font-normal">
                  {session?.session_type === "Race" ? "POS" : "INT"}
                </th>
                <th className="w-[5rem] text-center font-normal">
                  {translate ? "VUELTAS" : "LAP TIMES"}
                </th>
                <th className="w-[13rem] text-center font-normal">
                  {translate ? "MINISECTORES Y TIEMPOS" : "MINISECTORS & TIMES"}
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
                    (d) => d.driver_number === driver.driver_number,
                  );
                const isAboutToBeEliminated =
                  driver?.driver_number &&
                  aboutToBeEliminated.includes(driver?.driver_number);

                const baseStyle =
                  timing?.knockedOut || timing?.retired || timing?.stopped
                    ? {
                        opacity: 0.4,
                        background: `linear-gradient(-50deg, #0a0a0a ${
                          headshot ? "90%" : "100%"
                        }, #${driver?.team_colour} 100%)`,
                      }
                    : {
                        opacity: 1,
                        background: `linear-gradient(-50deg, ${
                          isAboutToBeEliminated
                            ? "#6b040447"
                            : isFavorite
                              ? "#" + driver?.team_colour + "30"
                              : "#0a0a0a"
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
                    <td className={`${headshot ? "w-[11.5rem]" : "w-[9rem]"}`}>
                      <DriverPositionInfo
                        position={pos}
                        driver={driver}
                        isPlaying={isPlayingAudio}
                        driverHeadshot={headshot}
                      />
                    </td>

                    <td className="w-[3rem]">
                      <Tyres driverStints={currentStints} />
                    </td>

                    <td className="w-[3rem]">
                      <DrsSpeed carData={carData} />
                    </td>

                    <td className="w-[3rem]">
                      <Pits timing={timing} driverStints={currentStints} />
                    </td>

                    <td className="w-[3rem]">
                      <DriverGap1 timing={timing} session={session} />
                    </td>

                    <td className="w-[3rem]">
                      <DriverGap2 timing={timing} session={session} />
                    </td>

                    <td className="w-[5rem]">
                      <LapTimes timing={timing} timingStats={timingStats} />
                    </td>

                    <td className="w-[13rem]">
                      <Minisectors timing={timing} timingStats={timingStats} />
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
