import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { TelemetryContent } from "@/components/TelemetryContent";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: `${dict.liveTiming.title || "Live Timing"}`,
    description:
      dict.liveTiming.description ||
      "F1 Telemetry live timing dashboard with real-time data and analytics.",
    openGraph: {
      title: `${dict.liveTiming.title || "Live Timing"}`,
      description:
        dict.liveTiming.description ||
        "F1 Telemetry live timing dashboard with real-time data and analytics.",
      url: `https://www.f1telemetry.com/${lang}/live-timing`,
    },
  };
}

export default async function Telemetry({
  params,
}: {
  params: { lang: Locale };
}) {
  const param = await params;
  const dict = await getDictionary(param.lang);
  return (
    <div className="min-h-screen bg-warmBlack">
      <TelemetryContent dict={dict} />
      <Footer dict={dict} />
    </div>
  );
}
