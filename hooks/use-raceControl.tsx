import { useRef, useCallback, useState, useEffect } from "react";
import { MapSector, ProcessedRaceControl } from "@/processors";
import Cookies from "js-cookie";

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
      // Spam with sectors so all sectors are yellow no matter what
      // number of sectors there really are
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
export const getSectorColor = (sector: MapSector, yellowSectors: Set<number>) =>
  yellowSectors.has(sector.number) ? "stroke-yellow-400" : "stroke-white";

export function useTelemetryAudio() {
  const lastPlayTime = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const radioAudioRef = useRef<HTMLAudioElement | null>(null);
  const [cookieAudio, setAudio] = useState<boolean>(false);

  useEffect(() => {
    const cookieAudio = Cookies.get("audio");
    if (cookieAudio !== undefined) {
      setAudio(cookieAudio === "true");
    }
  }, []);

  const createAudio = (
    volumen = 1,
    audioSrc = "/race-control-notification.mp3"
  ) => {
    if (typeof window === "undefined" || !cookieAudio) return null;
    const audio = new Audio(audioSrc);
    audio.volume = volumen;
    audio.preload = "auto";
    audio.loop = false;
    return audio;
  };

  const updateAudio = (newAudio: boolean) => {
    setAudio(newAudio);
    Cookies.set("audio", newAudio.toString(), {
      expires: 365,
      sameSite: "strict",
    });
  };

  const toggleAudio = () => {
    updateAudio(!cookieAudio);
  };

  const playNotificationSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = createAudio(1);
      }

      if ( !cookieAudio) {
        return false;
      }

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((error) => {
          console.error("Error reproduciendo audio:", error);
        });
        return true;
      }
    } catch (error) {
      console.error("Error con el audio:", error);
    }

    return false;
  }, [createAudio]);

  const playTeamRadioSound = useCallback(
    (audioSrc: string) => {
      try {
        if (!radioAudioRef.current) {
          radioAudioRef.current = createAudio(1, audioSrc);
        }

        if (!cookieAudio) {
          return false;
        }

        if (radioAudioRef.current) {
          radioAudioRef.current.play().catch((error) => {
            console.error("Error reproduciendo audio:", error);
          });
          return true;
        }
      } catch (error) {
        console.error("Error con el audio:", error);
      }

      return false;
    },
    [createAudio]
  );

  return {
    cookieAudio,
    updateAudio,
    toggleAudio,
    playNotificationSound,
    playTeamRadioSound,
    lastPlayTime: lastPlayTime.current,
    radioAudioRef,
  };
}
