"use client";

import { GameProvider } from "@/components/game/GameProvider";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <GameProvider><div className="game-ui">{children}</div></GameProvider>;
}
