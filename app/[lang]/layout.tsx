import type { Metadata } from "next";
import { PreferencesProvider } from "@/context/preferences"; // optional: remove if you only want a single provider
import { i18n, type Locale } from "@/lib/i18n/config";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export const metadata: Metadata = {
  title: "F1 Telemetry",
  description:
    "F1 Telemetry is a real-time Formula 1 dashboard featuring original telemetry data, a live circuit map, and real-time audio to provide an immersive Formula 1 experience.",
  keywords:
    "telemetry dashboard, F1 live, F1 realtime, F1 data, F1 analytics, f1 telemetry dashboard, f1 streaming, F1 resultados en vivo, F1 dashboard interactivo, f1 telemetry, F1 TELEMETRY, f1 dashboard, f1 telemetria, f1 estadisticas",
  authors: [
    {
      name: "Skoncito",
      url: "https://cafecito.app/skoncito",
    },
  ],
  openGraph: {
    title: "F1 Telemetry",
    description:
      "F1 Telemetry is a real-time Formula 1 dashboard featuring original telemetry data, a live circuit map, and real-time audio to provide an immersive Formula 1 experience.",
    url: "https://www.f1telemetry.com/",
    siteName: "F1 Telemetry",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function LangLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PreferencesProvider>{children}</PreferencesProvider>;
}
