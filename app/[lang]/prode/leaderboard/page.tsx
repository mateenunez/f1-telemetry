import type { Metadata } from "next";
import ProdeLeaderboard from "@/components/prode/ProdeLeaderboard";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import Navigation from "@/components/Navigation";
import { config } from "@/lib/config";
import Footer from "@/components/Footer";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return {
    title: `F1 Telemetry | ${dict.home.prodeLeaderboardButton}`,
    description: dict.home.prodeDescription,
  };
}

export default async function ProdeLeaderboardPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <main className="flex-1 px-5 py-16">
        <Navigation
          leftUrl={`/${lang}/live-timing`}
          rightUrl={`/${lang}/schedule`}
          leftTitle={dict.home.dashboardButton}
          rightTitle={dict.home.scheduleButton}
          f1t_url={config.public.assets.f1_white}
          prodeUrl={`/${lang}/prode/leaderboard`}
          prodeTitle={dict.home.prodeLeaderboardButton}
          prodeColor="f1Yellow"
          homeUrl={`/${lang}`}
          homeTitle={dict.schedule.homeButton}
          scheduleUrl={`/${lang}/schedule`}
          scheduleTitle={dict.home.scheduleButton}
        />
        <div className="mx-auto max-w-4xl">
          <header className="mb-12 mt-8 flex items-center gap-4">
            <h1 className="font-orbitron text-4xl">{dict.home.prodeLeaderboardButton}</h1>
            <a
              href={`/${lang}/prode/how-it-works`}
              className="text-sm text-f1Yellow transition hover:text-white"
            >
              {dict.home.prodeInfoButton}
            </a>
          </header>
          <ProdeLeaderboard labels={dict.leaderboard} />
        </div>
      </main>
      <Footer dict={dict} />
    </div>
  );
}
