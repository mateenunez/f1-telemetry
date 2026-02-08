"use client";

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
import TyresList from "./TyresList";
import { useJoke } from "@/hooks/use-joke";
import { JokeDisplay } from "./JokeDisplay";
import { Joke } from "./Joke";

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
  const {
    preferences,
    isEditMode,
    widgets,
    updateWidget,
    updateWidgets,
    isResizing,
  } = usePreferences();
  const isMobile = useIsMobile();
  const GRID_SIZE = 20;
  const minPositionY = 400;
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [maxPositionY, setMaxPositionY] = useState("220vh");

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
    if (
      !widget ||
      canvasSize.width === 0 ||
      canvasSize.height === 0 ||
      isResizing
    )
      return;

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

  useEffect(() => {
    const maxY = Math.max(
      ...widgets.filter((w) => w.enabled).map((w) => w.y + w.height + 10),
    );
    setMaxPositionY(maxY > minPositionY ? `${maxY}px` : minPositionY + "px");
  }, [widgets]);

const { status, setLocation, activeJokes, remove, coords, cancel, finish, sendJoke, canSend, color, setColor } = useJoke(
    telemetryData?.jokes,
  );

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (status !== "selecting-location") return;

    const rect = e.currentTarget.getBoundingClientRect(); // Ver por que usa esto y no canvasSize
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    setLocation(xPct, yPct);
  };

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
      onActivation: (event) => {
        const target = event.event.target as HTMLElement;
        if (target.tagName === "INPUT" || target.closest("button")) {
          return false;
        }
        return true;
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: { distance: 3 },
    }),
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
      <div className="flex flex-col lg:flex-row px-6 py-4 mb-4 gap-4 lg:gap-0 justify-between items-center border-b-2 border-t-0 border-l-0 border-r-0 rounded-none border-gray-800">
        <Skeleton height={60} width={300} />
        <Skeleton height={60} width={300} />
      </div>
    );

    const CanvasSkeleton = () => (
      <div className="w-full h-full">
        <Skeleton width="100%" height="95%" />
      </div>
    );

    return (
      <div className="lg:h-[170vh] h-[120vh] bg-warmBlack px-2">
        <LoaderOverlay />
        <SkeletonTheme baseColor="#151515ff" highlightColor="#444">
          <div className="w-full h-[20vh]">
            <HeaderSkeleton />
            <div className="h-[100vh] w-[100%] lg:h-[150vh]">
              <CanvasSkeleton />
            </div>
          </div>
        </SkeletonTheme>
      </div>
    );
  }

  const visibleWidgets = widgets.filter((w) => w.enabled);

  return (
    <div className="min-h-screen bg-warmBlack">
      <div className="max-w-8xl mx-auto space-y-4 h-full">
        {/* Header */}
        <Header telemetryData={telemetryData} dict={dict} />

        {isMobile ? (
          <DndContext onDragEnd={handleMobileDragEnd} sensors={sensors}>
            <SortableContext items={visibleWidgets.map((w) => w.id)}>
              <div
                className="grid h-full w-full grid-cols-12 gap-8"
                onClick={handleCanvasClick}
              >
                {visibleWidgets.map((w) => {
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
                            (c) => c,
                          )}
                          handlePinnedDriver={handlePinnedDriver}
                          session={session}
                          aboutToBeEliminated={aboutToBeEliminated}
                          fullWidth={w.width >= canvasSize.width * 0.4}
                          isMobile={isMobile}
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
                  if (w.id === "session-audios" && w.enabled) {
                    return (
                      <SortableWidget
                        key={w.id}
                        id={w.id}
                        className="col-span-12 lg:col-span-4"
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
                  if (w.id === "race-control-list" && w.enabled) {
                    return (
                      <SortableWidget
                        key={w.id}
                        id={w.id}
                        className="col-span-12 lg:col-span-4"
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
                  if (w.id === "circle-of-doom" && w.enabled) {
                    return (
                      <SortableWidget
                        key={w.id}
                        id={w.id}
                        className="col-span-12 lg:col-span-4"
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
                  if (w.id === "circle-car-data" && w.enabled) {
                    return (
                      <SortableWidget
                        key={w.id}
                        id={w.id}
                        className="col-span-12 lg:col-span-4"
                      >
                        <CircleCarData
                          carData={
                            pinnedDriver
                              ? telemetryData?.carData.find(
                                  (c) => c.driver_number === pinnedDriver,
                                )
                              : telemetryData?.carData.find(
                                  (c) =>
                                    c.driver_number ===
                                    currentPositions.at(0)?.driver_number,
                                )
                          }
                          driverInfo={driverInfos}
                        />
                      </SortableWidget>
                    );
                  }

                  // 7) Tyres List
                  if (w.id === "tyres-list" && w.enabled) {
                    return (
                      <SortableWidget
                        key={w.id}
                        id={w.id}
                        className="col-span-12 lg:col-span-4"
                      >
                        <TyresList
                          positions={telemetryData?.positions}
                          driverStints={driverStints}
                          driverInfos={driverInfos}
                          totalLaps={session?.current_lap}
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
          <div
            className={`w-full ${
              isEditMode ? "lg:h-[220vh]" : ""
            } welcome-step canvas-container ${status === "selecting-location" ? "cursor-crosshair z-50" : ""}`}
            style={{ height: !isEditMode ? maxPositionY : undefined }}
            onClick={handleCanvasClick}
          >
            <DndContext
              modifiers={isEditMode ? [snapToGrid] : []}
              onDragEnd={isEditMode ? handleDragEnd : undefined}
              sensors={sensors}
            >
              <div
                className="relative w-full h-full"
                style={gridStyle}
                ref={canvasRef}
              >
                <Joke
                  dict={dict}
                  status={status}
                  coords={coords}
                  cancel={cancel}
                  finish={finish}
                  sendJoke={sendJoke}
                  canSend={canSend}
                  color={color}
                  setColor={setColor}
                />
                <div className="absolute inset-0 z-50 pointer-events-none">
                  {activeJokes.map((joke) => (
                    <JokeDisplay
                      key={joke.id}
                      joke={joke}
                      canvasWidth={canvasSize.width}
                      canvasHeight={canvasSize.height}
                    />
                  ))}
                </div>
                {visibleWidgets.map((w) => {
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
                            (c) => c,
                          )}
                          handlePinnedDriver={handlePinnedDriver}
                          session={session}
                          aboutToBeEliminated={aboutToBeEliminated}
                          fullWidth={w.width >= canvasSize.width * 0.4}
                          isMobile={isMobile}
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
                                  (c) => c.driver_number === pinnedDriver,
                                )
                              : telemetryData?.carData.find(
                                  (c) =>
                                    c.driver_number ===
                                    currentPositions.at(0)?.driver_number,
                                )
                          }
                          driverInfo={driverInfos}
                        />
                      </DraggableWidget>
                    );
                  }

                  if (w.id === "tyres-list" && w.enabled) {
                    return (
                      <DraggableWidget
                        key={w.id}
                        widget={w}
                        isEditMode={isEditMode}
                        updateWidget={updateWidget}
                      >
                        <TyresList
                          positions={telemetryData?.positions}
                          driverStints={driverStints}
                          driverInfos={driverInfos}
                          totalLaps={session?.total_laps}
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
