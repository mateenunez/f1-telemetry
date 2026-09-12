import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import { config } from "@/lib/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import Footer from "@/components/Footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return {
    title: `F1 Telemetry | ${dict.home.prodeInfoButton}`,
    description: dict.home.prodeDescription,
  };
}

export default async function ProdeInfoPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const isSpanish = lang === "es";
  const copy = isSpanish
    ? {
        title: "Cómo funciona",
        beforeText:
          "Elegí tus pilotos y registrá tu predicción antes del inicio. Cuando comienza la sesión, la votación se cierra.",
        points: "Sistema de puntos",
        exact: "posición acertada",
        partial: "piloto en otra posición",
        practice: "Prácticas libres",
        practiceText: "Elegí el Top 3 de la tabla final.",
        qualifying: "Clasificación",
        qualifyingText: "Elegí la pole y el piloto de la vuelta rápida.",
        race: "Carrera y Sprint",
        raceText: "Elegí el podio completo.",
        bonus: "bonus podio completo",
      }
    : {
        title: "How it works",
        beforeText:
          "Choose your drivers and submit your prediction before the start. Voting closes when the session begins.",
        points: "Scoring system",
        exact: "exact position",
        partial: "driver in another position",
        practice: "Free practice",
        practiceText: "Choose the final Top 3.",
        qualifying: "Qualifying",
        qualifyingText: "Choose pole and the fastest-lap driver.",
        race: "Race and Sprint",
        raceText: "Choose the complete podium.",
        bonus: "complete podium bonus",
      };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <main className="flex-1 px-4 pb-20 sm:px-6">
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
        <div className="mx-auto max-w-6xl pt-28">
          <header className="max-w-3xl">
            <h1 className="font-orbitron text-2xl leading-tight sm:text-3xl">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
              {copy.beforeText}
            </p>
          </header>
          <section className="mt-6">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-orbitron text-2xl sm:text-3xl">
                {copy.points}
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              <article className="rounded-lg p-6 sm:p-8">
                <p className="text-xl font-semibold font-orbitron uppercase text-f1Green">
                  {copy.practice}
                </p>
                <p className="mt-1 text-gray-400">{copy.practiceText}</p>
                <div className="mt-8 flex items-end gap-3">
                  <strong className="text-5xl font-black font-geist leading-none text-f1Green">
                    +5
                  </strong>
                  <span className="pb-1 text-sm text-gray-400">
                    {copy.exact}
                  </span>
                </div>
                <div className="pt-5">
                  <strong className="text-4xl font-black text-gray-400 font-geist">
                    +2
                  </strong>
                  <span className="ml-3 text-sm text-gray-400">
                    {copy.partial}
                  </span>
                </div>
              </article>
              <article className="rounded-lg p-6 sm:p-8">
                <p className="text-xl font-semibold font-orbitron uppercase text-f1Purple">
                  {copy.qualifying}
                </p>
                <p className="mt-1 text-gray-400">{copy.qualifyingText}</p>
                <div className="mt-8 grid grid-rows-2 gap-5">
                  <div className="flex flex-row items-center gap-4">
                    <strong className="block text-5xl font-black leading-none font-geist text-f1Purple">
                      +5
                    </strong>
                    <span className="mt-2 block text-sm text-gray-400">
                      pole
                    </span>
                  </div>
                  <div className="flex flex-row items-center gap-4">
                    <strong className="block text-5xl font-black leading-none text-f1Purple font-geist">
                      +5
                    </strong>
                    <span className="mt-2 block text-sm text-gray-400">
                      {isSpanish ? "vuelta rápida" : "fastest lap"}
                    </span>
                  </div>
                </div>
              </article>
              <article className="rounded-lg p-6 sm:p-8">
                <p className="text-xl font-semibold font-orbitron uppercase text-f1Blue">
                  {copy.race}
                </p>
                <p className="mt-1 text-white/60">{copy.raceText}</p>
                <div className="mt-8 flex items-end gap-3">
                  <strong className="text-5xl font-black leading-none text-f1Blue font-geist">
                    +5
                  </strong>
                  <span className="pb-1 text-sm text-gray-400">
                    {copy.exact}
                  </span>
                </div>
                <div className="pt-5">
                  <strong className="text-5xl font-black text-f1Blue font-geist">
                    +5
                  </strong>
                  <span className="ml-3 text-sm text-gray-400">
                    {copy.bonus}
                  </span>
                </div>

                <div className="pt-5">
                  <strong className="text-4xl font-black text-gray-400 font-geist">
                    +2
                  </strong>
                  <span className="ml-3 text-sm text-gray-400">
                    {copy.partial}
                  </span>
                </div>
              </article>
            </div>
          </section>
        </div>
      </main>
      <Footer dict={dict} />
    </div>
  );
}
