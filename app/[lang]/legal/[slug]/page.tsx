import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";

const legalSlugs = ["about", "privacy", "terms", "contact"] as const;
type LegalSlug = (typeof legalSlugs)[number];

export function generateStaticParams() {
  return i18n.locales.flatMap((lang) => legalSlugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang);
  const page = dict.legal[slug as LegalSlug];
  return page ? { title: `${page.title} | F1 Telemetry`, description: page.body[0] } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ lang: Locale; slug: string }> }) {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang);
  const page = dict.legal[slug as LegalSlug];

  if (!page) notFound();

  return (
    <div className="min-h-screen bg-warmBlack text-offWhite">
      <main className="mx-auto max-w-3xl px-6 py-16 font-geist">
        <h1 className="font-orbitron text-3xl">{page.title}</h1>
        <div className="mt-8 space-y-5 text-base leading-7 text-gray-300">
          {page.body.map((paragraph: string) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </main>
      <Footer dict={dict} />
    </div>
  );
}