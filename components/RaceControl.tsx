"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProcessedRaceControl } from "@/processors";
import { Geist } from "next/font/google";
import { toLocaleTime } from "@/utils/calendar";
import { useTelemetryAudio } from "@/hooks/use-raceControl";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

interface RaceControlProps {
  raceControl: ProcessedRaceControl[];
}

export default function RaceControl({ raceControl }: RaceControlProps) {
  const [lastMessage, setLastMessage] = useState<ProcessedRaceControl | null>(
    null
  );

  const { playNotificationSound } = useTelemetryAudio();

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
      playNotificationSound();
    }
  }, [raceControl]);

  return (
    <Card className="bg-transparent border-none p-0">
      <CardContent className="align-center">
        {lastMessage && (
          <div
            className={`px-2 rounded text-f1Blue py-0`}
            style={mediumGeist.style}
          >
            <p className="text-xs text-gray-200 leading-tight">
              {lastMessage.message}
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">
                {toLocaleTime(lastMessage.date)}
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
