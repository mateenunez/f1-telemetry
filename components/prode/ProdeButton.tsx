"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { usePathname } from "next/navigation";
import { usePreferences } from "@/context/preferences";
import { useAuth } from "@/hooks/use-auth";
import { isProdeSessionLocked, prodeApi, type ProdeSession } from "@/utils/prode";
import ProdeVoteModal from "./ProdeVoteModal";

export default function ProdeButton() {
  const { token, isAuthenticated } = useAuth();
  const { preferences } = usePreferences();
  const [session, setSession] = useState<ProdeSession | null>(null);
  const [open, setOpen] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [now, setNow] = useState(Date.now());
  const pathname = usePathname();
  useEffect(() => { if (!token || !isAuthenticated) return; const load = () => prodeApi.current(token).then((result) => setSession(result.session)).catch(() => setSession(null)); load(); const id = setInterval(load, 60000); return () => clearInterval(id); }, [token, isAuthenticated]);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  useEffect(() => {
    if (!showSaved) return;
    const id = setTimeout(() => setShowSaved(false), 2000);
    return () => clearTimeout(id);
  }, [showSaved]);
  const locked = isProdeSessionLocked(session, now);
  const urgent = !!session?.date_start && new Date(session.date_start).getTime() > now && new Date(session.date_start).getTime() - now <= 60 * 60 * 1000;
  if (!session || !token || (session.my_prediction && !showSaved)) return null;
  const refreshSession = () => prodeApi.current(token).then((result) => setSession(result?.session ?? null)).catch(() => setSession(null));
  const locale = pathname?.split("/")[1] || "es";
  const leaderboardHref = `/${locale}/prode/leaderboard`;
  const buttonClassName = "relative flex h-6 min-w-[5.5rem] items-center justify-center gap-2 rounded-md border-f1Yellow bg-f1Yellow/10 px-2 text-xs font-inter text-f1Yellow transition-colors duration-500 hover:bg-f1Yellow/20 hover:text-offWhite disabled:cursor-default disabled:opacity-100";
  const buttonContent = <>
    <span className={`flex items-center gap-2 transition-all duration-[2000ms] ease-in-out ${showSaved ? "scale-50 opacity-0" : "scale-100 opacity-100"}`}>
      {urgent && !locked ? (preferences.translate ? "Participá en el PRODE" : "Predict this session") : preferences.translate ? "PRODE" : "Predict"}
    </span>
    <Check size={16} strokeWidth={2.5} className={`absolute transition-all duration-[2000ms] ease-in-out ${showSaved ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} />
  </>;
  return <>{locked ? (
    <a href={leaderboardHref} target="_blank" rel="noopener noreferrer" className={buttonClassName} aria-label={preferences.translate ? "Ver el leaderboard" : "View leaderboard"}>
      {buttonContent}
    </a>
  ) : (
    <button
      type="button"
      disabled={showSaved}
      onClick={() => setOpen(true)}
      aria-label={showSaved ? (preferences.translate ? "Voto guardado" : "Vote saved") : undefined}
      className={buttonClassName}
    >
      {buttonContent}
    </button>
  )}{open && !locked && !session.my_prediction && <ProdeVoteModal session={session} token={token} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); setShowSaved(true); refreshSession(); }} />}</>;
}