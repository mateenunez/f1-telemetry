import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import HomeContent from "@/components/HomeContent";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: `F1 Telemetry | ${dict.home.title}`,
    description: dict.home.description,
    keywords:
      lang === "en"
        ? "telemetry dashboard, F1 live, F1 realtime, F1 data, F1 analytics, f1 telemetry dashboard, f1 streaming, f1 telemetry, F1 TELEMETRY, f1 dashboard, f1 telemetria, f1 estadisticas"
        : "dashboard de telemetría, F1 en vivo, F1 tiempo real, datos F1, analíticas F1, dashboard telemetría F1, streaming F1, telemetría F1, dashboard F1, estadísticas F1",
    authors: [
      {
        name: "Skoncito",
        url: "https://cafecito.app/skoncito",
      },
    ],
    openGraph: {
      title: `F1 Telemetry | ${dict.home.title}`,
      description: dict.home.description,
      url: `https://www.f1telemetry.com/${lang}`,
      siteName: "F1 Telemetry",
      locale: lang === "en" ? "en_US" : "es_ES",
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
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-warmBlack">
      <HomeContent dict={dict} />
      <Footer dict={dict} />
    </div>
  );
}
