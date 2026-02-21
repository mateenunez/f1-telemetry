import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { HelpContent } from "@/components/help/HelpContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: `${dict.help.title || "Widgets and features"} | F1 Telemetry`,
    description:
      dict.help.description ||
      "Help and documentation for F1 Telemetry, the fan-made live timing dashboard for Formula 1 fans.",
    openGraph: {
      title: `${dict.help.title || "Widgets and features"} | F1 Telemetry`,
      description:
        dict.help.description ||
        "Help and documentation for F1 Telemetry, the fan-made live timing dashboard for Formula 1 fans.",
      url: `https://www.f1telemetry.com/${lang}/help`,
    },
  };
}

export default async function Help({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const param = await params;
  const dict = await getDictionary(param.lang);
  return (
    <div className="min-h-screen bg-warmBlack">
      <HelpContent dict={dict} />
      <Footer dict={dict} />
    </div>
  );
}
