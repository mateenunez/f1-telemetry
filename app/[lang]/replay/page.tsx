import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { ReplayList } from "@/components/replay/ReplayList";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const title = `F1 Telemetry | ${dict.replay.title}`;
  const url = `https://www.f1telemetry.com/${lang}/replay`;

  return {
    title,
    description: dict.replay.description,
    keywords:
      lang === "en"
        ? "F1 telemetry replays, Formula 1 telemetry recordings, replay F1 sessions, race telemetry analysis"
        : "repeticiones de telemetría F1, grabaciones de Fórmula 1, replay de sesiones F1, análisis de telemetría de carrera",
    alternates: {
      canonical: url,
      languages: {
        en: "https://www.f1telemetry.com/en/replay",
        es: "https://www.f1telemetry.com/es/replay",
      },
    },
    openGraph: {
      title,
      description: dict.replay.description,
      url,
      siteName: "F1 Telemetry",
      locale: lang === "en" ? "en_US" : "es_ES",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ReplayPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <div className="min-h-screen bg-warmBlack">
      <ReplayList dict={dict} locale={lang} />
      <Footer dict={dict} />
    </div>
  );
}
