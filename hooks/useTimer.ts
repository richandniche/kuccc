"use client";

import { useEffect, useRef, useState } from "react";

export function useTimer(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick when running
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  // Auto-pause when tab is hidden; resume only if it was running before.
  // This prevents inflated durations if the user walks away or switches apps.
  const wasRunningOnHideRef = useRef(false);
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        wasRunningOnHideRef.current = running;
        if (running) setRunning(false);
      } else if (wasRunningOnHideRef.current) {
        wasRunningOnHideRef.current = false;
        setRunning(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [running]);

  return {
    seconds,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    toggle: () => setRunning((r) => !r),
    reset: () => {
      setRunning(false);
      setSeconds(0);
    },
  };
}
