import type { Metadata } from "next";
import { PreferencesProvider } from "@/context/preferences";
import { i18n, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { TourProvider } from "@/context/tour";
import { AuthProvider } from "@/context/auth";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: dict.home.title, // Use localized title
    description: dict.home.description, // Use localized description
    keywords:
      "telemetry dashboard, F1 live, F1 realtime, F1 data, F1 analytics, f1 telemetry dashboard, f1 streaming, F1 resultados en vivo, F1 dashboard interactivo, f1 telemetry, F1 TELEMETRY, f1 dashboard, f1 telemetria, f1 estadisticas",
    authors: [
      {
        name: "Skoncito",
        url: "https://cafecito.app/skoncito",
      },
    ],
    openGraph: {
      title: dict.home.title, // Use localized title
      description: dict.home.description, // Use localized description
      url: `https://www.f1telemetry.com/${lang}`, // Include language in URL
      siteName: "F1 Telemetry",
      locale: lang === "es" ? "es_ES" : "en_US", // Dynamic locale
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

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}>) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <AuthProvider>
      <PreferencesProvider>
        <TourProvider dict={dict}>{children}</TourProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}
