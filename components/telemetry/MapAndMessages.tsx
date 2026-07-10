import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Map from "./Map";
import RaceControl from "@/components/telemetry/RaceControl";
import AuthForm from "@/components/telemetry/AuthForm";
import { Orbitron } from "next/font/google";
import { memo, useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  getTrackStatusColor,
  getTrackStatusLabel,
  isTrackStatusVisible,
} from "@/utils/telemetry";
import { TRACK_STATUS_KEYS } from "@/utils/telemetry";
import { TelemetryData } from "@/telemetry-manager";
import { ProcessedDriver } from "@/processors";

const orbitron = Orbitron({ subsets: ["latin"], weight: "400" });

interface MapAndMessagesProps {
  telemetryData: TelemetryData | null;
  session: any;
  yellowSectors: Set<number>;
  translate?: boolean;
  cornersPreferences?: boolean;
  sectorsPreferences?: boolean;
  favoriteDrivers?: ProcessedDriver[];
  isAuthenticated?: boolean;
  dict?: any;
}

const MapAndMessages = memo(function MapAndMessages({
  telemetryData,
  session,
  yellowSectors,
  translate,
  cornersPreferences,
  sectorsPreferences,
  favoriteDrivers,
  isAuthenticated = false,
  dict,
}: MapAndMessagesProps) {
  const [showAuthWarning, setShowAuthWarning] = useState(true);
  const [authFormOpen, setAuthFormOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthWarning(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setMapReady(false);
  }, [telemetryData?.session?.circuit_key]);

  const isRace = String(session?.session_type ?? "")
    .toLowerCase()
    .includes("race");
  const trackStatusLabel =
    session?.track_status && isTrackStatusVisible(session.track_status)
      ? translate
        ? getTrackStatusLabel(session.track_status, true)
        : getTrackStatusLabel(session.track_status, false)
      : "";

  if (!telemetryData) return null;

  return (
    <Card className="lg:col-span-5 bg-warmBlack flex flex-col border-none">
      <CardHeader className="flex flex-col py-2">
        <div className="flex flex-row gap-2 pt-4 items-center justify-between px-4 py-2 min-h-[4rem]">
          <CardTitle className="text-lg font-thin text-white">
            <div className="flex justify-center items-center">
              <RaceControl
                raceControl={
                  translate
                    ? telemetryData.raceControlEs
                    : telemetryData.raceControl
                }
              />
            </div>
          </CardTitle>
          <div className="flex flex-col h-full justify-start items-start">
            {isRace && (
              <CardTitle
                className="text-xxl font-bold text-gray-400 tracking-widest"
                style={orbitron.style}
              >
                {session?.current_lap}/{session?.total_laps}
              </CardTitle>
            )}
            {trackStatusLabel && (
              <CardTitle
                className={`${
                  session.session_type === "Race" ? "text-xs" : "text-md"
                } font-inter font-light text-gray-400 tracking-wide w-full text-top flex-wrap text-center mt-1`}
                style={{
                  color: getTrackStatusColor(session.track_status),
                }}
              >
                {trackStatusLabel}
              </CardTitle>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col justify-center h-full p-0">
        {telemetryData && telemetryData.session?.circuit_key && (
          <Map
            positions={isAuthenticated ? telemetryData.positionData : []}
            drivers={isAuthenticated ? telemetryData.drivers : ([] as any)}
            timing={telemetryData.timing}
            circuitKey={telemetryData.session.circuit_key}
            yellowSectors={yellowSectors}
            redFlag={session.track_status === TRACK_STATUS_KEYS.RedFlag}
            safetyCar={
              session.track_status === TRACK_STATUS_KEYS.SafetyCar ||
              session.track_status === TRACK_STATUS_KEYS.VirtualSafetyCar
            }
            cornersPreferences={cornersPreferences}
            sectorsPreferences={sectorsPreferences}
            favoriteDrivers={favoriteDrivers}
            onReady={() => setMapReady(true)}
          />
        )}
        {mapReady && !isAuthenticated && showAuthWarning && (
          <div className="relative w-full bg-f1Red/20 text-white font-geist text-center py-2 px-8 text-sm z-10">
            <button
              type="button"
              aria-label="Dismiss login warning"
              onClick={() => setShowAuthWarning(false)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-gray-200"
            >
              <X size={16} />
            </button>
            <div className="flex flex-col items-center justify-center gap-2">
              <span>
                {translate
                  ? "Iniciá sesión para ver la posición de los pilotos y traducciones."
                  : "Login to view pilot positions and transcriptions."}
              </span>{" "}
              <button
                type="button"
                onClick={() => setAuthFormOpen(true)}
                className="py-2 px-4 text-sm rounded-md bg-offWhite/20 text-white font-geist font-medium transition-all duration-300 hover:bg-offWhite/25 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-f1Blue"
                style={{
                  boxShadow:
                    "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
                }}
              >
                {translate ? "Iniciar sesión" : "Log in"}
              </button>
            </div>
          </div>
        )}
      </CardContent>
      <AuthForm
        isOpen={authFormOpen}
        onClose={() => setAuthFormOpen(false)}
        dict={dict}
      />
    </Card>
  );
});

export default MapAndMessages;
