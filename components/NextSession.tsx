"use client";

import {
  F1Event,
  getCountryCode,
  getDayOfWeek,
  getRelativeDate,
  getTimeOnly,
  TimeUntilNext,
} from "@/utils/calendar";
import { Geist } from "next/font/google";
import { useEffect, useState } from "react";

interface NextSessionProps {
  session: F1Event;
  timeUntil: TimeUntilNext;
}

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

export default function NextSession({ session, timeUntil }: NextSessionProps) {
  const [time, setTime] = useState<TimeUntilNext>(timeUntil);
  if (!session) return null;

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { days, hours, minutes, seconds, totalHours, totalMinutes } = prev;
        if (seconds > 0) {
          seconds -= 1;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes -= 1;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours -= 1;
            } else {
              hours = 23;
              if (days > 0) {
                days -= 1;
              }
            }
          }
        }
        return { days, hours, minutes, seconds, totalHours, totalMinutes };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex md:flex-col py-4 max-w-full justify-center"
      style={mediumGeist.style}
    >
      <div className="flex flex-col max-w-full justify-between items-center text-center">
        {/* Countdown Timer */}
        <div className="gap-4 tracking-wide md:tracking-widest flex md:flex-row text-[5rem]">
          <TimeUnit value={time.days} label={time.days > 1 ? "days" : "day"} />
          <TimeUnit
            value={time.hours}
            label={time.hours > 1 ? "hours" : "hour"}
          />
          <TimeUnit
            value={time.minutes}
            label={time.minutes > 1 ? "minutes" : "minute"}
          />
          <TimeUnit
            value={time.seconds}
            label={time.seconds > 1 ? "seconds" : "second"}
          />
        </div>

        {/* Session Details */}
        <div className="my-4 mx-8 flex flex-col">
          <span className="font-semibol text-xl tracking-wide mb-4 w-full">
            {session.location.toUpperCase() + " GRAND PRIX"}
          </span>

          <div className="flex md:flex-row flex-col justify-around">
            {/* Time Information */}
            <div className="flex flex-col items-center">
              <p className="text-xl">
                {getDayOfWeek(session.start)} {getRelativeDate(session.start)}
              </p>
              <div className="items-center text-gray-300">
                {getTimeOnly(session.start)} - {getTimeOnly(session.end)}
              </div>
            </div>

            {/* Location and Status */}
            <div>
              <InfoRowWithFlag label="" value={session.location} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para las unidades de tiempo
function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[3rem] md:text-[4rem]">{value}</span>
      <p className="text-[1rem] text-gray-600">{label}</p>
    </div>
  );
}

// Componente para filas de información con bandera
function InfoRowWithFlag({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-gray-500 flex flex-col gap-0 items-center">
      {label} <p className="text-gray-200 text-lg">{value}</p>{" "}
      <img
        src={`https://flagsapi.com/${getCountryCode(value)}/flat/32.png`}
        alt={`Flag of ${value}`}
      />
    </span>
  );
}
