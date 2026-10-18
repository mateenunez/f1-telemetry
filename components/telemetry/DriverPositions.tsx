import { Card, CardContent } from "@/components/ui/card";
import DriverPositionInfo from "@/components/telemetry/DriverPositionInfo";
import Minisectors from "@/components/telemetry/Minisectors";
import LapTimes from "@/components/telemetry/LapTimes";
import Tyres from "@/components/telemetry/Tyres";
import {
  ProcessedPosition,
  ProcessedDriver,
  ProcessedTiming,
  ProcessedTimingStats,
  ProcessedCarData,
  ProcessedStint,
  ProcessedCapture,
  ProcessedSession,
} from "@/processors";
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { audioUrl, useTelemetryAudio } from "@/hooks/use-raceControl";
import DrsSpeed from "@/components/telemetry/DrsSpeed";
import Pits from "./Pits";
import DriverGap2 from "./DriverGap2";
import DriverGap1 from "@/components/telemetry/DriverGap1";
import {
  usePreferences,
  DriverPositionColumnId,
  DriverPositionColumnConfig,
  DEFAULT_DRIVER_POSITION_COLUMNS,
} from "@/context/preferences";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";

interface DriverPositionsProps {
  positions: ProcessedPosition[];
  driverInfos: (ProcessedDriver | undefined)[];
  driverTimings: (ProcessedTiming | undefined)[];
  driverTimingStats: (ProcessedTimingStats | undefined)[];
  driverCarData: (ProcessedCarData | undefined)[];
  driverStints: (ProcessedStint[] | undefined)[];
  lastCapture: ProcessedCapture | undefined;
  handlePinnedDriver: (driverNumber: number) => void;
  session: ProcessedSession | null | undefined;
  aboutToBeEliminated: number[];
  translate?: boolean;
  driverHeadshot?: boolean;
  audioEnabled?: boolean;
  favoriteDrivers?: ProcessedDriver[];
  minisectorHorizontal?: boolean;
}

// Column header label resolver
function getColumnLabel(
  id: DriverPositionColumnId,
  translate: boolean,
  session: ProcessedSession | null | undefined,
): string {
  switch (id) {
    case "driver":
      return translate ? "PILOTO" : "DRIVER";
    case "tyres":
      return translate ? "NEUM." : "TYRES";
    case "speed":
      return translate ? "DRS" : "SPEED";
    case "pits":
      return "PITS";
    case "leader":
      return session?.session_type === "Race"
        ? translate
          ? "LÍDER"
          : "LEADER"
        : translate
          ? "MEJOR VUELTA"
          : "FASTEST";
    case "pos":
      return session?.session_type === "Race" ? "POS" : "INT";
    case "lapTimes":
      return translate ? "VUELTAS" : "LAP TIMES";
    case "minisectors":
      return translate ? "MINISECTORES Y TIEMPOS" : "MINISECTORS & TIMES";
    default:
      return "";
  }
}

// Column width resolver
function getColumnWidth(id: DriverPositionColumnId, driverHeadshot?: boolean): string {
  switch (id) {
    case "driver":
      return driverHeadshot ? "w-[11.5rem]" : "w-[9rem]";
    case "tyres":
    case "speed":
    case "pits":
    case "leader":
    case "pos":
      return "w-[3rem]";
    case "lapTimes":
      return "w-[5rem]";
    case "minisectors":
      return "w-[13rem]";
    default:
      return "";
  }
}

// Sortable column header component
function SortableColumnHeader({
  column,
  label,
  width,
  isEditing,
  isSticky,
  onRemove,
}: {
  column: DriverPositionColumnConfig;
  label: string;
  width: string;
  isEditing: boolean;
  isSticky: boolean;
  onRemove: (id: DriverPositionColumnId) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, disabled: !isEditing });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: isSticky && !isEditing ? "sticky" : undefined,
    left: isSticky && !isEditing ? 0 : undefined,
    zIndex: isDragging ? 50 : isSticky ? 40 : undefined,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      data-no-widget-drag="true"
      className={`text-center font-normal bg-warmBlack ${width} ${
        isEditing ? "select-none" : ""
      }`}
      onMouseDown={(e) => {
        if (isEditing) e.stopPropagation();
      }}
      onPointerDown={(e) => {
        if (isEditing) e.stopPropagation();
      }}
    >
      <div
        className={`flex items-center justify-center gap-0.5 relative ${
          isEditing
            ? "cursor-grab active:cursor-grabbing px-1 py-0.5 rounded hover:bg-white/5 transition-colors"
            : ""
        }`}
        {...(isEditing ? { ...attributes, ...listeners } : {})}
        onMouseDown={(e) => {
          if (isEditing) {
            e.stopPropagation();
          }
        }}
        onPointerDown={(e) => {
          if (isEditing) {
            listeners?.onPointerDown?.(e);
            e.stopPropagation();
          }
        }}
      >
        {isEditing && (
          <GripVertical
            width={10}
            className="text-gray-500 flex-shrink-0 transition-colors"
          />
        )}
        <span className={`${isEditing ? "text-[0.55rem]" : ""}`}>{label}</span>
        {isEditing && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(column.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="ml-0.5 p-0.5 rounded-full transition-colors flex-shrink-0 hover:bg-white/10"
            title={`Remove ${label}`}
          >
            <X width={8} className="text-gray-500 hover:text-f1Red transition-colors" />
          </button>
        )}
      </div>
    </th>
  );
}

const DriverPositions = memo(function DriverPositions({
  positions,
  driverInfos,
  driverTimings,
  driverTimingStats,
  driverCarData,
  driverStints,
  lastCapture,
  handlePinnedDriver,
  session,
  aboutToBeEliminated,
  translate,
  driverHeadshot,
  audioEnabled,
  favoriteDrivers,
  minisectorHorizontal,
}: DriverPositionsProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState<number | undefined>();
  const lastPlayedUtcRef = useRef<string | undefined>(
    lastCapture ? lastCapture.utc : undefined,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPosition = useRef(0);
  const { playNotificationSound } = useTelemetryAudio();
  const { playTeamRadioSound, radioAudioRef } = useTelemetryAudio();
  const {
    preferences,
    updateDriverPositionColumns,
    isEditMode,
    setIsColumnDragging,
  } = usePreferences();

  useEffect(() => {
    if (!isEditMode) {
      setIsColumnDragging(false);
    }
  }, [isEditMode, setIsColumnDragging]);

  useEffect(() => {
    return () => {
      setIsColumnDragging(false);
    };
  }, [setIsColumnDragging]);

  const columns =
    preferences.driverPositionColumns ?? DEFAULT_DRIVER_POSITION_COLUMNS;

  // Visible columns sorted by order
  const visibleColumns = useMemo(
    () =>
      [...columns]
        .filter((c) => c.visible)
        .sort((a, b) => a.order - b.order),
    [columns],
  );

  const hiddenColumns = useMemo(
    () => [...columns].filter((c) => !c.visible),
    [columns],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      updateDriverPositionColumns((prev) => {
        const visible = [...prev]
          .filter((c) => c.visible)
          .sort((a, b) => a.order - b.order);
        const oldIndex = visible.findIndex((c) => c.id === active.id);
        const newIndex = visible.findIndex((c) => c.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;

        const reordered = arrayMove(visible, oldIndex, newIndex);
        // Rebuild full list with updated orders
        const updated = prev.map((c) => {
          const newPos = reordered.findIndex((r) => r.id === c.id);
          if (newPos !== -1) {
            return { ...c, order: newPos };
          }
          return c;
        });
        return updated;
      });
    },
    [updateDriverPositionColumns],
  );

  const handleRemoveColumn = useCallback(
    (id: DriverPositionColumnId) => {
      updateDriverPositionColumns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, visible: false } : c)),
      );
    },
    [updateDriverPositionColumns],
  );

  const handleRestoreColumn = useCallback(
    (id: DriverPositionColumnId) => {
      updateDriverPositionColumns((prev) => {
        const maxOrder = Math.max(...prev.map((c) => c.order), -1);
        return prev.map((c) =>
          c.id === id ? { ...c, visible: true, order: maxOrder + 1 } : c,
        );
      });
    },
    [updateDriverPositionColumns],
  );

  useEffect(() => {
    if (!lastCapture || !audioEnabled) return;
    if (session?.session_status === "Finalised") return;
    if (lastPlayedUtcRef.current !== lastCapture.utc) {
      const url = audioUrl + session?.path + lastCapture.path;
      playNotificationSound();
      playTeamRadioSound(url);
      lastPlayedUtcRef.current = lastCapture.utc;
    }
  }, [lastCapture]);

  useEffect(() => {
    if (!radioAudioRef.current || !lastCapture) return;

    const handlePlay = () => setIsPlayingAudio(lastCapture.racingNumber);
    const handleEnded = () => setIsPlayingAudio(undefined);

    radioAudioRef.current.addEventListener("play", handlePlay);
    radioAudioRef.current.addEventListener("ended", handleEnded);

    return () => {
      radioAudioRef.current?.removeEventListener("play", handlePlay);
      radioAudioRef.current?.removeEventListener("ended", handleEnded);
    };
  }, [radioAudioRef.current, lastCapture]);

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollPosition.current = scrollRef.current.scrollTop;
    }
  }, [positions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollPosition.current;
    }
  });

  // Render a cell by column ID
  const renderCell = (
    columnId: DriverPositionColumnId,
    pos: ProcessedPosition,
    idx: number,
    baseStyle: React.CSSProperties & { opacity: number; background: string },
  ) => {
    const driver = driverInfos[idx];
    const timing = driverTimings[idx];
    const timingStats = driverTimingStats[idx];
    const carData = driverCarData[idx];
    const currentStints = driverStints[idx];
    const widthClass = getColumnWidth(columnId, driverHeadshot);

    switch (columnId) {
      case "driver":
        return (
          <td
            key={columnId}
            className={`${isEditMode ? "" : "sticky left-0 z-20"} ${widthClass}`}
            style={{ background: baseStyle.background }}
          >
            <div style={{ opacity: baseStyle.opacity }}>
              <DriverPositionInfo
                position={pos}
                driver={driver}
                isPlaying={isPlayingAudio}
                driverHeadshot={driverHeadshot}
              />
            </div>
          </td>
        );
      case "tyres":
        return (
          <td key={columnId} className={widthClass}>
            <Tyres driverStints={currentStints} />
          </td>
        );
      case "speed":
        return (
          <td key={columnId} className={widthClass}>
            <DrsSpeed carData={carData} />
          </td>
        );
      case "pits":
        return (
          <td key={columnId} className={widthClass}>
            <Pits timing={timing} driverStints={currentStints} />
          </td>
        );
      case "leader":
        return (
          <td key={columnId} className={widthClass}>
            <DriverGap1 timing={timing} session={session} />
          </td>
        );
      case "pos":
        return (
          <td key={columnId} className={widthClass}>
            <DriverGap2 timing={timing} session={session} />
          </td>
        );
      case "lapTimes":
        return (
          <td key={columnId} className={widthClass}>
            <LapTimes timing={timing} timingStats={timingStats} />
          </td>
        );
      case "minisectors":
        return (
          <td key={columnId} className={widthClass}>
            <Minisectors timing={timing} timingStats={timingStats} MinisectorHorizontal={minisectorHorizontal} />
          </td>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full h-full bg-warmBlack border-none">
      <CardContent className="flex-1 h-full p-0">
        <div
          className="w-full h-full overflow-auto scrollbar-hide"
          ref={scrollRef}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={() => {
              setIsColumnDragging(true);
            }}
            onDragEnd={(event) => {
              setIsColumnDragging(false);
              handleDragEnd(event);
            }}
            onDragCancel={() => {
              setIsColumnDragging(false);
            }}
          >
            {isEditMode && hiddenColumns.length > 0 && (
              <div className="sticky top-0 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-black/95 border-b border-white/10 text-xs flex-wrap">
                <span className="text-gray-400 text-[0.65rem] font-geist">
                  {translate ? "Columnas ocultas:" : "Hidden columns:"}
                </span>
                {hiddenColumns.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleRestoreColumn(col.id)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-offWhite text-[0.6rem] transition-colors"
                    title={
                      translate
                        ? `Restaurar ${getColumnLabel(col.id, !!translate, session)}`
                        : `Restore ${getColumnLabel(col.id, !!translate, session)}`
                    }
                  >
                    <span className="font-bold text-f1Green">+</span>
                    <span>{getColumnLabel(col.id, !!translate, session)}</span>
                  </button>
                ))}
              </div>
            )}
            <table className="table-auto min-w-max w-full text-[0.6rem] text-gray-400">
              <thead className="sticky top-0 z-30 bg-warmBlack h-[2rem] font-geist">
                <tr className="text-center">
                  <SortableContext
                    items={visibleColumns.map((c) => c.id)}
                    strategy={horizontalListSortingStrategy}
                    disabled={!isEditMode}
                  >
                    {visibleColumns.map((col) => (
                      <SortableColumnHeader
                        key={col.id}
                        column={col}
                        label={getColumnLabel(col.id, !!translate, session)}
                        width={getColumnWidth(col.id, driverHeadshot)}
                        isEditing={isEditMode}
                        isSticky={col.id === "driver"}
                        onRemove={handleRemoveColumn}
                      />
                    ))}
                  </SortableContext>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, idx) => {
                  const driver = driverInfos[idx];
                  const timing = driverTimings[idx];
                  const isFavorite =
                    driver?.driver_number &&
                    favoriteDrivers?.some(
                      (d) => d.driver_number === driver.driver_number,
                    );
                  const isAboutToBeEliminated =
                    driver?.driver_number &&
                    aboutToBeEliminated.includes(driver?.driver_number);

                  const baseStyle =
                    timing?.knockedOut || timing?.retired || timing?.stopped
                      ? {
                        opacity: 0.4,
                        background: `linear-gradient(-50deg, #0a0a0a ${driverHeadshot ? "80%" : "100%"
                          }, #${driver?.team_colour} 100%)`,
                      }
                      : {
                        opacity: 1,
                        background: `linear-gradient(-50deg, ${isAboutToBeEliminated
                          ? "#6b040447"
                          : isFavorite
                            ? "#" + driver?.team_colour + "30"
                            : "#0a0a0a"
                          } ${driverHeadshot && !isAboutToBeEliminated ? "80%" : "100%"}, #${driver?.team_colour} 100%), #0a0a0a`,
                      };

                  return (
                    <tr
                      key={pos.driver_number}
                      className="transition-all cursor-pointer py-4"
                      onDoubleClick={() => handlePinnedDriver(pos.driver_number)}
                      style={baseStyle}
                    >
                      {visibleColumns.map((col) =>
                        renderCell(col.id, pos, idx, baseStyle),
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </DndContext>
        </div>
      </CardContent>
    </Card>
  );
});

export default DriverPositions;
