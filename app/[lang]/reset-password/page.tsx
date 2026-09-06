import { Suspense } from "react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { Metadata } from "next";
import ResetPasswordContent from "@/components/auth/ResetPasswordContent";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { config } from "@/lib/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: `F1 Telemetry | ${dict.auth.resetPasswordTitle}`,
  };
}

export default async function ResetPassword({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-warmBlack flex flex-col">
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
      <div className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={null}>
          <ResetPasswordContent dict={dict} lang={lang} />
        </Suspense>
      </div>
      <Footer dict={dict} />
    </div>
  );
}
