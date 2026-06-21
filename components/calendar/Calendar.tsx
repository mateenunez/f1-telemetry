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
          className="group relative overflow-hidden flex flex-row items-center justify-center font-orbitron text-md font-regular text-white cursor-pointer underline-offset-4 decoration-red-400/60 bg-black aurora-wrapper"
          href="/schedule"
        >
          {/* 1. El texto va primero (abajo de la aurora) y DEBE ser text-white siempre */}
          <span className="px-4 block text-white transition-opacity duration-300 group-hover:opacity-90">
            {formatTimeUntil(
              upcoming.timeUntilNext,
              dict.locale === "es",
            ).toUpperCase()}
          </span>

          {/* 2. La aurora va después (arriba del texto) para poder aplicar el mix-blend-mode */}
          <div className="aurora-container">
            <div className="aurora__item"></div>
            <div className="aurora__item"></div>
            <div className="aurora__item"></div>
            <div className="aurora__item"></div>
          </div>
        </a>
      </div>
    );
  }
}
