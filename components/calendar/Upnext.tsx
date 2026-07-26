import { useEffect, useRef } from "react";
import {
  F1Event,
  formatEventDateShort,
  getCountryCode,
  GroupByLocation,
} from "@/utils/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { config } from "@/lib/config";
import { cn } from "@/lib/utils";

interface UpNextProps {
  upNextEvents: GroupByLocation[];
  dict: any;
  viewportRef: React.RefObject<HTMLDivElement | null>;
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

  return Math.max(...sessions.map((s) => new Date(s.start).getTime()));
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
  if (!eventData) return <></>;

  const displayLabel = sessionKey.toUpperCase();

  return (
    <div
      className={cn(
        "flex flex-col gap-0 text-wrap text-gray-400 text-xs",
        isPast(eventData.start) && "opacity-50",
      )}
    >
      <span className="text-md text-offWhite">{displayLabel}</span>
      <span>{formatEventDateShort(eventData.start || "", dict.locale)}</span>
    </div>
  );
}

export default function Upnext({
  upNextEvents,
  dict,
  viewportRef,
}: UpNextProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || upNextEvents.length === 0) return;

    let anchorIndex = upNextEvents.findIndex(
      (event) => getGroupEndTime(event) >= Date.now(),
    );
    if (anchorIndex === -1) anchorIndex = upNextEvents.length - 1;

    const anchorCard = cardRefs.current[anchorIndex];
    if (anchorCard) {
      viewport.scrollLeft = anchorCard.offsetLeft;
    }
  }, [upNextEvents, viewportRef]);

  return (
    <div className="flex gap-4 pb-4 flex-row">
      {upNextEvents.map((event, index) => (
        <Card
          key={index}
          ref={(el) => {
            cardRefs.current[index] = el;
          }}
          className={cn(
            "min-w-[20rem] max-w-[320px] flex-shrink-0 flex flex-col justify-between bg-transparent border-none",
            getGroupEndTime(event) < Date.now() && "opacity-50",
          )}
        >
          <CardHeader className="py-0 flex flex-row gap-4 items-center">
            <img
              src={`https://flagsapi.com/${getCountryCode(
                event.location
              )}/flat/32.png`}
              alt={`Flag of ${event.location}`}
              className="w-8 h-8"
            />
            <p className="text-md text-bold text-start text-white text-wrap font-regular">
              {event.track.toUpperCase()}
            </p>
          </CardHeader>
          <CardContent className="flex flex-row gap-2">
            <div className="text-start flex flex-row justify-between">
              <div className="flex flex-col gap-0 justify-evenly px-2">
                <Session sessionKey="p1" eventData={event.p1} dict={dict} />
                <Session sessionKey="p2" eventData={event.p2} dict={dict} />
                <Session sessionKey="p3" eventData={event.p3} dict={dict} />
                <Session sessionKey="sq" eventData={event.sq} dict={dict} />
                <Session sessionKey="sr" eventData={event.sr} dict={dict} />
                <Session sessionKey="q" eventData={event.q} dict={dict} />
                <Session sessionKey="r" eventData={event.r} dict={dict} />
              </div>
              <div className="flex items-center max-w-[10rem]">
                <img
                  alt={event.location}
                  src={
                    config.public.blobBaseUrl +
                    `/tracks/${event.location.replaceAll(" ", "")}.png`
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
