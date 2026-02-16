"use client";
import Navigation from "../Navigation";
import { config } from "@/lib/config";
import DriverPositions from "../telemetry/DriverPositions";
import { useIsMobile } from "@/hooks/use-mobile";
import Tyres from "../telemetry/Tyres";
import { getCompoundSvg } from "@/hooks/use-telemetry";
import Pits from "../telemetry/Pits";
import CircleOfDoom from "../telemetry/CircleOfDoom";
import { mockData } from "@/lib/mocks/mockData";
import { mockKnockedOut } from "@/lib/mocks/mockKnockedOut";
import Map from "../telemetry/Map";
import { mockCircleOfDoom } from "@/lib/mocks/mockCircleOfDoom";

interface HelpContentProps {
  dict: any;
}

export function HelpContent({ dict }: HelpContentProps) {
  const f1t = config.public.assets.f1t;
  const isMobile = useIsMobile();

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
            <h1 className="text-2xl font-orbitron">{dict.help.title}</h1>
            <p className="text-gray-300 font-geist">{dict.help.description}</p>
          </div>

          {/* Positions */}
          <div className="flex flex-col gap-2 py-4">
            <h1 className="text-2xl font-orbitron">Drivers positions</h1>
            <p className="text-gray-300 font-geist">
              The driver positions leaderboard shows the current telemetrics of
              each driver.
            </p>
            <div className="w-full">
              <DriverPositions
                positions={mockData.positions}
                driverInfos={mockData.driver_infos}
                driverTimings={mockData.driver_timings}
                driverTimingStats={mockData.timing_timings_stats}
                driverCarData={mockData.driver_car_data}
                driverStints={mockData.driver_stints}
                lastCapture={undefined}
                session={mockData.session[0]}
                aboutToBeEliminated={[]}
                isMobile={isMobile}
                fullWidth={true}
              />
            </div>
            <p className="text-gray-300 font-geist">
              When a driver is knocked out, it will be displayed with less
              opacity.
            </p>
            <div className="w-full">
              <DriverPositions
                positions={mockData.positions}
                driverInfos={mockData.driver_infos}
                driverTimings={mockKnockedOut.driver_timings}
                driverTimingStats={mockData.timing_timings_stats}
                driverCarData={mockData.driver_car_data}
                driverStints={mockData.driver_stints}
                lastCapture={undefined}
                session={mockData.session[0]}
                aboutToBeEliminated={[]}
                isMobile={isMobile}
                fullWidth={true}
              />
            </div>
            <p className="text-gray-300 font-geist">
              When a driver is about to be eliminated, it will be displayed with
              a red background.
            </p>
            <div className="w-full">
              <DriverPositions
                positions={mockData.positions}
                driverInfos={mockData.driver_infos}
                driverTimings={mockData.driver_timings}
                driverTimingStats={mockData.timing_timings_stats}
                driverCarData={mockData.driver_car_data}
                driverStints={mockData.driver_stints}
                lastCapture={undefined}
                session={mockData.session[0]}
                aboutToBeEliminated={[43]}
                isMobile={isMobile}
                fullWidth={true}
              />
            </div>
          </div>

          {/* Tyres */}
          <div className="flex flex-col gap-2 py-4">
            <h1 className="text-2xl font-orbitron">Compounds</h1>
            <div className="text-gray-300 font-geist flex flex-row">
              The tyres compounds are displayed with the age below. In this case
              the compund has been used 12 laps
              <Tyres driverStints={mockData.driver_stints[0]} />
            </div>

            <div className="flex flex-row w-full gap-6 justify-start items-center">
              <p className="text-gray-300 font-geist">
                Here are all compounds icons:
              </p>
              <div>{getCompoundSvg("HARD", 5, 35)} Hard</div>
              <div>{getCompoundSvg("MEDIUM", 5, 35)} Medium</div>
              <div>{getCompoundSvg("SOFT", 5, 35)} Soft</div>
              <div>{getCompoundSvg("INTERMEDIATE", 5, 35)} Intermediate</div>
              <div>{getCompoundSvg("WET", 5, 35)} Wet</div>
              <div>{getCompoundSvg("jijo", 5, 35)} Unknown</div>
            </div>
          </div>

          {/* Pits */}
          <div className="flex flex-col gap-2 py-4">
            <h1 className="text-2xl font-orbitron">Pit stops</h1>
            <div className="text-gray-300 font-geist flex flex-row gap-1">
              We display the drivers pits stops compounds and the quantity of
              pits stops they have done. In this case the driver has done 2 pit
              stops, using medium and soft compounds.
            </div>
            <Pits
              driverStints={mockData.driver_stints[0]}
              timing={mockData.driver_timings[0]}
            />

            <p className="text-gray-300 font-geist">
              If the driver is in the pitlane it will be displayed like
            </p>
            <Pits
              driverStints={mockData.driver_stints[0]}
              timing={mockKnockedOut.driver_timings[0]}
            />
          </div>

          {/* Colors */}
          <div className="flex flex-col gap-2 py-4">
            <h1 className="text-2xl font-orbitron">Colors</h1>
            <p className="text-gray-300 font-geist">
              We follow the official Formula 1 color standard for telemetrics.
            </p>
            <div className="flex flex-row gap-1">
              <p className="text-f1Yellow">Yellow</p>
              <p>for slower than personal best time</p>
            </div>
            <div className="flex flex-row gap-1">
              <p className="text-f1Green">Green</p>
              <p>for personal best time</p>
            </div>
            <div className="flex flex-row gap-1">
              <p className="text-f1Purple">Purple</p>
              <p>for overall best time</p>
            </div>
            <div className="flex flex-row gap-1">
              <p className="text-f1Blue">Blue</p>
              <p>for drivers in pit lane</p>
            </div>
          </div>

          {/* Map */}
          <div className="flex flex-col gap-2 py-4">
            <h1 className="text-2xl font-orbitron">Map</h1>
            <p className="text-gray-300 font-geist">
              The map is updated in real-time and shows the drivers' positions
              relative to each other. The map will have yellow sectors on
              incidents or safety car, and red sectors on red flag.
            </p>
            <div className="flex justify-start items-center justify-between">
              <Map
                positions={mockData.positions}
                drivers={mockData.driver_infos}
                timing={mockData.driver_timings}
                circuitKey={63}
                yellowSectors={new Set<number>()}
                redFlag={false}
                safetyCar={false}
              />
              <Map
                positions={mockData.positions}
                drivers={mockData.driver_infos}
                timing={mockData.driver_timings}
                circuitKey={63}
                yellowSectors={new Set<number>()}
                redFlag={false}
                safetyCar={true}
              />
              <Map
                positions={mockData.positions}
                drivers={mockData.driver_infos}
                timing={mockData.driver_timings}
                circuitKey={63}
                yellowSectors={new Set<number>()}
                redFlag={true}
                safetyCar={false}
              />
            </div>
            <p className="text-gray-300 font-geist">
              Also, you can set the preference to display the three sectors in
              the preferences panel.
            </p>
          </div>

          {/* Circle of Doom */}
          <div className="flex flex-col gap-2 py-4">
            <h1 className="text-2xl font-orbitron">Circle of Doom</h1>
            <p className="text-gray-300 font-geist">
              The Circle of Doom shows the difference in seconds between the
              drivers, its usefull to see where a driver will fall if it goes
              into the pitlane. In this case, if the driver COLAPINTO goes into
              the pitlane he will fall near STROLL. The PIT mark is pink and has more grossor.
            </p>
            <div className="w-full flex justify-center items-center">
              <div className="w-[15rem] pt-4">
                <CircleOfDoom
                  currentPositions={mockCircleOfDoom.currentPositions}
                  timings={mockCircleOfDoom.timings}
                  driverInfos={mockCircleOfDoom.driverInfos}
                  refDriver={43}
                />
              </div>
            </div>
          </div>

          {/* Car Data  */}
          <div className="flex flex-col gap-2 py-4">
            <h1 className="text-2xl font-orbitron">Circle of Car Data</h1>
            <p className="text-gray-300 font-geist">
              The Circle of Car Data shows the car data for each driver in a
              circular format. It displays the current speed, throttle, brake,
              gear, and rpm.
            </p>
          </div>

          {/* Compound history */}
          <div className="flex flex-col gap-2 py-4">
            <h1 className="text-2xl font-orbitron">Compound history</h1>
            <p className="text-gray-300 font-geist">
              The compound history shows the history of the compounds used by
              each driver. It displays the compounds used in each stint and the
              age of the compounds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
