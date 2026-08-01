import { Suspense } from "react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { Metadata } from "next";
import ResetPasswordContent from "@/components/auth/ResetPasswordContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: `${dict.auth.resetPasswordTitle} | F1 Telemetry`,
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
    <div className="min-h-screen bg-warmBlack flex items-center justify-center p-4">
      <Suspense fallback={null}>
        <ResetPasswordContent dict={dict} lang={lang} />
      </Suspense>
    </div>
  );
}
