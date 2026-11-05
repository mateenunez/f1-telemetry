import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, parse } from "node:path";

const tracksDir = join(process.cwd(), "public", "assets", "tracks");
const outputFile = join(
  process.cwd(),
  "lib",
  "track-manifest.generated.ts",
);

const supportedExtensions = new Set([".svg", ".png"]);

const tracksByName = new Map();

for (const entry of readdirSync(tracksDir, { withFileTypes: true })) {
  if (!entry.isFile()) continue;

  const { name, ext } = parse(entry.name);
  const format = ext.slice(1).toLowerCase();

  if (!supportedExtensions.has(ext.toLowerCase())) continue;

  const current = tracksByName.get(name);

  // If both formats exist for the same circuit, prefer the vector version.
  if (!current || format === "svg") {
    tracksByName.set(name, { name, format });
  }
}

const manifest = [...tracksByName.values()].sort((a, b) =>
  a.name.localeCompare(b.name),
);

const contents = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Run \`node scripts/generate-track-manifest.mjs\` after adding or removing
// files in public/assets/tracks.

export const TRACK_MANIFEST = ${JSON.stringify(manifest, null, 2)} as const;
`;

if (existsSync(outputFile) && readFileSync(outputFile, "utf8") === contents) {
  console.log(`Track manifest is up to date (${manifest.length} assets).`);
} else {
  writeFileSync(outputFile, contents, "utf8");
  console.log(
    `Generated ${outputFile} with ${manifest.length} track assets.`,
  );
}
