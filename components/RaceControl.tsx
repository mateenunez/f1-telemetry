"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProcessedRaceControl } from "@/processors/race-control-processor";
import { Geist } from "next/font/google";
import { ensureUtc } from "@/utils/calendar";
import { useTelemetryAudio } from "@/hooks/use-raceControl";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

interface RaceControlProps {
  raceControl: ProcessedRaceControl[];
}

export default function RaceControl({ raceControl }: RaceControlProps) {
  const [lastMessage, setLastMessage] = useState<ProcessedRaceControl | null>(
    null
  );

  const { playNotificationSound, unlockAudio, isUnlocked, timeUntilNextSound } =
  useTelemetryAudio({
      cooldownMs: 10 * 1000, // 10 segundos de cooldown
      audioSrc: "/race-control-notification.mp3", // Audio en /public
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
    if (!raceControl || raceControl.length === 0) return;

    const newest = raceControl[0];

    if (!lastMessage) {
      setLastMessage(newest);
      return;
    }

    const isNew =
      newest.date !== lastMessage.date ||
      newest.message !== lastMessage.message;

    if (isNew) {
      setLastMessage(newest);
      if (isUnlocked) {
        playNotificationSound();
      }
    }
  }, [raceControl]);

  // const getAlertColor = (flag?: string) => {
  //   if (!flag) return "border-carbonBlack";

  //   const borderMap: Record<string, string> = {
  //     YELLOW: "text-f1Yellow",
  //     "DOUBLE YELLOW": "text-f1Yellow",
  //     RED: "text-f1Red",
  //     BLUE: "text-f1Blue",
  //     GREEN: "text-f1Green",
  //     WHITE: "text-highWhite",
  //     BLACK: "text-carbonBlack",
  //     CLEAR: "text-highWhite",
  //     CHEQUERED: "text-black",
  //     SC: "text-f1Yellow/90",
  //     VSC: "text-f1Yellow/75",
  //   };

  //   return borderMap[flag.toUpperCase()] || "border-carbonBlack";
  // };

  const formatTime = (dateString: string) => {
    const date = new Date(ensureUtc(dateString));
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "America/Argentina/Buenos_Aires",
    });
  };

  return (
    <Card className="bg-transparent border-none p-0">
      <CardContent className="pt-0">
        {lastMessage && (
          <div
            className={`mb-3 p-2 rounded text-f1Blue`}
            style={mediumGeist.style}
          >
            <p className="text-xs text-gray-200 leading-tight">
              {lastMessage.message}
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">
                {formatTime(lastMessage.date)}
              </span>
              {lastMessage.racing_number && (
                <span className="text-xs text-gray-400">
                  #{lastMessage.racing_number}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
