"use client";

import { Suspense } from "react";
import { useGame } from "@/components/game/GameProvider";
import SpiritRootGate from "@/components/game/SpiritRootGate";
import type { RunMode, SpiritRoot } from "@/types/game";
import { useRouter, useSearchParams } from "next/navigation";

function GameEntry() {
  const { dispatch } = useGame();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawDailyKey = searchParams.get("daily");
  const linkedDailyKey = rawDailyKey && /^\d{4}-\d{2}-\d{2}$/.test(rawDailyKey) ? rawDailyKey : undefined;

  function handleGateComplete(
    spiritRoot: SpiritRoot,
    fortune: number,
    options?: { runMode?: RunMode; dailyKey?: string; celestialId?: string; seed?: number }
  ) {
    dispatch({ type: "START_GAME", spiritRoot, fortune, ...options });
    router.push("/game/play");
  }

  return <SpiritRootGate onComplete={handleGateComplete} dailyKey={linkedDailyKey} />;
}

export default function GamePage() {
  return <Suspense fallback={<div className="min-h-screen" />}><GameEntry /></Suspense>;
}
