// @ts-nocheck
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
import { CircleCarData } from "../telemetry/CircleCarData";
import { useEffect, useState } from "react";

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
            <h1 className="text-2xl font-orbitron">
              {dict.help.drivers.title}
            </h1>
            <p className="text-gray-300 font-geist">
              {dict.help.drivers.description}
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
                translate={dict.locale === "es"}
                audioEnabled={false}
                driverHeadshot={false}
                handlePinnedDriver={() => {}}
              />
            </div>
            <p className="text-gray-300 font-geist">
              {dict.help.drivers.knocked_out}
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
                translate={dict.locale === "es"}
                audioEnabled={false}
                driverHeadshot={false}
                handlePinnedDriver={() => {}}
              />
            </div>
            <p className="text-gray-300 font-geist">
              {dict.help.drivers.elimination}
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
                translate={dict.locale === "es"}
                audioEnabled={false}
                driverHeadshot={false}
                handlePinnedDriver={() => {}}
              />
            </div>
          </div>

          {/* Tyres */}
          <div className="flex flex-col gap-2 py-4">
            <h1 className="text-2xl font-orbitron">
              {dict.help.compounds.title}
            </h1>
            <div className="text-gray-300 font-geist flex flex-row">
              {dict.help.compounds.description}
              <Tyres driverStints={mockData.driver_stints[0]} />
            </div>

            <div className="flex flex-row w-full gap-6 justify-start items-center">
              <p className="text-gray-300 font-geist">
                {dict.help.compounds.icons_label}
              </p>
              <div>
                {getCompoundSvg("HARD", 5, 35)} {dict.help.compounds.types.hard}
              </div>
              <div>
                {getCompoundSvg("MEDIUM", 5, 35)}{" "}
                {dict.help.compounds.types.medium}
              </div>
              <div>
                {getCompoundSvg("SOFT", 5, 35)} {dict.help.compounds.types.soft}
              </div>
              <div>
                {getCompoundSvg("INTERMEDIATE", 5, 35)}{" "}
                {dict.help.compounds.types.intermediate}
              </div>
              <div>
                {getCompoundSvg("WET", 5, 35)} {dict.help.compounds.types.wet}
              </div>
              <div>
                {getCompoundSvg("jijo", 5, 35)}{" "}
                {dict.help.compounds.types.unknown}
              </div>
            </div>
          </div>

          {/* Pits */}
          <div className="flex flex-col gap-2 py-4">
            <h1 className="text-2xl font-orbitron">{dict.help.pits.title}</h1>
            <div className="text-gray-300 font-geist flex flex-row gap-1">
              {dict.help.pits.description}
            </div>
            <Pits
              driverStints={mockData.driver_stints[0]}
              timing={mockData.driver_timings[0]}
            />

            <p className="text-gray-300 font-geist">
              {dict.help.pits.pitlane_label}
            </p>
            <Pits
              driverStints={mockData.driver_stints[0]}
              timing={mockKnockedOut.driver_timings[0]}
            />
          </div>

          {/* Colors */}
          <div className="flex flex-col gap-2 py-4">
            <h1 className="text-2xl font-orbitron">{dict.help.colors.title}</h1>
            <p className="text-gray-300 font-geist">
              {dict.help.colors.description}{" "}
            </p>
            <div className="flex flex-row gap-1">
              <p className="text-f1Yellow">{dict.help.colors.color.yellow}</p>
              <p>{dict.help.colors.yellow}</p>
            </div>
            <div className="flex flex-row gap-1">
              <p className="text-f1Green">{dict.help.colors.color.green}</p>
              <p>{dict.help.colors.green}</p>
            </div>
            <div className="flex flex-row gap-1">
              <p className="text-f1Purple">{dict.help.colors.color.purple}</p>
              <p>{dict.help.colors.purple}</p>
            </div>
            <div className="flex flex-row gap-1">
              <p className="text-f1Blue">{dict.help.colors.color.blue}</p>
              <p>{dict.help.colors.blue}</p>
            </div>
          </div>

          {/* Map */}
          <div className="flex flex-col gap-2 py-4">
            <h1 className="text-2xl font-orbitron">{dict.help.map.title}</h1>
            <p className="text-gray-300 font-geist">
              {dict.help.map.description}
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
            <p className="text-gray-300 font-geist">{dict.help.map.footer}</p>
          </div>

          {/* Circle of Doom */}
          <div className="flex flex-col gap-2 py-4">
            <h1 className="text-2xl font-orbitron">{dict.help.doom.title}</h1>
            <p className="text-gray-300 font-geist">
              {dict.help.doom.description}
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
            <h1 className="text-2xl font-orbitron">
              {dict.help.car_data.title}
            </h1>
            <p className="text-gray-300 font-geist">
              {dict.help.car_data.description}
            </p>

            <div className="w-full flex justify-center items-center">
              <div className="w-[15rem] pt-4">
                <CircleCarData
                  driverInfo={mockData.driver_infos}
                  carData={mockData.driver_car_data[0]}
                  translate={dict.locale === "es"}
                />
              </div>
            </div>
          </div>

          {/* Compound history */}
        </div>
      </div>
    </div>
  );
}
