"use client";

import { GameProvider } from "@/components/game/GameProvider";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <GameProvider>
      <div className="fixed inset-0 overflow-hidden">
        {children}
      </div>
    </GameProvider>
  );
}
