"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Search, Medal } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { prodeApi, type LeaderboardEntry, type ProdeSession } from "@/utils/prode";

function LeaderboardList({
  mode,
  session,
  rows,
  current,
  pagination,
  search,
  setMode,
  setSearch,
  setPage,
  year,
  infoHref,
  infoLabel,
  labels,
}: {
  mode: "season" | "gp";
  session: ProdeSession | null;
  rows: LeaderboardEntry[];
  current?: LeaderboardEntry;
  pagination: { page: number; totalPages: number; total: number };
  search: string;
  setMode: (mode: "season" | "gp") => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  year: number;
  infoHref?: string;
  infoLabel?: string;
  labels: {
    title: string;
    currentGp: string;
    season: string;
    search: string;
    period: string;
    points: string;
    yourPosition: string;
    previous: string;
    next: string;
    page: string;
  };
}) {
  const [periodOpen, setPeriodOpen] = useState(false);

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center gap-1.5 pb-3">
        <h2 className="font-orbitron text-xl text-white">
          {labels.title}
        </h2>
        <div className="relative">
          <button
            type="button"
            onClick={() => setPeriodOpen((open) => !open)}
            aria-label={labels.period}
            aria-expanded={periodOpen}
            className="flex items-center gap-1 bg-transparent py-1 text-xl text-white font-orbitron outline-none transition-colors hover:text-f1Yellow focus:text-f1Yellow"
          >
            {mode === "gp" ? labels.currentGp : labels.season}
            <ChevronDown size={14} className={`transition-transform ${periodOpen ? "rotate-180" : ""}`} />
          </button>
          {periodOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 min-w-max bg-warmBlack py-1 shadow-xl">
              <button
                type="button"
                disabled={!session}
                onClick={() => { setMode("gp"); setPeriodOpen(false); }}
                className="font-orbitron block w-full px-2 py-1.5 text-left text-sm text-f1Gray transition-colors hover:bg-f1Yellow/10 hover:text-f1Yellow disabled:cursor-not-allowed disabled:opacity-35"
              >
                {labels.currentGp}
              </button>
              <button
                type="button"
                onClick={() => { setMode("season"); setPeriodOpen(false); }}
                className="font-orbitron block w-full px-2 py-1.5 text-left text-sm text-f1Gray transition-colors hover:bg-f1Yellow/10 hover:text-f1Yellow"
              >
                {labels.season}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-5 flex justify-center">
        <label className="flex w-full max-w-xs items-center justify-center gap-2 border-b border-white/15 px-1 py-2 text-white/60 focus-within:border-f1Yellow">
          <Search size={15} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={labels.search}
            className="w-32 bg-transparent font-geist py-1 text-xl text-white outline-none"
          />
        </label>
      </div>

      <div className="divide-y divide-white/10">
        {rows.map((row) => (
          <div key={row.user_id} className="flex min-h-14 items-center py-3 text-sm">
            <span className="flex w-[3.75rem] shrink-0 items-center">
              <span className="w-[2rem] pl-4 text-[1rem] font-bold leading-none text-white/75">
                {row.rank}
              </span>
            </span>
            <span className="min-w-0 flex-1 truncate font-inter text-white">{row.username}</span>
            <span className="font-inter text-white">{row.total_points} {labels.points}</span>
          </div>
        ))}
      </div>

      {current && !rows.some((row) => row.is_current_user) && (
        <div className="sticky bottom-3 mt-3 flex justify-between bg-warmBlack px-1 py-3 text-sm text-white">
          <span>{labels.yourPosition}: #{current.rank} · {current.username}</span>
          <strong>{current.total_points} {labels.points}</strong>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/60">
          <button type="button" disabled={pagination.page <= 1} onClick={() => setPage(pagination.page - 1)} aria-label={labels.previous} className="p-2 transition hover:text-f1Yellow disabled:cursor-not-allowed disabled:opacity-30">
            <ChevronLeft size={18} />
          </button>
          <span>{labels.page} {pagination.page} / {pagination.totalPages} · {pagination.total}</span>
          <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage(pagination.page + 1)} aria-label={labels.next} className="p-2 transition hover:text-f1Yellow disabled:cursor-not-allowed disabled:opacity-30">
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {infoHref && infoLabel && (
        <a href={infoHref} className="mt-4 block text-center text-sm text-f1Yellow transition hover:text-white">
          {infoLabel}
        </a>
      )}
    </section>
  );
}

export default function ProdeLeaderboard({ year = new Date().getUTCFullYear(), infoHref, infoLabel, labels }: { year?: number; infoHref?: string; infoLabel?: string; labels: { title: string; currentGp: string; season: string; search: string; period: string; points: string; yourPosition: string; previous: string; next: string; page: string } }) {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"season" | "gp">("gp");
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [session, setSession] = useState<ProdeSession | null>(null);
  const [currentGrandPrixId, setCurrentGrandPrixId] = useState<number | null>(null);
  const [currentSeasonYear, setCurrentSeasonYear] = useState<number | null>(null);
  const [contextLoaded, setContextLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [current, setCurrent] = useState<LeaderboardEntry | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 });
  useEffect(() => {
    setContextLoaded(false);
    prodeApi.current(token)
      .then((result) => {
        setSession(result.session);
        setCurrentGrandPrixId(result.currentGrandPrixId);
        setCurrentSeasonYear(result.currentSeasonYear);
        setContextLoaded(true);
      })
      .catch(() => {
        setSession(null);
        setCurrentGrandPrixId(null);
        setCurrentSeasonYear(null);
        setContextLoaded(true);
      });
  }, [token]);
  useEffect(() => {
    if (!contextLoaded) return;
    const load = mode === "gp" && currentGrandPrixId
      ? prodeApi.gpLeaderboard(currentGrandPrixId, search, page, token)
      : prodeApi.seasonLeaderboard(currentSeasonYear ?? year, search, page, token);
    load.then((result) => {
      setRows(result?.leaderboard?.rows ?? []);
      setCurrent(result?.leaderboard?.currentUser ?? null);
      setPagination(result?.leaderboard?.pagination ?? { page: 1, totalPages: 0, total: 0 });
    }).catch(() => { setRows([]); setCurrent(null); setPagination({ page: 1, totalPages: 0, total: 0 }); });
  }, [contextLoaded, mode, currentGrandPrixId, currentSeasonYear, search, year, page, token]);
  return <LeaderboardList mode={mode} session={currentGrandPrixId ? session ?? ({ grand_prix_id: currentGrandPrixId } as ProdeSession) : null} rows={rows} current={current ?? undefined} pagination={pagination} search={search} setMode={(nextMode) => { setMode(nextMode); setPage(1); }} setSearch={(nextSearch) => { setSearch(nextSearch); setPage(1); }} setPage={setPage} year={year} infoHref={infoHref} infoLabel={infoLabel} labels={labels} />;
}