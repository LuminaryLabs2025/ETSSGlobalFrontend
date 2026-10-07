import { useEffect, useState } from "react";

const REFRESH_MS = 15_000;

export function useRevenueLiveTick() {
  const [tick, setTick] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setLastUpdated(new Date());
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return { tick, lastUpdated };
}
