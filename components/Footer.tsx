import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <div className="w-full flex flex-row justify-center py-4 px-4 bg-transparent gap-4">
      <div className="text-xs text-gray-500">
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
