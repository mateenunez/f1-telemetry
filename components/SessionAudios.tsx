import {
  ProcessedCapture,
  ProcessedDriver,
  ProcessedSession,
  ProcessedTeamRadio,
} from "@/processors";
import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import {
  DownloadIcon,
  PauseIcon,
  PlayIcon,
  CirclePlayIcon,
  CirclePauseIcon,
} from "lucide-react";
import { toLocaleTime } from "@/utils/calendar";
import SoundWave from "./SoundWave";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { useTelemetryAudio, audioUrl } from "@/hooks/use-raceControl";
import path from "path";
import { useAudioLog, useCircleOfDoom, useHeadshot } from "@/hooks/use-cookies";

interface SessionAudiosProps {
  teamRadio: ProcessedTeamRadio | undefined;
  drivers: (ProcessedDriver | undefined)[];
  session: ProcessedSession | null | undefined;
}

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const AUDIO_DOWNLOAD_URL = process.env.NEXT_PUBLIC_AUDIO_DOWNLOAD_URL;

export default function SessionAudios({
  teamRadio,
  drivers,
  session,
}: SessionAudiosProps) {
  const [playingAudio, setPlayingAudio] = useState<number | undefined>();
  const [progressMap, setProgressMap] = useState<Map<number, number>>();
  const [orderedCaptures, setOrderedCaptures] = useState<
    ProcessedCapture[] | []
  >();
  const { playTeamRadioSound, radioAudioRef, stopTeamRadioSound } =
    useTelemetryAudio();
  const { headshot } = useHeadshot();
  const { audioLog } = useAudioLog();

  const getDriverInfo = (driverNumber: number) => {
    const driver = drivers.find((d) => d?.driver_number === driverNumber);
    return {
      headshot_url: driver?.headshot_url,
      team_color: driver?.team_colour,
      name_acronym: driver?.name_acronym,
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

  useEffect(() => {
    if (!teamRadio?.captures) return setOrderedCaptures([]);
    setOrderedCaptures(
      [...teamRadio.captures].sort(
        (a, b) => Date.parse(String(b.utc)) - Date.parse(String(a.utc))
      )
    );
  }, [teamRadio]);

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
    <Card className="flex w-[20rem] gap-6 bg-transparent border-none md:p-0">
      <CardContent className="overflow-x-auto flex-1 max-h-[20rem] p-0">
        <ScrollArea
          className="overflow-x-auto h-full p-0 min-w-max"
          type="scroll"
        >
          {orderedCaptures && teamRadio ? (
            <div className="space-y-2">
              {orderedCaptures.map((capture, idx) => {
                const driverInfo = getDriverInfo(capture.racingNumber);
                const progress = progressMap?.get(idx) ?? 80;
                return (
                  <div
                    key={idx}
                    className="border-none flex flex-col w-full p-0"
                  >
                    <div className="flex flex-row gap-2 rounded">
                      {headshot ? (
                        <img
                          src={driverInfo.headshot_url}
                          className="object-cover h-[3.5rem]"
                        />
                      ) : (
                        <p
                          className="text-md text-gray-100 h-[3rem] flex items-center"
                          style={{
                            fontFamily: mediumGeist.style.fontFamily,
                            color: "#" + driverInfo.team_color,
                          }}
                        >
                          {driverInfo.name_acronym}
                        </p>
                      )}

                      <div
                        className="relative w-full my-2 text-gray-400 border-none items-center border-[2px] rounded border-gray-400 flex justify-start overflow-hidden"
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
                          <div className="flex flex-col gap-4 w-full">
                            <div className="w-full h-[2px] mx-1 rounded overflow-hidden">
                              <div
                                className="h-full max-w-[90%] transition-[width] duration-150 ease-linear"
                                style={{
                                  width: `${progress}%`,
                                  background: "#" + driverInfo.team_color,
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
                            className="w-[80%] h-[2px] mx-1 rounded"
                            style={{
                              width: `${progress}%`,
                              background: "#" + driverInfo.team_color,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <span
                      className="text-xs flex flex-row gap-2 items-center text-gray-500 mx-[4.5rem]"
                      style={mediumGeist.style}
                    >
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
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="min-h-[20rem] items-center justify-center flex"
              style={mediumGeist.style}
            >
              <p className="text-xs text-gray-400">No race audios.</p>
            </div>
          )}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
