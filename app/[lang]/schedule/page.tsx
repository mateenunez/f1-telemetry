import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { ScheduleContent } from "@/components/ScheduleContent";
import Footer from "@/components/Footer";

export default async function SchedulePage({
  params,
}: {
  params: { lang: Locale };
}) {
  const { lang } = params;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-warmBlack">
      <ScheduleContent dict={dict} />
      <Footer dict={dict} />
    </div>
  );
}
