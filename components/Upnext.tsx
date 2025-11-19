import {
  F1Event,
  formatEventDateShort,
  getCountryCode,
  GroupByLocation,
} from "@/utils/calendar";
import { Card, CardContent, CardHeader } from "./ui/card";
import { config } from "@/lib/config";

interface UpNextProps {
  upNextEvents: GroupByLocation[];
  dict: any;
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
    <div className="flex flex-col gap-0 text-wrap text-gray-400 text-xs">
      <span className="text-md text-gray-100">{displayLabel}</span>
      <span>{formatEventDateShort(eventData.start || "", dict.locale)}</span>
    </div>
  );
}

export default function Upnext({ upNextEvents, dict }: UpNextProps) {
  return (
    <div className="flex gap-4 pb-4 flex-row">
      {upNextEvents.map((event, index) => (
        <Card
          key={index}
          className="min-w-[20rem] max-w-[320px] flex-shrink-0 flex flex-col justify-between bg-transparent border-none"
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
