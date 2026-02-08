"use client"
import React, { createContext, useState, useContext } from 'react';

interface JokeContextType {
  status: 'idle' | 'selecting-location' | 'writing';
  coords: { xPct: number; yPct: number } | null;
  color: string;
  startPlacing: () => void; 
  setLocation: (x: number, y: number) => void;
  setColor: (color: string) => void;
  cancel: () => void;
  finish: () => void; 
  startWriting: () => void;
  setIdle: () => void;
}

export const JokeContext = createContext<JokeContextType | undefined>(undefined);

export const JokeProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<JokeContextType['status']>('idle');
  const [coords, setCoords] = useState<JokeContextType['coords']>(null);
  const [color, setColor] = useState<string>('#FFFFFF');

  const startPlacing = () => setStatus('selecting-location');
  const startWriting = () => setStatus('writing');
  const setIdle = () => { setStatus('idle'); setCoords(null); };
  const setLocation = (xPct: number, yPct: number) => {
    setCoords({ xPct, yPct });
    setStatus('writing');
  };
  const cancel = () => { setStatus('idle'); setCoords(null); };
  const finish = () => { setStatus('idle'); setCoords(null); };

  return (
    <JokeContext.Provider value={{
      status,
      coords,
      color,
      startPlacing,
      setLocation,
      setColor,
      cancel,
      finish,
      startWriting,
      setIdle,
    }}>
      {children}
    </JokeContext.Provider>
  );
};