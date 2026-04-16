"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  onComplete: (fortune: number, cycles: number) => void;
}

function getRootType(fortune: number): { label: string; borderColor: string; textColor: string; glowColor: string; desc: string } {
  if (fortune >= 91) return {
    label: "天灵根", desc: "万中无一，天道垂青",
    borderColor: "#d4a843", textColor: "#e8c86a",
    glowColor: "rgba(212,168,67,0.45)",
  };
  if (fortune >= 81) return {
    label: "双灵根", desc: "资质上乘，前途无量",
    borderColor: "#4ade9a", textColor: "#6fedb5",
    glowColor: "rgba(74,222,154,0.35)",
  };
  if (fortune >= 51) return {
    label: "三灵根", desc: "资质中等，勤能补拙",
    borderColor: "rgba(74,222,154,0.4)", textColor: "rgba(74,222,154,0.55)",
    glowColor: "rgba(74,222,154,0.12)",
  };
  return {
    label: "伪灵根", desc: "资质平平，唯有坚韧",
    borderColor: "rgba(74,222,154,0.2)", textColor: "rgba(74,222,154,0.3)",
    glowColor: "transparent",
  };
}

export default function ReincarnationGate({ onComplete }: Props) {
  const [phase, setPhase] = useState<"spinning" | "revealed">("spinning");
  const [cycles, setCycles] = useState(0);
  const [fortune, setFortune] = useState(0);
  const cyclesRef = useRef(0);

  // 轮回循环
  useEffect(() => {
    if (phase !== "spinning") return;
    const interval = setInterval(() => {
      cyclesRef.current += 1;
      const val = Math.floor(Math.random() * 101);
      if (val > 95) {
        clearInterval(interval);
        const f = Math.floor(Math.random() * 100) + 1;
        setCycles(cyclesRef.current);
        setFortune(f);
        setPhase("revealed");
      }
    }, 100);
    return () => clearInterval(interval);
  }, [phase]);

  const root = getRootType(fortune);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "transparent" }}
    >
      <div className="relative text-center px-8 max-w-sm mx-auto" style={{ zIndex: 1 }}>
        {phase === "spinning" && (
          <div className="flex flex-col items-center gap-8">
            {/* 旋转光环 */}
            <div className="relative w-32 h-32">
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  border: "2px solid #4ade9a",
                  boxShadow: "0 0 12px rgba(74,222,154,0.3)",
                  animationDuration: "3s",
                }}
              />
              <div
                className="absolute inset-2 rounded-full animate-spin"
                style={{
                  border: "1px solid #6fedb5",
                  boxShadow: "0 0 8px rgba(111,237,181,0.2)",
                  animationDuration: "2s",
                  animationDirection: "reverse",
                }}
              />
              <div
                className="absolute inset-4 rounded-full animate-spin"
                style={{
                  border: "1px solid #22c47a",
                  boxShadow: "0 0 6px rgba(34,196,122,0.25)",
                  animationDuration: "1.5s",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-4 h-4 rounded-full animate-pulse"
                  style={{ backgroundColor: "#4ade9a", boxShadow: "0 0 16px rgba(74,222,154,0.6)" }}
                />
              </div>
            </div>
            <p
              className="text-sm tracking-widest animate-pulse"
              style={{ color: "#6fedb5" }}
            >
              经历轮回转世中...
            </p>
          </div>
        )}

        {phase === "revealed" && (
          <div className="flex flex-col items-center gap-6 animate-[fadeIn_0.8s_ease-in]">
            {/* 灵根圆圈 */}
            <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
              <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{ backgroundColor: root.glowColor, filter: "blur(14px)" }}
              />
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  border: `2px solid ${root.borderColor}`,
                  boxShadow: `0 0 20px ${root.glowColor}`,
                }}
              >
                <span className="text-lg font-bold font-serif" style={{ color: root.textColor }}>
                  {root.label[0]}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm leading-relaxed" style={{ color: "#b8ccc2" }}>
                经历了{" "}
                <span className="font-bold text-base" style={{ color: "#e8f0ec" }}>{cycles}</span>
                {" "}世轮回后，
              </p>
              <p className="font-serif text-base" style={{ color: "#e8f0ec" }}>
                这一世你终于有了灵根。
              </p>
            </div>

            <div
              className="px-6 py-3 rounded-xl text-center"
              style={{
                border: `1px solid ${root.borderColor}`,
                backgroundColor: root.glowColor === "transparent" ? "rgba(74,222,154,0.03)" : root.glowColor,
              }}
            >
              <p className="text-xs tracking-widest mb-1" style={{ color: root.textColor }}>你的灵根</p>
              <p className="font-serif font-bold text-lg" style={{ color: root.textColor }}>{root.label}</p>
              <p className="text-xs mt-1" style={{ color: "#6a8878" }}>{root.desc}</p>
            </div>

            <button
              onClick={() => onComplete(fortune, cycles)}
              className="btn-primary"
            >
              踏入修仙之路
            </button>

            <button
              onClick={() => {
                cyclesRef.current = 0;
                setCycles(0);
                setFortune(0);
                setPhase("spinning");
              }}
              className="btn-secondary"
            >
              再入轮回，重塑天资
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
