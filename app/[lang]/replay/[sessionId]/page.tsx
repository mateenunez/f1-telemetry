import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { ReplayPlayer } from "@/components/replay/ReplayPlayer";
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
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function ReplaySessionPage({
  params,
}: {
  params: Promise<{ lang: Locale; sessionId: string }>;
}) {
  const { lang, sessionId } = await params;
  const dict = await getDictionary(lang);
  const recordingId = sessionId.startsWith("session=")
    ? sessionId.slice("session=".length)
    : sessionId;

  return (
    <div className="min-h-screen bg-warmBlack flex flex-col">
      <div className="flex-1">
        <ReplayPlayer dict={dict} sessionId={recordingId} />
      </div>
      <Footer dict={dict} />
    </div>
  );
}
