"use client";
import { useState, useEffect } from "react";
import {
  F1UpcomingResponse,
  fetchUpcoming,
  formatTimeUntil,
  translateSessionType,
} from "@/utils/calendar";

export default function F1Calendar({ dict }: { dict: any }) {
  const [upcoming, setUpcoming] = useState<F1UpcomingResponse | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--mouse-x", `${x}%`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}%`);
  };

  useEffect(() => {
    const loadCalendar = async () => {
      try {
        const calendarData = await fetchUpcoming();
        setUpcoming(calendarData);
      } catch (err) {
        console.error("Error loading upcoming:", err);
      }
    };

    loadCalendar();

    // Actualizar cada 1 minuto
    const interval = setInterval(loadCalendar, 1 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (upcoming) {
    return (
      <div className="flex flex-col gap-0 items-center text-offWhite">
        <div className="flex flex-row font-geist lg:flex-row text-xs md:text-sm lg:text-sm text-gray-400 gap-1">
          <p>{dict.schedule.next}:</p>
          <p>{upcoming?.nextEvent.location} - </p>
          <p>{translateSessionType(upcoming?.nextEvent.type, dict)}</p>
        </div>
        <a
          className={`group relative flex flex-row items-center justify-center font-orbitron text-md font-regular cursor-pointer underline-offset-4 calendar-glow-wrapper ${
            upcoming.isWeekRace ? "decoration-red-400/60" : "decoration-gray-400/60"
          }`}
          href="/schedule"
          onMouseMove={handleMouseMove}
        >
          {/* Texto base: rojo en week race, blanco/gris el resto del tiempo */}
          <span
            className={`px-4 block ${
              upcoming.isWeekRace
                ? "calendar-glow-text-base"
                : "calendar-glow-text-base-neutral"
            }`}
          >
            {formatTimeUntil(
              upcoming.timeUntilNext,
              dict.locale === "es",
            ).toUpperCase()}
          </span>

          {/* Texto duplicado: brillo que sigue al cursor, enmascarado a las letras */}
          <span
            className={`px-4 block ${
              upcoming.isWeekRace
                ? "calendar-glow-text-spot"
                : "calendar-glow-text-spot-neutral"
            }`}
            aria-hidden="true"
          >
            {formatTimeUntil(
              upcoming.timeUntilNext,
              dict.locale === "es",
            ).toUpperCase()}
          </span>
        </a>
      </div>
    );
  }
}
