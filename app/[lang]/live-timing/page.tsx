import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { TelemetryContent } from "@/components/TelemetryContent";
import Footer from "@/components/Footer";

export default async function Telemetry({
  params,
}: {
  params: { lang: Locale };
}) {
  const param = await params;
  const dict = await getDictionary(param.lang);
  return (
    <div className="min-h-screen bg-warmBlack">
      <TelemetryContent dict={dict} />
      <Footer dict={dict} />
    </div>
  );
}
