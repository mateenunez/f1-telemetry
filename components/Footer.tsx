import {
  useAudioLog,
  useCircleOfDoom,
  useHeadshot,
  useRaceControlLog,
} from "@/hooks/use-cookies";
import { useCorners, useSectors } from "@/hooks/use-cookies";
import { useTelemetryAudio } from "@/hooks/use-raceControl";
import { Github, Linkedin } from "lucide-react";

const GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_URL ||
  "";
const LINKEDIN_URL =
  process.env.NEXT_PUBLIC_LINKEDIN_URL ||
  "teenunez/";
const DISCORD_INVITE_URL = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "";
const DISCORD_ICON_URL =
  process.env.NEXT_PUBLIC_DISCORD_ICON_URL ||
  "https://res.cloudinary.com/dvukvnmqt/image/upload/v1758219358/discord_1_rxede6.svg";

export default function Footer({
  isDashboard = false,
}: {
  isDashboard: boolean;
}) {

    const { cookieAudio, toggleAudio } = useTelemetryAudio();
    const { headshot, set: setHeadshot } = useHeadshot();
    const { corners, set: setCorners } = useCorners();
    const { sectors, set: setSectors } = useSectors();
    const { audioLog, set: setAudioLog } = useAudioLog();
    const { raceControlLog, set: setRaceControlLog } = useRaceControlLog();
    const { circleOfDoom, set: setCircleOfDoom } = useCircleOfDoom();
  

  return (
    <div className="flex flex-col justify-center py-2">
      <div className="w-full flex flex-row justify-center py-2 px-4 bg-transparent gap-4 ">
        {isDashboard && (
          <div className="flex flex-row gap-2 flex-wrap justify-evenly md:justify-center">
            <div className="text-xs text-gray-500">
              <select
                className="bg-transparent border-none focus:outline-none"
                value={headshot.toString()}
                onChange={(e) => setHeadshot(e.target.value === "true")}
              >
                <option
                  value="true"
                  className="bg-black text-gray-500 border-none focus:outline-none appearance-none"
                >
                  Show driver headshot
                </option>
                <option
                  value="false"
                  className="bg-black border-black focus:outline-none border-0 appearance-none"
                >
                  Hide driver headshot
                </option>
              </select>
            </div>
            <div className="text-xs text-gray-500">
              <select
                className="bg-transparent border-none focus:outline-none"
                value={cookieAudio.toString()}
                onChange={toggleAudio}
                onLoadStart={toggleAudio}
              >
                <option
                  value="true"
                  className="bg-black text-gray-500 border-none focus:outline-none appearance-none"
                >
                  Audio enabled
                </option>
                <option
                  value="false"
                  className="bg-black border-black focus:outline-none border-0 appearance-none"
                >
                  Audio disabled
                </option>
              </select>
            </div>
            <div className="text-xs text-gray-500">
              <select
                className="bg-transparent border-none focus:outline-none"
                value={corners.toString()}
                onChange={(e) => setCorners(e.target.value === "true")}
              >
                <option
                  value="true"
                  className="bg-black text-gray-500 border-none focus:outline-none appearance-none"
                >
                  Corners enabled
                </option>
                <option
                  value="false"
                  className="bg-black border-black focus:outline-none border-0 appearance-none"
                >
                  Corners disabled
                </option>
              </select>
            </div>
            <div className="text-xs text-gray-500">
              <select
                className="bg-transparent border-none focus:outline-none"
                value={sectors.toString()}
                onChange={(e) => setSectors(e.target.value === "true")}
              >
                <option
                  value="true"
                  className="bg-black text-gray-500 border-none focus:outline-none appearance-none"
                >
                  Full sectors
                </option>
                <option
                  value="false"
                  className="bg-black border-black focus:outline-none border-0 appearance-none"
                >
                  Simple sectors
                </option>
              </select>
            </div>
            <div className="text-xs text-gray-500">
              <select
                className="bg-transparent border-none focus:outline-none"
                value={audioLog.toString()}
                onChange={(e) => setAudioLog(e.target.value === "true")}
              >
                <option
                  value="true"
                  className="bg-black text-gray-500 border-none focus:outline-none appearance-none"
                >
                  Audio Log Enabled
                </option>
                <option
                  value="false"
                  className="bg-black border-black focus:outline-none border-0 appearance-none"
                >
                  Audio Log Disabled
                </option>
              </select>
            </div>
            <div className="text-xs text-gray-500">
              <select
                className="bg-transparent border-none focus:outline-none"
                value={raceControlLog.toString()}
                onChange={(e) => setRaceControlLog(e.target.value === "true")}
              >
                <option
                  value="true"
                  className="bg-black text-gray-500 border-none focus:outline-none appearance-none"
                >
                  Messages Log Enabled
                </option>
                <option
                  value="false"
                  className="bg-black border-black focus:outline-none border-0 appearance-none"
                >
                  Messages Log Disabled
                </option>
              </select>
            </div>
            <div className="text-xs text-gray-500">
              <select
                className="bg-transparent border-none focus:outline-none"
                value={circleOfDoom.toString()}
                onChange={(e) => setCircleOfDoom(e.target.value === "true")}
              >
                <option
                  value="true"
                  className="bg-black text-gray-500 border-none focus:outline-none appearance-none"
                >
                  Circle Enabled
                </option>
                <option
                  value="false"
                  className="bg-black border-black focus:outline-none border-0 appearance-none"
                >
                  Circle Disabled
                </option>
              </select>
            </div>
          </div>
        )}
        <div className="flex flex-row gap-2 text-gray-500 text-bottom align-bottom flex-wrap justify-evenly">
          <a href={GITHUB_URL} target="_blank" className="decoration-none">
            <Github size={16} />
          </a>
          <a href={LINKEDIN_URL} target="_blank" className="decoration-none">
            <Linkedin size={16} />
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
