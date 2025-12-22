import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { ScheduleContent } from "@/components/calendar/ScheduleContent";
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
    title: `${dict.schedule.title || "Schedule"} | F1 Telemetry`,
    description:
      dict.schedule.description ||
      "F1 Telemetry schedule page with upcoming sessions and race calendar.",
    openGraph: {
      title: `${dict.schedule.title || "Schedule"} | F1 Telemetry`,
      description:
        dict.schedule.description ||
        "F1 Telemetry schedule page with upcoming sessions and race calendar.",
      url: `https://www.f1telemetry.com/${lang}/schedule`,
    },
  };
}

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-warmBlack">
      <ScheduleContent dict={dict} />
      <Footer dict={dict} />
    </div>
  );
}
