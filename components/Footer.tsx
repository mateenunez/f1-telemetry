import { Github } from "lucide-react";
import { Geist } from "next/font/google";
import { config } from "@/lib/config";

const mediumGeist = Geist({ weight: "400", subsets: ["latin"] });

interface FooterProps {
  dict: any;
}

export default function Footer({ dict }: FooterProps) {
  return (
    <div className="flex flex-col justify-center py-2">
      <div className="w-full flex flex-row justify-center py-2 px-4 bg-transparent gap-4 ">
        <div className="flex flex-row gap-2 text-gray-500 text-bottom align-bottom flex-wrap justify-evenly">
          <a
            href={config.public.github}
            target="_blank"
            className="decoration-none"
          >
            <Github size={16} />
          </a>
          <a
            href={config.public.discord}
            target="_blank"
            className="text-xs text-gray-500 inline-block align-bottom text-bottom align-text-bottom"
          >
            <img
              src={config.public.blobBaseUrl + "/discord.svg"}
              width={15}
              className="h-full"
            />
          </a>
        </div>
      </div>
      <div className="text-center text-gray-500 text-xs">
        <p style={mediumGeist.style}>{dict.footer.legal}</p>
      </div>
    </div>
  );
}
