import Navigation from "../Navigation";
import { config } from "@/lib/config";
import { changelog, type ChangelogType } from "@/lib/changelog/changelog";

interface ChangelogContentProps {
  dict: any;
}

const TYPE_COLOR: Record<ChangelogType, string> = {
  added: "text-f1Green",
  changed: "text-f1Blue",
  fixed: "text-f1Yellow",
  removed: "text-f1Red",
};

export function ChangelogContent({ dict }: ChangelogContentProps) {
  const f1t = config.public.assets.f1_white;
  const locale = dict.locale === "es" ? "es" : "en";

  return (
    <div className="min-h-screen bg-warmBlack text-white overflow-hidden font-geist">
      <div className="max-w-6xl mx-auto mt-20 px-4 md:px-8">
        <Navigation
          leftUrl="/live-timing"
          rightUrl="/"
          leftTitle={dict.schedule.dashboardButton}
          rightTitle={dict.schedule.homeButton}
          f1t_url={f1t}
          rightColor="f1Purple"
        />
        <div className="w-full h-full flex flex-col">
          {/* Introduction */}
          <div className="flex flex-col gap-2 py-4">
            <h1 className="text-2xl font-orbitron">{dict.changelog.title}</h1>
            <p className="text-gray-400 font-geist">
              {dict.changelog.description}
            </p>
          </div>

          {/* Releases */}
          {changelog.map((release) => (
            <div
              key={release.version}
              className="flex flex-col gap-2 py-4 border-t border-gray-800"
            >
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-orbitron">v{release.version}</h2>
                <span className="text-xs text-gray-500 font-geist">
                  {release.date}
                </span>
              </div>
              <ul className="flex flex-col gap-2 mt-2">
                {release.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-gray-400 font-geist text-sm flex flex-wrap items-baseline gap-2"
                  >
                    <span
                      className={`font-medium ${TYPE_COLOR[item.type]}`}
                    >
                      {dict.changelog.types[item.type]}
                    </span>
                    <span className="text-gray-600 text-xs">
                      [{dict.changelog.scopes[item.scope]}]
                    </span>
                    <span>{locale === "es" ? item.es : item.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
