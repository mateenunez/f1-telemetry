import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Map from "@/components/Map";
import RaceControl from "@/components/RaceControl";
import { Saira } from "next/font/google";
import { memo } from "react";

const saira = Saira({ subsets: ["latin"], weight: "400" });

interface MapAndMessagesProps {
  telemetryData: any;
  session: any;
  yellowSectors: Set<number>;
  handleMapFullscreen: () => void;
}

const MapAndMessages = memo(function MapAndMessages({
  telemetryData,
  session,
  yellowSectors,
  handleMapFullscreen,
}: MapAndMessagesProps) {
  return (
    <Card className="lg:col-span-4 bg-warmBlack1 border-none border-2 flex flex-col">
      <CardHeader className="pb-3 flex flex-col gap-6">
        <div className="flex flex-row gap-2 pt-4 items-center justify-between">
          <CardTitle className="text-lg font-thin text-white">
            <div className="mt-3 flex justify-center p-0">
              <RaceControl raceControl={telemetryData?.raceControl || []} />
            </div>
          </CardTitle>
          {session?.session_type === "Race" && (
            <CardTitle
              className=" text-xlg font-bold text-white tracking-wider"
              style={saira.style}
            >
              {session.session_status === "Finalised" ? (
                <>
                  {session?.total_laps}/{session?.total_laps}
                </>
              ) : (
                <>
                  {session?.current_lap}/{session?.total_laps}
                </>
              )}
            </CardTitle>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col justify-center h-full">
        <div className="overflow-hidden h-fit">
          {telemetryData && telemetryData.session?.circuit_key && (
            <div onDoubleClick={handleMapFullscreen}>
              <Map
                positions={telemetryData.positionData}
                drivers={telemetryData.drivers}
                timing={telemetryData.timing}
                circuitKey={telemetryData.session.circuit_key}
                yellowSectors={yellowSectors}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default MapAndMessages;