import { useCallback, useEffect, useRef, useState } from "react";

export const SEARCH_DEBOUNCE_MS = 500;

export function useDebouncedSearch(initialValue = "", onDebounced?: () => void) {
  const [search, setSearch] = useState(initialValue);
  const [debouncedSearch, setDebouncedSearch] = useState(initialValue);
  const onDebouncedRef = useRef(onDebounced);

  onDebouncedRef.current = onDebounced;

  useEffect(() => {
    if (search === "") {
      setDebouncedSearch("");
      onDebouncedRef.current?.();
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      onDebouncedRef.current?.();
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  const resetSearch = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
  }, []);

  const isSearchPending = search !== debouncedSearch;

  return { search, setSearch, debouncedSearch, resetSearch, isSearchPending };
}
