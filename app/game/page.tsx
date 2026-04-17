"use client";

import { useGame } from "@/components/game/GameProvider";
import SpiritRootGate from "@/components/game/SpiritRootGate";
import type { SpiritRoot } from "@/types/game";
import { useRouter } from "next/navigation";

function GameEntry() {
  const { dispatch } = useGame();
  const router = useRouter();

  function handleGateComplete(spiritRoot: SpiritRoot, fortune: number) {
    dispatch({ type: "START_GAME", spiritRoot, fortune });
    router.push("/game/play");
  }

  return <SpiritRootGate onComplete={handleGateComplete} />;
}

export default function GamePage() {
  return <GameEntry />;
}
