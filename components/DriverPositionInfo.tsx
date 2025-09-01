"use client";

import { Badge } from "@/components/ui/badge";
import { AudioLines, Volume, Volume1, Volume2 } from "lucide-react";
import { Geist, Aldrich } from "next/font/google";
import type { ProcessedPosition, ProcessedDriver } from "@/processors";
import { ProcessedCapture } from "@/processors/team-radio-processor";
import { audioUrl, useTelemetryAudio } from "@/hooks/use-raceControl";
import { useEffect, useRef, useState } from "react";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const aldrich = Aldrich({ subsets: ["latin"], weight: "400" });

interface DriverPositionInfoProps {
  position: ProcessedPosition;
  driver: ProcessedDriver | undefined;
  lastCapture: ProcessedCapture | undefined;
  sessionPath: string | undefined;
}

export default function DriverPositionInfo({
  position,
  driver,
  lastCapture,
  sessionPath,
}: DriverPositionInfoProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const lastPlayedUtcRef = useRef<string | undefined>(undefined);
  const { playNotificationSound, unlockAudio, isUnlocked } = useTelemetryAudio({
    cooldownMs: 0,
    audioSrc: "/race-control-notification.mp3",
  });

  const { playTeamRadioSound, radioAudioRef } = useTelemetryAudio({
    cooldownMs: 5 * 1000,
    audioSrc:
      sessionPath && lastCapture
        ? audioUrl + sessionPath + lastCapture?.path
        : "",
  });

  useEffect(() => {
    if (isUnlocked) return;

    const handler = async () => {
      await unlockAudio();
    };

    document.addEventListener("pointerdown", handler, { once: true });
    document.addEventListener("keydown", handler, { once: true });
    document.addEventListener("touchstart", handler, { once: true });

    return () => {
      document.removeEventListener("pointerdown", handler as any);
      document.removeEventListener("keydown", handler as any);
      document.removeEventListener("touchstart", handler as any);
    };
  }, [unlockAudio, isUnlocked]);

  useEffect(() => {
    if (!lastCapture) return;
    if (driver?.driver_number !== lastCapture.racingNumber) return;
    // Solo reproducir si el utc es diferente al último reproducido
    if (lastPlayedUtcRef.current === lastCapture.utc) {
      playNotificationSound();
      playTeamRadioSound();
      lastPlayedUtcRef.current = lastCapture.utc;
    }
  }, [lastCapture]);

  useEffect(() => {
    if (!radioAudioRef.current) return;

    const handlePlay = () => setIsPlayingAudio(true);
    const handleEnded = () => setIsPlayingAudio(false);
    const handlePause = () => setIsPlayingAudio(false);

    radioAudioRef.current.addEventListener("play", handlePlay);
    radioAudioRef.current.addEventListener("ended", handleEnded);
    radioAudioRef.current.addEventListener("pause", handlePause);

    return () => {
      radioAudioRef.current?.removeEventListener("play", handlePlay);
      radioAudioRef.current?.removeEventListener("ended", handleEnded);
      radioAudioRef.current?.removeEventListener("pause", handlePause);
    };
  }, [radioAudioRef.current]);

  return (
    <div className="flex flex-row items-center min-w-[11.5rem]">
      {/* Posición */}
      <div className="flex flex-row items-center min-w-[5.75rem]">
        <Badge
          className="w-8 h-8 rounded-full flex items-center justify-center text-md font-bold pr-0 min-w-[2rem]"
          style={{
            backgroundColor: `transparent`,
            fontFamily: aldrich.style.fontFamily,
          }}
        >
          {position.position}
        </Badge>

        {driver?.headshot_url && (
          <img
            src={driver?.headshot_url}
            className="obect-cover h-[60px]"
            alt={`${driver.name_acronym} headshot`}
          />
        )}
        {driver?.driver_number === 43 && (
          <img
            src="/franco-colapinto.png"
            className="obect-cover h-[60px]"
            alt="Franco Colapinto"
          />
        )}
      </div>

      {/* Info del piloto */}
      <div className="flex justify-evenly flex-row " style={aldrich.style}>
        <div className="flex flex-col self-start">
          <div className="flex items-center gap-1">
            <span
              className="text-xs text-gray-400 self-center"
              style={mediumGeist.style}
            >
              #{position.driver_number}
            </span>
            <span
              className="font-semibold text-sm text-white flex flex-row items-center"
              style={mediumGeist.style}
            >
              {driver?.name_acronym}{" "}
              {isPlayingAudio && (
                <span
                  className="ml-2"
                  style={{ color: "#" + driver?.team_colour }}
                >
                  <Volume2 size={14} />
                </span>
              )}
            </span>
          </div>
          <p className="text-xs text-gray-100 truncate">{driver?.team_name}</p>
        </div>
      </div>
    </div>
  );
}
