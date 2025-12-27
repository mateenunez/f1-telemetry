"use client";

import { usePreferences, Widget, WidgetId } from "@/context/preferences";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";
import { X } from "lucide-react";

const ManualInput = ({
  value,
  onUpdate,
}: {
  value: number;
  onUpdate: (val: number) => void;
}) => {
  const [tempValue, setTempValue] = useState(value.toString());

  useEffect(() => {
    setTempValue(value.toString());
  }, [value]);

  const commitChange = () => {
    const num = parseInt(tempValue);
    if (!isNaN(num) && num > 0) {
      onUpdate(num);
    } else {
      setTempValue(value.toString());
    }
  };

  return (
    <div className="bg-warmBlack">
      <input
        type="number"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={commitChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commitChange();
          }
        }}
        className="w-[4rem] bg-black/40 text-white text-geist bg-warmBlack text-sm p-1 border border-white/10 rounded outline-none focus:border-f1Blue"
      />
    </div>
  );
};

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
  const { setIsResizing } = usePreferences();
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
      {isEditMode && (
        <div
          className="absolute -bottom-10 p-1 right-0 flex bg-warmBlack rounded shadow-lg"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <ManualInput
            value={widget.width}
            onUpdate={(newWidth) =>
              updateWidget(widget.id, { width: newWidth })
            }
          />
          <span className="text-offWhite text-lg mx-2">×</span>
          <ManualInput
            value={widget.height}
            onUpdate={(newHeight) =>
              updateWidget(widget.id, { height: newHeight })
            }
          />
        </div>
      )}

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
            className="absolute -top-0 m-2 -right-0 z-[9999] text-gray-400 hover:text-f1Red p-2 shadow-lg transition-colors pointer-events-auto w-[2rem] text-md"
          >
            <X size={18} />
          </button>
        )}

      <Resizable
        width={widget.width}
        height={widget.height}
        onResize={handleResize}
        onResizeStart={() => setIsResizing(true)}
        onResizeStop={() => setIsResizing(false)}
        minConstraints={[100, 100]}
        maxConstraints={[Infinity, Infinity]}
        handle={
          <div
            className="absolute bottom-0 right-0 m-2 w-4 h-4 bg-offWhite/60 hover:bg-offWhite/80 border border-offWhite/50 cursor-se-resize rounded-md"
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
