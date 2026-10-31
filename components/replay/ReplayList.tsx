"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { config } from "@/lib/config";
import Navigation from "@/components/Navigation";

interface Recording {
  sessionId: string;
  filename: string;
  sessionName: string | null;
  sessionType: string | null;
  savedAt: string;
  sizeBytes: number;
}

interface ReplayListProps {
  dict: any;
  locale: string;
}

function formatBytes(bytes: number, locale: string) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)} ${units[unitIndex]}`;
}

export function ReplayList({ dict, locale }: ReplayListProps) {
  const { token, isLoading: authLoading } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setRecordings([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const loadRecordings = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = config.public.apiUrl;
        if (!apiUrl) throw new Error("The API URL is not configured.");

        const response = await fetch(
          `${apiUrl.replace(/\/$/, "")}/admin/recordings`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("RECORDINGS_ENDPOINT_NOT_FOUND");
          }
          throw new Error(`Request failed with status ${response.status}.`);
        }

        const result: { success: boolean; recordings: Recording[] } =
          await response.json();
        if (!result.success || !Array.isArray(result.recordings)) {
          throw new Error("The API returned an invalid recordings list.");
        }
        setRecordings(result.recordings);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        console.error("Error loading telemetry recordings:", loadError);
        setError(
          loadError instanceof Error &&
            loadError.message === "RECORDINGS_ENDPOINT_NOT_FOUND"
            ? dict.replay.endpointNotAvailable
            : dict.replay.loadError,
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadRecordings();
    return () => controller.abort();
  }, [
    authLoading,
    dict.replay.endpointNotAvailable,
    dict.replay.loadError,
    token,
  ]);

  return (
    <div className="min-h-screen bg-warmBlack text-white font-geist">
      <Navigation dict={dict} locale={locale} />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-28 md:px-8">
        <header className="mb-8">
          <h1 className="font-orbitron text-2xl md:text-3xl">
            {dict.replay.title}
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            {dict.replay.description}
          </p>
        </header>

        {loading || authLoading ? (
          <p className="text-gray-300" role="status">
            {dict.replay.loading}
          </p>
        ) : !token ? (
          <p className="py-12 text-center text-gray-400">
            {dict.replay.loginRequired}
          </p>
        ) : error ? (
          <p
            className="rounded border border-red-800 bg-red-950/40 p-5 text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : recordings.length === 0 ? (
          <p className="text-gray-300">
            {dict.replay.empty}
          </p>
        ) : (
          <div className="max-h-[calc(100dvh-18rem)] overflow-y-auto overscroll-y-contain pr-2">
            <ul className="grid gap-4">
              {recordings.map((recording) => (
                <li key={recording.sessionId}>
                  <Link
                    href={`/${locale}/replay/${encodeURIComponent(recording.sessionId)}`}
                    className="block rounded border border-gray-700 bg-warmBlack1 p-5 transition hover:border-f1Blue hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-f1Blue"
                  >
                    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                      <div className="grid min-w-0 grid-cols-3 gap-3">
                        <div className="min-w-0">
                          <p className="text-sm text-gray-400">
                            {dict.replay.session}
                          </p>
                          <p className="mt-1 break-all text-gray-200">
                            {recording.sessionId}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-400">
                            {dict.replay.sessionName}
                          </p>
                          <p className="mt-1 break-words text-gray-200">
                            {recording.sessionName || "—"}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-400">
                            {dict.replay.sessionType}
                          </p>
                          <p className="mt-1 break-words text-gray-200">
                            {recording.sessionType || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-3 text-sm text-gray-300 sm:grid-cols-2 sm:gap-8">
                        <div>
                          <p className="text-gray-400">{dict.replay.savedAt}</p>
                          <time dateTime={recording.savedAt}>
                            {new Intl.DateTimeFormat(locale, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(recording.savedAt))}
                          </time>
                        </div>
                        <div>
                          <p className="text-gray-400">{dict.replay.size}</p>
                          <p>{formatBytes(recording.sizeBytes, locale)}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
