import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import LiveMapContent from "@/components/LiveMapContent";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: `${dict.map.title || "Live Map"} | F1 Telemetry`,
    description:
      dict.map.description || "F1 Telemetry live map of the Formula 1 race circuit.",
    openGraph: {
      title: `${dict.map.title || "Live Map"} | F1 Telemetry`,
      description:
        dict.map.description || "F1 Telemetry live map of the Formula 1 race  circuit.",
      url: `https://www.f1telemetry.com/${lang}/live-map`,
    },
  };
}

export default async function LiveMapPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-warmBlack">
      <LiveMapContent dict={dict} />
      <Footer dict={dict} />
    </div>
  );
}
