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

  return (
    <div className="flex flex-row items-center justify-between gap-[2rem] py-8 px-4 max-w-5xl mx-auto text-gray-400">
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <Image
          src={config.public.assets.f1_white}
          width={60}
          height={60}
          alt="F1 Telemetry logo"
        />
        <div className="flex items-center gap-2">
          <TrackedLink
            href={config.public.github}
            action="cta_click"
            params={{ cta: "github", location: "footer" }}
            className="text-gray-400"
          >
            <Github size={18} />
          </TrackedLink>
          <TrackedLink
            href={discordUrl}
            action="cta_click"
            params={{ cta: "discord", location: "footer" }}
            className="text-gray-400 w-[1rem]"
          >
            <Image
              src={config.public.assets.discordIcon}
              width={18}
              height={18}
              alt="Discord"
            />
          </TrackedLink>
        </div>
        <p className="text-xs text-center text-gray-400 font-geist">{dict.footer.legal}</p>
        <TrackedLink
          href="/help"
          action="cta_click"
          params={{ cta: "help", location: "footer" }}
          className="text-xs text-gray-400 font-geist hover:text-f1Blue text-center"
        >
          {dict.footer.help}
        </TrackedLink>
        <TrackedLink
          href="/changelog"
          action="cta_click"
          params={{ cta: "changelog", location: "footer" }}
          className="text-xs text-gray-400 font-geist hover:text-f1Blue text-center"
        >
          {dict.footer.changelog}
        </TrackedLink>
        <TrackedLink
          href={dict.donate.url}
          action="donate_click"
          params={{ location: "footer" }}
          className="text-xs text-gray-400 font-geist hover:text-f1Blue text-center"
        >
          {dict.donate.shortLabel}
        </TrackedLink>
      </div>
    </div>
  );
}
