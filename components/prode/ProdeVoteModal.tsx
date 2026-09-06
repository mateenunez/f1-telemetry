"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowDown, Trophy, X } from "lucide-react";
import { usePreferences } from "@/context/preferences";
import { isProdeSessionLocked, prodeApi, type ProdeDriver, type ProdeSession } from "@/utils/prode";

interface Props {
  session: ProdeSession;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}

interface DriverSelectProps {
  label: string;
  isEnglish: boolean;
  value?: number;
  drivers: ProdeDriver[];
  onChange: (value: number) => void;
}

function DriverSelect({ label, isEnglish, value, drivers, onChange }: DriverSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const selectedDriver = drivers.find((driver) => driver.driver_number === value);
  const filteredDrivers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return drivers;
    return drivers.filter((driver) =>
      [driver.full_name, driver.name_acronym, driver.team_name]
        .filter((field): field is string => typeof field === "string")
        .some((field) => field.toLowerCase().includes(normalizedQuery)),
    );
  }, [drivers, query]);

  const chooseDriver = (driver: ProdeDriver) => {
    onChange(driver.driver_number);
    setQuery(driver.full_name);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="flex flex-col gap-2 font-orbitron text-sm text-white/75">
        <span className="font-medium text-white">{label}</span>
        <div className="relative">
          <input
            value={selectedDriver && !isOpen ? selectedDriver.full_name : query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={isEnglish ? "Search driver" : "Buscar piloto"}
            autoComplete="off"
            className="w-full border border-white/15 bg-black/30 px-3 py-2.5 pr-9 font-geist text-sm text-white outline-none transition placeholder:font-geist placeholder:text-f1Gray focus:border-f1Yellow"
            role="combobox"
            aria-expanded={isOpen}
            aria-label={`${label}: ${isEnglish ? "search driver" : "buscar piloto"}`}
          />
        </div>
      </label>
      {isOpen && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto border border-white/15 bg-warmBlack shadow-xl">
          {filteredDrivers.length > 0 ? (
            filteredDrivers.map((driver) => (
              <button
                type="button"
                key={driver.driver_number}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseDriver(driver)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left font-geist text-sm text-white/80 transition hover:bg-f1Yellow hover:text-warmBlack"
              >
                <span>{driver.full_name}</span>
                <span className="text-xs opacity-60">{driver.team_name}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 font-orbitron text-sm text-white/45">{isEnglish ? "No drivers found" : "No se encontraron pilotos"}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProdeVoteModal({ session, token, onClose, onSaved }: Props) {
  const pathname = usePathname();
  const { preferences } = usePreferences();
  const locale = pathname.split("/")[1] || "es";
  const isEnglish = !preferences.translate;
  const [drivers, setDrivers] = useState<ProdeDriver[]>([]);
  const [prediction, setPrediction] = useState<Record<string, any>>(session.my_prediction ?? {});
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(Date.now());
  const isRace = session.session_type === "RACE" || session.session_type === "SPRINT";
  const isQualifying = session.session_type === "QUALIFYING";
  const locked = isProdeSessionLocked(session, now);

  useEffect(() => {
    prodeApi.drivers().then((result) => setDrivers(result.drivers)).catch(() => setDrivers([]));
  }, []);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (session.my_prediction) return null;

  const set = (key: string, value: any) => setPrediction((current) => ({ ...current, [key]: value }));
  const setPosition = (key: "podium" | "top3", position: number, value: number) => {
    const positions = [...(prediction[key] ?? [])];
    positions[position] = value;
    set(key, positions);
  };

  const submit = async () => {
    if (isProdeSessionLocked(session)) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await prodeApi.vote(token, session.id, prediction);
      onSaved();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo guardar el voto");
    } finally {
      setSaving(false);
    }
  };

  const positionSelects = (key: "podium" | "top3", prefix: string) => (
    <>
      {[0, 1, 2].map((position) => (
        <DriverSelect
          key={`${key}-${position}`}
          label={`${prefix} ${position + 1}`}
          isEnglish={isEnglish}
          value={prediction[key]?.[position]}
          drivers={drivers}
          onChange={(value) => setPosition(key, position, value)}
        />
      ))}
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-f1Yellow/35 bg-warmBlack p-5 font-geist text-white shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="font-orbitron text-lg font-medium text-white sm:text-xl">{session.grand_prix_name}</h2>
            <p className="mt-1 font-orbitron text-sm text-white/55">{session.session_name}</p>
          </div>
          <button type="button" aria-label="Cerrar" onClick={onClose} className="text-white/55 transition hover:text-f1Yellow">
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          {isRace ? positionSelects("podium", "P") : isQualifying ? (
            <>
              <DriverSelect label="Pole position" isEnglish={isEnglish} value={prediction.pole_driver} drivers={drivers} onChange={(value) => set("pole_driver", value)} />
              <DriverSelect label={isEnglish ? "Fastest lap" : "Vuelta rápida"} isEnglish={isEnglish} value={prediction.fastest_lap_driver} drivers={drivers} onChange={(value) => set("fastest_lap_driver", value)} />
            </>
          ) : positionSelects("top3", "Top")}
        </div>

        <button type="button" disabled={saving || locked} onClick={submit} className="mt-6 flex w-full items-center justify-center gap-2 bg-f1Yellow px-4 py-3 font-geist text-md font-semibold text-warmBlack transition hover:bg-f1Yellow/85 disabled:cursor-not-allowed disabled:opacity-50">
          {locked ? (isEnglish ? "Closed" : "Cerrado") : saving ? (isEnglish ? "Saving..." : "Guardando...") : (isEnglish ? "Save prediction" : "Guardar predicción")}
        </button>
        <a target="_blank" href={`/${locale}/prode/leaderboard`}  className="mt-4 block text-center font-geist text-sm font-medium text-f1Yellow transition hover:text-white">
          Leaderboard
        </a>
      </div>
    </div>
  );
}
