"use client";

import {
  F1Event,
  getCountryCode,
  getDayOfWeek,
  getRelativeDate,
  getTimeOnly,
} from "@/utils/calendar";
import { Geist } from "next/font/google";

interface NextSessionProps {
  session: F1Event;
  timeUntil: {
    days: number;
    hours: number;
    minutes: number;
  };
}

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

export default function NextSession({ session, timeUntil }: NextSessionProps) {
  if (!session) return null;

  return (
    <div
      className="flex md:flex-col py-4 max-w-full justify-center"
      style={mediumGeist.style}
    >
      <div className="flex md:flex-row flex-col max-w-[75vw] justify-between items-center">
        {/* Countdown Timer */}
        <div className="gap-4 tracking-widest flex md:flex-row">
          <TimeUnit
            value={timeUntil.days}
            label={timeUntil.days > 1 ? "days" : "day"}
          />
          <TimeUnit
            value={timeUntil.hours}
            label={timeUntil.hours > 1 ? "hours" : "hour"}
          />
          <TimeUnit
            value={timeUntil.minutes}
            label={timeUntil.minutes > 1 ? "minutes" : "minute"}
          />
        </div>

        {/* Session Details */}
        <div className="my-4 mx-8 flex flex-col">
          <h1 className="font-semibol text-xl tracking-wide mb-4">
            {session.summary.toUpperCase().slice(2)}
          </h1>

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
      <h2 className="text-4xl">{value}</h2>
      <p className="text-lg text-gray-500">{label}</p>
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
