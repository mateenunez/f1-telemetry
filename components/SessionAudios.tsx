import {
  ProcessedCapture,
  ProcessedDriver,
  ProcessedSession,
  ProcessedTeamRadio,
} from "@/processors";
import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Copy, DownloadIcon, PauseIcon, PlayIcon } from "lucide-react";
import { toLocaleTime } from "@/utils/calendar";
import { cn } from "@/lib/utils";
import { useTelemetryAudio, audioUrl } from "@/hooks/use-raceControl";
import { usePreferences } from "@/context/preferences";
import { config } from "@/lib/config";

interface SessionAudiosProps {
  teamRadio: ProcessedTeamRadio | undefined;
  drivers: (ProcessedDriver | undefined)[];
  session: ProcessedSession | null | undefined;
  driverInfos?: (ProcessedDriver | undefined)[];
}

const AUDIO_DOWNLOAD_URL = config.public + "download-mp3";

export default function SessionAudios({
  teamRadio,
  drivers,
  session,
  driverInfos,
}: SessionAudiosProps) {
  const [playingAudio, setPlayingAudio] = useState<number | undefined>();
  const [progressMap, setProgressMap] = useState<Map<number, number>>();

  const { playTeamRadioSound, radioAudioRef, stopTeamRadioSound } =
    useTelemetryAudio();

  const { preferences } = usePreferences();
  const headshot = preferences.headshot;

  const getMessageStyle = (msg: ProcessedCapture) => {
    const racingNumber = msg.racingNumber;
    if (!racingNumber || !driverInfos) return {};

    if (isNaN(racingNumber)) return {};

    const driver = driverInfos.find((d) => d?.driver_number === racingNumber);
    if (!driver) return {};

    const isFavorite = preferences.favoriteDrivers.some(
      (fav) => fav.driver_number === driver.driver_number
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

  const handleCopyTranscription = async (cap: ProcessedCapture) => {
    const text = preferences.translate
      ? cap?.transcriptionEs
      : cap?.transcription;
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
        (a, b) => Date.parse(String(b.utc)) - Date.parse(String(a.utc))
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
        next.set(playingAudio, Math.min(pct, 80));
        return next;
      });
    };
    radioAudioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    radioAudioRef.current.addEventListener("ended", handleEnded);

    return () => {
      radioAudioRef.current?.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );
      radioAudioRef.current?.removeEventListener("ended", handleEnded);
    };
  }, [radioAudioRef.current, playingAudio]);

  return (
    <Card className="flex w-full bg-transparent border-b-2 border-t-2 border-l-0 border-r-0 rounded-none border-gray-800 md:border-none md:p-0 ">
      <CardContent className="overflow-x-hidden flex-1 max-h-[20rem] px-6 py-4">
        <ScrollArea className="overflow-x-auto h-full p-0" type="scroll">
          {orderedCaptures.length > 0 && teamRadio ? (
            <div className="space-y-2">
              {orderedCaptures.map((capture, idx) => {
                const driver = getdriver(capture.racingNumber);
                const progress = progressMap?.get(idx) ?? 80;
                const hasTranscription =
                  capture.transcription && capture.transcription !== "";
                const hasEsTranscription =
                  capture.transcriptionEs && capture.transcriptionEs !== "";
                const messageStyle = getMessageStyle(capture);
                return (
                  <div
                    key={idx}
                    className="border-none flex flex-col max-w-full p-0 rounded"
                    style={{ ...messageStyle }}
                  >
                    <div className="flex flex-row gap-2 rounded max-w-full px-1">
                      {headshot ? (
                        <div>
                          {driver && (
                            <img
                              src={
                                driver.driver_number === 43
                                  ? config.public.assets.col
                                  : driver?.headshot_url ||
                                    config.public.assets.driver
                              }
                              className="object-cover h-[60px]"
                              alt={`${driver.name_acronym} headshot f1 telemetry`}
                            />
                          )}
                        </div>
                      ) : (
                        <p
                          className="text-md text-gray-100 h-[3rem] flex items-center font-f1-regular"
                          style={{
                            color: "#" + driver.team_color,
                          }}
                        >
                          {driver.name_acronym}
                        </p>
                      )}
                      <div
                        className="relative w-full max-w-full my-2 text-gray-400 border-none items-center border-[2px] rounded border-gray-400 flex justify-start overflow-hidden"
                        onClick={() => handleAudioPlay(idx, capture.path)}
                      >
                        <div
                          className={cn(
                            "absolute inset-0 flex flex-row w-full items-center px-0",
                            playingAudio === idx
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 -translate-y-2"
                          )}
                        >
                          <PauseIcon
                            className="mx-1 hover:cursor-pointer transition fill-gray-400"
                            width={15}
                          />
                          <div className="flex flex-col gap-0 w-full">
                            <div className="w-full h-[2px] rounded overflow-hidden">
                              <div
                                className="h-full w-full transition-[width] duration-150 ease-linear"
                                style={{
                                  width: `${progress}%`,
                                  background: "#" + driver.team_color,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "absolute inset-0 flex flex-row w-full items-center px-0 transition-all duration-300 ease-out",
                            playingAudio === idx ? "opacity-0" : "opacity-100"
                          )}
                        >
                          <PlayIcon
                            className="mx-1 hover:cursor-pointer fill-gray-400"
                            width={15}
                          />
                          <div
                            className="w-full h-[2px] rounded"
                            style={{
                              width: `${progress}%`,
                              background: "#" + driver.team_color,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs flex flex-row gap-2 items-center text-gray-500 mx-[4.5rem] max-w-full font-geist font-medium">
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
                        className="flex flex-row gap-3 max-w-full w-[80%] mx-[4.5rem] overflow-hidden mt-2 items-stretch rounded-md"
                        style={{
                          backgroundColor: "#" + driver.team_color + "20",
                        }}
                      >
                        <div
                          className="w-[3px] self-stretch"
                          style={{ backgroundColor: "#" + driver.team_color }}
                        />
                        <span
                          className="text-start py-1.5 whitespace-pre-wrap text-sm italic font-geist font-medium"
                          style={{
                            color: "#" + driver.team_color,
                          }}
                        >
                          {preferences.translate
                            ? hasEsTranscription
                              ? `" ${capture.transcriptionEs} "`
                              : capture.transcription
                            : capture.transcription &&
                              `" ${capture.transcription} "`}
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
                {preferences.translate
                  ? "Sin audios de carrera."
                  : "No team audios."}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
