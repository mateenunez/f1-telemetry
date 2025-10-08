"use client";

import { useState } from "react";
import { usePreferences } from "@/context/preferences";
import {
  PanelLeftOpen,
  PanelLeftClose,
  X,
} from "lucide-react";
import { Geist, Orbitron } from "next/font/google";
import { ProcessedDriver } from "@/processors";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const orbitron = Orbitron({ subsets: ["latin"], weight: "400" });

interface PreferencesPanelProps {
  driverInfo: ProcessedDriver[] | undefined;
}

export default function PreferencesPanel({
  driverInfo,
}: PreferencesPanelProps) {
  const { preferences, setPreference } = usePreferences();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>(
    preferences.favoriteDrivers
  );

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
            d.team_name.toLowerCase().includes(value.toLowerCase())
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
      (d) => d.full_name !== driver.full_name
    );
    setFavorites(newFavorites);
    setPreference("favoriteDrivers", newFavorites);
  };

  const preferenceDetails: Record<
    string,
    { title: string; description: string }
  > = {
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
      description: "Enable sound effects and background audio during the race.",
    },
    headshot: {
      title: "Driver Headshot",
      description: "Show a picture for each driver.",
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
  };

  return (
    <>
      {/* Toggle Button */}
      <PanelLeftOpen
        className="text-gray-600 hover:text-gray-400 hover:cursor-pointer"
        width={15}
        onClick={() => setOpen((prev) => !prev)}
      />

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
        style={mediumGeist.style}
      />

      {/* Slide Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-96 bg-black text-white z-50 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-8 overflow-y-auto h-full">
          <span
            className="text-xl font-semibold mb-6 text-center flex gap-6 items-center"
            style={orbitron.style}
          >
            <PanelLeftClose
              className="text-gray-600 hover:text-gray-400 hover:cursor-pointer"
              width={15}
              onClick={() => setOpen((prev) => !prev)}
            />
            Settings
          </span>

          <div className="space-y-3">
            <p className="text-lg text-gray-100" style={mediumGeist.style}>
              Visual
            </p>
            {Object.entries(preferences).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between"
                style={mediumGeist.style}
              >
                {preferenceDetails[key as string] ? (
                  <>
                    {" "}
                    <div className="flex flex-col px-2">
                      <span className="text-sm">
                        {preferenceDetails[key as string].title}
                      </span>
                      <span className="text-xs text-gray-500">
                        {preferenceDetails[key as string].description}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={value}
                        onChange={(e) =>
                          setPreference(
                            key as keyof typeof preferences,
                            e.target.checked
                          )
                        }
                      />
                      <div className="w-10 h-5 bg-gray-800 rounded-full peer-checked:bg-gray-500 transition-colors"></div>
                      <div className="absolute left-1 top-1 bg-gray-400 peer-checked:bg-white w-3 h-3 rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  </>
                ) : (
                  <></>
                )}
              </div>
            ))}

            <div className="flex flex-col gap-4 pt-2">
              <p
                className="text-lg text-gray-100 font-semibold"
                style={mediumGeist.style}
              >
                Favorites Drivers
              </p>

              {/* Show selected driver acronym */}

              <div className="text-gray-400 text-sm bg-warmBlack flex flex-row gap-2 flex-wrap ">
                {favorites &&
                  favorites.map((driver, idx) => (
                    <span
                      key={idx}
                      className="font-bold text-gray-200 border-2 border-gray-400 p-1 rounded flex flex-row gap-1 w-[4rem] items-center hover:cursor-pointer"
                      style={{
                        fontFamily: mediumGeist.style.fontFamily,
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
                  style={mediumGeist.style}
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search by name or team..."
                  className="w-full px-3 py-2 text-sm rounded-md bg-warmBlack text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
                        <div className="font-medium" style={mediumGeist.style}>
                          {driver.full_name}
                        </div>
                        <div
                          className="text-xs text-gray-400"
                          style={mediumGeist.style}
                        >
                          {driver.team_name}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Metrics option */}
            {/* <p className="text-lg text-gray-100" style={mediumGeist.style}>
              Metrics
            </p> */}

            {/* Help tutorial */}
            {/* <div className="flex flex-col gap-2">
              <p className="text-lg text-gray-100" style={mediumGeist.style}>
                Help!
              </p>
              <div className="flex flex-row gap-1">
                <p className="text-sm text-gray-400"> Click here to a quick </p>
                <p className="text-sm text-blue-500 hover:cursor-pointer">
                  dashboard tutorial!
                </p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}
