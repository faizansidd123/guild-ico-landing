import { useEffect, useState } from "react";

export type CountdownState = {
  d: number;
  h: number;
  m: number;
  s: number;
  total: number;
};

export const buildCountdown = (endIso: string): CountdownState => {
  const distance = new Date(endIso).getTime() - Date.now();
  const total = Math.max(0, distance);
  const d = Math.floor(total / (1000 * 60 * 60 * 24));
  const h = Math.floor((total / (1000 * 60 * 60)) % 24);
  const m = Math.floor((total / (1000 * 60)) % 60);
  const s = Math.floor((total / 1000) % 60);

  return { d, h, m, s, total };
};

export const useCountdown = (endIso: string | null | undefined, refreshMs = 1000) => {
  const [countdown, setCountdown] = useState<CountdownState | null>(() =>
    endIso && endIso.length > 0 ? buildCountdown(endIso) : null,
  );

  useEffect(() => {
    if (!endIso || endIso.length === 0) {
      setCountdown(null);
      return;
    }

    setCountdown(buildCountdown(endIso));

    const timer = window.setInterval(() => {
      setCountdown(buildCountdown(endIso));
    }, refreshMs);

    return () => window.clearInterval(timer);
  }, [endIso, refreshMs]);

  return countdown;
};
