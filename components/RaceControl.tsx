"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const previousMessageCount = useRef<number>(0);
  const { playNotificationSound, timeUntilNextSound } = useRaceControlAudio({
    cooldownMs: 2 * 60 * 1000, // 2 minutos
    audioSrc: "/race-control-notification.mp3", // Audio en /public
  });

  useEffect(() => {
    if (raceControl && raceControl.length > 0) {
      const newMessageCount = raceControl.length;

      if (newMessageCount > previousMessageCount.current) {
        const newMessage = raceControl[0];

        if (isAudioEnabled && newMessage && newMessage !== lastMessage) {
          playNotificationSound();
        }

        setLastMessage(newMessage);
      }

      previousMessageCount.current = newMessageCount;
    }
  }, [raceControl, isAudioEnabled, playNotificationSound, lastMessage]);

  const getBorderColor = (flag?: string) => {
    if (!flag) return "border-carbonBlack";
    
    const borderMap: Record<string, string> = {
      YELLOW: "border-f1Yellow",
      "DOUBLE YELLOW": "border-f1Yellow",
      RED: "border-f1Red",
      BLUE: "border-f1Blue",
      GREEN: "border-f1Green",
      WHITE: "border-highWhite",
      BLACK: "border-carbonBlack",
      CLEAR: "border-highWhite",
      CHEQUERED: "border-black",
      SC: "border-f1Yellow/90",
      VSC: "border-f1Yellow/75",
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
    <Card className="bg-warmBlack1 border-none">
      <CardContent className="pt-0">
        {lastMessage && (
          <div
            className={`mb-3 p-2 bg-warmBlack2 rounded text-f1Blue border-l-2 ${getBorderColor(lastMessage.flag)}`}
            style={mediumGeist.style}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white">
                  {lastMessage.category} {lastMessage.scope}{" "}
                  {lastMessage.sector}
                </span>
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
