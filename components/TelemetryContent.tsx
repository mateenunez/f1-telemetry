"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Header from "@/components/Header";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DriverPositions from "@/components/DriverPositions";
import MapAndMessages from "@/components/MapAndMessages";
import { useTelemetryManager } from "@/hooks/use-telemetry";
import SessionAudios from "@/components/SessionAudios";
import RaceControlList from "@/components/RaceControlList";
import CircleOfDoom from "@/components/CircleOfDoom";
import { Widget, WidgetId, usePreferences } from "@/context/preferences";
import { CircleCarData } from "@/components/CircleCarData";
import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTour } from "@reactour/tour";
import { Countdown } from "./Countdown";
import {
  DndContext,
  useDraggable,
  DragEndEvent,
  useSensor,
  useSensors,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { createSnapModifier } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TelemetryContentProps {
  dict: any;
}

function DraggableWidget({
  widget,
  children,
  isEditMode,
  updateWidget,
}: {
  widget: Widget;
  children: React.ReactNode;
  isEditMode: boolean;
  updateWidget: (id: WidgetId, updates: Partial<Widget>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: widget.id,
    disabled: !isEditMode,
  });

  const handleResize = useCallback(
    (
      e: React.SyntheticEvent,
      data: { size: { width: number; height: number } }
    ) => {
      updateWidget(widget.id, {
        width: data.size.width,
        height: data.size.height,
      });
    },
    [widget.id, updateWidget]
  );

  const style = {
    position: "absolute" as const,
    left: widget.x,
    top: widget.y,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    cursor: isEditMode ? "grab" : "default",
  };

  // Si no está en edit mode, renderizar sin Resizable
  if (!isEditMode) {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          width: widget.width,
          height: widget.height,
        }}
        {...attributes}
      >
        {children}
      </div>
    );
  }

  // En edit mode, usar Resizable
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative"
    >
      {isEditMode &&
        widget.id !== "driver-positions" &&
        widget.id !== "map-and-messages" && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateWidget(widget.id, { enabled: false });
            }}
            onMouseDownCapture={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateWidget(widget.id, { enabled: false });
            }}
            className="absolute -top-0 -right-0 z-[9999] text-gray-400 hover:text-f1Red p-2 shadow-lg transition-colors pointer-events-auto w-[2rem] text-md"
          >
            <X size={18} />
          </button>
        )}

      {/* Widget redimensionable */}
      <Resizable
        width={widget.width}
        height={widget.height}
        onResize={handleResize}
        minConstraints={[100, 100]} // Tamaño mínimo
        maxConstraints={[Infinity, Infinity]}
        handle={
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-f1Blue/60 hover:bg-f1Blue border border-white/50 cursor-se-resize"
            style={{
              zIndex: 1000,
            }}
          />
        }
        resizeHandles={["se"]} // Solo esquina inferior derecha, o puedes usar ["n", "s", "e", "w"] para laterales
      >
        <div
          style={{
            width: widget.width,
            height: widget.height,
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </Resizable>
    </div>
  );
}

function SortableItem({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.8 : 1,
    cursor: "grab",
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
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
                      <SortableItem
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
                      </SortableItem>
                    );
                  }

                  // 2) Mapa + mensajes
                  if (w.id === "map-and-messages") {
                    return (
                      <SortableItem
                        key={w.id}
                        id={w.id}
                        className="col-span-12 lg:col-span-7"
                      >
                        <MapAndMessages
                          telemetryData={telemetryData}
                          session={session}
                          yellowSectors={yellowSectors}
                        />
                      </SortableItem>
                    );
                  }

                  // 3) Audios sesión
                  if (
                    w.id === "session-audios" &&
                    preferences.audioLog.enabled
                  ) {
                    return (
                      <SortableItem
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
                      </SortableItem>
                    );
                  }

                  // 4) Race control
                  if (
                    w.id === "race-control-list" &&
                    preferences.raceControlLog.enabled
                  ) {
                    return (
                      <SortableItem
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
                      </SortableItem>
                    );
                  }

                  // 5) Circle of Doom
                  if (
                    w.id === "circle-of-doom" &&
                    preferences.circleOfDoom.enabled
                  ) {
                    return (
                      <SortableItem
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
                      </SortableItem>
                    );
                  }

                  // 6) Circle Car Data
                  if (
                    w.id === "circle-car-data" &&
                    preferences.circleCarData.enabled
                  ) {
                    return (
                      <SortableItem
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
                      </SortableItem>
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
