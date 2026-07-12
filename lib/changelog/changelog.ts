// Curated, user-facing changelog rendered at /[lang]/changelog.
//
// This is a PRODUCT version, independent from this repo's package.json version
// and from f1-api-ws's package.json version — each repo keeps bumping its own
// package.json for its own releases, but this file tracks user-facing milestones
// across both the frontend (f1-telemetry) and the backend (f1-api-ws).
//
// When you ship a user-facing change in either repo:
//   1. Add an entry to that repo's CHANGELOG.md (technical, one line per change).
//   2. If it's worth telling users about, add a curated item here in both languages.
//   3. Only bump `version` below for an actual release milestone, following semver:
//      MAJOR = breaking / big shift for users, MINOR = new feature, PATCH = fix.

export type ChangelogType = "added" | "changed" | "fixed" | "removed";
export type ChangelogScope = "frontend" | "backend" | "both";

export interface ChangelogItem {
  type: ChangelogType;
  scope: ChangelogScope;
  en: string;
  es: string;
}

export interface ChangelogRelease {
  version: string;
  date: string; // ISO yyyy-mm-dd
  items: ChangelogItem[];
}

export const changelog: ChangelogRelease[] = [
  {
    version: "2.0.0",
    date: "2026-07-12",
    items: [
      {
        type: "added",
        scope: "both",
        en: "Added a role-based system: some data and widgets are now available depending on your account type.",
        es: "Se añadió un sistema de roles: algunos datos y widgets ahora están disponibles según el tipo de cuenta.",
      },
      {
        type: "added",
        scope: "frontend",
        en: "Added this changelog so you can see what's new in F1 Telemetry.",
        es: "Se añadió este historial de novedades para que puedas ver las novedades de F1 Telemetry.",
      },
      {
        type: "changed",
        scope: "frontend",
        en: "Reorganized the preferences menu, grouping options into categories to make them easier to find.",
        es: "Se reorganizó el menú de preferencias, agrupando las opciones en categorías para encontrarlas más fácil.",
      },
      {
        type: "fixed",
        scope: "frontend",
        en: "Fixed a bug in the session countdown timer.",
        es: "Se corrigió un error en el contador de tiempo para la próxima sesión.",
      },
      {
        type: "fixed",
        scope: "frontend",
        en: "Fixed a bug in the \"drivers about to be eliminated\" indicator during qualifying.",
        es: "Se corrigió un error en el indicador de pilotos a punto de quedar eliminados durante la clasificación.",
      },
      {
        type: "removed",
        scope: "both",
        en: "Removed the chat widget and the underlying chat system.",
        es: "Se eliminó el widget de chat y el sistema de chat.",
      },
    ],
  },
];
