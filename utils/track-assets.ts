import { config } from "@/lib/config";
import { TRACK_MANIFEST } from "@/lib/track-manifest.generated";
import { getCountryCode } from "@/utils/calendar";

export type TrackAssetFormat = "svg" | "png";

export interface TrackAsset {
  /** Stable identifier for the circuit drawing. */
  key: string;
  /** Public URL of the drawing. */
  src: string;
  format: TrackAssetFormat;
}

export interface TrackIdentity {
  location: string;
  track?: string;
}

interface TrackEntry {
  name: string;
  key: string;
  format: TrackAssetFormat;
}

const ASSETS_PATH = "/assets/tracks";
const BLOB_TRACKS_PATH = `${config.public.blobBaseUrl.replace(/\/$/, "")}/tracks`;

// The event API exposes the country as `location` and the Grand Prix name as
// `track`. Track-specific names (Miami, Las Vegas, Imola...) must win over the
// country fallback because several races can share a country.
const TRACK_SCORE = 3000;
const LOCATION_SCORE = 2000;
const COUNTRY_SCORE = 1000;

const TRACK_ENTRIES: TrackEntry[] = TRACK_MANIFEST.map(({ name, format }) => ({
  name,
  format,
  key: normalizeTrackName(name),
}));

const countryDisplayNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();

export function normalizeTrackName(value: string | null | undefined): string {
  if (!value) return "";

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function scoreMatch(value: string, key: string): number {
  if (!value || !key) return 0;
  if (value === key) return key.length + 100;
  if (value.includes(key)) return key.length;
  return 0;
}

function rankEntry(
  entry: TrackEntry,
  locationKey: string,
  trackKey: string,
  countryKey: string,
): number {
  const trackScore = scoreMatch(trackKey, entry.key);
  if (trackScore > 0) return TRACK_SCORE + trackScore;

  const locationScore = scoreMatch(locationKey, entry.key);
  if (locationScore > 0) return LOCATION_SCORE + locationScore;

  const countryScore = scoreMatch(countryKey, entry.key);
  if (countryScore > 0) return COUNTRY_SCORE + countryScore;

  return 0;
}

function getCountryName(location: string): string | null {
  const code = getCountryCode(location);

  if (!code || code === "UN") return null;

  try {
    return countryDisplayNames?.of(code) ?? null;
  } catch {
    return null;
  }
}

function toAssetName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("");
}

/**
 * Resolves the circuit drawing for an event without knowing anything about
 * individual Grands Prix. It first matches the track name, then the location
 * and finally the canonical country name against the files that actually exist
 * in `public/assets/tracks`.
 *
 * When there is no local asset yet, it falls back to the legacy blob URL so
 * new circuits keep working until their drawing is added.
 */
export function getTrackAsset({
  location,
  track,
}: TrackIdentity): TrackAsset | null {
  const locationKey = normalizeTrackName(location);

  if (!locationKey) return null;

  const trackKey = normalizeTrackName(track);
  const countryName = getCountryName(location);
  const countryKey = normalizeTrackName(countryName);

  let bestEntry: TrackEntry | null = null;
  let bestScore = 0;

  for (const entry of TRACK_ENTRIES) {
    const score = rankEntry(entry, locationKey, trackKey, countryKey);

    if (score > bestScore) {
      bestEntry = entry;
      bestScore = score;
    }
  }

  if (bestEntry) {
    return {
      key: bestEntry.key,
      format: bestEntry.format,
      src: `${ASSETS_PATH}/${bestEntry.name}.${bestEntry.format}`,
    };
  }

  const fallbackName = toAssetName(countryName ?? location);

  if (!fallbackName) return null;

  return {
    key: normalizeTrackName(fallbackName),
    format: "png",
    src: `${BLOB_TRACKS_PATH}/${fallbackName}.png`,
  };
}
