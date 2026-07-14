"use client";

import {
  ProcessedCapture,
  ProcessedDriver,
  ProcessedSession,
  ProcessedTeamRadio,
} from "@/processors";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, DownloadIcon, PauseIcon, PlayIcon } from "lucide-react";
import { toLocaleTime } from "@/utils/calendar";
import { cn } from "@/lib/utils";
import { useTelemetryAudio, audioUrl } from "@/hooks/use-raceControl";
import { config } from "@/lib/config";
import { usePreferences } from "@/context/preferences";

interface SessionAudiosProps {
  teamRadio: ProcessedTeamRadio | undefined;
  drivers: (ProcessedDriver | undefined)[];
  session: ProcessedSession | null | undefined;
  driverInfos?: (ProcessedDriver | undefined)[];
  translate?: boolean;
}

const AUDIO_DOWNLOAD_URL = config.public.apiUrl + "download-mp3";

export default function SessionAudios({
  teamRadio,
  drivers,
  session,
  driverInfos,
  translate,
}: SessionAudiosProps) {
  const [playingAudio, setPlayingAudio] = useState<number | undefined>();
  const [progressMap, setProgressMap] = useState<Map<number, number>>();
  const pendingSeekRatioRef = useRef<number | null>(null);
  const { preferences } = usePreferences();

  const { playTeamRadioSound, radioAudioRef, stopTeamRadioSound } =
    useTelemetryAudio();

  const getMessageStyle = (msg: ProcessedCapture) => {
    const racingNumber = msg.racingNumber;
    if (!racingNumber || !driverInfos) return {};

    if (isNaN(racingNumber)) return {};

    const driver = driverInfos.find((d) => d?.driver_number === racingNumber);
    if (!driver) return {};

    const isFavorite = preferences?.favoriteDrivers?.some(
      (fav) => fav.driver_number === driver.driver_number,
    );

    if (!isFavorite) return {};

    return {
      backgroundColor: `#${driver.team_colour}30`,
      borderColor: `#${driver.team_colour}60`,
    };
  };

  const getdriver = (driverNumber: number) => {
    const driver = drivers.find((d) => d?.driver_number === driverNumber);
    return {
      headshot_url: driver?.headshot_url,
      team_color: driver?.team_colour,
      name_acronym: driver?.name_acronym,
      driver_number: driver?.driver_number,
    };
  };

  const handleAudioPlay = (idx: number, capturePath: string) => {
    if (playingAudio === idx) {
      stopTeamRadioSound();
      setPlayingAudio(undefined);
    } else {
      setPlayingAudio(idx);
      setProgressMap((prev) => {
        const next = new Map(prev);
        if (!next.has(idx)) next.set(idx, 0);
        return next;
      });
      const url = audioUrl + session?.path + capturePath;
      playTeamRadioSound(url);
    }
  };

  const handleSeek = (
    e: React.PointerEvent<HTMLDivElement>,
    idx: number,
    capturePath: string,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      Math.max((e.clientX - rect.left) / rect.width, 0),
      1,
    );

    if (playingAudio === idx) {
      const audio = radioAudioRef.current;
      if (audio?.duration) {
        audio.currentTime = ratio * audio.duration;
        setProgressMap((prev) => {
          const next = new Map(prev);
          next.set(idx, ratio * 100);
          return next;
        });
      } else {
        pendingSeekRatioRef.current = ratio;
      }
      return;
    }

    pendingSeekRatioRef.current = ratio;
    handleAudioPlay(idx, capturePath);
  };

  const handleCopyTranscription = async (cap: ProcessedCapture) => {
    const text = translate ? cap?.transcriptionEs : cap?.transcription;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  const orderedCaptures = teamRadio
    ? [...teamRadio.captures].sort(
      (a, b) => Date.parse(String(b.utc)) - Date.parse(String(a.utc)),
    )
    : [];

  useEffect(() => {
    if (!radioAudioRef.current) return;
    const handleEnded = () => setPlayingAudio(undefined);
    const handleTimeUpdate = () => {
      if (!radioAudioRef.current?.duration) return;
      if (playingAudio === undefined) return;
      const pct =
        (radioAudioRef.current.currentTime / radioAudioRef.current.duration) *
        100;
      setProgressMap((prev) => {
        const next = new Map(prev);
        next.set(playingAudio, Math.min(pct, 100));
        return next;
      });
    };
    const handleLoadedMetadata = () => {
      if (
        pendingSeekRatioRef.current === null ||
        !radioAudioRef.current?.duration ||
        playingAudio === undefined
      )
        return;
      radioAudioRef.current.currentTime =
        pendingSeekRatioRef.current * radioAudioRef.current.duration;
      setProgressMap((prev) => {
        const next = new Map(prev);
        next.set(playingAudio, pendingSeekRatioRef.current! * 100);
        return next;
      });
      pendingSeekRatioRef.current = null;
    };

    radioAudioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    radioAudioRef.current.addEventListener("ended", handleEnded);
    radioAudioRef.current.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata,
    );

    return () => {
      radioAudioRef.current?.removeEventListener(
        "timeupdate",
        handleTimeUpdate,
      );
      radioAudioRef.current?.removeEventListener("ended", handleEnded);
      radioAudioRef.current?.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata,
      );
    };
  }, [radioAudioRef.current, playingAudio]);

  return (
    <Card className="flex w-full h-full bg-warmBlack border-none">
      <CardContent className="overflow-x-hidden flex-1 px-6 py-4">
        <ScrollArea
          className="overflow-x-auto h-[20rem] lg:h-full p-0"
          type="scroll"
        >
          {orderedCaptures.length > 0 && teamRadio ? (
            <div className="space-y-2">
              {orderedCaptures.map((capture, idx) => {
                const driver = getdriver(capture.racingNumber);
                const progress = progressMap?.get(idx) ?? 0;
                const hasTranscription =
                  capture.transcription && capture.transcription !== "";
                const hasEsTranscription =
                  capture.transcriptionEs && capture.transcriptionEs !== "";
                const messageStyle = getMessageStyle(capture);
                return (
                  <div
                    key={idx}
                    className="flex flex-col max-w-full p-0"
                    style={{ ...messageStyle }}
                  >
                    <div className="flex flex-row rounded max-w-full px-1 ">
                      <p
                        className="text-sm text-gray-400 h-[3rem] w-12 shrink-0 flex items-center justify-center text-center font-f1-regular"
                        style={{
                          color: "#" + driver.team_color,
                        }}
                      >
                        {driver.name_acronym}
                      </p>
                      <div className="relative w-full max-w-full mx-2 my-2 h-8 text-gray-400 border-none items-center border-[2px] rounded border-gray-400 flex justify-start gap-2 px-2">
                        <button
                          type="button"
                          aria-label={
                            playingAudio === idx ? "Pause" : "Play"
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAudioPlay(idx, capture.path);
                          }}
                          className="shrink-0 flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          {playingAudio === idx ? (
                            <PauseIcon
                              className="fill-gray-400 transition"
                              width={15}
                            />
                          ) : (
                            <PlayIcon
                              className="fill-gray-400 transition"
                              width={15}
                            />
                          )}
                        </button>

                        <div
                          className="group/track relative w-full h-4 flex items-center cursor-pointer"
                          onPointerDown={(e) =>
                            handleSeek(e, idx, capture.path)
                          }
                        >
                          <div className="relative w-full h-1.5 rounded-full bg-gray-500/30 transition-[height] duration-150 group-hover/track:h-2">
                            <div
                              className={cn(
                                "absolute inset-y-0 left-0 rounded-full",
                                playingAudio === idx &&
                                  "transition-[width] duration-150 ease-linear",
                              )}
                              style={{
                                width: `${progress}%`,
                                background: "#" + driver.team_color,
                              }}
                            />
                            <div
                              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full opacity-0 shadow transition-opacity group-hover/track:opacity-100"
                              style={{
                                left: `${progress}%`,
                                background: "#" + driver.team_color,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs flex flex-row gap-2 items-center text-gray-400 mx-[4.5rem] max-w-full font-geist font-medium">
                      {toLocaleTime(capture.utc)}

                      {AUDIO_DOWNLOAD_URL ? (
                        <a
                          href={
                            AUDIO_DOWNLOAD_URL +
                            "?url=" +
                            audioUrl +
                            session?.path +
                            capture.path +
                            "&idx=" +
                            idx
                          }
                        >
                          <DownloadIcon width={15} />
                        </a>
                      ) : (
                        <DownloadIcon width={15} />
                      )}
                      {(hasTranscription || hasEsTranscription) && (
                        <Copy
                          width={15}
                          className="cursor-pointer"
                          onClick={() => handleCopyTranscription(capture)}
                        />
                      )}
                    </span>
                    {(hasTranscription || hasEsTranscription) && (
                      <div
                        className="flex flex-row gap-3 w-[75%] mx-[4.5rem] text-wrap overflow-hidden mt-2 items-stretch rounded-md"
                        style={{
                          backgroundColor: "#" + driver.team_color + "20",
                        }}
                      >
                        <div
                          className="w-[3px] self-stretch"
                          style={{ backgroundColor: "#" + driver.team_color }}
                        />
                        <span
                          className="text-start py-1.5 px-2 whitespace-pre-wrap text-xs italic font-f1-regular font-medium"
                          style={{
                            color: "#" + driver.team_color,
                          }}
                        >
                          {translate
                            ? hasEsTranscription
                              ? `"${capture.transcriptionEs}"`
                              : capture.transcription
                            : capture.transcription &&
                            `"${capture.transcription}"`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="min-h-[20rem] items-center justify-center flex">
              <p className="text-xs text-gray-400 font-geist font-medium">
                {translate ? "Sin audios de carrera." : "No team audios."}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
