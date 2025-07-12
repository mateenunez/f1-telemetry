import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "F1 Telemetry",
  description: "Telemetry Dashboard interactivo de Fórmula 1 con datos en tiempo real.",
  keywords: "F1, Formula 1, dashboard, tiempo real, carreras, pilotos, telemetría, live timing, resultados, posiciones, clasificación, GP, Grand Prix, circuito, equipos, escuderías, estrategia, neumáticos, velocidad, sector, vuelta rápida, datos, streaming, análisis, estadísticas, OpenF1, telemetry dashboard, F1 live, F1 realtime, F1 data, F1 analytics, F1 telemetry dashboard, F1 streaming, F1 resultados en vivo, F1 posiciones en tiempo real, F1 análisis de carrera, F1 dashboard interactivo",
  authors: [
    {
      name: "Skoncito",
      url: "https://cafecito.app/skoncito",
    },
  ],
  openGraph: {
    title: "F1 Telemetry",
    description: "Telemetry Dashboard interactivo de Fórmula 1 con datos en tiempo real de OpenF1 API.",
    url: "https://f1-websocket-telemetry.vercel.app/", 
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        {/* SEO extra tags */}
        <meta name="google-site-verification" content="eF8UbK8ghA29zsWnzurWzjJgXzmLeucRd59QUDpdHTE" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#b91c1c" />
        <link rel="canonical" href="https://f1-websocket-telemetry.vercel.app/" /> 
      </head>
      <body>{children}</body>
        <Analytics />
    </html>
  )
}
