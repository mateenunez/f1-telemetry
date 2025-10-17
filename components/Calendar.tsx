"use client";
import { useState, useEffect } from "react";
import {
  F1UpcomingResponse,
  fetchUpcoming,
  formatTimeUntil,
  translateSessionType,
} from "@/utils/calendar";
import { Geist, Orbitron } from "next/font/google";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const orbitron = Orbitron({ subsets: ["latin"], weight: "400" });

export default function F1Calendar({dict}: {dict: any}) {
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
        <div
          className="flex flex-row lg:flex-row text-xs md:text-sm lg:text-sm text-gray-500 gap-1"
          style={mediumGeist.style}
        >
          <p>{dict.schedule.next}:</p>
          <p>{upcoming?.nextEvent.location} - </p>
          <p>{translateSessionType(upcoming?.nextEvent.type, dict)}</p>
        </div>
        <a
          style={orbitron.style}
          className="flex flex-row gap-2 hover:cursor-pointer text-md font-regular"
          href="/schedule"
        >
          {formatTimeUntil(upcoming.timeUntilNext).toUpperCase()}{" "}
        </a>
      </div>
    );
  }
}
