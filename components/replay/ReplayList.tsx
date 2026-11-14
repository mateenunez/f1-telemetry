"use client";

import Link from "next/link";
import {
  Fragment,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ChevronDown, Search, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";
import { config } from "@/lib/config";
import { cn } from "@/lib/utils";
import { getCountryCode } from "@/utils/calendar";
import {
  formatDateTime,
  getCountryFilterLabel,
  getCountryFilterValue,
  getMeetingSearchText,
  getSessionCategory,
  getSessionSearchText,
  matchesSearch,
  SESSION_CATEGORY_ORDER,
  type GroupedMeeting,
  type GroupedSession,
  type SessionCategory,
} from "./replay-list-helpers";

interface ReplayListProps {
  dict: any;
  locale: string;
}

export function ReplayList({ dict, locale }: ReplayListProps) {
  const { token, isLoading: authLoading } = useAuth();
  const [meetings, setMeetings] = useState<GroupedMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<
    SessionCategory | "all"
  >("all");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setMeetings([]);
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
          `${apiUrl.replace(/\/$/, "")}/admin/recordings?view=grouped`,
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

        const result: {
          success: boolean;
          meetings?: GroupedMeeting[];
        } = await response.json();

        if (!result.success || !Array.isArray(result.meetings)) {
          throw new Error(
            "The API returned an invalid grouped recordings list.",
          );
        }

        const nextMeetings = result.meetings.map((meeting) => ({
          ...meeting,
          sessions: Array.isArray(meeting.sessions)
            ? meeting.sessions.map((session) => ({
                ...session,
                recordings: Array.isArray(session.recordings)
                  ? session.recordings
                  : [],
              }))
            : [],
        }));

        setMeetings(nextMeetings);
        setExpanded(new Set<number>());
      } catch (loadError) {
        if (controller.signal.aborted) return;
        console.error("Error loading telemetry recordings:", loadError);
        setError(
          loadError instanceof Error &&
            loadError.message === "RECORDINGS_ENDPOINT_NOT_FOUND"
            ? (dict.replay.endpointNotAvailable ?? dict.replay.loadError)
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

  const availableYears = useMemo(
    () =>
      Array.from(new Set(meetings.map((meeting) => meeting.year))).sort(
        (a, b) => b - a,
      ),
    [meetings],
  );

  const availableCountries = useMemo(() => {
    const countries = new Map<string, string>();
    for (const meeting of meetings) {
      const value = getCountryFilterValue(meeting);
      if (value === "unknown") continue;
      countries.set(value, getCountryFilterLabel(meeting));
    }
    return Array.from(countries.entries()).sort((a, b) =>
      a[1].localeCompare(b[1], locale),
    );
  }, [locale, meetings]);

  const availableCategories = useMemo(() => {
    const categories = new Set<SessionCategory>();
    for (const meeting of meetings) {
      for (const session of meeting.sessions) {
        categories.add(getSessionCategory(session.type, session.name));
      }
    }
    return SESSION_CATEGORY_ORDER.filter((category) =>
      categories.has(category),
    );
  }, [meetings]);

  const filtered = useMemo(() => {
    const currentQuery = deferredQuery;
    const hasQuery = currentQuery.trim().length > 0;
    const filteredMeetings: GroupedMeeting[] = [];

    for (const meeting of meetings) {
      if (selectedYear !== "all" && String(meeting.year) !== selectedYear) {
        continue;
      }
      if (
        selectedCountry !== "all" &&
        getCountryFilterValue(meeting) !== selectedCountry
      ) {
        continue;
      }

      const meetingMatches = matchesSearch(
        getMeetingSearchText(meeting),
        currentQuery,
      );
      const sessions = meeting.sessions.filter((session) => {
        if (
          selectedCategory !== "all" &&
          getSessionCategory(session.type, session.name) !== selectedCategory
        ) {
          return false;
        }

        return (
          !hasQuery ||
          meetingMatches ||
          matchesSearch(getSessionSearchText(session), currentQuery)
        );
      });

      if (sessions.length > 0) {
        filteredMeetings.push({ ...meeting, sessions });
      }
    }

    return filteredMeetings;
  }, [
    deferredQuery,
    meetings,
    selectedCategory,
    selectedCountry,
    selectedYear,
  ]);

  const toggleMeeting = useCallback((meetingKey: number) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(meetingKey)) {
        next.delete(meetingKey);
      } else {
        next.add(meetingKey);
      }
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-warmBlack text-white font-geist">
      <Navigation dict={dict} locale={locale} />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-28 md:px-8">
        <header className="mb-6">
          <h1 className="font-orbitron text-2xl md:text-3xl">
            {dict.replay.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-300">
            {dict.replay.description}
          </p>
        </header>

        {loading || authLoading ? (
          <p className="py-12 text-center text-gray-400" role="status">
            {dict.replay.loading}
          </p>
        ) : !token ? (
          <p className="py-12 text-center text-gray-400">
            {dict.replay.loginRequired}
          </p>
        ) : error ? (
          <p className="py-12 text-center text-red-300" role="alert">
            {error}
          </p>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3">
              <label className="relative block">
                <span className="sr-only">{dict.replay.searchPlaceholder}</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={dict.replay.searchPlaceholder}
                  className="h-11 w-full rounded-lg border border-gray-800 bg-warmBlack pl-10 pr-10 text-sm text-white placeholder:text-gray-500 focus:border-f1Blue focus:outline-none focus:ring-2 focus:ring-f1Blue/40"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label={dict.replay.clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-gray-400 transition-colors hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </label>

              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  aria-label={dict.replay.year}
                  className="h-11 min-w-0 flex-1 rounded-lg border border-gray-800 bg-warmBlack px-3 text-sm text-white focus:border-f1Blue focus:outline-none focus:ring-2 focus:ring-f1Blue/40 sm:w-32 sm:flex-none"
                >
                  <option value="all">{dict.replay.allYears}</option>
                  {availableYears.map((year) => (
                    <option key={year} value={String(year)}>
                      {year}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCountry}
                  onChange={(event) => setSelectedCountry(event.target.value)}
                  aria-label={dict.replay.country}
                  className="h-11 min-w-0 flex-1 rounded-lg border border-gray-800 bg-warmBlack px-3 text-sm text-white focus:border-f1Blue focus:outline-none focus:ring-2 focus:ring-f1Blue/40 sm:w-44 sm:flex-none"
                >
                  <option value="all">{dict.replay.allCountries}</option>
                  {availableCountries.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(
                      event.target.value as SessionCategory | "all",
                    )
                  }
                  aria-label={dict.replay.filterByType}
                  className="h-11 w-full min-w-0 rounded-lg border border-gray-800 bg-warmBlack px-3 text-sm text-white focus:border-f1Blue focus:outline-none focus:ring-2 focus:ring-f1Blue/40 sm:w-44 sm:flex-none"
                >
                  <option value="all">{dict.replay.allTypes}</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {dict.replay.categories?.[category] ?? category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <p className="py-12 text-center text-gray-400">
                {dict.replay.noResults}
              </p>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full border-collapse">
                  <tbody>
                    {filtered.map((meeting) => {
                      const isOpen = expanded.has(meeting.meetingKey);
                      const countryLabel =
                        meeting.country.name ??
                        meeting.country.code ??
                        dict.replay.countryUnknown;
                      const flagCode = getCountryCode(
                        meeting.country.name ??
                          meeting.location ??
                          meeting.name,
                      );

                      return (
                        <Fragment key={meeting.meetingKey}>
                          <tr>
                            <td>
                              <button
                                type="button"
                                onClick={() =>
                                  toggleMeeting(meeting.meetingKey)
                                }
                                aria-expanded={isOpen}
                                className="flex w-full items-center gap-3 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-f1Blue"
                              >
                                <img
                                  src={`https://flagsapi.com/${flagCode}/flat/64.png`}
                                  alt={`Flag of ${countryLabel}`}
                                  className="h-9 w-14 shrink-0 rounded object-cover"
                                  onError={(event) => {
                                    const target =
                                      event.target as HTMLImageElement;
                                    target.src =
                                      config.public.assets.chequered_flag;
                                    target.onerror = null;
                                  }}
                                />
                                <p className="min-w-0 flex-1 break-words font-medium leading-snug text-white">
                                  {meeting.officialName || meeting.name}
                                </p>
                                <ChevronDown
                                  className={cn(
                                    "ml-auto h-4 w-4 shrink-0 text-gray-400 transition-transform",
                                    isOpen && "rotate-180",
                                  )}
                                />
                              </button>
                            </td>
                          </tr>
                          {isOpen ? (
                            <tr>
                              <td className="pb-4">
                                <div className="space-y-1">
                                  {meeting.sessions.map((session) => (
                                    <SessionRow
                                      key={session.sessionKey}
                                      session={session}
                                      dict={dict}
                                      locale={locale}
                                    />
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function SessionRow({
  session,
  dict,
  locale,
}: {
  session: GroupedSession;
  dict: any;
  locale: string;
}) {
  const start = formatDateTime(session.startDate, locale);
  const primaryRecording = session.recordings[0];

  const content = (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-100 transition-colors group-hover:text-white">
          {session.name}
        </p>
        <span className="text-xs text-gray-500 transition-colors group-hover:text-gray-300">
          {start ?? dict.replay.dateUnknown}
        </span>
      </div>

      {session.recordings.length > 1 ? (
        <div className="relative z-10 flex shrink-0 items-center gap-3">
          {session.recordings.map((recording) => (
            <Link
              key={recording.sessionId}
              href={`/${locale}/replay/${encodeURIComponent(recording.sessionId)}`}
              title={dict.replay.open}
              className="text-xs font-medium text-gray-500 transition-colors hover:text-white"
            >
              Q{recording.qualifyingPart ?? "?"}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );

  if (!primaryRecording) {
    return (
      <div className="px-3 py-3 opacity-45">
        {content}
        <span className="sr-only">{dict.replay.sessionUnavailable}</span>
      </div>
    );
  }

  return (
    <div className="group relative rounded-lg px-3 py-3">
      {content}
      <Link
        href={`/${locale}/replay/${encodeURIComponent(primaryRecording.sessionId)}`}
        title={dict.replay.open}
        aria-label={`${dict.replay.open}: ${session.name}`}
        className="absolute inset-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-f1Blue"
      />
    </div>
  );
}
