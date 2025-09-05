import { useRef, useCallback } from "react";
import { MapSector, ProcessedRaceControl } from "@/processors";

interface UseRaceControlAudioOptions {
  cooldownMs?: number;
  audioSrc?: string;
}
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

export function useTelemetryAudio(options: UseRaceControlAudioOptions = {}) {
  const { cooldownMs = 0, audioSrc = "/race-control-notification.mp3" } =
    options;
  const lastPlayTime = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const radioAudioRef = useRef<HTMLAudioElement | null>(null);
  const isUnlockedRef = useRef<boolean>(false);

  const createAudio = useCallback(
    (volumen = 1) => {
      if (typeof window === "undefined") return null;
      const audio = new Audio(audioSrc);
      audio.volume = volumen;
      audio.preload = "auto";
      audio.loop = false;
      return audio;
    },
    [audioSrc]
  );

  const unlockAudio = useCallback(async () => {
    try {
      if (!audioRef.current) {
        audioRef.current = createAudio();
      }
      if (!audioRef.current) return false;

      // Intento de "unlock" bajo gesto de usuario
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      await audioRef.current.pause();
      isUnlockedRef.current = true;
      return true;
    } catch (e) {
      // Si falla, seguimos bloqueados hasta el próximo intento con interacción del usuario
      return false;
    }
  }, [createAudio]);

  const playNotificationSound = useCallback(() => {
    const now = Date.now();

    if (now - lastPlayTime.current < cooldownMs) {
      return false;
    }

    try {
      if (!audioRef.current) {
        audioRef.current = createAudio();
      }

      // Si no está desbloqueado, no intentamos reproducir (navegadores bloquean)
      if (!isUnlockedRef.current) {
        return false;
      }

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => {
            lastPlayTime.current = now;
          })
          .catch((error) => {
            console.error("Error reproduciendo audio:", error);
          });
        return true;
      }
    } catch (error) {
      console.error("Error con el audio:", error);
    }

    return false;
  }, [cooldownMs, createAudio]);

  const playTeamRadioSound = useCallback(() => {
    try {
      if (!radioAudioRef.current) {
        radioAudioRef.current = createAudio(0.5);
      }

      // Si no está desbloqueado, no intentamos reproducir (navegadores bloquean)
      if (!isUnlockedRef.current) {
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
  }, [createAudio]);

  return {
    playNotificationSound,
    playTeamRadioSound,
    unlockAudio,
    isUnlocked: isUnlockedRef.current,
    lastPlayTime: lastPlayTime.current,
    timeUntilNextSound: Math.max(
      0,
      cooldownMs - (Date.now() - lastPlayTime.current)
    ),
    radioAudioRef,
  };
}
