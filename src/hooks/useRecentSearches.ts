import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const KEY = "blush:recent-searches";
const MAX = 8;

/** Persists a small list of recent search terms in localStorage. */
export function useRecentSearches() {
  const [recent, setRecent] = useLocalStorage<string[]>(KEY, []);

  const add = useCallback(
    (term: string) => {
      const clean = term.trim();
      if (!clean) return;
      setRecent((prev) => [clean, ...prev.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, MAX));
    },
    [setRecent],
  );

  const remove = useCallback(
    (term: string) => {
      setRecent((prev) => prev.filter((t) => t !== term));
    },
    [setRecent],
  );

  const clear = useCallback(() => setRecent([]), [setRecent]);

  return { recent, add, remove, clear };
}
