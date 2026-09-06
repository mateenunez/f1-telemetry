"use client";

import { useState, useEffect, useRef } from "react";
import { F1CalendarResponse, fetchCalendar } from "@/utils/calendar";
import NextSession from "@/components/calendar/NextSession";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Upnext from "@/components/calendar/Upnext";
import { config } from "@/lib/config";
import Navigation from "../Navigation";

interface ScheduleContentProps {
  dict: any;
}

export function ScheduleContent({ dict }: ScheduleContentProps) {
  const [calendar, setCalendar] = useState<F1CalendarResponse | null>(null);
  const f1t = config.public.assets.f1_white;
  const viewportRef = useRef<HTMLDivElement>(null);

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
    const LoaderOverlay = () => (
      <div className="fixed inset-0 z-20 flex items-center justify-center bg-warmBlack/40 backdrop-blur-sm">
        <div className="loader" aria-label={dict.loading} role="status" />
      </div>
    );

    return (
      <div className="min-h-screen bg-warmBlack p-4 flex items-start justify-center gap-4 overflow-hidden">
        <LoaderOverlay />
      </div>
    );
  }

  if (calendar)
    return (
      <div className="min-h-screen bg-warmBlack text-white overflow-hidden font-geist">
        <div className="max-w-6xl mx-auto mt-20 px-4 md:px-8">
          <Navigation
            leftUrl={`/${dict.locale}/live-timing`}
            rightUrl={`/${dict.locale}`}
            leftTitle={dict.schedule.dashboardButton}
            rightTitle={dict.schedule.homeButton}
            f1t_url={f1t}
            rightColor="f1Purple"
            prodeUrl={`/${dict.locale}/prode/leaderboard`}
            prodeTitle={dict.home.prodeLeaderboardButton}
            prodeColor="f1Yellow"
            homeUrl={`/${dict.locale}`}
            homeTitle={dict.schedule.homeButton}
            scheduleUrl={`/${dict.locale}/schedule`}
            scheduleTitle={dict.schedule.title}
          />
          <div className="flex flex-row my-4">
            <div className="flex flex-col md:mx-8 w-full gap-6">
              {/* Proxima sesion */}
              <NextSession
                dict={dict}
                session={calendar.nextEvent}
                timeUntil={calendar.timeUntilNext}
              />

              {/* Calendario completo */}
              <div className="flex flex-col w-full">
                <span className="text-xl mb-4">{dict.schedule.upnext}</span>
                <ScrollArea className="w-full" viewportRef={viewportRef}>
                  <Upnext
                    upNextEvents={calendar.groupsByLocation}
                    dict={dict}
                    viewportRef={viewportRef}
                  />
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
