"use client";

import { Widget, WidgetId } from "@/context/preferences";
import { ReactNode, useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";

const ManualInput = ({
  value,
  onUpdate,
  label,
}: {
  value: number;
  onUpdate: (val: number) => void;
  label: string;
}) => {
  const [tempValue, setTempValue] = useState(value.toString());
  const [focused, setFocused] = useState(false);

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
    <div className="bg-warmBlack relative">
      <input
        type="number"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          commitChange();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commitChange();
          }
        }}
        className="w-[4rem] bg-black/40 text-white text-geist bg-warmBlack text-sm p-1 border border-white/10 rounded outline-none focus:border-f1Blue"
      />
      {focused && (
        <p className="font-geist text-xs text-white absolute top-full left-0 mt-1">{label}</p>
      )}
    </div>
  );
};

export default function DraggableWidget({
  widget,
  children,
  isEditMode,
  updateWidget,
  translate,
}: {
  widget: Widget;
  children: ReactNode;
  isEditMode: boolean;
  updateWidget: (id: WidgetId, updates: Partial<Widget>) => void;
  translate: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: widget.id,
    disabled: !isEditMode,
  });
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
            label={translate ? "ancho" : "width"}
          />
          <span className="text-offWhite text-lg mx-2">×</span>
          <ManualInput
            value={widget.height}
            onUpdate={(newHeight) =>
              updateWidget(widget.id, { height: newHeight })
            }
            label={translate ? "alto" : "height"}
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

      <div
        style={{
          width: widget.width,
          height: widget.height,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
