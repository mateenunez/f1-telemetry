"use client";

import { useState, useEffect } from "react";
import {
  StandingsResponse,
  F1CalendarResponse,
  fetchCalendar,
  fetchDriverStandings,
  formatEventDateShort,
  getCountryCode,
  fetchConstructorStandings,
} from "@/utils/calendar";
import NextSession from "@/components/NextSession";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Geist } from "next/font/google";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Footer from "@/components/Footer";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

export default function SchedulePage() {
  const [calendar, setCalendar] = useState<F1CalendarResponse | null>(null);
  const [driverStandings, setDriverStandings] =
    useState<StandingsResponse | null>(null);
  const [constructorStandings, setConstructorStandings] =
    useState<StandingsResponse | null>(null);

  useEffect(() => {
    const loadCalendar = async () => {
      try {
        const calendarData = await fetchCalendar();
        setCalendar(calendarData);
        const driverStandings = await fetchDriverStandings();
        setDriverStandings(driverStandings);
        const constructorStandings = await fetchConstructorStandings();
        setConstructorStandings(constructorStandings);
      } catch (err) {
        console.error("Error loading calendar:", err);
      }
    };

    loadCalendar();
  }, []);

  if (!calendar || !driverStandings || !constructorStandings) {
    return (
      <div className="min-h-screen bg-black p-4 flex items-start justify-center gap-4 overflow-hidden">
        <div className="max-w-6xl w-full mx-auto px-4 md:px-8">
          <SkeletonTheme baseColor="#151515ff" highlightColor="#444">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4 mb-8">
              <div className="flex flex-row items-center gap-4">
                <Skeleton height={36} width={180} />
              </div>
              <Skeleton height={32} width={120} />
            </div>
            {/* Next session skeleton */}
            <div className="flex flex-col mx-0 md:mx-8 w-full gap-8">
              <Skeleton height={32} width={180} style={{ marginBottom: 16 }} />
              <Skeleton height={80} width="100%" style={{ marginBottom: 32 }} />
              {/* Upcoming Events Skeleton */}
              <Skeleton height={32} width={180} style={{ marginBottom: 16 }} />
              <div className="flex gap-4 pb-4 flex-row md:flex-row lg:flex-row over">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton width={300} height={160} key={idx} />
                ))}
              </div>
            </div>
          </SkeletonTheme>
        </div>
      </div>
    );
  }

  if (calendar && driverStandings && constructorStandings)
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-warmBlack to-warmBlack2 text-white overflow-hidden"
        style={mediumGeist.style}
      >
        <div className="max-w-6xl mx-auto my-12 px-4 md:px-8">
          <div className="flex flex-row justify-between items-center w-full gap-4 mb-8">
            <span className="text-2xl font-regular flex flex-row gap-2">
              <img
                src={`https://flagsapi.com/AR/flat/32.png`}
                alt={`Flag of Argentina`}
                className="w-6 h-6 self-center"
              />
              Schedule
            </span>

            <a className="text-xl font-regular hover:cursor-pointer" href="/">
              Telemetry
            </a>
          </div>
          <div className="flex flex-row my-4">
            <div className="flex flex-col mx-0 md:mx-8 w-full gap-6">
              <span className="text-xl py-5"> Next session in</span>

              {/* Proxima sesion */}
              <NextSession
                session={calendar.nextEvent}
                timeUntil={calendar.timeUntilNext}
              />

              {/* Calendario completo */}
              <div className="flex flex-col w-full">
                <span className="text-xl mb-4">Upcoming Events</span>
                <ScrollArea className="w-full">
                  <div className="flex gap-4 pb-4 flex-row">
                    {calendar.upcomingEvents.slice(1).map((event, index) => (
                      <Card
                        key={index}
                        className="min-w-[20rem] max-w-[320px] flex-shrink-0 flex flex-col justify-between bg-transparent border-none"
                      >
                        <CardHeader>
                          <p className="text-sm text-start text-white text-wrap font-regular">
                            {event.summary.toUpperCase().slice(2)}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-2 flex flex-row gap-2">
                          <div className="text-start flex flex-col justify-between">
                            <div className="text-sm text-gray-300 mb-2">
                              {formatEventDateShort(event.start)}
                            </div>
                            <div className="flex items-center justify-start gap-2 mb-2">
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
                            <div className="text-xs text-gray-600">
                              Status: {event.status}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <img
                                alt={event.location}
                                src={`https://res.cloudinary.com/dvukvnmqt/image/upload/v1757271442/${event.location.replaceAll(
                                  " ",
                                  ""
                                )}.png`}
                                width={100}
                              />
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

              {/* Standings */}
              {/* <div className="flex w-full flex-col">
                <span className="text-xl mb-4">Standings</span>
                <div className="flex flex-col md:flex-row lg:flex-row justify-around gap-4 mt-4">
                  <Standings standingsResponse={driverStandings} />
                  <Standings standingsResponse={constructorStandings} />
                </div>
              </div> */}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
}
