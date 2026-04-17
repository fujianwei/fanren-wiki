"use client";

import { useEffect, useRef, useState } from "react";
import { getSpiritRoot } from "@/lib/game/engine";
import type { SpiritRoot } from "@/types/game";

interface Props {
  onComplete: (spiritRoot: SpiritRoot, fortune: number) => void;
}

const ROOT_COLORS: Record<string, string> = {
  tianling: "#d4a843",
  shuang: "#4ade9a",
  san: "#6fedb5",
  wei: "#4a6a58",
};

export default function SpiritRootGate({ onComplete }: Props) {
  const [phase, setPhase] = useState<"rolling" | "revealed">("rolling");
  const [fortune, setFortune] = useState(0);
  const [spiritRoot, setSpiritRoot] = useState<SpiritRoot | null>(null);
  const [displayFortune, setDisplayFortune] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const finalFortune = Math.floor(Math.random() * 100) + 1;
    setFortune(finalFortune);

    let tick = 0;
    const totalTicks = 60;
    intervalRef.current = setInterval(() => {
      tick++;
      if (tick >= totalTicks) {
        clearInterval(intervalRef.current!);
        setDisplayFortune(finalFortune);
        const root = getSpiritRoot(finalFortune);
        setSpiritRoot(root);
        setTimeout(() => setPhase("revealed"), 300);
      } else {
        const noise =
          tick < totalTicks - 10
            ? Math.floor(Math.random() * 100) + 1
            : finalFortune;
        setDisplayFortune(noise);
      }
    }, 33);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleStart = () => {
    if (spiritRoot) onComplete(spiritRoot, fortune);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div
        className="w-full max-w-sm rounded-2xl p-8 text-center"
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
      >
        <p className="text-xs tracking-widest mb-6" style={{ color: "#6a8878" }}>
          轮回入场
        </p>

        <div className="mb-6">
          <div
            className="text-6xl font-bold font-serif mb-2 tabular-nums"
            style={{
              color:
                phase === "revealed" && spiritRoot
                  ? ROOT_COLORS[spiritRoot.type]
                  : "#4ade9a",
            }}
          >
            {displayFortune}
          </div>
          <p className="text-xs" style={{ color: "#6a8878" }}>
            机遇值
          </p>
        </div>

        {phase === "revealed" && spiritRoot && (
          <div className="mb-8">
            <div
              className="text-2xl font-serif font-bold mb-1"
              style={{ color: ROOT_COLORS[spiritRoot.type] }}
            >
              {spiritRoot.name}
            </div>
            <p className="text-xs" style={{ color: "#6a8878" }}>
              修炼速度 ×{spiritRoot.cultivationMult}
            </p>
          </div>
        )}

        {phase === "revealed" && (
          <button onClick={handleStart} className="btn-primary w-full py-3 rounded-full font-medium">
            踏入炼气期
          </button>
        )}

        {phase === "rolling" && (
          <div className="text-xs" style={{ color: "#4a6a58" }}>
            天机推演中……
          </div>
        )}
      </div>
    </div>
  );
}
