import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { ReplayList } from "@/components/replay/ReplayList";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return {
    title: `F1 Telemetry | ${dict.replay.title}`,
    description: dict.replay.description,
  };
}

export default async function ReplayPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <div className="min-h-screen bg-warmBlack">
      <ReplayList dict={dict} locale={lang} />
      <Footer dict={dict} />
    </div>
  );
}
