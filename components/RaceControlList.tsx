import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Geist } from "next/font/google";
import { ProcessedRaceControl } from "@/processors";
import { toLocaleTime } from "@/utils/calendar";
import { useRaceControlLog } from "@/hooks/use-cookies";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

interface RaceControlListProps {
  raceControl: ProcessedRaceControl[] | undefined;
}

export default function RaceControlList({ raceControl }: RaceControlListProps) {
  const { raceControlLog } = useRaceControlLog();
  return (
    <Card className="flex w-[20rem] gap-6 bg-transparent border-none md:p-0 py-[2rem]">
      <CardContent className="overflow-x-auto flex-1 max-h-[20rem] p-0">
        <ScrollArea className="overflow-x-auto h-full p-0" type="scroll">
          {raceControlLog && (
            <div className="space-y-2">
              {raceControl ? (
                raceControl.map((msg, idx) => (
                  <div
                    key={`${msg.date}-${idx}`}
                    className="border-none flex flex-col w-full p-0"
                  >
                    <div className="flex flex-row gap-2 rounded">
                      <div
                        className="relative w-full max-w-full my-2 text-gray-400 border-none items-start border-[2px] rounded border-gray-400 flex flex-col px-2 py-1"
                        style={mediumGeist.style}
                      >
                        <div className="pr-2 w-full max-w-full">
                          <p className="text-xs text-gray-200 leading-tight w-full max-w-full whitespace-normal break-words">
                            {msg.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 ">
                          <span className="text-xs text-gray-500">
                            {toLocaleTime(msg.date)}
                          </span>
                          {msg.racing_number && (
                            <span className="text-xs text-gray-400">
                              #{msg.racing_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="min-h-[20rem] justify-center items-center flex"
                  style={mediumGeist.style}
                >
                  <p className="text-xs text-gray-400">No race messages.</p>
                </div>
              )}
            </div>
          )}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
