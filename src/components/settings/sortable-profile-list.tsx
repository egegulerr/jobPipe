"use client";

import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";
import { moveItemByIndex, reorderByDragIds } from "@/lib/reorder-array";

type SortableProfileListProps<T> = {
  items: T[];
  getId: (item: T) => string;
  onReorder: (items: T[]) => void;
  renderItem: (item: T) => ReactNode;
};

const reorderControlClassName = cn(
  "flex size-9 shrink-0 items-center justify-center rounded-lg",
  "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant",
);

const pointerSensorOptions = { activationConstraint: { distance: 8 } };

function DragHandle({
  attributes,
  listeners,
}: Pick<ReturnType<typeof useSortable>, "attributes" | "listeners">) {
  return (
    <button
      type="button"
      className={cn(reorderControlClassName, "cursor-grab touch-none active:cursor-grabbing")}
      aria-label="Drag to reorder"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-4" />
    </button>
  );
}

function MoveButton({
  direction,
  disabled,
  index,
  onMoveAt,
}: {
  direction: "up" | "down";
  disabled: boolean;
  index: number;
  onMoveAt: (index: number, direction: -1 | 1) => void;
}) {
  const offset = direction === "up" ? -1 : 1;
  const Icon = direction === "up" ? ChevronUp : ChevronDown;
  const label = direction === "up" ? "Move up" : "Move down";

  return (
    <button
      type="button"
      className={reorderControlClassName}
      aria-label={label}
      disabled={disabled}
      onClick={() => onMoveAt(index, offset)}
    >
      <Icon className="size-4" />
    </button>
  );
}

function SortableRow<T>({
  id,
  item,
  index,
  canMoveUp,
  canMoveDown,
  onMoveAt,
  renderItem,
}: {
  id: string;
  item: T;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveAt: (index: number, direction: -1 | 1) => void;
  renderItem: (item: T) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "z-10 opacity-90")}>
      <div className="flex gap-2 items-start">
        <div className="mt-1 flex shrink-0 flex-col gap-0.5">
          <MoveButton direction="up" disabled={!canMoveUp} index={index} onMoveAt={onMoveAt} />
          <DragHandle attributes={attributes} listeners={listeners} />
          <MoveButton direction="down" disabled={!canMoveDown} index={index} onMoveAt={onMoveAt} />
        </div>
        <div className="min-w-0 flex-1">{renderItem(item)}</div>
      </div>
    </div>
  );
}

export function SortableProfileList<T>({ items, getId, onReorder, renderItem }: SortableProfileListProps<T>) {
  const dndContextId = useId();
  const itemsRef = useRef(items);
  const getIdRef = useRef(getId);

  useEffect(() => {
    itemsRef.current = items;
    getIdRef.current = getId;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, pointerSensorOptions),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = items.map(getId);

  const commitReorder = useCallback(
    (next: T[] | null) => {
      if (next) onReorder(next);
    },
    [onReorder],
  );

  const handleMoveAt = useCallback(
    (index: number, direction: -1 | 1) => {
      commitReorder(moveItemByIndex(itemsRef.current, index, direction));
    },
    [commitReorder],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      commitReorder(
        reorderByDragIds(itemsRef.current, String(active.id), String(over.id), getIdRef.current),
      );
    },
    [commitReorder],
  );

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {items.map((item, index) => (
            <SortableRow
              key={ids[index]}
              id={ids[index]}
              item={item}
              index={index}
              canMoveUp={index > 0}
              canMoveDown={index < items.length - 1}
              onMoveAt={handleMoveAt}
              renderItem={renderItem}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
