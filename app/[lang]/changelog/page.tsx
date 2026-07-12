import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { ChangelogContent } from "@/components/changelog/ChangelogContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: `${dict.changelog.title} | F1 Telemetry`,
    description: dict.changelog.description,
    openGraph: {
      title: `${dict.changelog.title} | F1 Telemetry`,
      description: dict.changelog.description,
      url: `https://www.f1telemetry.com/${lang}/changelog`,
    },
  };
}

export default async function Changelog({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const param = await params;
  const dict = await getDictionary(param.lang);
  return (
    <div className="min-h-screen bg-warmBlack">
      <ChangelogContent dict={dict} />
      <Footer dict={dict} />
    </div>
  );
}
