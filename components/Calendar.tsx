"use client";
import { useState, useEffect } from "react";
import {
  F1CalendarResponse,
  fetchCalendar,
  formatTimeUntil,
  getEventType,
} from "@/utils/calendar";
import { Geist, Anta } from "next/font/google";
import { Link, SquareArrowUpRight } from "lucide-react";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const regularAnta = Anta({ subsets: ["latin"], weight: "400" });

export default function F1Calendar() {
  const [calendar, setCalendar] = useState<F1CalendarResponse | null>(null);

  useEffect(() => {
    const loadCalendar = async () => {
      try {
        const calendarData = await fetchCalendar();
        setCalendar(calendarData);
      } catch (err) {
        console.error("Error loading calendar:", err);
      }
    };

    loadCalendar();

    // Actualizar cada 5 minutos
    const interval = setInterval(loadCalendar, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (calendar) {
    return (
      <div className="flex flex-col gap-0 items-center text-offWhite">
        <div className="flex flex-col md:flex-row lg:flex-row text-xs md:text-sm lg:text-sm text-gray-500 md:gap-1 lg:gap-1" style={mediumGeist.style}>
        <p>Upcoming: {" "}</p>
        <p>
          {getEventType(calendar?.nextEvent.summary)} - 
        </p>
        <p>{calendar?.nextEvent.location}</p>
        </div>
        <a style={regularAnta.style} className="flex flex-row gap-2 hover:underline hover:cursor-pointer underline-offset-4" href="/schedule">
          {formatTimeUntil(calendar.timeUntilNext).toUpperCase()}{" "}<Link className="w-4"/>
        </a>
      </div>
    );
  }
}
