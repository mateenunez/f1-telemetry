import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ProcessedDriver, ProcessedRaceControl } from "@/processors";
import { toLocaleTime } from "@/utils/calendar";
import { usePreferences } from "@/context/preferences";
interface RaceControlListProps {
  raceControl: ProcessedRaceControl[] | undefined;
  driverInfos?: (ProcessedDriver | undefined)[];
}

export default function RaceControlList({
  raceControl,
  driverInfos,
}: RaceControlListProps) {
  const { preferences } = usePreferences();
  const raceControlLog = preferences.raceControlLog;

  const getMessageStyle = (msg: ProcessedRaceControl) => {
    if (!msg.racing_number || !driverInfos) return {};

    const racingNumber = parseInt(msg.racing_number, 10);
    if (isNaN(racingNumber)) return {};

    const driver = driverInfos.find((d) => d?.driver_number === racingNumber);
    if (!driver) return {};

    const isFavorite = preferences.favoriteDrivers.some(
      (fav) => fav.driver_number === driver.driver_number
    );

    if (!isFavorite) return {};

    return {
      backgroundColor: `#${driver.team_colour}30`,
      borderColor: `#${driver.team_colour}60`,
    };
  };

  return (
    <Card className="flex w-full h-full bg-warmBlack border-none">
      <CardContent className="overflow-x-auto flex-1 h-full w-full px-6 py-4">
        <ScrollArea className="overflow-x-auto h-full p-0" type="scroll">
          {raceControlLog && (
            <div className="space-y-2">
              {raceControl && raceControl?.length > 0 ? (
                raceControl.map((msg, idx) => {
                  const messageStyle = getMessageStyle(msg);
                  return (
                    <div
                      key={`${msg.date}-${idx}`}
                      className="border-none flex flex-col w-full p-0"
                    >
                      <div className="flex flex-row gap-2 rounded">
                        <div
                          className="relative w-full max-w-full my-2 font-geist font-medium text-gray-400 border-none items-start border-[2px] rounded border-gray-400 flex flex-col px-2 py-1"
                          style={{ ...messageStyle }}
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
                  );
                })
              ) : (
                <div className="min-h-[20rem] justify-center items-center flex font-geist font-medium">
                  <p className="text-xs text-gray-400">
                    {preferences.translate
                      ? "Sin mensajes de carrera."
                      : "No race messages."}
                  </p>
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
