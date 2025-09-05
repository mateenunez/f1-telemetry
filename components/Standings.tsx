import type { StandingsResponse } from "../utils/calendar";

interface StandingsProps {
  standingsResponse: StandingsResponse | null;
}

export default function Standings({ standingsResponse }: StandingsProps) {
  const driverStandings =
    standingsResponse?.MRData.StandingsTable.StandingsLists[0]
      .DriverStandings || null;
  const constructorStandings =
    standingsResponse?.MRData.StandingsTable.StandingsLists[0]
      .ConstructorStandings || null;

  return (
    <div className="overflow-x-auto grid cols-2">
      <table className="min-w-full bg-warmBlack1 rounded-lg border border-gray-800">
        <thead>
          <tr className="bg-warmBlack2 text-white text-sm font-regular">
            <th className="py-2 px-4 text-left">Pos</th>
            <th className="py-2 px-4 text-left">
              {driverStandings ? "Driver" : "Constructor"}
            </th>
            <th className="py-2 px-4 text-right">Points</th>
          </tr>
        </thead>
        <tbody>
          {driverStandings &&
            driverStandings.map((standing) => (
              <tr
                key={
                  standing.Driver
                    ? standing.Driver.driverId
                    : standing.Constructors[0].constructorId
                }
                className="border-b border-gray-700 hover:bg-warmBlack transition"
              >
                <td className="py-2 px-4 text-white">{standing.position}</td>
                <td className="py-2 px-4 text-white">
                  <span className="flex flex-row gap-2 align-center items-center">
                    {" "}
                    <img
                      src={
                        standing.Constructors[0].name == "Sauber"
                          ? "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000000/common/f1/2025/kicksauber/2025kicksauberlogowhite.webp"
                          : standing.Constructors[0].name == "Red Bull"
                          ? "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000000/common/f1/2025/redbullracing/2025redbullracinglogowhite.webp"
                          : standing.Constructors[0].name == "Aston Martin"
                          ? "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000000/common/f1/2025/astonmartin/2025astonmartinlogowhite.webp"
                          : `https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000000/common/f1/2025/${standing.Constructors[0].constructorId}/2025${standing.Constructors[0].constructorId}logowhite.webp`
                      }
                    />
                    {standing.Driver.givenName} {standing.Driver.familyName}
                  </span>
                  {/* {standing.Constructors.map((c) => c.name).join(", ")} */}
                </td>
                <td className="py-2 px-4 text-right text-white">
                  {standing.points}
                </td>
              </tr>
            ))}
          {constructorStandings &&
            constructorStandings.map((standing) => (
              <tr
                key={standing.Constructor.constructorId}
                className="border-b border-gray-700 hover:bg-warmBlack transition"
              >
                <td className="py-2 px-4 text-white">{standing.position}</td>
                <td className="py-2 px-4 text-white ">
                  <span className="flex flex-row gap-2 align-center items-center">
                    {" "}
                    <img
                      src={
                        standing.Constructor.name == "Sauber"
                          ? "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000000/common/f1/2025/kicksauber/2025kicksauberlogowhite.webp"
                          : standing.Constructor.name == "Red Bull"
                          ? "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000000/common/f1/2025/redbullracing/2025redbullracinglogowhite.webp"
                          : standing.Constructor.name == "Aston Martin"
                          ? "https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000000/common/f1/2025/astonmartin/2025astonmartinlogowhite.webp"
                          : `https://media.formula1.com/image/upload/c_lfill,w_48/q_auto/v1740000000/common/f1/2025/${standing.Constructor.constructorId}/2025${standing.Constructor.constructorId}logowhite.webp`
                      }
                      width={30}
                    />
                    {standing.Constructor.name}
                  </span>
                </td>
                <td className="py-2 px-4 text-right text-white">
                  {standing.points}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
