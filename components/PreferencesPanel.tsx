"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Preferences,
  WidgetConfig,
  usePreferences,
  DEFAULT_CONFIG,
} from "@/context/preferences";
import { X, Check, PanelLeft, Pencil, Type } from "lucide-react";
import { ProcessedDriver } from "@/processors";
import { useTour } from "@reactour/tour";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import AuthForm from "./telemetry/AuthForm";
import { useContext } from "react";

interface PreferencesPanelProps {
  driverInfo: ProcessedDriver[] | undefined;
  dict?: any;
}

type LanguageOptions = {
  value: string;
  label: string;
};

export default function PreferencesPanel({
  driverInfo,
  dict,
}: PreferencesPanelProps) {
  const {
    preferences,
    setPreference,
    isEditMode,
    setIsEditMode,
    widgets,
    setWidgetsPreferences,
  } = usePreferences();
  const { isAuthenticated } = useAuth();
  const { setIsOpen } = useTour();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [authFormOpen, setAuthFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>(
    preferences.favoriteDrivers,
  );
  const [delay, setDelay] = useState<number>(preferences.delay);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    preferences.translate ? "es" : "en",
  );
  const pathname = usePathname();
  const isLiveTimingPage = /^\/[^/]+\/live-timing\/?$/.test(pathname ?? "");
  const { user, logout } = useAuth();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = driverInfo
      ? driverInfo.filter(
          (d) =>
            d.full_name.toLowerCase().includes(value.toLowerCase()) ||
            d.team_name.toLowerCase().includes(value.toLowerCase()),
        )
      : [];

    setSuggestions(filtered.slice(0, 5));
  };

  const handleSelectDriver = (driver: any) => {
    // Avoid duplicates
    if (favorites.some((fav) => fav.full_name === driver.full_name)) {
      setSearch("");
      setSuggestions([]);
      return;
    }

    const newFavorites = [...favorites, driver];
    setFavorites(newFavorites);
    setSearch("");
    setSuggestions([]);
    setPreference("favoriteDrivers", newFavorites);
  };

  const handleDeleteDriver = (driver: any) => {
    const newFavorites = favorites.filter(
      (d) => d.full_name !== driver.full_name,
    );
    setFavorites(newFavorites);
    setPreference("favoriteDrivers", newFavorites);
  };

  const handleDelayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const stringValue = event.target.value;

    if (stringValue === "") {
      return;
    }

    let numValue = parseInt(stringValue, 10);
    let finalValue: number;

    if (isNaN(numValue) || numValue < 0) {
      finalValue = 0;
    } else if (numValue > 600) {
      finalValue = 600;
    } else {
      finalValue = numValue;
    }

    setDelay(finalValue);
  };

  const handleDelay = () => {
    setPreference("delay", delay);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value;
    setSelectedLanguage(newLang);
    setPreference("translate", newLang === "es");
  };

  const handleRestartTour = () => {
    if (!isLiveTimingPage) return;
    setOpen(false);
    setTimeout(() => setIsOpen(true), 300);
  };

  const handleResetWidgets = () => {
    const widgetKeys: Array<keyof Preferences> = [
      "driverPositions",
      "mapAndMessages",
      "audioLog",
      "raceControlLog",
      "circleOfDoom",
      "circleCarData",
      "tyresList",
      "chat",
    ];

    widgetKeys.forEach((key) => {
      setPreference(key, DEFAULT_CONFIG[key]);
    });
  };

  const handleEditMode = () => {
    if (isEditMode) {
      setWidgetsPreferences(widgets);
    }
    setIsEditMode(!isEditMode);
    setOpen(false);
  };

  const preferenceDetails: Record<
    string,
    { title: string; description: string }
  > = preferences.translate
    ? {
        sectors: {
          title: "Sectores marcados",
          description:
            "Mostrar los sectores coloreados en el mapa del circuito.",
        },
        corners: {
          title: "Números de curvas",
          description:
            "Mostrar la numeración de las curvas y detalles de los giros en el mapa.",
        },
        audio: {
          title: "Notificaciones de audio",
          description:
            "Activar efectos de sonido y audio de fondo durante la carrera.",
        },
        headshot: {
          title: "Foto del piloto",
          description: "Mostrar una foto de cada piloto.",
        },
        weatherDetailed: {
          title: "Clima detallado",
          description:
            "Mostrar información completa del clima (lluvia, humedad, viento, presión).",
        },
        audioLog: {
          title: "Audios de pilotos",
          description:
            "Mostrar el historial de mensajes de audio y llamadas de radio de equipo.",
        },
        raceControlLog: {
          title: "Mensajes de carrera",
          description:
            "Mostrar la lista oficial de mensajes de control de carrera.",
        },
        circleOfDoom: {
          title: 'Círculo "Doom"',
          description:
            "Mostrar la diferencia en segundos entre pilotos; es efectivo en carreras.",
        },
        circleCarData: {
          title: 'Círculo "CarData"',
          description:
            "Mostrar la velocidad, marcha, acelerador y frenos de un piloto.",
        },
        tyresList: {
          title: "Historial de compuestos",
          description:
            "Mostrar el historial de compuestos de cada piloto, incluyendo promedios y mejores vueltas.",
        },
        chat: {
          title: "Chat",
          description: "Mostrar el chat para enviar y ver mensajes en vivo.",
        },
      }
    : {
        sectors: {
          title: "Track Sectors",
          description: "Display colored sectors on the circuit map.",
        },
        corners: {
          title: "Track Corners",
          description: "Show corner numbering and turn details on the map.",
        },
        audio: {
          title: "Audio Pop-Ups",
          description:
            "Enable sound effects and background audio during the race.",
        },
        headshot: {
          title: "Driver Headshot",
          description: "Show a picture for each driver.",
        },
        weatherDetailed: {
          title: "Detailed Weather",
          description:
            "Show complete weather information (rain, humidity, wind, pressure).",
        },
        audioLog: {
          title: "Driver Audios",
          description:
            "Display the history of audio messages and team radio calls.",
        },
        raceControlLog: {
          title: "Race Messages",
          description: "Show official race control messages list.",
        },
        circleOfDoom: {
          title: "Circle of Doom",
          description:
            "Show gap in seconds between drivers, its effective on races.",
        },
        circleCarData: {
          title: "Circle Car-Data",
          description: "Show speed, gear, throttle and brakes of one driver.",
        },
        tyresList: {
          title: "Compounds Record",
          description:
            "Display each driver's tire compound history, including averages and best laps.",
        },
        chat: {
          title: "Chat",
          description: "Show the chat to send and view live messages.",
        },
      };

  const options: LanguageOptions[] = preferences.translate
    ? [
        { value: "en", label: "Inglés" },
        { value: "es", label: "Español" },
      ]
    : [
        { value: "en", label: "English" },
        { value: "es", label: "Spanish" },
      ];

  return (
    <>
      {/* Toggle Button */}
      <PanelLeft
        className="text-gray-300 hover:text-gray-400 hover:cursor-pointer preferences-step"
        width={15}
        onClick={() => setOpen((prev) => !prev)}
      />

      {!isMobile && (
        <Pencil
          width={15}
          className={`hover:cursor-pointer transition-colors edit-step ${
            isEditMode
              ? "text-f1Blue hover:text-f1Blue/80"
              : "text-gray-300 hover:text-gray-400"
          }`}
          onClick={handleEditMode}
        />
      )}

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 font-geist ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Slide Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-96 bg-black text-white z-50 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-8 overflow-y-auto h-full">
          {/* Panel button */}
          <span className="text-xl mb-6 text-center flex gap-6 items-center font-orbitron">
            <PanelLeft
              className="text-gray-300 hover:text-gray-400 hover:cursor-pointer"
              width={15}
              onClick={() => setOpen((prev) => !prev)}
            />
            {preferences.translate ? "Configuración" : "Settings"}
          </span>

          {/* Delay */}
          <div className="flex flex-col gap-4 pb-4">
            <p className="text-md text-gray-100 font-orbitron">Delay</p>
            <div className="flex flex-row w-full justify-around gap-2 h-[2.5rem] items-center">
              <input
                type="number"
                placeholder={
                  preferences.translate
                    ? "Delay en segundos..."
                    : "Delay in seconds..."
                }
                style={{
                  boxShadow:
                    "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
                }}
                onChange={handleDelayChange}
                value={delay}
                className="w-[8rem] px-3 h-full text-sm rounded-md bg-warmBlack text-gray-100 border-2 border-gray-700 hover:border-offWhite hover:bg-warmBlack/80 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-200 font-geist font-medium"
              />
              <button
                type="button"
                className="flex justify-center items-center px-3 h-full text-sm rounded-md bg-warmBlack text-gray-100 border-2 border-gray-700 transition-all hover:border-offWhite hover:bg-warmBlack/80 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-200"
                onClick={handleDelay}
                style={{
                  boxShadow:
                    "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
                }}
              >
                <Check width={15} />
              </button>
              <p className="text-xs text-gray-500 font-geist font-medium">
                {preferences.translate
                  ? "Ajustar delay en segundos (máx 600s)."
                  : "Set delay on seconds (máx 600s)."}
              </p>
            </div>
          </div>

          {/* Language */}
          <div className="flex flex-col gap-2 pb-4">
            <p className="text-md text-gray-100 font-orbitron">
              {preferences.translate ? "Idioma" : "Language"}
            </p>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-500 font-geist font-medium">
                {preferences.translate
                  ? "Las traducciones al español pueden tardar unos segundos más en llegar."
                  : "The spanish translation may have additional delay."}
              </p>
              <select
                id="language-select"
                value={selectedLanguage}
                onChange={handleSelectChange}
                style={{
                  boxShadow:
                    "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
                }}
                className="text-sm py-2 px-2 rounded-md bg-warmBlack text-gray-200 border-2 border-gray-700 hover:border-offWhite hover:bg-warmBlack/80 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-200 font-geist font-medium"
              >
                {options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-warmBlack px-2 text-gray-200 border-none"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tutorial Button */}
          <div className="flex flex-col gap-2 pb-4">
            <p className="text-md text-gray-100 font-orbitron">Tutorial</p>
            <p className="text-xs text-gray-500 font-geist font-medium">
              {preferences.translate
                ? "Volver a ver el tutorial de introducción."
                : "Show the introduction tutorial again."}
            </p>
            <button
              onClick={handleRestartTour}
              className="flex items-start justify-start gap-2 px-4 py-2 text-sm rounded-md bg-warmBlack text-gray-100 border-2 border-gray-700 hover:border-offWhite hover:bg-warmBlack/80 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-f1Blue font-geist font-medium"
              style={{
                boxShadow:
                  "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
              }}
            >
              <span>{preferences.translate ? "Reiniciar" : "Restart"}</span>
            </button>
          </div>

          {/* Edit Canvas Button */}
          {!isMobile && (
            <div className="flex flex-col gap-2 pb-4">
              <p className="text-md text-gray-100 font-orbitron">
                {preferences.translate ? "Editar widgets" : "Edit canvas"}
              </p>
              <p className="text-xs text-gray-500 font-geist font-medium">
                {preferences.translate
                  ? "Habilitar el modo de edición para mover o redimensionar los widgets."
                  : "Enable edit mode to move or redimension widgets."}
              </p>
              <button
                onClick={handleEditMode}
                className="flex items-start justify-start gap-2 px-4 py-2 text-sm rounded-md bg-warmBlack text-gray-100 border-2 border-gray-700 hover:border-offWhite hover:bg-warmBlack/80 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-f1Blue font-geist font-medium"
                style={{
                  boxShadow:
                    "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
                }}
              >
                <span>
                  {isEditMode ? (
                    <>
                      {preferences.translate
                        ? "Guardar cambios"
                        : "Save changes"}
                    </>
                  ) : (
                    <>
                      {preferences.translate
                        ? "Activar modo edición"
                        : "Enable edit mode"}
                    </>
                  )}
                </span>
              </button>
            </div>
          )}

          {/* Favorite Drivers */}
          <div className="flex flex-col gap-2 pb-4">
            <p className="text-md text-gray-100 font-orbitron">
              {preferences.translate
                ? "Pilotos Favoritos"
                : "Favorites Drivers"}
            </p>

            {/* Show selected driver acronym */}
            <div className="text-gray-400 text-sm bg-transparent flex flex-row gap-2 flex-wrap">
              {favorites &&
                favorites.map((driver, idx) => (
                  <span
                    key={idx}
                    className="text-gray-200 border-2 border-gray-400 p-1 rounded flex flex-row gap-1 w-[4rem] items-center hover:cursor-pointer font-geist font-medium"
                    style={{
                      color: "#" + driver.team_colour,
                    }}
                    onClick={() => handleDeleteDriver(driver)}
                  >
                    <X width={15} color="red" />
                    {driver.name_acronym}
                  </span>
                ))}
            </div>

            {/* Input */}
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                style={{
                  boxShadow:
                    "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
                }}
                value={search}
                onChange={handleSearch}
                placeholder={
                  preferences.translate
                    ? "Buscar por piloto o equipo..."
                    : "Search by name or team..."
                }
                className="w-full px-3 py-2 text-sm rounded-md bg-warmBlack text-gray-100 border-2 border-gray-700 hover:border-offWhite hover:bg-warmBlack/80 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-200 font-geist font-medium"
              />

              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <ul className="absolute z-20 w-full mt-1 bg-warmBlack border border-gray-700 rounded-md shadow-lg max-h-48 overflow-auto">
                  {suggestions.map((driver, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelectDriver(driver)}
                      className="px-3 py-2 text-sm text-gray-200 hover:cursor-pointer"
                    >
                      <div className="font-medium font-geist font-medium">
                        {driver.full_name}
                      </div>
                      <div className="text-xs text-gray-400 font-geist font-medium">
                        {driver.team_name}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Visuals */}
          <div className="flex flex-col justify-evenly pb-4">
            <p className="text-md text-gray-100 font-orbitron">
              {preferences.translate ? "Vista" : "Visuals"}
            </p>
            <a
              href="/help"
              target="_blank"
              className="text-xs text-gray-500 font-geist font-medium hover:text-f1Blue"
            >
              {preferences.translate
                ? "Más información sobre los widgets acá."
                : "Learn more about widgets here."}
            </a>
            {Object.entries(preferences).map(([key, value]) => {
              const handleWidgetToggle = (
                key: keyof Preferences,
                enabled: boolean,
              ) => {
                const currentValue = preferences[key];
                if (
                  typeof currentValue === "object" &&
                  currentValue !== null &&
                  "enabled" in currentValue &&
                  ("x" in currentValue || "xPct" in currentValue) &&
                  ("y" in currentValue || "yPct" in currentValue) &&
                  ("width" in currentValue || "widthPct" in currentValue) &&
                  ("height" in currentValue || "heightPct" in currentValue)
                ) {
                  setPreference(key, {
                    ...currentValue,
                    enabled,
                  } as Preferences[keyof Preferences]);
                } else {
                  setPreference(key, enabled as Preferences[keyof Preferences]);
                }
              };

              const isWidgetConfig =
                typeof value === "object" &&
                value !== null &&
                "enabled" in value &&
                ("x" in value || "xPct" in value);

              const checked = isWidgetConfig
                ? (value as WidgetConfig).enabled
                : (value as boolean);

              return (
                <div key={key} className="flex items-center justify-between">
                  {preferenceDetails[key as string] ? (
                    <>
                      {" "}
                      <div className="flex flex-col px-2 py-2">
                        <span className="text-xs font-geist font-medium">
                          {preferenceDetails[key as string].title}
                        </span>
                        <span className="text-xs text-gray-500 font-geist font-medium">
                          {preferenceDetails[key as string].description}
                        </span>
                      </div>
                      <label className="relative inline-flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={checked}
                          onChange={(e) =>
                            handleWidgetToggle(
                              key as keyof Preferences,
                              e.target.checked,
                            )
                          }
                        />
                        <div className="w-10 h-5 bg-gray-800 rounded-full peer-checked:bg-f1Blue/80 transition-colors peer-checked:shadow-f1Blue-md"></div>
                        <div className="absolute left-1 top-1 bg-f1Blue peer-checked:bg-white w-3 h-3 rounded-full transition-transform peer-checked:translate-x-5 "></div>
                      </label>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              );
            })}
          </div>

          {/* Reset config */}
          <div className="flex flex-col gap-2 pb-4 border-t border-gray-700 pt-4">
            <p className="text-xs text-gray-500 font-geist font-medium">
              {preferences.translate
                ? "Restablecer todos los widgets a sus posiciones y tamaños por defecto. Esta acción no se puede deshacer."
                : "Reset all widgets to their default positions and sizes. This action cannot be undone."}
            </p>
            <button
              onClick={handleResetWidgets}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md text-red-600 hover:text-red-700 text-white border-2 border-red-700 hover:border-red-800 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 font-geist font-medium"
              style={{
                boxShadow:
                  "0 6px 12px -3px #37415140, -3px 0 12px -3px #37415140, 3px 0 12px -3px #37415140",
              }}
            >
              <span>
                {preferences.translate
                  ? "Restablecer widgets"
                  : "Reset widgets"}
              </span>
            </button>
          </div>

          {user && (
            <div className="flex flex-row gap-1">
              <p className="text-xs text-gray-500 font-geist font-medium">
                {preferences.translate
                  ? "Sesión iniciada como "
                  : "Signed in as "}
              </p>
              <p className="text-xs text-gray-500 font-geist font-medium">
                {user.username}.
              </p>
              <p
                className="text-xs text-gray-500 hover:text-f1Blue font-geist font-medium underline hover:cursor-pointer"
                onClick={logout}
              >
                {preferences.translate ? " Cerrar sesión. " : " Sign out. "}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Auth Form Modal */}
      <AuthForm
        isOpen={authFormOpen}
        onClose={() => setAuthFormOpen(false)}
        dict={dict}
      />
    </>
  );
}
