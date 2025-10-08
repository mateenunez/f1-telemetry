import { Github } from "lucide-react";

const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL || "";
const DISCORD_INVITE_URL = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "";
const DISCORD_ICON_URL =
  process.env.NEXT_PUBLIC_DISCORD_ICON_URL ||
  "https://res.cloudinary.com/dvukvnmqt/image/upload/v1758219358/discord_1_rxede6.svg";

export default function Footer() {
  return (
    <div className="flex flex-col justify-center py-2">
      <div className="w-full flex flex-row justify-center py-2 px-4 bg-transparent gap-4 ">
        <div className="flex flex-row gap-2 text-gray-500 text-bottom align-bottom flex-wrap justify-evenly">
          <a href={GITHUB_URL} target="_blank" className="decoration-none">
            <Github size={16} />
          </a>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            className="text-xs text-gray-500 inline-block align-bottom text-bottom align-text-bottom"
          >
            <img src={DISCORD_ICON_URL} width={15} className="h-full" />
          </a>
        </div>
      </div>
      <div className="text-center text-gray-500 text-xs">
        <p>
          This website is not associated, affiliated, authorized, endorsed, or
          officially connected in any way with Formula 1, the FIA, or any of its
          subsidiaries or affiliates.
        </p>
      </div>
    </div>
  );
}
