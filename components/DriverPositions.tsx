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
import { memo, useEffect, useRef, useState } from "react";
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
}: DriverPositionsProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState<number | undefined>();
  const lastPlayedUtcRef = useRef<string | undefined>(
    lastCapture ? lastCapture.utc : undefined
  );
  const { playNotificationSound } = useTelemetryAudio();
  const { playTeamRadioSound, radioAudioRef } = useTelemetryAudio();
  const { getPreference, preferences } = usePreferences();
  const headshot = getPreference("headshot");

  useEffect(() => {
    if (!lastCapture) return;
    if (session?.session_status !== "Finalised") return;
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

  return (
    <Card className="lg:col-span-6 bg-warmBlack border-none max-h-screen">
      <CardContent className="overflow-x-auto flex-1 max-h-[90vh] h-full p-0">
        <ScrollArea className="overflow-x-auto min-w-max h-full" type="scroll">
          <div
            style={orbitron.style}
            className="sticky top-0 z-30 bg-warmBlack w-full py-1.5"
          >
            <div className="py-1.5 text-[0.6rem] text-gray-400/50 text-center">
              <div className="flex flex-row gap-3">
                <div
                  className={`min-w-[${headshot ? "11.5rem" : "9rem"}]`}
                ></div>
                <div className="flex flex-row items-start justify-around w-full gap-2">
                  <div className="min-w-[3rem]">TYRES</div>
                  <div
                    className={`flex flex-row ${headshot ? "gap-2" : "gap-4"}`}
                  >
                    <div className="min-w-[2rem]">SPEED</div>
                    <div className="min-w-[2rem]">PITS</div>
                  </div>
                  <div className="w-[8.5rem] flex flex-row items-center align-text-top gap-6 justify-center">
                    <div className="text-center min-w-[2.5rem]">
                      {session?.session_type === "Race" ? "LEADER" : "FASTEST"}
                    </div>
                    <div className="text-center min-w-[2.5rem]">
                      {session?.session_type === "Race" ? "POS" : "INT"}
                    </div>
                  </div>
                  <div className="min-w-[4.5rem] text-center">LAP TIMES</div>
                  <div className="min-w-[16rem]">MINISECTORS & TIMES</div>
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
              const currentStints = driverStints[idx];
              const isFavorite = driver?.driver_number && preferences.favoriteDrivers.some((d) => d.driver_number ===driver.driver_number);

              return (
                <div
                  key={pos.driver_number}
                  className={`flex items-center gap-2 rounded-md transition-opacity max-w-full overflow-x-auto min-w-0 min-h-full cursor-pointer`}
                  onDoubleClick={() => handlePinnedDriver(pos.driver_number)}
                  style={
                    timing?.knockedOut || timing?.retired || timing?.stopped
                      ? {
                          opacity: 0.4,
                          background: `linear-gradient(-90deg, #0d0d0d ${
                            headshot ? "90%" : "100%"
                          }, #${driver?.team_colour} 100%)`,
                        }
                      : {
                          opacity: 1,
                          background: `linear-gradient(-90deg, #0d0d0d ${
                            headshot ? "90%" : "100%"
                          }, #${driver?.team_colour} 100%)`,
                          boxShadow: isFavorite ? 'inset 0 0 0.2rem 0.2rem rgba(255, 255, 255, 0.15)' : ""
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
                  <div className="flex flex-row items-center justify-around w-full py-1.5 gap-2 overflow-x-auto">
                    <Tyres driverStints={currentStints} />
                    <PitsDrsSpeed
                      timing={timing}
                      carData={carData}
                      driverStints={currentStints}
                    />
                    <DriverGaps timing={timing} session={session} />
                    <LapTimes timing={timing} timingStats={timingStats} />
                    <Minisectors timing={timing} timingStats={timingStats} />
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
