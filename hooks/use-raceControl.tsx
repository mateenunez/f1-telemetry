import { useRef, useCallback } from 'react';

interface UseRaceControlAudioOptions {
  cooldownMs?: number; 
  audioSrc?: string;
}

export function useRaceControlAudio(options: UseRaceControlAudioOptions = {}) {
  const { cooldownMs = 30 * 1000, audioSrc = '/race-control-notification.mp3' } = options;
  const lastPlayTime = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isUnlockedRef = useRef<boolean>(false);

  const createAudio = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const audio = new Audio(audioSrc);
    audio.volume = 1;
    audio.preload = 'auto';
    audio.loop = false;
    return audio;
  }, [audioSrc]);

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
        audioRef.current.play().then(() => {
          lastPlayTime.current = now;
        }).catch((error) => {
          console.error('Error reproduciendo audio:', error);
        });
        return true;
      }
    } catch (error) {
      console.error('Error con el audio:', error);
    }

    return false;
  }, [cooldownMs, createAudio]);

  return {
    playNotificationSound,
    unlockAudio,
    isUnlocked: isUnlockedRef.current,
    lastPlayTime: lastPlayTime.current,
    timeUntilNextSound: Math.max(0, cooldownMs - (Date.now() - lastPlayTime.current))
  };
}