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
import { memo } from "react";

interface DriverPositionsProps {
  positions: ProcessedPosition[];
  driverInfos: (ProcessedDriver | undefined)[];
  driverTimings: (ProcessedTiming | undefined)[];
  driverTimingStats: (ProcessedTimingStats | undefined)[];
  driverCarData: (ProcessedCarData | undefined)[];
  driverStints: (ProcessedStint | undefined)[];
  lastCaptures: (ProcessedCapture | undefined)[];
  pinnedDriver: number | null;
  handlePinnedDriver: (driverNumber: number) => void;
  session: ProcessedSession | null | undefined;
}

const DriverPositions = memo(function DriverPositions({
  positions,
  driverInfos,
  driverTimings,
  driverTimingStats,
  driverCarData,
  driverStints,
  lastCaptures,
  pinnedDriver,
  handlePinnedDriver,
  session,
}: DriverPositionsProps) {
  return (
    <Card className="lg:col-span-6 bg-warmBlack1 border-none max-h-screen">
      <CardContent className="overflow-x-auto flex-1 max-h-[90vh] h-full p-0">
        <ScrollArea className="overflow-x-auto min-w-max h-full" type="scroll">
          <div className="space-y-2">
            {positions.map((pos, idx) => {
              const driver = driverInfos[idx];
              const timing = driverTimings[idx];
              const timingStats = driverTimingStats[idx];
              const carData = driverCarData[idx];
              const currentStint = driverStints[idx];
              const lastCapture = lastCaptures[idx];
             
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
                          background: `linear-gradient(-90deg, #111111 94%, #${driver?.team_colour} 100%)`,
                        }
                      : {
                          opacity: 1,
                          background: `linear-gradient(-90deg, #111111 94%, #${driver?.team_colour}8D 100%)`,
                        }
                  }
                >
                  {/* Posición y datos del Piloto */}
                  <DriverPositionInfo
                    position={pos}
                    driver={driver}
                    lastCapture={lastCapture}
                    sessionPath={session?.path}
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
