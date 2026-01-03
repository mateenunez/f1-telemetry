import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Map from "./Map";
import RaceControl from "@/components/telemetry/RaceControl";
import { Orbitron } from "next/font/google";
import { memo } from "react";
import { usePreferences } from "@/context/preferences";
import { getTrackStatusColor, getTrackStatusLabel } from "@/utils/telemetry";
import { TRACK_STATUS_KEYS } from "@/utils/telemetry";
import { TelemetryData } from "@/telemetry-manager";

const orbitron = Orbitron({ subsets: ["latin"], weight: "400" });

interface MapAndMessagesProps {
  telemetryData: TelemetryData | null;
  session: any;
  yellowSectors: Set<number>;
}

const MapAndMessages = memo(function MapAndMessages({
  telemetryData,
  session,
  yellowSectors,
}: MapAndMessagesProps) {
  const { preferences } = usePreferences();
  if (!telemetryData) return;

  return (
    <Card className="lg:col-span-5 bg-warmBlack flex flex-col border-none">
      <CardHeader className="flex flex-col py-2 third-step">
        <div className="flex flex-row gap-2 pt-4 items-center justify-between px-4 py-2 min-h-[5rem]">
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
                } text-gray-200 tracking-widest w-full text-top flex-wrap text-center mt-1`}
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
      <CardContent className="flex flex-col justify-center h-full p-0 second-step">
        {telemetryData && telemetryData.session?.circuit_key && (
          <Map
            positions={telemetryData.positionData}
            drivers={telemetryData.drivers}
            timing={telemetryData.timing}
            circuitKey={telemetryData.session.circuit_key}
            yellowSectors={yellowSectors}
            redFlag={session.track_status === TRACK_STATUS_KEYS.RedFlag}
            safetyCar={
              session.track_status === TRACK_STATUS_KEYS.SafetyCar ||
              session.track_status === TRACK_STATUS_KEYS.VirtualSafetyCar
            }
          />
        )}
      </CardContent>
    </Card>
  );
});

export default MapAndMessages;
