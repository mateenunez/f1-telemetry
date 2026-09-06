import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import Navigation from "@/components/Navigation";
import { config } from "@/lib/config";

const legalSlugs = ["about", "privacy", "terms", "contact"] as const;
type LegalSlug = (typeof legalSlugs)[number];

export function generateStaticParams() {
  return i18n.locales.flatMap((lang) => legalSlugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang);
  const page = dict.legal[slug as LegalSlug];
  return page ? { title: `F1 Telemetry | ${page.title}`, description: page.body[0] } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ lang: Locale; slug: string }> }) {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang);
  const page = dict.legal[slug as LegalSlug];

  if (!page) notFound();

  return (
    <div className="min-h-screen bg-warmBlack text-offWhite flex flex-col">
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
      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-16 font-geist">
        <h1 className="font-orbitron text-3xl">{page.title}</h1>
        <div className="mt-8 space-y-5 text-base leading-7 text-gray-300">
          {page.body.map((paragraph: string) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </main>
      <Footer dict={dict} />
    </div>
  );
}