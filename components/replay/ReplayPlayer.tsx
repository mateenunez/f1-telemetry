"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Pause, Play } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { config } from "@/lib/config";
import type { WebSocketData } from "@/websocket/websocket-manager";
import { TelemetryContent } from "@/components/telemetry/TelemetryContent";

const PLAYBACK_RATES = [1, 5, 10, 20, 30];

interface ReplayPlayerProps {
  dict: any;
  sessionId: string;
}

function parseRecording(content: string): WebSocketData[] {
  const lines = content.split(/\r?\n/);
  const frames: WebSocketData[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;

    let frame: unknown;
    try {
      frame = JSON.parse(line);
    } catch (error) {
      throw new Error(`Invalid JSON on recording line ${index + 1}.`, {
        cause: error,
      });
    }

    if (
      typeof frame !== "object" ||
      frame === null ||
      (!("R" in frame) && !("M" in frame))
    ) {
      throw new Error(
        `Invalid telemetry frame on recording line ${index + 1}.`,
      );
    }
    frames.push(frame as WebSocketData);
  }

  if (frames.length === 0) {
    throw new Error("Recording contains no telemetry frames.");
  }
  return frames;
}

function parseClockSeconds(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match = /^(\d+):([0-5]\d):([0-5]\d)$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

function getTimestampMs(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function getReplayClock(frames: WebSocketData[]): (string | undefined)[] {
  const firstFeedTimestamp =
    frames
      .flatMap((frame) => frame.M ?? [])
      .map((message) => getTimestampMs(message.A?.[2]))
      .find((timestamp) => timestamp !== null) ?? null;
  const initialClock = frames.find((frame) => frame.R?.ExtrapolatedClock)
    ?.R?.ExtrapolatedClock;

  let anchorRemaining = parseClockSeconds(initialClock?.Remaining);
  let anchorTimestamp = firstFeedTimestamp ?? null;
  let extrapolating = initialClock?.Extrapolating === true;
  let currentTimestamp = firstFeedTimestamp;

  return frames.map((frame) => {
    for (const message of frame.M ?? []) {
      const [feedName, data, timestampValue] = message.A ?? [];
      const messageTimestamp = getTimestampMs(timestampValue);
      if (messageTimestamp !== null) {
        currentTimestamp =
          currentTimestamp === null
            ? messageTimestamp
            : Math.max(currentTimestamp, messageTimestamp);
      }

      if (feedName === "ExtrapolatedClock" && data) {
        const remaining = parseClockSeconds(data.Remaining);
        if (remaining !== null) {
          anchorRemaining = remaining;
          anchorTimestamp = currentTimestamp;
        }
        if (typeof data.Extrapolating === "boolean") {
          extrapolating = data.Extrapolating;
        }
      }
    }

    if (anchorRemaining === null) return undefined;
    const elapsedSeconds =
      extrapolating && anchorTimestamp !== null && currentTimestamp !== null
        ? Math.floor(Math.max(0, currentTimestamp - anchorTimestamp) / 1000)
        : 0;
    const remaining = Math.max(0, anchorRemaining - elapsedSeconds);
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    return [hours, minutes, seconds]
      .map((part) => String(part).padStart(2, "0"))
      .join(":");
  });
}

export function ReplayPlayer({ dict, sessionId }: ReplayPlayerProps) {
  const recordingId = sessionId.startsWith("session=")
    ? sessionId.slice("session=".length)
    : sessionId;
  const { token, isLoading: authLoading } = useAuth();
  const [frames, setFrames] = useState<WebSocketData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [linesPerSecond, setLinesPerSecond] = useState(10);
  const isPlayingRef = useRef(false);
  const updatePlayback = useCallback((playing: boolean) => {
    isPlayingRef.current = playing;
    setIsPlaying(playing);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const loadRecording = async () => {
      setLoading(true);
      setError(null);
      setFrames(null);
      try {
        const apiUrl = config.public.apiUrl;
        if (!apiUrl) throw new Error("The API URL is not configured.");

        const response = await fetch(
          `${apiUrl.replace(/\/$/, "")}/admin/recordings/${encodeURIComponent(recordingId)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          const responseBody = await response.text();
          console.error(
            `Recording download failed for ID "${recordingId}" with status ${response.status}:`,
            responseBody,
          );
          if (response.status === 404) {
            throw new Error("RECORDING_NOT_FOUND");
          }
          throw new Error(`Request failed with status ${response.status}.`);
        }

        const recordingFrames = parseRecording(await response.text());
        if (controller.signal.aborted) return;
        setFrames(recordingFrames);
        setCurrentIndex(0);
        setResetKey((key) => key + 1);
        updatePlayback(true);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        console.error(`Error loading telemetry recording ${recordingId}:`, loadError);
        setError(
          loadError instanceof Error &&
            loadError.message === "RECORDING_NOT_FOUND"
            ? dict.replay.recordingNotFound
            : dict.replay.recordingLoadError,
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadRecording();
    return () => controller.abort();
  }, [
    authLoading,
    dict.replay.recordingLoadError,
    recordingId,
    token,
    updatePlayback,
  ]);

  useEffect(() => {
    if (!isPlaying || !frames) return;
    const intervalId = window.setInterval(() => {
      if (!isPlayingRef.current) return;
      setCurrentIndex((index) => Math.min(index + 1, frames.length - 1));
    }, 1000 / linesPerSecond);
    return () => window.clearInterval(intervalId);
  }, [frames, isPlaying, linesPerSecond]);

  const handlePlaybackRateChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const rate = Number(event.target.value);
    if (PLAYBACK_RATES.includes(rate)) setLinesPerSecond(rate);
  };

  useEffect(() => {
    if (frames && currentIndex >= frames.length - 1) {
      updatePlayback(false);
    }
  }, [currentIndex, frames, updatePlayback]);

  const progress = useMemo(() => {
    if (!frames || frames.length <= 1) return 0;
    return (currentIndex / (frames.length - 1)) * 100;
  }, [currentIndex, frames]);
  const replayClock = useMemo(
    () => (frames ? getReplayClock(frames) : []),
    [frames],
  );

  const seek = useCallback(
    (targetIndex: number) => {
      if (!frames) return;
      updatePlayback(false);
      if (targetIndex < currentIndex) {
        setResetKey((key) => key + 1);
      }
      setCurrentIndex(targetIndex);
    },
    [currentIndex, frames, updatePlayback],
  );

  const togglePlayback = () => {
    if (!frames) return;
    if (currentIndex >= frames.length - 1) {
      setResetKey((key) => key + 1);
      setCurrentIndex(0);
      updatePlayback(true);
      return;
    }
    updatePlayback(!isPlayingRef.current);
  };

  return (
    <div className="min-h-screen bg-warmBlack font-geist text-white">
      <main className="mx-auto max-w-[1600px] px-2 pb-10 pt-4">
        {loading || authLoading ? (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-warmBlack/40 backdrop-blur-sm">
            <div className="loader" aria-label={dict.loading} role="status" />
          </div>
        ) : !token ? (
          <p className="rounded border border-gray-700 bg-warmBlack1 p-5 text-gray-200">
            {dict.replay.loginRequired}
          </p>
        ) : error ? (
          <p
            className="rounded border border-red-800 bg-red-950/40 p-5 text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : frames ? (
          <>
            <section
              aria-label={dict.replay.player}
              className="mb-2 flex items-center gap-3"
            >
              <button
                type="button"
                onClick={togglePlayback}
                className="flex mt-1 h-8 w-8 shrink-0 items-center justify-center rounded text-f1White"
                aria-label={isPlaying ? dict.replay.pause : dict.replay.play}
              >
                {isPlaying ? (
                  <Pause size={16} aria-hidden="true" fill="currentColor" />
                ) : (
                  <Play size={16} aria-hidden="true" fill="currentColor" />
                )}
              </button>
              <label className="block min-w-0 flex-1">
                <span className="sr-only">{dict.replay.seek}</span>
                <input
                  type="range"
                  min={0}
                  max={frames.length - 1}
                  step={1}
                  value={currentIndex}
                  onChange={(event) => seek(Number(event.target.value))}
                  style={{
                    background: `linear-gradient(to right, #FFFFFF ${progress}%, #4b5563 ${progress}%)`,
                  }}
                  className="h-1 w-full cursor-pointer appearance-none rounded-lg accent-highWhite"
                  aria-label={dict.replay.seek}
                  aria-valuetext={`${Math.round(progress)}%, ${dict.replay.line} ${currentIndex + 1} / ${frames.length}`}
                />
              </label>
              <span
                className="shrink-0 text-xs tabular-nums text-gray-300"
                aria-live="polite"
              >
                {currentIndex + 1}/{frames.length}
              </span>
              <label className="flex shrink-0 flex-col items-center gap-1 text-xs text-gray-300">
                <span>{dict.replay.linesPerSecond}</span>
                <select
                  value={linesPerSecond}
                  onChange={handlePlaybackRateChange}
                  className="rounded border border-gray-600 bg-warmBlack px-1.5 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-f1Blue"
                  aria-label={dict.replay.linesPerSecond}
                >
                  {PLAYBACK_RATES.map((rate) => (
                    <option key={rate} value={rate}>
                      {rate}
                    </option>
                  ))}
                </select>
              </label>
            </section>
            <TelemetryContent
              dict={dict}
              replay={{
                frames,
                index: currentIndex,
                resetKey,
                remaining: replayClock[currentIndex],
              }}
            />
          </>
        ) : null}
      </main>
    </div>
  );
}
