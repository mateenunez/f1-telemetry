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
      <div
        className="flex flex-col gap-0 items-center text-offWhite"

      >
        <div
          className="flex flex-row font-geist lg:flex-row text-xs md:text-sm lg:text-sm text-gray-400 gap-1"
       
        >
          <p>{dict.schedule.next}:</p>
          <p>{upcoming?.nextEvent.location} - </p>
          <p>{translateSessionType(upcoming?.nextEvent.type, dict)}</p>
        </div>
        <a
          className="group flex flex-row items-center gap-2 font-orbitron text-md font-regular
            text-offWhite hover:text-red-400 transition-colors duration-300 cursor-pointer
            hover:underline underline-offset-4 decoration-red-400/60"
          href="/schedule"
          style={{ textShadow: "0 0 8px rgba(239, 68, 68, 0.35)" }}
        >
          {formatTimeUntil(
            upcoming.timeUntilNext,
            dict.locale === "es"
          ).toUpperCase()}
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 text-red-400/70 text-xs">
            →
          </span>
        </a>
      </div>
    );
  }
}
