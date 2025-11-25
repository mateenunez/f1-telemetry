import { Github } from "lucide-react";
import { Geist } from "next/font/google";
import { config } from "@/lib/config";
import Image from "next/image";

interface FooterProps {
  dict: any;
}

export default function Footer({ dict }: FooterProps) {
  return (
    <div className="flex flex-row items-center justify-between gap-[2rem] py-2 px-4 max-w-5xl mx-auto text-gray-500">
      <div className="flex items-center gap-4">
        <Image
          src={config.public.assets.f1t}
          width={60}
          height={60}
          alt="F1 Telemetry logo"
        />
        <div className="flex items-center gap-2">
          <a
            href={config.public.github}
            target="_blank"
            className="text-gray-400 hover:text-gray-200"
          >
            <Github size={16} />
          </a>
          <a
            href={config.public.discord}
            target="_blank"
            className="text-gray-400 hover:text-gray-200"
          >
            <img
              src={config.public.assets.discordIcon}
              width={15}
              alt="Discord"
            />
          </a>
        </div>
        <p className="text-xs text-center font-geist">
          {dict.footer.legal}
        </p>
      </div>
    </div>
  );
}
