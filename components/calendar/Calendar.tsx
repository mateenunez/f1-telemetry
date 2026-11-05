"use client";
import { useCallback, useEffect, useState } from "react";
import {
  ensureUtc,
  fetchUpcoming,
  translateSessionType,
  type F1UpcomingResponse,
  type TimeUntilNext,
} from "@/utils/calendar";

function getTimeUntil(start: string): TimeUntilNext {
  const diff = Math.max(0, new Date(ensureUtc(start)).getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    days,
    hours,
    minutes,
    seconds,
    totalMinutes: Math.floor(totalSeconds / 60),
    totalHours: Math.floor(totalSeconds / 3600),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

function GlowText({
  isRace,
  children,
}: {
  isRace: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <span
        className={`px-4 block ${
          isRace ? "calendar-glow-text-base" : "calendar-glow-text-base-neutral"
        }`}
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        className={`px-4 block ${
          isRace ? "calendar-glow-text-spot" : "calendar-glow-text-spot-neutral"
        }`}
      >
        {children}
      </span>
    </>
  );
}

export default function F1Calendar({ dict }: { dict: any }) {
  const [upcoming, setUpcoming] = useState<F1UpcomingResponse | null>(null);
  const [timeUntil, setTimeUntil] = useState<TimeUntilNext | null>(null);

  const loadCalendar = useCallback(async () => {
    try {
      const data = await fetchUpcoming();
      setUpcoming(data);
      setTimeUntil(getTimeUntil(data.nextEvent.start));
    } catch (err) {
      console.error("Error loading upcoming:", err);
    }
  }, []);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  // Tick local cada 1s desde nextEvent.start — sin refetch
  useEffect(() => {
    if (!upcoming?.nextEvent?.start) return;
    const start = upcoming.nextEvent.start;
    const id = setInterval(() => {
      const next = getTimeUntil(start);
      setTimeUntil(next);
      // Al llegar a 0, refrescar para obtener el siguiente evento
      if (next.days === 0 && next.hours === 0 && next.minutes === 0 && next.seconds === 0) {
        loadCalendar();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [upcoming?.nextEvent?.start, loadCalendar]);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--mouse-x", `${x}%`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}%`);
  };

  if (!upcoming || !timeUntil) return null;

  const { nextEvent, isWeekRace } = upcoming;
  const { days, hours, minutes, seconds } = timeUntil;

  // Labels cortos localizados: primera letra de dict.schedule.*
  const dLabel = (dict.schedule?.day ?? "day").slice(0, 1).toUpperCase();
  const hLabel = (dict.schedule?.hour ?? "hour").slice(0, 1).toUpperCase();
  const mLabel = (dict.schedule?.minute ?? "minute").slice(0, 1).toUpperCase();
  const sLabel = (dict.schedule?.second ?? "second").slice(0, 1).toUpperCase();

  // Jerarquía: D/H primario (más grande), M/S atenuado
  const primary: { value: string; label: string }[] = [];
  if (days > 0) {
    primary.push({ value: pad(days), label: dLabel });
    primary.push({ value: pad(hours), label: hLabel });
  } else if (hours > 0) {
    primary.push({ value: pad(hours), label: hLabel });
  } else {
    primary.push({ value: pad(minutes), label: mLabel });
  }

  const secondary: { value: string; label: string }[] = [];
  if (days > 0 || hours > 0) {
    secondary.push({ value: pad(minutes), label: mLabel });
  }
  secondary.push({ value: pad(seconds), label: sLabel });

  const plural = (base: string, v: number) => (v > 1 ? `${base}s` : base);
  const ariaLabel = [
    days > 0 ? `${days} ${plural(dict.schedule?.day ?? "day", days)}` : "",
    `${hours} ${plural(dict.schedule?.hour ?? "hour", hours)}`,
    `${minutes} ${plural(dict.schedule?.minute ?? "minute", minutes)}`,
    `${seconds} ${plural(dict.schedule?.second ?? "second", seconds)}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-0 items-center text-offWhite">
      <div className="flex flex-row font-geist lg:flex-row text-xs md:text-sm lg:text-sm text-gray-400 gap-1">
        <p>{nextEvent.location} - </p>
        <p>{translateSessionType(nextEvent.type, dict)}</p>
      </div>
      <a
        className={`group relative flex flex-row items-center justify-center font-f1-regular text-md font-regular cursor-pointer underline-offset-4 calendar-glow-wrapper ${
          isWeekRace ? "decoration-red-400/60" : "decoration-gray-400/60"
        }`}
        href="/schedule"
        onMouseMove={handleMouseMove}
      >
        <GlowText isRace={isWeekRace}>
          <time
            dateTime={ensureUtc(nextEvent.start)}
            aria-label={ariaLabel}
            className="flex items-baseline gap-2 font-geist tabular-nums"
          >
            <span className="flex items-baseline gap-1.5 text-base font-bold leading-none">
              {primary.map((u, i) => (
                <span key={i} className="flex items-baseline">
                  <span>{u.value}</span>
                  <span aria-hidden="true" className="text-[0.65em] font-medium">
                    {u.label}
                  </span>
                </span>
              ))}
            </span>
            <span className="flex items-baseline gap-1.5 text-sm font-medium leading-none opacity-80">
              {secondary.map((u, i) => (
                <span key={i} className="flex items-baseline">
                  <span>{u.value}</span>
                  <span aria-hidden="true" className="text-[0.65em]">
                    {u.label}
                  </span>
                </span>
              ))}
            </span>
          </time>
        </GlowText>
      </a>
    </div>
  );
}
