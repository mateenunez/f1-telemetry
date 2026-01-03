export type TrackStatusKey =
  | "AllClear"
  | "Yellow"
  | "Red"
  | "Aborted"
  | "SCDeployed"
  | "VSCDeployed";

export const TRACK_STATUS_KEYS: Record<string, TrackStatusKey> = {
  Clear: "AllClear",
  YellowFlag: "Yellow",
  RedFlag: "Red",
  Aborted: "Aborted",
  SafetyCar: "SCDeployed",
  VirtualSafetyCar: "VSCDeployed",
};

export const TRACK_STATUS_LABELS_EN: Record<TrackStatusKey, string> = {
  AllClear: "Clear",
  Yellow: "Yellow Flag",
  Red: "Red Flag",
  Aborted: "Aborted",
  SCDeployed: "Safety Car",
  VSCDeployed: "Virtual Safety Car",
};

export const TRACK_STATUS_LABELS_ES: Record<TrackStatusKey, string> = {
  AllClear: "Despejado",
  Yellow: "Alerta Amarilla",
  Red: "Alerta Roja",
  Aborted: "Suspendido",
  SCDeployed: "Coche de Seguridad",
  VSCDeployed: "Coche de Seguridad Virtual",
};

export const TRACK_STATUS_COLORS: Record<TrackStatusKey, string> = {
  AllClear: "#6B7280", // offWhite
  Yellow: "#eab309", // yellow-500
  Red: "#ef4444", // red-500
  Aborted: "#F3F3F366", // gray-500
  SCDeployed: "#f59e0b", // amber-500
  VSCDeployed: "#f59e0b",
};

export function getCompoundColor(compound: string): string {
  const colors: Record<string, string> = {
    SOFT: "#ff1e29ee",
    MEDIUM: "#ffe066",
    HARD: "#F3F3F3",
    INTERMEDIATE: "#1ad01aba",
    WET: "#1e1ef272",
  };
  return colors[compound.toUpperCase()] || "#808080";
}

function normalizeStatus(status: string): TrackStatusKey | null {
  if (!status) return null;
  const key = status.replace(/\s+/g, "").trim() as TrackStatusKey;
  const allowed: TrackStatusKey[] = [
    "AllClear",
    "Yellow",
    "Red",
    "Aborted",
    "SCDeployed",
  ];
  return allowed.includes(key) ? key : null;
}

export function getTrackStatusLabel(
  status: string,
  translate: boolean
): string {
  const key = normalizeStatus(status);
  if (!key) return status || "";
  return translate ? TRACK_STATUS_LABELS_ES[key] : TRACK_STATUS_LABELS_EN[key];
}

export function getTrackStatusColor(status: string): string {
  const key = normalizeStatus(status);
  if (!key) return "#6b7280"; // fallback gray
  return TRACK_STATUS_COLORS[key];
}

import type {
  ProcessedPosition,
  ProcessedSession,
  ProcessedTiming,
} from "@/processors";

export function getAboutToBeEliminatedDrivers(
  currentPositions: ProcessedPosition[],
  session: ProcessedSession | null | undefined,
  driverTimings: ProcessedTiming[] | undefined
): number[] {
  if (!session || session.session_type !== "Qualifying") {
    return [];
  }

  const currentPart =
    session.series.length > 0
      ? session.series[session.series.length - 1]?.QualifyingPart
      : undefined;

  if (!currentPart || currentPart === 3 || !driverTimings) {
    return [];
  }

  const activePositions = currentPositions.filter((pos) => {
    const timing = driverTimings.find(
      (t) => t?.driver_number === pos.driver_number
    );
    return !timing?.knockedOut && !timing?.retired && !timing?.stopped;
  });

  if (activePositions.length > 5) {
    const sortedByPosition = [...activePositions].sort(
      (a, b) => b.position - a.position
    );
    return sortedByPosition.slice(0, 5).map((pos) => pos.driver_number);
  }

  return [];
}

export const parseLapTime = (lapTime: string): number => {
  const [minutes, seconds] = lapTime.split(":").map(Number);
  return minutes * 60 + seconds;
};
