"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProcessedRaceControl } from "@/processors";
import { toLocaleTime } from "@/utils/calendar";
import { useTelemetryAudio } from "@/hooks/use-raceControl";
import { usePreferences } from "@/context/preferences";

interface RaceControlProps {
  raceControl: ProcessedRaceControl[];
}

export default function RaceControl({ raceControl }: RaceControlProps) {
  const [lastMessage, setLastMessage] = useState<ProcessedRaceControl | null>(
    null
  );

  const { playNotificationSound } = useTelemetryAudio();
  const { preferences } = usePreferences();
  const popup = preferences.audio;

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
      if (popup) playNotificationSound();
    }
  }, [raceControl]);

  return (
    <Card className="bg-transparent border-none p-0">
      <CardContent className="align-center p-0">
        {lastMessage && (
          <div className="text-f1Blue py-0 font-geist font-medium">
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
