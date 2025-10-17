import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Map from "@/components/Map";
import RaceControl from "@/components/RaceControl";
import { Saira } from "next/font/google";
import { memo } from "react";

const saira = Saira({ subsets: ["latin"], weight: "500" });


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
    <Card className="lg:col-span-5 bg-warmBlack1 border-none border-2 flex flex-col">
      <CardHeader className="flex flex-col">
        <div className="flex flex-row gap-2 pt-4 items-center justify-between">
          <CardTitle className="text-lg font-thin text-white">
            <div className="flex justify-center">
              <RaceControl raceControl={telemetryData?.raceControlEs || []} />
            </div>
          </CardTitle>
          {session?.session_type === "Race" && (
            <CardTitle
              className="text-xxl font-bold text-gray-200 tracking-widest mb-[2rem]"
              style={saira.style}
            >
              {session?.current_lap}/{session?.total_laps}
            </CardTitle>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col justify-center h-full p-0">
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
