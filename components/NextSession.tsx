"use client";

import { F1Event, formatEventDate, getCountryCode } from "@/utils/calendar";

interface NextSessionProps {
  session: F1Event;
  timeUntil: {
    days: number;
    hours: number;
    minutes: number;
  };
}

export default function NextSession({ session, timeUntil }: NextSessionProps) {
  if (!session) return null;

  return (
    <div className="flex md:flex-col py-4">
      <div className="flex md:flex-row flex-col w-[75vw] justify-between items-center">
        {/* Countdown Timer */}
        <div className="gap-4 tracking-widest flex md:flex-row ">
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
          <h1 className="font-bold text-xl tracking-wide mb-4">
            {session.summary.toUpperCase().slice(2)}
          </h1>

          <div className="flex md:flex-row flex-col justify-around">
            {/* Time Information */}
            <div className="">
              <InfoRow label="STARTS:" value={formatEventDate(session.start)} />
              <InfoRow label="ENDS:" value={formatEventDate(session.end)} />
            </div>

            {/* Location and Status */}
            <div>
              <InfoRowWithFlag label="LOCATION:" value={session.location} />
              <InfoRow
                label="STATUS:"
                value={session.status}
                className="text-sm"
              />
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

// Componente para filas de información básica
function InfoRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <span
      className={`text-gray-500 flex flex-row gap-2 items-center ${className}`}
    >
      {label} <p className="text-white">{value}</p>
    </span>
  );
}

// Componente para filas de información con bandera
function InfoRowWithFlag({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-gray-500 flex flex-row gap-2 items-center">
      {label} <p className="text-white">{value}</p>{" "}
      <img
        src={`https://flagsapi.com/${getCountryCode(value)}/flat/32.png`}
        alt={`Flag of ${value}`}
      />
    </span>
  );
}
