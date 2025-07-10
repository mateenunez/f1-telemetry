import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "F1 Telemetry",
  description: "Telemetry Dashboard interactivo de Fórmula 1 con datos en tiempo real.",
  keywords: "F1, Formula 1, dashboard, tiempo real, carreras, pilotos, al, angulo, tv",
  authors: [
    {
      name: "Skoncito",
      url: "https://cafecito.app/skoncito",
    },
  ],
  openGraph: {
    title: "F1 Telemetry",
    description: "Telemetry Dashboard interactivo de Fórmula 1 con datos en tiempo real de OpenF1 API.",
    // url: "https://alangulo-dashboard-f1.vercel.app/", // Cambia por tu dominio real
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#b91c1c" />
{/*         
        <link rel="canonical" href="https://alangulo-dashboard-f1.vercel.app/" /> */}

      </head>
      <body>{children}</body>
        <Analytics />
    </html>
  )
}
