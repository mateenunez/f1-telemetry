import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Map from "@/components/Map";
import RaceControl from "@/components/RaceControl";
import { Orbitron } from "next/font/google";
import { memo } from "react";
import { usePreferences } from "@/context/preferences";
import { getTrackStatusColor, getTrackStatusLabel } from "@/utils/telemetry";

const orbitron = Orbitron({ subsets: ["latin"], weight: "400" });

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
  const { preferences } = usePreferences();
  return (
    <Card className="lg:col-span-5 bg-warmBlack1 border-none border-2 flex flex-col">
      <CardHeader className="flex flex-col">
        <div className="flex flex-row gap-2 pt-4 items-center justify-between">
          <CardTitle className="text-lg font-thin text-white">
            <div className="flex justify-center items-center">
              <RaceControl
                raceControl={
                  preferences.translate
                    ? telemetryData.raceControlEs
                    : telemetryData.raceControl
                }
              />
            </div>
          </CardTitle>
          <div className="flex flex-col h-full justify-start items-start">
            {session?.session_type === "Race" && (
              <CardTitle
                className="text-xxl font-bold text-gray-200 tracking-widest"
                style={orbitron.style}
              >
                {session?.current_lap}/{session?.total_laps}
              </CardTitle>
            )}
            {session.track_status && (
              <CardTitle
                className={`${
                  session.session_type === "Race" ? "text-xs" : "text-md"
                } text-gray-200 tracking-widest w-full text-top flex-wrap text-center`}
                style={{
                  fontFamily: orbitron.style.fontFamily,
                  color: getTrackStatusColor(session.track_status),
                }}
              >
                {preferences.translate
                  ? getTrackStatusLabel(session.track_status, true)
                  : getTrackStatusLabel(session.track_status, false)}
              </CardTitle>
            )}
          </div>
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
