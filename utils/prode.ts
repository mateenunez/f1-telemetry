import { config } from "@/lib/config";

export interface ProdeDriver { driver_number: number; name_acronym: string; full_name: string; team_name?: string; team_colour?: string; headshot_url?: string; }
export interface ProdeSession { id: number; grand_prix_id: number; session_name: string; session_type: "FP" | "QUALIFYING" | "RACE" | "SPRINT"; date_start?: string; status: string; grand_prix_name: string; my_prediction?: Record<string, any>; }
export interface LeaderboardEntry { user_id: number; username: string; total_points: number; exact_hits: number; rank?: number; is_current_user?: boolean; }
export interface LeaderboardPagination { page: number; pageSize: number; total: number; totalPages: number; }
export interface LeaderboardResponse { success: boolean; leaderboard: { rows: LeaderboardEntry[]; currentUser: LeaderboardEntry | null; pagination: LeaderboardPagination; }; }
export interface CurrentProdeResponse { success: boolean; session: ProdeSession | null; currentGrandPrixId: number | null; currentSeasonYear: number | null; }

export function isProdeSessionLocked(session: ProdeSession | null | undefined, now = Date.now()) {
  if (!session) return true;
  const status = typeof session.status === "string" ? session.status.toUpperCase() : "";
  return ["STARTED", "ACTIVE", "LOCKED", "FINISHED", "EVALUATED"].includes(status)
    || (!!session.date_start && new Date(session.date_start).getTime() <= now);
}

const endpoint = (path: string) => `${(config.public.apiUrl ?? "").replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
async function request<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  const response = await fetch(endpoint(path), { ...init, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data && typeof data === "object" && "error" in data && typeof data.error === "string"
      ? data.error
      : "PRODE_REQUEST_FAILED";
    throw new Error(message);
  }
  return data;
}
export const prodeApi = {
  current: (token?: string | null) => request<CurrentProdeResponse>("/prode/sessions/current", token ?? undefined),
  drivers: () => request<{ success: boolean; drivers: ProdeDriver[] }>("/prode/drivers"),
  vote: (token: string, sessionId: number, predictionData: Record<string, any>) => request<{ success: boolean }>("/prode/vote", token, { method: "POST", body: JSON.stringify({ sessionId, predictionData }) }),
  seasonLeaderboard: (year: number, search = "", page = 1, token?: string | null) => request<LeaderboardResponse>(`/prode/leaderboard/season?year=${year}&search=${encodeURIComponent(search)}&page=${page}`, token ?? undefined),
  gpLeaderboard: (id: number, search = "", page = 1, token?: string | null) => request<LeaderboardResponse>(`/prode/leaderboard/gp/${id}?search=${encodeURIComponent(search)}&page=${page}`, token ?? undefined),
  info: () => request<{ success: boolean; info: any }>("/prode/info"),
};