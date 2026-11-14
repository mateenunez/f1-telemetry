export interface GroupedRecording {
  sessionId: string;
  qualifyingPart: number | null;
  source: string;
  savedAt: string;
  sizeBytes: number;
}

export interface GroupedSession {
  sessionKey: number;
  name: string;
  type: string;
  startDate: string | null;
  endDate: string | null;
  hasRecording: boolean;
  recordings: GroupedRecording[];
}

export interface GroupedMeeting {
  meetingKey: number;
  name: string;
  officialName: string | null;
  location: string | null;
  country: {
    key: number | null;
    code: string | null;
    name: string | null;
  };
  circuit: {
    key: number | null;
    shortName: string | null;
  };
  year: number;
  sessions: GroupedSession[];
}

export type SessionCategory =
  | "practice"
  | "qualifying"
  | "sprint"
  | "race"
  | "other";

export const SESSION_CATEGORY_ORDER: SessionCategory[] = [
  "practice",
  "qualifying",
  "sprint",
  "race",
  "other",
];

// Adds the Spanish names (and common circuit names) used by the F1 community,
// so a search for "Brasil" also finds a meeting whose live-timing country is
// stored as "Brazil".
const COUNTRY_ALIASES: Record<string, string[]> = {
  argentina: ["argentina"],
  australia: ["australia", "melbourne"],
  austria: ["austria", "spielberg"],
  azerbaijan: ["azerbaiyan", "azerbaijan", "baku"],
  bahrain: ["bahrein", "bahrain", "sakhir"],
  belgium: ["belgica", "belgium", "spa"],
  brazil: ["brasil", "brazil", "sao paulo", "interlagos"],
  canada: ["canada", "montreal"],
  china: ["china", "shanghai"],
  croatia: ["croacia", "croatia"],
  czechia: ["republica checa", "czech republic", "czechia"],
  denmark: ["dinamarca", "denmark"],
  finland: ["finlandia", "finland"],
  france: ["francia", "france", "paul ricard", "magny cours"],
  germany: ["alemania", "germany", "hockenheim", "nurburgring"],
  hungary: ["hungria", "hungary", "budapest"],
  italy: ["italia", "italy", "monza", "imola", "mugello"],
  japan: ["japon", "japan", "suzuka", "fuji"],
  mexico: ["mexico", "ciudad de mexico", "cdmx", "hermanos rodriguez"],
  monaco: ["monaco", "monte carlo"],
  netherlands: ["paises bajos", "holanda", "netherlands", "holland", "zandvoort"],
  portugal: ["portugal", "portimao", "algarve"],
  qatar: ["qatar", "catar", "lusail"],
  "saudi arabia": ["arabia saudita", "saudi arabia", "jeddah", "yeda"],
  singapore: ["singapur", "singapore", "marina bay"],
  "south africa": ["sudafrica", "south africa", "kyalami"],
  "south korea": ["corea del sur", "south korea", "korea"],
  spain: ["espana", "spain", "barcelona", "madrid", "jerez", "valencia"],
  sweden: ["suecia", "sweden"],
  switzerland: ["suiza", "switzerland"],
  turkey: ["turquia", "turkey", "istanbul"],
  "united arab emirates": [
    "emiratos arabes unidos",
    "abu dhabi",
    "uae",
    "dubai",
  ],
  "united kingdom": [
    "reino unido",
    "great britain",
    "britain",
    "uk",
    "silverstone",
    "british",
  ],
  "united states": [
    "estados unidos",
    "usa",
    "miami",
    "las vegas",
    "austin",
    "cota",
    "america",
  ],
  vietnam: ["vietnam"],
};

const COUNTRY_CODE_ALIASES: Record<string, string[]> = {
  arg: ["argentina"],
  aus: ["australia"],
  aut: ["austria"],
  aze: ["azerbaijan"],
  bah: ["bahrain"],
  bel: ["belgium"],
  bra: ["brazil"],
  br: ["brazil"],
  can: ["canada"],
  chn: ["china"],
  cn: ["china"],
  esp: ["spain"],
  es: ["spain"],
  fra: ["france"],
  fr: ["france"],
  gbr: ["united kingdom"],
  gb: ["united kingdom"],
  uk: ["united kingdom"],
  ger: ["germany"],
  de: ["germany"],
  hun: ["hungary"],
  hu: ["hungary"],
  ita: ["italy"],
  it: ["italy"],
  jpn: ["japan"],
  jp: ["japan"],
  mex: ["mexico"],
  mx: ["mexico"],
  mon: ["monaco"],
  mc: ["monaco"],
  ned: ["netherlands"],
  nl: ["netherlands"],
  por: ["portugal"],
  pt: ["portugal"],
  qat: ["qatar"],
  qa: ["qatar"],
  sau: ["saudi arabia"],
  sa: ["saudi arabia"],
  sgp: ["singapore"],
  sg: ["singapore"],
  usa: ["united states"],
  us: ["united states"],
  uae: ["united arab emirates"],
  ae: ["united arab emirates"],
};

const SESSION_CATEGORY_ALIASES: Record<SessionCategory, string> = {
  practice:
    "practice practica practicas entrenamientos entrenamiento fp fp1 fp2 fp3 free practice",
  qualifying:
    "qualifying qualy quali clasificacion clasificaciones q1 q2 q3 shootout",
  sprint: "sprint sprint race carrera sprint sprint qualifying sprint shootout",
  race: "race carrera gp grand prix gran premio",
  other: "other otra otro",
};

export function normalizeSearch(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildCountryAliasIndex(): Record<string, string[]> {
  const index: Record<string, string[]> = {};

  const register = (canonical: string, values: string[]) => {
    const all = Array.from(
      new Set([canonical, ...values].map((value) => normalizeSearch(value))),
    );
    for (const key of all) {
      index[key] = Array.from(new Set([...(index[key] ?? []), ...all]));
    }
  };

  for (const [canonical, aliases] of Object.entries(COUNTRY_ALIASES)) {
    register(canonical, aliases);
  }

  return index;
}

// Reverse index: every known name/alias points to the complete alias list.
// This makes both "Brazil" and "Brasil" match, regardless of which language
// was used when the meeting was created.
const COUNTRY_ALIAS_INDEX = buildCountryAliasIndex();

export function matchesSearch(haystack: string, query: string): boolean {
  const needle = normalizeSearch(query);
  if (!needle) return true;

  const normalizedHaystack = normalizeSearch(haystack);
  if (normalizedHaystack.includes(needle)) return true;

  // Also allow compact searches such as "practice3" or "q1" to match text
  // that is stored with spaces or punctuation.
  return normalizedHaystack.replace(/\s+/g, "").includes(needle.replace(/\s+/g, ""));
}

export function getSessionCategory(
  type: string | null | undefined,
  name: string | null | undefined,
): SessionCategory {
  const text = normalizeSearch(`${type ?? ""} ${name ?? ""}`);

  if (text.includes("sprint")) return "sprint";
  if (
    text.includes("qualif") ||
    text.includes("clasif") ||
    text.includes("qualy") ||
    /\bq[1-3]\b/.test(text)
  ) {
    return "qualifying";
  }
  if (
    text.includes("practice") ||
    text.includes("practica") ||
    text.includes("free practice") ||
    /\bfp\d?\b/.test(text)
  ) {
    return "practice";
  }
  if (text.includes("race") || text.includes("carrera")) return "race";
  return "other";
}

export function getCountryFilterValue(meeting: GroupedMeeting): string {
  return meeting.country.code ?? meeting.country.name ?? "unknown";
}

export function getCountryFilterLabel(meeting: GroupedMeeting): string {
  return meeting.country.name ?? meeting.country.code ?? "—";
}

function getCountrySearchAliases(
  name: string | null,
  code: string | null,
): string[] {
  const keys = [normalizeSearch(name), normalizeSearch(code)].filter(Boolean);
  const aliases = new Set<string>();

  for (const key of keys) {
    const canonicalKeys = [key, ...(COUNTRY_CODE_ALIASES[key] ?? [])];
    for (const canonicalKey of canonicalKeys) {
      const indexedAliases = COUNTRY_ALIAS_INDEX[canonicalKey];
      if (indexedAliases) {
        for (const alias of indexedAliases) aliases.add(alias);
      } else {
        aliases.add(canonicalKey);
      }
    }
  }

  return Array.from(aliases);
}

export function getMeetingSearchText(meeting: GroupedMeeting): string {
  return normalizeSearch(
    [
      meeting.name,
      meeting.officialName,
      meeting.location,
      meeting.year,
      meeting.country.name,
      meeting.country.code,
      ...getCountrySearchAliases(meeting.country.name, meeting.country.code),
      meeting.circuit.shortName,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function getSessionSearchText(session: GroupedSession): string {
  const category = getSessionCategory(session.type, session.name);

  return normalizeSearch(
    [
      session.name,
      session.type,
      session.sessionKey,
      session.startDate,
      SESSION_CATEGORY_ALIASES[category],
      ...session.recordings.flatMap((recording) => [
        recording.sessionId,
        recording.source,
        recording.qualifyingPart ? `q${recording.qualifyingPart}` : "",
      ]),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function formatDateTime(
  value: string | null | undefined,
  locale: string,
): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
