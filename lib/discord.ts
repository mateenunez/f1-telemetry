import { config } from "@/lib/config";

// 10 days. The invite link only rotates every 30 days, and PUT
// /config/discord-link on the API triggers an immediate revalidation via
// /api/revalidate, so this is just the worst-case staleness window.
const REVALIDATE_SECONDS = 60 * 60 * 24 * 10;

export async function getDiscordInviteUrl(): Promise<string | undefined> {
  const apiUrl = config.public.apiUrl;
  if (!apiUrl) return config.public.discord;

  try {
    const res = await fetch(new URL("config/discord-link", apiUrl).toString(), {
      next: { revalidate: REVALIDATE_SECONDS, tags: ["discord-link"] },
    });

    if (!res.ok) return config.public.discord;

    const data = await res.json();
    return data.url || config.public.discord;
  } catch {
    return config.public.discord;
  }
}
