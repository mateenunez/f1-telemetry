import { useRef, useCallback } from "react";
import { MapSector, ProcessedRaceControl } from "@/processors";
import { config } from "@/lib/config";

export const audioUrl = "https://livetiming.formula1.com/static/";

export const findYellowSectors = (
  messages: ProcessedRaceControl[] | undefined
): Set<number> => {
  const msgs = messages?.filter((msg) => {
    return (
      msg.flag === "YELLOW" ||
      msg.flag === "DOUBLE YELLOW" ||
      msg.flag === "CLEAR"
    );
  });

  if (!msgs) {
    return new Set();
  }

  const done: Set<number> = new Set();
  const sectors: Set<number> = new Set();
  for (let i = 0; i < msgs.length; i++) {
    const msg = msgs[i];
    if (msg.scope === "Track" && msg.flag !== "CLEAR") {
      for (let j = 0; j < 100; j++) {
        sectors.add(j);
      }
      return sectors;
    }
    if (msg.scope === "Sector") {
      if (!msg.sector || done.has(msg.sector)) {
        continue;
      }
      if (msg.flag === "CLEAR") {
        done.add(msg.sector);
      } else {
        sectors.add(msg.sector);
      }
    }
  }
  return sectors;
};
export const getSectorColor = (
  sector: MapSector,
  yellowSectors: Set<number>,
  sector1End: number,
  sector2End: number,
  idx: number,
  sectorsCookie: boolean
) => {
  if (yellowSectors.has(sector.number)) {
    return "stroke-yellow-400";
  }

  if (sectorsCookie) {
    if (idx <= sector1End) return "stroke-red-500";
    if (idx <= sector2End) return "stroke-blue-300";
    return "stroke-orange-300";
  }

  return "stroke-white";
};

export function useTelemetryAudio() {
  const lastPlayTime = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const radioAudioRef = useRef<HTMLAudioElement | null>(null);

  const createAudio = (
    volumen = 1,
    audioSrc = config.public.assets.mp3.raceControl
  ) => {
    if (typeof window === "undefined") return null;
    const audio = new Audio(audioSrc);
    audio.volume = volumen;
    audio.preload = "auto";
    audio.loop = false;
    return audio;
  };

  const playNotificationSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = createAudio(1);
      }

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
        return true;
      }
    } catch (error) {
      console.error("Error with audio:", error);
    }

    return false;
  }, [createAudio]);

  const playTeamRadioSound = useCallback(
    (audioSrc: string) => {
      try {
        if (!radioAudioRef.current) {
          radioAudioRef.current = createAudio(1, audioSrc);
        }

        if (radioAudioRef.current) {
          if (radioAudioRef.current.src !== audioSrc) {
            radioAudioRef.current.pause();
            radioAudioRef.current.src = audioSrc;
            radioAudioRef.current.load();
          }

          radioAudioRef.current.onended = () => {
            radioAudioRef.current = null;
          };

          radioAudioRef.current.play().catch((error) => {
            console.error("Error playing audio:", error);
          });
          return true;
        }
      } catch (error) {
        console.error("Error with audio:", error);
      }

      return false;
    },
    [createAudio]
  );

  const stopTeamRadioSound = useCallback(() => {
    if (radioAudioRef.current) {
      radioAudioRef.current.onended = null;
      radioAudioRef.current.pause();
    }
  }, []);

  return {
    playNotificationSound,
    playTeamRadioSound,
    lastPlayTime: lastPlayTime.current,
    radioAudioRef,
    stopTeamRadioSound,
  };
}
