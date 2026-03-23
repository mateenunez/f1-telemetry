if (typeof window === "undefined") {
  const required = {
    NEXT_PUBLIC_WS: process.env.NEXT_PUBLIC_WS,
    NEXT_PUBLIC_API: process.env.NEXT_PUBLIC_API,
  };

  for (const [key, val] of Object.entries(required)) {
    if (!val) {
      console.warn(`Missing environment variable: ${key}`);
    }
  }
}

const blobBaseUrl = process.env.NEXT_PUBLIC_F1TBLOB_BASE_URL || "/assets";

export const config = {
  public: {
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL,
    discord: process.env.NEXT_PUBLIC_DISCORD_INVITE_URL,
    github: process.env.NEXT_PUBLIC_GITHUB_URL,
    websocket: process.env.NEXT_PUBLIC_WS,
    apiUrl: process.env.NEXT_PUBLIC_API,
    blobBaseUrl: blobBaseUrl,
    assets: {
      chequered_flag: `${blobBaseUrl}/chequered_flag.png`,
      f1_white: `${blobBaseUrl}/F1White.svg`,
      f1_black: `${blobBaseUrl}/F1Black.svg`,
      f1_blue: `${blobBaseUrl}/F1Blue.svg`,
      discordIcon: `${blobBaseUrl}/discord.svg`,
      driver: `${blobBaseUrl}/driver.png`,
      f1telemetry_black: `${blobBaseUrl}/F1TelemetryBlack.svg`,
      f1telemetry_white: `${blobBaseUrl}/F1TelemetryWhite.svg`,
      f1telemetrybg_v1: `${blobBaseUrl}/f1telemetrybg_v1.png`,
      mp3: {
        raceControl: `${blobBaseUrl}/mp3/race-control-notification.mp3`,
      },
      mp4: {
        audios: `${blobBaseUrl}/mp4/audios.mkv`,
        circles: `${blobBaseUrl}/mp4/circles.mp4`,
        livemap: `${blobBaseUrl}/mp4/livemap.mp4`,
      },
      tyres: {
        hard: `${blobBaseUrl}/tyres/hard.svg`,
        intermediate: `${blobBaseUrl}/tyres/intermediate.svg`,
        medium: `${blobBaseUrl}/tyres/medium.svg`,
        soft: `${blobBaseUrl}/tyres/soft.svg`,
        unknown: `${blobBaseUrl}/tyres/unknown.svg`,
        wet: `${blobBaseUrl}/tyres/wet.svg`,
      }
    },
  },
  server: {},
};
