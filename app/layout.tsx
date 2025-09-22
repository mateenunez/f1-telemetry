import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "F1 Telemetry",
  description:
    "F1 Telemetry es un dashboard en tiempo real de Formula 1 con datos de telemetría originales, un mapa del circuito en vivo y audios en tiempo real para vivir una experiencia inmersiva de Formula 1. ",
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
      "F1 Telemetry es un dashboard en tiempo real de Formula 1 con datos de telemetría originales, un mapa del circuito en vivo y audios en tiempo real para vivir una experiencia inmersiva de Formula 1.",
    url: "https://f1telemetry.com/",
    siteName: "F1 Telemetry",
    locale: "es_ES",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="es">
        <head>
          {/* SEO extra tags */}
          <meta
            name="google-site-verification"
            content="eF8UbK8ghA29zsWnzurWzjJgXzmLeucRd59QUDpdHTE"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#b91c1c" />
          <link rel="canonical" href="https://f1telemetry.com/" />
        </head>
        <body>{children}</body>
        <Analytics />
      </html>
  );
}
