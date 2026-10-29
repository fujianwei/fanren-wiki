"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGame } from "@/components/game/GameProvider";
import { getSpiritRoot } from "@/lib/game/engine";
import { getAtlasSummary } from "@/lib/game/atlas";
import { getDailyContext, getDailyCelestial } from "@/lib/game/daily";
import { buildThreeLifeMirror } from "@/lib/game/mirror";
import { AXIS_LABELS } from "@/lib/game/narrative";
import type { RunMode, SpiritRoot } from "@/types/game";

interface CompleteOptions {
  runMode?: RunMode;
  dailyKey?: string;
  celestialId?: string;
  seed?: number;
}

interface Props {
  onComplete: (spiritRoot: SpiritRoot, fortune: number, options?: CompleteOptions) => void;
  dailyKey?: string;
}

function getRootStyle(fortune: number) {
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

function BlueFlame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width = 260;
    const H = canvas.height = 150;
    const CX = W / 2;
    const BASE_Y = H - 30;

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      life: number; maxLife: number;
      r: number;
      type: "flame" | "spark";
    }

    const particles: Particle[] = [];

    function spawn() {
      for (let i = 0; i < 2; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.0;
        const speed = Math.random() * 0.5 + 0.25;
        const maxLife = Math.random() * 30 + 50;
        particles.push({
          x: CX + (Math.random() - 0.5) * 30,
          y: BASE_Y,
          vx: Math.cos(angle) * speed * 0.5,
          vy: Math.sin(angle) * speed,
          life: maxLife, maxLife,
          r: Math.random() * 4 + 3,
          type: "flame",
        });
      }
      if (Math.random() < 0.15) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
        const speed = Math.random() * 1.2 + 0.8;
        particles.push({
          x: CX + (Math.random() - 0.5) * 16,
          y: BASE_Y - 25 - Math.random() * 15,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.3,
          life: Math.random() * 18 + 8, maxLife: 26,
          r: Math.random() * 1.5 + 0.5,
          type: "spark",
        });
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      spawn();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const progress = p.life / p.maxLife;
        p.x += p.vx + Math.sin(p.life * 0.18) * 0.3;
        p.y += p.vy;
        p.vy -= 0.018;
        if (p.life > p.maxLife * 0.5) { p.r *= 1.018; } else { p.r *= 0.972; }
        p.life--;
        if (p.life <= 0 || p.r < 0.3) { particles.splice(i, 1); continue; }
        if (p.type === "flame") {
          const alpha = progress * 0.85;
          const color = progress > 0.7
            ? `rgba(220,240,255,${alpha})`
            : progress > 0.4
            ? `rgba(96,165,250,${alpha})`
            : `rgba(59,90,220,${alpha * 0.7})`;
          const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
          grad.addColorStop(0, color);
          grad.addColorStop(0.5, color.replace(/[\d.]+\)$/, `${alpha * 0.5})`));
          grad.addColorStop(1, "rgba(30,60,180,0)");
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
          ctx!.fillStyle = grad;
          ctx!.fill();
        } else {
          const alpha = progress * 0.9;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(186,230,253,${alpha})`;
          ctx!.fill();
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
          ctx!.strokeStyle = `rgba(147,197,253,${alpha * 0.4})`;
          ctx!.lineWidth = p.r * 0.8;
          ctx!.stroke();
        }
      }
      const baseGrad = ctx!.createRadialGradient(CX, BASE_Y, 0, CX, BASE_Y, 60);
      baseGrad.addColorStop(0, "rgba(96,165,250,0.28)");
      baseGrad.addColorStop(0.5, "rgba(59,130,246,0.10)");
      baseGrad.addColorStop(1, "rgba(30,60,180,0)");
      ctx!.beginPath();
      ctx!.ellipse(CX, BASE_Y, 60, 18, 0, 0, Math.PI * 2);
      ctx!.fillStyle = baseGrad;
      ctx!.fill();
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return <canvas ref={canvasRef} style={{ width: 260, height: 150, display: "block" }} />;
}

export default function SpiritRootGate({ onComplete, dailyKey }: Props) {
  const { state } = useGame();
  const router = useRouter();
  const [phase, setPhase] = useState<"spinning" | "revealed">("spinning");
  const [cycles, setCycles] = useState(0);
  const [fortune, setFortune] = useState(0);
  const cyclesRef = useRef(0);

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

  const root = getRootStyle(fortune);
  const spiritRoot = fortune > 0 ? getSpiritRoot(fortune) : null;
  const daily = getDailyContext(dailyKey);
  const todayCelestial = getDailyCelestial(dailyKey);
  const atlas = getAtlasSummary(state.meta);

  function handleStart() {
    if (spiritRoot) onComplete(spiritRoot, fortune, { runMode: "free", celestialId: todayCelestial.id });
  }

  function handleDailyStart() {
    onComplete(daily.spiritRoot, daily.fortune, {
      runMode: "daily",
      dailyKey: daily.dateKey,
      celestialId: daily.celestial.id,
      seed: daily.seed,
    });
  }

  function handleReroll() {
    cyclesRef.current = 0;
    setCycles(0);
    setFortune(0);
    setPhase("spinning");
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="relative text-center px-8 max-w-sm mx-auto" style={{ zIndex: 1 }}>
        {phase === "spinning" && (
          <div className="flex flex-col items-center gap-8">
            <BlueFlame />
            <p className="text-sm tracking-widest animate-pulse" style={{ color: "#93c5fd" }}>
              经历轮回转世中...
            </p>
          </div>
        )}

        {phase === "revealed" && (
          <div className="flex flex-col items-center gap-6 animate-[fadeIn_0.8s_ease-in]">
            <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
              <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{ backgroundColor: root.glowColor, filter: "blur(14px)" }}
              />
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ border: `2px solid ${root.borderColor}`, boxShadow: `0 0 20px ${root.glowColor}` }}
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

            <div className="rounded-xl px-4 py-3 text-center" style={{ backgroundColor: "#0e1610", border: "1px solid #1a2820" }}>
              <p className="text-[10px] leading-relaxed" style={{ color: "#6a8878" }}>
                灵根决定起步快慢与擅长的路，不封死秘境、禁术、乱星海与飞升。此后能走多远，交给选择。
              </p>
            </div>

            {state.phase === "playing" && (
              <button onClick={() => router.push("/game/play")} className="btn-secondary w-full">
                继续第 {state.lifeNumber} 世 · {state.age}岁
              </button>
            )}

            {(() => {
              const mirror = buildThreeLifeMirror(state.meta.lives);
              return mirror ? (
                <div className="w-full rounded-xl px-4 py-4 text-left" style={{ backgroundColor: "#101915", border: "1px solid #26352d" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px]" style={{ color: "#d4a843" }}>三生镜 · 前 {Math.min(3, state.meta.lives.length)} 世</div>
                    <div className="text-[9px]" style={{ color: "#4a6a58" }}>{mirror.selectionBias}</div>
                  </div>
                  <p className="font-serif text-sm leading-6 mb-1" style={{ color: "#e8f0ec" }}>{mirror.headline}</p>
                  <p className="text-[10px] leading-relaxed" style={{ color: "#6a8878" }}>{mirror.insight}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(mirror.axisCounts).sort((a,b)=>b[1]-a[1]).map(([axis,count]) => (
                      <span key={axis} className="text-[9px] px-2 py-0.5 rounded-full" style={{ color: "#d4a843", backgroundColor: "#16140a" }}>{AXIS_LABELS[axis as keyof typeof AXIS_LABELS]} ×{count}</span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            <div className="w-full rounded-xl px-4 py-3 text-left" style={{ backgroundColor: "#101915", border: `1px solid ${todayCelestial.color}35` }}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[9px] tracking-[.18em]" style={{ color: todayCelestial.color }}>今日天象 · {todayCelestial.name}</span>
                <span className="text-[9px]" style={{ color: "#5c786a" }}>{daily.dateKey} · {daily.spiritRoot.name}</span>
              </div>
              <p className="mt-1 text-[10px] leading-5" style={{ color: "#779285" }}>{todayCelestial.epithet}。{todayCelestial.description}</p>
            </div>

            <button onClick={handleStart} className="btn-primary w-full">
              踏入修仙之路
            </button>

            <button onClick={handleDailyStart} className="btn-secondary w-full">
              今日同命 · 直接看看这一世
            </button>

            <Link href="/game/atlas" className="text-[10px]" style={{ color: "#7d998a" }}>
              命途图鉴 · 已见 {atlas.seen}/{atlas.total} · 未见 {atlas.unseen}
            </Link>

            <button onClick={handleReroll} className="btn-secondary">
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
