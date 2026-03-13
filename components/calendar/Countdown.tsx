"use client";

import { useState, useEffect } from "react";
interface CountdownProps {
  totalSeconds?: number;
  size?: number;
  strokeWidth?: number;
  dict: any;
}

export function Countdown({
  totalSeconds,
  size = 50,
  strokeWidth = 4,
  dict,
}: CountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    if (typeof window === "undefined") return undefined;
    return totalSeconds;
  });
  const [isActive, setIsActive] = useState(true);

  // Only render after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (totalSeconds && totalSeconds !== remainingSeconds) {
      setRemainingSeconds(totalSeconds);
      setIsActive(true);
    }
  }, [totalSeconds]);

  useEffect(() => {
    if (!mounted || !remainingSeconds) return;

    if (!isActive || remainingSeconds <= 0) {
      if (remainingSeconds <= 0) {
        setIsActive(false);
      }
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (!prev) return;
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mounted, isActive, remainingSeconds]);

  if (!mounted || !remainingSeconds || !totalSeconds)
    return (
      <span className="text-white text-2xl text-center font-geist font-medium">
        {dict.loading}
      </span>
    );

  return (
    <div className="flex flex-col items-center justify-center gap-2 bg-none">
      <span className="text-white text-2xl text-center font-geist font-medium">
        {dict.delaying}
      </span>
      <span className="text-6xl font-bold text-offWhite font-geist">
        {remainingSeconds}
      </span>
    </div>
  );
}
