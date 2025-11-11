import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { PreferencesProvider } from "@/context/preferences";
import { i18n, type Locale } from "@/lib/i18n/config";
import Script from "next/script";

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
  alternates: {
    canonical: "https://www.f1telemetry.com/en",
    languages: {
      en: "https://www.f1telemetry.com/en",
      es: "https://www.f1telemetry.com/es",
    },
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: Locale };
}>) {
  const { lang } = params;

  return (
    <html lang={lang}>
      <head>
        <meta
          name="google-site-verification"
          content="eF8UbK8ghA29zsWnzurWzjJgXzmLeucRd59QUDpdHTE"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#b91c1c" />
        <link rel="canonical" href={`https://www.f1telemetry.com/${lang}`} />
        {i18n.locales.map((l) => (
          <link
            key={l}
            rel="alternate"
            hrefLang={l}
            href={`https://www.f1telemetry.com/${l}`}
          />
        ))}
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://www.f1telemetry.com/en"
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-CS9SV8WN8Y"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-CS9SV8WN8Y');
        `}
        </Script>
      </head>
      <body>
        <PreferencesProvider>{children}</PreferencesProvider>
        <Analytics />
      </body>
    </html>
  );
}
