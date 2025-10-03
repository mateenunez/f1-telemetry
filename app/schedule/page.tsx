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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Geist } from "next/font/google";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Footer from "@/components/Footer";
import Upnext from "@/components/Upnext";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

export default function SchedulePage() {
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
  }, []);

  if (!calendar) {
    return (
      <div className="min-h-screen bg-black p-4 flex items-start justify-center gap-4 overflow-hidden">
        <div className="max-w-6xl w-full mx-auto px-4 md:px-8">
          <SkeletonTheme baseColor="#151515ff" highlightColor="#444">
            {/* Header Skeleton */}
            <div className="flex flex-row justify-between mt-12 items-start md:items-center w-full gap-4 mb-8">
              <div className="flex flex-row items-center gap-4 w-full">
                <Skeleton height={36} width={"8rem"} />
              </div>
              <Skeleton height={36} width={"8rem"} />
            </div>
            {/* Next session skeleton */}
            <div className="mx-0 w-full gap-8 py-12">
              <div className="flex flex-col items-center">
                <Skeleton
                  height={150}
                  width="30rem"
                  style={{ marginBottom: 32, marginLeft: "0" }}
                />
                <Skeleton
                  height={80}
                  width="20rem"
                  style={{ marginBottom: 32, marginLeft: "0" }}
                />
              </div>
              {/* Upcoming Events Skeleton */}
              <div className="flex gap-4 md:justify-evenly pb-4 flex-row md:flex-row lg:flex-row over pl-[2rem]">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton width={"15rem"} height={160} key={idx} />
                ))}
              </div>
            </div>
          </SkeletonTheme>
        </div>
      </div>
    );
  }

  if (calendar)
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-warmBlack to-warmBlack2 text-white overflow-hidden"
        style={mediumGeist.style}
      >
        <div className="max-w-6xl mx-auto mt-12 px-4 md:px-8">
          <div className="flex flex-row justify-between items-center w-full gap-4 mb-8">
            <span className="text-2xl font-regular flex flex-row gap-2">
              Schedule
            </span>

            <a className="text-xl font-regular hover:cursor-pointer" href="/">
              Telemetry
            </a>
          </div>
          <div className="flex flex-row my-4">
            <div className="flex flex-col md:mx-8 w-full gap-6">
              {/* Proxima sesion */}
              <NextSession
                session={calendar.nextEvent}
                timeUntil={calendar.timeUntilNext}
              />

              {/* Calendario completo */}
              <div className="flex flex-col w-full">
                <span className="text-xl mb-4">Upnext</span>
                <ScrollArea className="w-full">
                  <Upnext upNextEvents={calendar.groupsByLocation}/>
                  <ScrollBar
                    orientation="horizontal"
                    className="bg-gray-700 hidden md:block"
                  />
                </ScrollArea>
              </div>
            </div>
          </div>
          <Footer isDashboard={false} />
        </div>
      </div>
    );
}
