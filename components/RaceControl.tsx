"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProcessedRaceControl } from "@/processors/race-control-processor";
import { Geist } from "next/font/google";
import { useRaceControlAudio } from "@/hooks/use-raceControl";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

interface RaceControlProps {
  raceControl: ProcessedRaceControl[];
}

export default function RaceControl({ raceControl }: RaceControlProps) {
  const [lastMessage, setLastMessage] = useState<ProcessedRaceControl | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const previousMessageCount = useRef<number>(0);
  const { playNotificationSound, timeUntilNextSound } = useRaceControlAudio({
    cooldownMs: 30 * 1000, // 30 segundos de cooldown
    audioSrc: "/race-control-notification.mp3", // Audio en /public
  });

  useEffect(() => {
    if (raceControl && raceControl.length > 0) {
      const newMessageCount = raceControl.length;

      if (newMessageCount > previousMessageCount.current) {
        const newMessage = raceControl[0];

        if (newMessage && newMessage !== lastMessage) {
          playNotificationSound();
          setIsAnimating(true);

          // Detener la animación después de 5 segundos
          setTimeout(() => {
            setIsAnimating(false);
          }, 5000);
        }

        setLastMessage(newMessage);
      }

      previousMessageCount.current = newMessageCount;
    }
  }, [raceControl, playNotificationSound, lastMessage]);

  const getAlertColor = (flag?: string) => {
    if (!flag) return "border-carbonBlack";

    const borderMap: Record<string, string> = {
      YELLOW: "text-f1Yellow",
      "DOUBLE YELLOW": "text-f1Yellow",
      RED: "text-f1Red",
      BLUE: "text-f1Blue",
      GREEN: "text-f1Green",
      WHITE: "text-highWhite",
      BLACK: "text-carbonBlack",
      CLEAR: "text-highWhite",
      CHEQUERED: "text-black",
      SC: "text-f1Yellow/90",
      VSC: "text-f1Yellow/75",
    };

    return borderMap[flag.toUpperCase()] || "border-carbonBlack";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex gap-2 flex-row items-center">
                <span className="text-xs font-medium text-white">
                  {lastMessage.category} {lastMessage.scope}{" "}
                  {lastMessage.sector}
                </span>
                {/* <span
                  className={`${getAlertColor(
                    "YELLOW"
                  )} transition-all duration-500 ease-in-out ${
                    isAnimating ? "scale-150 animate-pulse" : "opacity-0"
                  }`}
                >
                  •
                </span> */}
              </div>
            </div>
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
