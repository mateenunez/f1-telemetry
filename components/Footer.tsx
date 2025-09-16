import { useHeadshot } from "@/hooks/use-headshot";
import { useCorners, useSectors } from "@/hooks/use-mapPreferences";
import { useTelemetryAudio } from "@/hooks/use-raceControl";
import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  const { cookieAudio, toggleAudio } = useTelemetryAudio();
  const { headshot, set: setHeadshot } = useHeadshot();
  const {corners, set: setCorners } = useCorners();
  const {sectors, set: setSectors} = useSectors();

  return (
    <div className="w-full flex flex-row justify-center py-4 px-4 bg-transparent gap-4 flex-wrap">
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
      <div className="flex flex-row gap-2 text-gray-500">
        <a
          href="https://github.com/mateenunez/f1-telemetry"
          target="_blank"
          className="decoration-none"
        >
          <Github size={16} />
        </a>
        <a
          href="https://www.linkedin.com/in/mateenunez/"
          target="_blank"
          className="decoration-none"
        >
          <Linkedin size={16} />
        </a>
      </div>
    </div>
  );
}
