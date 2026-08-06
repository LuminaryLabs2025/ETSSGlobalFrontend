/** Returns barrier IDs present in both entry and exit selections. */
export function findOverlappingBarrierIds(
  entryIds: Iterable<string>,
  exitIds: Iterable<string>,
): string[] {
  const exitSet = new Set(exitIds);
  return [...entryIds].filter((id) => exitSet.has(id));
}

/** User-facing validation message when entry/exit selections overlap. */
export function barrierOverlapError(overlappingIds: string[]): string | null {
  if (overlappingIds.length === 0) return null;
  return "The same barrier cannot be assigned as both entry and exit.";
}

/**
 * Toggle a barrier in one role and automatically remove it from the other role
 * so a barrier is never entry and exit at the same time.
 */
export function toggleBarrierSelection(
  id: string,
  selected: Set<string>,
  otherSelected: Set<string>,
): { selected: Set<string>; otherSelected: Set<string> } {
  const nextSelected = new Set(selected);
  const nextOther = new Set(otherSelected);

  if (nextSelected.has(id)) {
    nextSelected.delete(id);
  } else {
    nextSelected.add(id);
    nextOther.delete(id);
  }

  return { selected: nextSelected, otherSelected: nextOther };
}
