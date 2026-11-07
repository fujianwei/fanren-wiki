"use client";

import { useEffect, useRef, useState } from "react";

export function useGuidedStep<T>(initial: T) {
  const [step, setStep] = useState(initial);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (!moved.current) return;
    panel.current?.focus({ preventScroll: true });
    panel.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [step]);

  function goTo(next: T) {
    if (timer.current || next === step) return;
    moved.current = true;
    setLeaving(true);
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 150;
    timer.current = setTimeout(() => {
      setStep(next);
      setLeaving(false);
      timer.current = null;
    }, delay);
  }

  return { step, goTo, leaving, panel };
}
