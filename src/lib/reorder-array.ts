import { arrayMove } from "@dnd-kit/sortable";

function reorderByIndices<T>(items: T[], from: number, to: number): T[] | null {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length) return null;
  if (from === to) return null;
  return arrayMove(items, from, to);
}

export function reorderByDragIds<T>(
  items: T[],
  activeId: string,
  overId: string,
  getId: (item: T) => string,
): T[] | null {
  const from = items.findIndex((i) => getId(i) === activeId);
  const to = items.findIndex((i) => getId(i) === overId);
  return reorderByIndices(items, from, to);
}

export function moveItemByIndex<T>(items: T[], index: number, direction: -1 | 1): T[] | null {
  return reorderByIndices(items, index, index + direction);
}
