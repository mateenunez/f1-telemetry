import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import HomeContent from "@/components/HomeContent";
import Footer from "@/components/Footer";

export default async function Page({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-warmBlack">
      <HomeContent dict={dict} />
      <Footer dict={dict} />
    </div>
  );
}
