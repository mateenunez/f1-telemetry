import {
  F1Event,
  formatEventDateShort,
  getCountryCode,
  GroupByLocation,
} from "@/utils/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import TrackCircuit from "@/components/calendar/TrackCircuit";
import { getTrackAsset } from "@/utils/track-assets";
import { cn } from "@/lib/utils";

const sessionDictKeys: Record<string, string> = {
  p1: "practice1",
  p2: "practice2",
  p3: "practice3",
  sq: "sprintqualification",
  sr: "sprintrace",
  q: "qualifying",
  r: "race",
};

interface UpNextProps {
  upNextEvents: GroupByLocation[];
  dict: any;
}

function isPast(dateString: string | undefined): boolean {
  if (!dateString) return false;
  return new Date(dateString).getTime() < Date.now();
}

function getGroupEndTime(event: GroupByLocation): number {
  const sessions = [
    event.p1,
    event.p2,
    event.p3,
    event.sq,
    event.sr,
    event.q,
    event.r,
  ].filter(Boolean) as F1Event[];

  if (sessions.length === 0) return new Date(event.start).getTime();

  return Math.max(
    ...sessions.map((s) => new Date(s.end || s.start).getTime()),
  );
}

function getSessionLabel(sessionKey: string, dict: any): string {
  const dictKey = sessionDictKeys[sessionKey];
  return dict?.sessionTypes?.[dictKey] ?? sessionKey.toUpperCase();
}

function Session({
  sessionKey,
  eventData,
  dict,
}: {
  sessionKey: string;
  eventData: F1Event | undefined;
  dict: any;
}) {
  if (!eventData) return null;

  const past = isPast(eventData.start);

  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-center justify-start gap-x-3 gap-y-0.5 py-2 sm:justify-start sm:py-1.5",
        past && "opacity-45",
      )}
    >
      <span className="font-medium text-offWhite text-base">
        {getSessionLabel(sessionKey, dict)}
      </span>
      <span className="whitespace-nowrap text-base text-gray-400">
        {formatEventDateShort(eventData.start || "", dict.locale)}
      </span>
    </div>
  );
}

export default function Upnext({ upNextEvents, dict }: UpNextProps) {
  const now = Date.now();
  const upcomingEvents = upNextEvents
    .filter((event) => getGroupEndTime(event) >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <div className="grid grid-cols-1 gap-5 pb-4 md:grid-cols-2">
      {upcomingEvents.map((event, index) => {
        const trackAsset = getTrackAsset(event);
        const isNextRace = index === 0;

        return (
          <Card
            key={index}
            className={cn(
              "relative flex flex-col overflow-hidden rounded-xl bg-warmBlack p-5 shadow-none transition-colors",
              isNextRace
                ? "border-white/60 next-race-glow"
                : "border-none",
            )}
          >
            {trackAsset && (
              <TrackCircuit
                asset={trackAsset}
                variant={isNextRace ? "trail" : "image"}
                className={cn(
                  "pointer-events-none absolute right-1.5 top-1 h-auto w-full select-none lg:w-[80%]",
                  isNextRace && trackAsset.format === "svg"
                    ? "text-white"
                    : trackAsset.format === "svg"
                      ? "opacity-5"
                      : "opacity-15",
                )}
              />
            )}

            <CardHeader className="relative z-10 flex flex-row items-center gap-3 p-0">
              <img
                src={`https://flagsapi.com/${getCountryCode(
                  event.location
                )}/flat/32.png`}
                alt={`Flag of ${event.location}`}
                className="h-9 w-9 rounded-sm object-cover"
              />
              <div className="flex min-w-0 flex-col">
                <p className="truncate text-base font-geist text-f1White">
                  {event.track.toUpperCase()}
                </p>
                <p className="truncate text-xs font-geist text-gray-400">
                  {event.location}
                </p>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 mt-4 flex w-full min-w-0 flex-col gap-1.5 p-0">
              <Session sessionKey="p1" eventData={event.p1} dict={dict} />
              <Session sessionKey="p2" eventData={event.p2} dict={dict} />
              <Session sessionKey="p3" eventData={event.p3} dict={dict} />
              <Session sessionKey="sq" eventData={event.sq} dict={dict} />
              <Session sessionKey="sr" eventData={event.sr} dict={dict} />
              <Session sessionKey="q" eventData={event.q} dict={dict} />
              <Session sessionKey="r" eventData={event.r} dict={dict} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
