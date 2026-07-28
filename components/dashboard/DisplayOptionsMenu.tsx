"use client";

import { useEffect, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

function setsEqual<T>(a: Set<T>, b: Set<T>) {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

type DisplayOptionsMenuProps<T extends string> = {
  columns: ReadonlyArray<{ key: T; label: string }>;
  allColumnKeys: readonly T[];
  visibleColumns: Set<T>;
  onApply: (columns: Set<T>) => void;
  label?: string;
  showHiddenCount?: boolean;
};

export function DisplayOptionsMenu<T extends string>({
  columns,
  allColumnKeys,
  visibleColumns,
  onApply,
  label = "Display Options",
  showHiddenCount = true,
}: DisplayOptionsMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Set<T>>(() => new Set(visibleColumns));

  useEffect(() => {
    if (open) {
      setDraft(new Set(visibleColumns));
    }
  }, [open, visibleColumns]);

  const hiddenCount = allColumnKeys.length - visibleColumns.size;
  const hasChanges = !setsEqual(draft, visibleColumns);

  function close() {
    setOpen(false);
  }

  function toggleDraft(key: T) {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAllDraft() {
    setDraft(
      draft.size === allColumnKeys.length
        ? new Set<T>()
        : new Set(allColumnKeys as T[]),
    );
  }

  function handleApply() {
    onApply(new Set(draft));
    close();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
          showHiddenCount && hiddenCount > 0
            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
            : open
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {label}
        {showHiddenCount && hiddenCount > 0 && (
          <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {hiddenCount} hidden
          </span>
        )}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} />
          <div
            className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-gray-200 bg-white shadow-lg"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
              <p className="text-xs font-bold text-gray-700">Display Columns</p>
              <button
                type="button"
                onClick={toggleAllDraft}
                className="text-[11px] font-medium text-emerald-600 hover:underline"
              >
                {draft.size === allColumnKeys.length ? "Hide all" : "Show all"}
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {columns.map((column) => (
                <label
                  key={column.key}
                  className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={draft.has(column.key)}
                    onChange={() => toggleDraft(column.key)}
                    className="h-3.5 w-3.5 rounded border-gray-300 accent-emerald-600"
                  />
                  {column.label}
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-3 py-2.5">
              <button
                type="button"
                onClick={close}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!hasChanges}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
