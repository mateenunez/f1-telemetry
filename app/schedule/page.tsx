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
import Standings from "@/components/Standings";
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

    const interval = setInterval(loadCalendar, 60 * 1000);
    return () => clearInterval(interval);
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
              <div className="flex gap-4 pb-4 flex-col md:flex-row lg:flex-row over">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton width={300} height={160} key={idx} />
                ))}
              </div>
              {/* Standings Skeleton */}
              <div className="flex w-full flex-col mt-8 ">
                <Skeleton
                  height={30}
                  width={100}
                  style={{ marginBottom: 16 }}
                />
                <div className="flex flex-col md:flex-row lg:flex-row justify-around gap-4 mt-4">
                  {/* Tabla de Driver Standings Skeleton */}
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full bg-warmBlack1 rounded-lg w-[5rem] border border-gray-800">
                      <thead>
                        <tr className="bg-warmBlack2 text-white text-sm font-regular">
                          <th className="py-2 px-4 text-left">
                            <Skeleton width={10} />
                          </th>
                          <th className="py-2 px-4 text-left">
                            <Skeleton width={10} />
                          </th>
                          <th className="py-2 px-4 text-right">
                            <Skeleton width={10} />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 8 }).map((_, idx) => (
                          <tr key={idx} className="border-b border-gray-700">
                            <td className="py-2 px-4">
                              <Skeleton width={10} />
                            </td>
                            <td className="py-2 px-4">
                              <div className="flex flex-row gap-2 align-center">
                                <Skeleton width={10} />
                              </div>
                            </td>
                            <td className="py-2 px-4 text-right">
                              <Skeleton width={10} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Tabla de Constructor Standings Skeleton */}
                  <div className="overflow-x-auto min-w-[20rem] w-full">
                    <table className="min-w-full bg-warmBlack1 rounded-lg border border-gray-800">
                      <thead>
                        <tr className="bg-warmBlack2 text-white text-sm font-regular">
                          <th className="py-2 px-4 text-left">
                            <Skeleton width={10} />
                          </th>
                          <th className="py-2 px-4 text-left">
                            <Skeleton width={10} />
                          </th>
                          <th className="py-2 px-4 text-right">
                            <Skeleton width={10} />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 8 }).map((_, idx) => (
                          <tr key={idx} className="border-b border-gray-700">
                            <td className="py-2 px-4">
                              <Skeleton width={10} />
                            </td>
                            <td className="py-2 px-4">
                              <div className="flex flex-row gap-2 align-center">
                                <Skeleton width={10} />
                              </div>
                            </td>
                            <td className="py-2 px-4 text-right">
                              <Skeleton width={10} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </SkeletonTheme>
        </div>
      </div>
    );
  }

  if (calendar && driverStandings && constructorStandings) return (
    <div
      className="min-h-screen bg-gradient-to-br from-warmBlack to-warmBlack2 text-white overflow-hidden"
      style={mediumGeist.style}
    >
      <div className="max-w-6xl mx-auto my-12 px-4 md:px-8">
        <div className="flex flex-row justify-between items-center w-full gap-4 mb-8">
          <h1 className="text-3xl font-regular flex flex-row gap-2">
            <img
              src={`https://flagsapi.com/AR/flat/32.png`}
              alt={`Flag of Argentina`}
              className="w-10"
            />{" "}
            Schedule
          </h1>

          <a
            className="text-xl font-regular hover:cursor-pointer"
            href="/"
          >
            Telemetry
          </a>
        </div>
        <div className="flex flex-row my-4">
          <div className="flex flex-col mx-0 md:mx-8 w-full gap-6">
            <h2 className="text-xl py-5"> Next session in</h2>

            {/* Proxima sesion */}
            <NextSession
              session={calendar.nextEvent}
              timeUntil={calendar.timeUntilNext}
            />

            {/* Calendario completo */}
            <div className="flex flex-col w-full">
              <h2 className="text-xl mb-4">Upcoming Events</h2>
              <ScrollArea className="w-full">
                <div className="flex gap-4 pb-4 flex-row">
                  {calendar.upcomingEvents.slice(1).map((event, index) => (
                    <Card
                      key={index}
                      className="min-w-[20rem] max-w-[320px] flex-shrink-0 bg-transparent border-none"
                    >
                      <CardHeader>
                        <p className="text-sm text-start text-white text-wrap font-regular">
                          {event.summary.toUpperCase().slice(2)}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-start">
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

            {/* Standings */}
            <div className="flex w-full flex-col">
              <h2 className="text-xl mb-4">Standings</h2>
              <div className="flex flex-col md:flex-row lg:flex-row justify-around gap-4 mt-4">
                <Standings standingsResponse={driverStandings} />
                <Standings standingsResponse={constructorStandings} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
