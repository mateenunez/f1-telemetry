"use client";

import { Widget, WidgetId } from "@/context/preferences";
import { ReactNode, useCallback } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";
import { X } from "lucide-react";

export default function DraggableWidget({
  widget,
  children,
  isEditMode,
  updateWidget,
}: {
  widget: Widget;
  children: ReactNode;
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

      <Resizable
        width={widget.width}
        height={widget.height}
        onResize={handleResize}
        minConstraints={[100, 100]}
        maxConstraints={[Infinity, Infinity]}
        handle={
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-f1Blue/60 hover:bg-f1Blue border border-white/50 cursor-se-resize"
            style={{
              zIndex: 1000,
            }}
          />
        }
        resizeHandles={["se"]}
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
