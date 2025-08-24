"use client";

import { useState, useEffect } from "react";
import {
  F1CalendarResponse,
  fetchCalendar,
  formatEventDateShort,
  getCountryCode,
} from "@/utils/calendar";
import NextSession from "@/components/NextSession";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Geist } from "next/font/google";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

export default function SchedulePage() {
  const [calendar, setCalendar] = useState<F1CalendarResponse | null>(null);

  useEffect(() => {
    const loadCalendar = async () => {
      try {
        const calendarData = await fetchCalendar();
        setCalendar(calendarData);
        console.log(calendarData);
      } catch (err) {
        console.error("Error loading calendar:", err);
      }
    };

    loadCalendar();

    const interval = setInterval(loadCalendar, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!calendar) {
    return (
      <div className="min-h-screen bg-warmBlack p-4 flex items-center justify-center" style={mediumGeist.style}>
        <div className="text-center">
          <img
            src="/logo-girando.gif"
            alt="F1 Dashboard Telemetría Al Angulo TV"
            className="h-12 w-12 mx-auto flex align-center"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  if (calendar)
    return (
      <div className="min-h-screen  bg-gradient-to-br from-warmBlack to-warmBlack2 text-white p-4" style={mediumGeist.style}>
        <div className="max-w-6xl mx-auto my-12">
          <div className="w-full flex flex-row justify-between items-center">
            <h1 className="text-3xl font-regular mb-8 flex flex-row items-center gap-2">
              <img
                src={`https://flagsapi.com/AR/flat/32.png`}
                alt={`Flag of Argentina`}
                className="w-10"
              />{" "}
              Schedule{" "}
            </h1>

            <a
              className="text-xl font-regular mb-8 hover:cursor-pointer"
              href="/"
            >
              {" "}
              Telemetry{" "}
            </a>
          </div>
          <div className="flex flex-row my-4">
            <div className="flex flex-col mx-8">
              <h1 className="text-xl py-5"> Next session in</h1>

              {/* Proxima sesion */}
              <NextSession
                session={calendar.nextEvent}
                timeUntil={calendar.timeUntilNext}
              />

              {/* Calendario completo */}
              <div>
                <h2 className="text-xl">Upcoming Events</h2>
                <ScrollArea>
                  <div className="flex w-full space-x-4 p-4 4 md:flex-row flex-col md:space-x-4 md:space-y-0 space-y-4 items-center mx-8mxa">
                    {calendar.upcomingEvents.slice(1).map((event, index) => (
                      <Card
                        key={index}
                        className="md:w-[20vw] flex-shrink-0 bg-transparent border-none w-[100%] items-center"
                      >
                        <CardHeader>
                          <p className="text-sm text-center text-white text-wrap font-regular">
                            {event.summary.toUpperCase().slice(2)}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-center">
                            <div className="text-sm text-gray-300 mb-2">
                              {formatEventDateShort(event.start)}
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="text-sm text-gray-400">
                                {event.location}
                              </span>
                              <img
                                src={`https://flagsapi.com/${getCountryCode(
                                  event.location
                                )}/flat/24.png`}
                                alt={`Flag of ${event.location}`}
                                className="w-6 h-4"
                              />
                            </div>
                            <div className="text-xs text-gray-500">
                              Status: {event.status}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <ScrollBar
                    orientation="horizontal"
                    className="bg-gray-700 hidden md:block"
                  />
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
