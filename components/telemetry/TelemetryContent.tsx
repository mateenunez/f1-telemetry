"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Header from "@/components/Header";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DriverPositions from "@/components/telemetry/DriverPositions";
import MapAndMessages from "@/components/telemetry/MapAndMessages";
import { useTelemetryManager } from "@/hooks/use-telemetry";
import SessionAudios from "@/components/telemetry/SessionAudios";
import RaceControlList from "@/components/telemetry/RaceControlList";
import CircleOfDoom from "@/components/telemetry/CircleOfDoom";
import { Widget, WidgetId, usePreferences } from "@/context/preferences";
import { CircleCarData } from "@/components/telemetry/CircleCarData";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTour } from "@reactour/tour";
import { Countdown } from "../calendar/Countdown";
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createSnapModifier } from "@dnd-kit/modifiers";
import { useIsMobile } from "@/hooks/use-mobile";
import DraggableWidget from "@/components/telemetry/DraggableWidget";
import SortableWidget from "@/components/telemetry/SortableWidget";

interface TelemetryContentProps {
  dict: any;
}

export function TelemetryContent({ dict }: TelemetryContentProps) {
  const {
    telemetryData,
    loading,
    driverInfos,
    driverCarData,
    driverTimings,
    driverStints,
    driverTimingStats,
    teamRadioCaptures,
    currentPositions,
    yellowSectors,
    pinnedDriver,
    handlePinnedDriver,
    delayed,
    deltaDelay,
    aboutToBeEliminated,
  } = useTelemetryManager();
  const { setIsOpen } = useTour();
  const { preferences, isEditMode, widgets, updateWidget, updateWidgets } =
    usePreferences();
  const isMobile = useIsMobile();
  const GRID_SIZE = 20;
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const snapToGrid = createSnapModifier(GRID_SIZE);
  const gridStyle = isEditMode
    ? {
        backgroundImage: `
        linear-gradient(to right, rgba(255, 255, 255, 0.23) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.23) 1px, transparent 1px)
      `,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        backgroundColor: "#050505",
      }
    : {};

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const widgetId = active.id as WidgetId;
    const widget = widgets.find((w) => w.id === widgetId);
    if (!widget || canvasSize.width === 0 || canvasSize.height === 0) return;

    let newX = widget.x + delta.x;
    let newY = widget.y + delta.y;
    const maxX = canvasSize.width - widget.width - 2;
    const maxY = canvasSize.height - widget.height;

    newX = Math.max(0, Math.min(maxX, newX));
    newY = Math.max(0, Math.min(maxY, newY));

    updateWidget(widgetId, {
      x: newX,
      y: newY,
    });
  };

  const handleMobileDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as WidgetId;
    const overId = over.id as WidgetId;

    const currentIds = widgets.map((w) => w.id);
    const oldIndex = currentIds.indexOf(activeId);
    const newIndex = currentIds.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(currentIds, oldIndex, newIndex);
    const newWidgets = reordered.map((id) => widgets.find((w) => w.id === id)!);
    updateWidgets(newWidgets);
  };

  useEffect(() => {
    if (!preferences.hasSeenTour && !loading && !delayed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [preferences.hasSeenTour, loading, delayed, setIsOpen]);

  useLayoutEffect(() => {
    if (!canvasRef.current) return;

    const updateSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        });
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(canvasRef.current);

    return () => resizeObserver.disconnect();
  }, [loading]);

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(MouseSensor)
  );

  const secondsDelay = (deltaDelay * -1) / 1000;
  const session = telemetryData?.session;

  if (loading || delayed) {
    const LoaderOverlay = () => (
      <div className="fixed inset-0 z-20 flex items-center justify-center bg-warmBlack/40 backdrop-blur-sm">
        {delayed ? (
          <Countdown totalSeconds={Math.max(secondsDelay, 0)} dict={dict} />
        ) : (
          <span className="text-white text-xl text-center font-geist">
            {dict.loading}
          </span>
        )}
      </div>
    );

    const HeaderSkeleton = () => (
      <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center w-full px-6 py-4 mb-4">
        <Skeleton height={60} width={450} />
        <Skeleton height={60} width={300} />
      </div>
    );

    const PositionsSkeletonList = () => (
      <Card className="lg:col-span-5 bg-warmBlack1 border-none max-h-screen px-2">
        <CardContent className="overflow-x-auto flex-1 max-h-[90vh] h-full p-0">
          <div className="space-y-2">
            {Array.from({ length: 20 }).map((_, idx) => (
              <Skeleton key={idx} height={60} width="100%" />
            ))}
          </div>
        </CardContent>
      </Card>
    );

    const MapAndRaceSkeleton = () => (
      <Card className="lg:col-span-5 bg-warmBlack1 border-none flex flex-col p-0 m-0">
        <CardHeader className="pb-6 flex flex-row items-center justify-between">
          <Skeleton height={50} width={200} />
          <Skeleton height={50} width={120} />
        </CardHeader>
        <CardContent className="flex flex-col justify-center h-full">
          <div className="overflow-hidden h-fit">
            <Skeleton height={400} width="100%" />
          </div>
        </CardContent>
      </Card>
    );

    const CardsRowSkeleton = () => (
      <div className="flex flex-col md:flex-row gap-8 md:px-0 py-[2rem] md:mx-[1rem] md:justify-around items-center ">
        <div className="flex flex-col md:flex-row gap-[3rem]">
          {Array.from({ length: 2 }).map((_, idx) => (
            <Skeleton key={idx} className="gap-2" width={320} height={250} />
          ))}
        </div>
        <Skeleton circle height={280} width={280} />
        <Skeleton circle height={280} width={280} />
      </div>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-warmBlack to-warmBlack2 px-2">
        <LoaderOverlay />
        <div className="max-w-8xl mx-auto space-y-4 h-full">
          <SkeletonTheme baseColor="#151515ff" highlightColor="#444">
            <HeaderSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 pb-4">
              <PositionsSkeletonList />
              <MapAndRaceSkeleton />
            </div>
            <CardsRowSkeleton />
          </SkeletonTheme>
        </div>
      </div>
    );
  }

  console.log(widgets)

  return (
    <div className="min-h-screen bg-warmBlack">
      <div className="max-w-8xl mx-auto space-y-4 h-full">
        {/* Header */}
        <Header telemetryData={telemetryData} dict={dict} />

        {isMobile ? (
          <DndContext onDragEnd={handleMobileDragEnd} sensors={sensors}>
            <SortableContext items={widgets}>
              <div className="grid h-full w-full grid-cols-12 gap-8">
                {widgets.map((w) => {
                  // 1) Posiciones
                  if (w.id === "driver-positions") {
                    return (
                      <SortableWidget
                        key={w.id}
                        id={w.id}
                        className="col-span-12 lg:col-span-5"
                      >
                        <DriverPositions
                          positions={currentPositions}
                          driverInfos={driverInfos}
                          driverTimings={driverTimings}
                          driverTimingStats={driverTimingStats}
                          driverCarData={driverCarData}
                          driverStints={driverStints}
                          lastCapture={teamRadioCaptures?.captures.findLast(
                            (c) => c
                          )}
                          handlePinnedDriver={handlePinnedDriver}
                          session={session}
                          aboutToBeEliminated={aboutToBeEliminated}
                        />
                      </SortableWidget>
                    );
                  }

                  // 2) Mapa + mensajes
                  if (w.id === "map-and-messages") {
                    return (
                      <SortableWidget
                        key={w.id}
                        id={w.id}
                        className="col-span-12 lg:col-span-7"
                      >
                        <MapAndMessages
                          telemetryData={telemetryData}
                          session={session}
                          yellowSectors={yellowSectors}
                        />
                      </SortableWidget>
                    );
                  }

                  // 3) Audios sesión
                  if (
                    w.id === "session-audios" &&
                    preferences.audioLog.enabled
                  ) {
                    return (
                      <SortableWidget
                        key={w.id}
                        id={w.id}
                        className="col-span-12 md:col-span-6 lg:col-span-4"
                      >
                        <SessionAudios
                          teamRadio={teamRadioCaptures}
                          drivers={driverInfos}
                          session={session}
                          driverInfos={telemetryData?.drivers}
                        />
                      </SortableWidget>
                    );
                  }

                  // 4) Race control
                  if (
                    w.id === "race-control-list" &&
                    preferences.raceControlLog.enabled
                  ) {
                    return (
                      <SortableWidget
                        key={w.id}
                        id={w.id}
                        className="col-span-12 md:col-span-6 lg:col-span-4"
                      >
                        <RaceControlList
                          raceControl={
                            preferences.translate
                              ? telemetryData?.raceControlEs
                              : telemetryData?.raceControl
                          }
                          driverInfos={telemetryData?.drivers}
                        />
                      </SortableWidget>
                    );
                  }

                  // 5) Circle of Doom
                  if (
                    w.id === "circle-of-doom" &&
                    preferences.circleOfDoom.enabled
                  ) {
                    return (
                      <SortableWidget
                        key={w.id}
                        id={w.id}
                        className="col-span-12 md:col-span-6 lg:col-span-4"
                      >
                        <CircleOfDoom
                          driverInfos={driverInfos}
                          timings={driverTimings}
                          currentPositions={currentPositions}
                          refDriver={
                            pinnedDriver
                              ? pinnedDriver
                              : currentPositions.at(0)?.driver_number
                          }
                        />
                      </SortableWidget>
                    );
                  }

                  // 6) Circle Car Data
                  if (
                    w.id === "circle-car-data" &&
                    preferences.circleCarData.enabled
                  ) {
                    return (
                      <SortableWidget
                        key={w.id}
                        id={w.id}
                        className="col-span-12 md:col-span-6 lg:col-span-4"
                      >
                        <CircleCarData
                          carData={
                            pinnedDriver
                              ? telemetryData?.carData.find(
                                  (c) => c.driver_number === pinnedDriver
                                )
                              : telemetryData?.carData.find(
                                  (c) =>
                                    c.driver_number ===
                                    currentPositions.at(0)?.driver_number
                                )
                          }
                          driverInfo={driverInfos}
                        />
                      </SortableWidget>
                    );
                  }

                  return null;
                })}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="w-full lg:h-[150vh]">
            <DndContext
              modifiers={isEditMode ? [snapToGrid] : []}
              onDragEnd={isEditMode ? handleDragEnd : undefined}
            >
              <div
                className="relative w-full h-full"
                style={gridStyle}
                ref={canvasRef}
              >
                {widgets.map((w) => {
                  if (w.id === "driver-positions") {
                    return (
                      <DraggableWidget
                        key={w.id}
                        widget={w}
                        isEditMode={isEditMode}
                        updateWidget={updateWidget}
                      >
                        <DriverPositions
                          positions={currentPositions}
                          driverInfos={driverInfos}
                          driverTimings={driverTimings}
                          driverTimingStats={driverTimingStats}
                          driverCarData={driverCarData}
                          driverStints={driverStints}
                          lastCapture={teamRadioCaptures?.captures.findLast(
                            (c) => c
                          )}
                          handlePinnedDriver={handlePinnedDriver}
                          session={session}
                          aboutToBeEliminated={aboutToBeEliminated}
                        />
                      </DraggableWidget>
                    );
                  }

                  if (w.id === "map-and-messages") {
                    return (
                      <DraggableWidget
                        key={w.id}
                        widget={w}
                        isEditMode={isEditMode}
                        updateWidget={updateWidget}
                      >
                        <MapAndMessages
                          telemetryData={telemetryData}
                          session={session}
                          yellowSectors={yellowSectors}
                        />
                      </DraggableWidget>
                    );
                  }

                  if (w.id === "session-audios" && w.enabled) {
                    return (
                      <DraggableWidget
                        key={w.id}
                        widget={w}
                        isEditMode={isEditMode}
                        updateWidget={updateWidget}
                      >
                        <SessionAudios
                          teamRadio={teamRadioCaptures}
                          drivers={driverInfos}
                          session={session}
                          driverInfos={telemetryData?.drivers}
                        />
                      </DraggableWidget>
                    );
                  }

                  if (w.id === "race-control-list" && w.enabled) {
                    return (
                      <DraggableWidget
                        key={w.id}
                        widget={w}
                        isEditMode={isEditMode}
                        updateWidget={updateWidget}
                      >
                        <RaceControlList
                          raceControl={
                            preferences.translate
                              ? telemetryData?.raceControlEs
                              : telemetryData?.raceControl
                          }
                          driverInfos={telemetryData?.drivers}
                        />
                      </DraggableWidget>
                    );
                  }

                  if (w.id === "circle-of-doom" && w.enabled) {
                    return (
                      <DraggableWidget
                        key={w.id}
                        widget={w}
                        isEditMode={isEditMode}
                        updateWidget={updateWidget}
                      >
                        <CircleOfDoom
                          driverInfos={driverInfos}
                          timings={driverTimings}
                          currentPositions={currentPositions}
                          refDriver={
                            pinnedDriver
                              ? pinnedDriver
                              : currentPositions.at(0)?.driver_number
                          }
                        />
                      </DraggableWidget>
                    );
                  }

                  if (w.id === "circle-car-data" && w.enabled) {
                    return (
                      <DraggableWidget
                        key={w.id}
                        widget={w}
                        isEditMode={isEditMode}
                        updateWidget={updateWidget}
                      >
                        <CircleCarData
                          carData={
                            pinnedDriver
                              ? telemetryData?.carData.find(
                                  (c) => c.driver_number === pinnedDriver
                                )
                              : telemetryData?.carData.find(
                                  (c) =>
                                    c.driver_number ===
                                    currentPositions.at(0)?.driver_number
                                )
                          }
                          driverInfo={driverInfos}
                        />
                      </DraggableWidget>
                    );
                  }
                  return null;
                })}
              </div>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
}
