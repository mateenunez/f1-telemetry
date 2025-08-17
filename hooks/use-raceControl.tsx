import { useRef, useCallback } from 'react';

interface UseRaceControlAudioOptions {
  cooldownMs?: number; 
  audioSrc?: string;
}

export function useRaceControlAudio(options: UseRaceControlAudioOptions = {}) {
    // 2 minutos de cooldown
  const { cooldownMs = 2 * 60 * 1000, audioSrc = '/race-control-notification.mp3' } = options;
  const lastPlayTime = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const createAudio = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const audio = new Audio(audioSrc);
    audio.volume = 1; 
    audio.preload = 'auto';
    audio.loop = false;
    
    return audio;
  }, [audioSrc]);

  const playNotificationSound = useCallback(() => {
    const now = Date.now();
    
    if (now - lastPlayTime.current < cooldownMs) {
      return false;
    }

    try {
      if (!audioRef.current) {
        audioRef.current = createAudio();
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
    lastPlayTime: lastPlayTime.current,
    timeUntilNextSound: Math.max(0, cooldownMs - (Date.now() - lastPlayTime.current))
  };
}