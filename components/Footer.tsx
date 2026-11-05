import { Github } from "lucide-react";
import { config } from "@/lib/config";
import { getDiscordInviteUrl } from "@/lib/discord";
import Image from "next/image";
import TrackedLink from "@/components/TrackedLink";

interface FooterProps {
  dict: any;
}

export default async function Footer({ dict }: FooterProps) {
  const discordUrl = await getDiscordInviteUrl();
  const locale = dict.locale;
  const legalLinks = [
    { href: `/${locale}/legal/about`, label: dict.footer.about },
    { href: `/${locale}/legal/privacy`, label: dict.footer.privacy },
    { href: `/${locale}/legal/terms`, label: dict.footer.terms },
    { href: `/${locale}/legal/contact`, label: dict.footer.contact },
  ];

  return (
    <footer className="py-8 px-4 max-w-5xl mx-auto text-gray-400">
      <div className="flex flex-col items-center gap-5">
        <div className="flex items-center gap-2">
          <Image
            src={config.public.assets.f1_white}
            width={60}
            height={60}
            alt="F1 Telemetry logo"
          />
          <TrackedLink
            href={config.public.github}
            action="cta_click"
            params={{ cta: "github", location: "footer" }}
            className="inline-flex text-gray-400 transition-all duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2"
          >
            <Github size={18} />
          </TrackedLink>
          <TrackedLink
            href={discordUrl}
            action="cta_click"
            params={{ cta: "discord", location: "footer" }}
            className="inline-flex w-[1rem] text-gray-400 transition-all duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2"
          >
            <Image
              src={config.public.assets.discordIcon}
              width={18}
              height={18}
              alt="Discord"
            />
          </TrackedLink>
        </div>
        <nav
          aria-label={dict.footer.legalNavigation}
          className="flex flex-wrap justify-center gap-x-4 gap-y-2"
        >
          {legalLinks.map((link) => (
            <TrackedLink
              key={link.href}
              href={link.href}
              action="cta_click"
              params={{ cta: link.label, location: "footer" }}
              target="_self"
              className="text-xs text-gray-400 font-geist text-center transition-all duration-200 ease-out hover:-translate-y-0.5 hover:text-f1Blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1Blue"
            >
              {link.label}
            </TrackedLink>
          ))}
          <TrackedLink
            href={`/${locale}/help`}
            action="cta_click"
            params={{ cta: "help", location: "footer" }}
            target="_self"
            className="text-xs text-gray-400 font-geist text-center transition-all duration-200 ease-out hover:-translate-y-0.5 hover:text-f1Blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1Blue"
          >
            {dict.footer.help}
          </TrackedLink>
          <TrackedLink
            href={`/${locale}/changelog`}
            action="cta_click"
            params={{ cta: "changelog", location: "footer" }}
            target="_self"
            className="text-xs text-gray-400 font-geist text-center transition-all duration-200 ease-out hover:-translate-y-0.5 hover:text-f1Blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1Blue"
          >
            {dict.footer.changelog}
          </TrackedLink>
          <TrackedLink
            href={dict.donate.url}
            action="donate_click"
            params={{ location: "footer" }}
            className="text-xs text-gray-400 font-geist text-center transition-all duration-200 ease-out hover:-translate-y-0.5 hover:text-f1Blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1Blue"
          >
            {dict.donate.shortLabel}
          </TrackedLink>
        </nav>
        <p className="text-xs text-center text-gray-400 font-geist">
          {dict.footer.legal}
        </p>
      </div>
    </footer>
  );
}
