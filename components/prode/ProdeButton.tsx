"use client";

import { useEffect, useState } from "react";
import { Check, LockKeyhole } from "lucide-react";
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
  const Icon = locked ? LockKeyhole : null;
  const refreshSession = () => prodeApi.current(token).then((result) => setSession(result?.session ?? null)).catch(() => setSession(null));
  return <>{<button
    type="button"
    disabled={locked || showSaved}
    onClick={() => setOpen(true)}
    aria-label={showSaved ? (preferences.translate ? "Voto guardado" : "Vote saved") : undefined}
    className={`relative flex h-6 min-w-[5.5rem] items-center justify-center gap-2 rounded-md px-2 text-xs font-inter transition-colors duration-500 ${locked ? "cursor-not-allowed border-white/10 text-white/35" : "border-f1Yellow bg-f1Yellow/10 text-f1Yellow hover:bg-f1Yellow/20 hover:text-offWhite"}`}
  >
    <span className={`flex items-center gap-2 transition-all duration-[2000ms] ease-in-out ${showSaved ? "scale-50 opacity-0" : "scale-100 opacity-100"}`}>
      {Icon && <Icon size={14} />}
      {locked ? (preferences.translate ? "CERRADO" : "CLOSED") : urgent ? (preferences.translate ? "Participá en el PRODE" : "Predict this session") : "PRODE"}
    </span>
    <Check size={16} strokeWidth={2.5} className={`absolute transition-all duration-[2000ms] ease-in-out ${showSaved ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} />
  </button>}{open && !locked && !session.my_prediction && <ProdeVoteModal session={session} token={token} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); setShowSaved(true); refreshSession(); }} />}</>;
}