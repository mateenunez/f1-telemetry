import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { memo, useEffect, useRef, useState } from "react";
import { Orbitron } from "next/font/google";
import { audioUrl, useTelemetryAudio } from "@/hooks/use-raceControl";

interface DriverPositionsProps {
  positions: ProcessedPosition[];
  driverInfos: (ProcessedDriver | undefined)[];
  driverTimings: (ProcessedTiming | undefined)[];
  driverTimingStats: (ProcessedTimingStats | undefined)[];
  driverCarData: (ProcessedCarData | undefined)[];
  driverStints: (ProcessedStint | undefined)[];
  lastCapture: ProcessedCapture | undefined;
  pinnedDriver: number | null;
  handlePinnedDriver: (driverNumber: number) => void;
  session: ProcessedSession | null | undefined;
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
  pinnedDriver,
  handlePinnedDriver,
  session,
}: DriverPositionsProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState<number | undefined>();
  const lastPlayedUtcRef = useRef<string | undefined>(undefined);
  const { playNotificationSound } = useTelemetryAudio();
  const { playTeamRadioSound, radioAudioRef } = useTelemetryAudio();

  useEffect(() => {
    if (!lastCapture) return;
    if (new Date(lastCapture.utc).getDay() !== new Date().getDay()) return;
    // Solo reproducir si el utc es diferente al último reproducido
    if (lastPlayedUtcRef.current !== lastCapture.utc) {
      const url = audioUrl + session?.path + lastCapture.path;
      lastPlayedUtcRef.current = lastCapture.utc;
      playNotificationSound();
      playTeamRadioSound(url);
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
  }, [radioAudioRef.current]);

  return (
    <Card className="lg:col-span-6 bg-warmBlack1 border-none max-h-screen">
      <CardContent className="overflow-x-auto flex-1 max-h-[90vh] h-full p-0">
        <ScrollArea className="overflow-x-auto min-w-max h-full" type="scroll">
          <div style={orbitron.style}>
            <div className="py-1.5 text-[0.6rem] text-gray-400/20 text-center">
              <div className="flex flex-row gap-6">
                <div className="min-w-[11.5rem]">DRIVER</div>
                <div className="flex flex-row items-start justify-between w-full">
                  <div className="flex flex-row gap-2">
                    <div className="min-w-[2rem]">DRS</div>
                    <div className="min-w-[2rem]">PIT</div>
                  </div>
                  <div className="min-w-[10rem]">MINISECTORS</div>
                  <div className="min-w-[4.3rem]">SECTOR TIMES</div>
                  <div className="min-w-[7rem]">LAP TIMES</div>
                  <div className="min-w-[8rem]">GAPS</div>
                  <div className="min-w-[2rem]">TYRES</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {positions.map((pos, idx) => {
              const driver = driverInfos[idx];
              const timing = driverTimings[idx];
              const timingStats = driverTimingStats[idx];
              const carData = driverCarData[idx];
              const currentStint = driverStints[idx];

              return (
                <div
                  key={pos.driver_number}
                  className={`flex items-center gap-4 rounded-md transition-opacity ${
                    pinnedDriver === pos.driver_number
                      ? `border-offWhite sticky top-0 z-10`
                      : ""
                  } max-w-full overflow-x-auto min-w-0 min-h-full cursor-pointer`}
                  onDoubleClick={() => handlePinnedDriver(pos.driver_number)}
                  style={
                    timing?.knockedOut || timing?.retired || timing?.stopped
                      ? {
                          opacity: 0.4,
                          background: `linear-gradient(-90deg, #0d0d0d 94%, #${driver?.team_colour} 100%)`,
                        }
                      : {
                          opacity: 1,
                          background: `linear-gradient(-90deg, #0d0d0d 94%, #${driver?.team_colour}8D 100%)`,
                        }
                  }
                >
                  {/* Posición y datos del Piloto */}
                  <DriverPositionInfo
                    position={pos}
                    driver={driver}
                    isPlaying={isPlayingAudio}
                  />

                  {/* Estadísticas */}
                  <div className="flex flex-row items-center justify-around w-full py-1.5 gap-4 md:gap-2 lg:gap-2">
                    <PitsDrsSpeed timing={timing} carData={carData} />
                    <Minisectors timing={timing} timingStats={timingStats} />
                    <LapTimes timing={timing} timingStats={timingStats} />
                    <DriverGaps timing={timing} session={session} />
                    <Tyres currentStint={currentStint} />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

export default DriverPositions;
