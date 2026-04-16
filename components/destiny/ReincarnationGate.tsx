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
      // 火焰粒子：窄扇形，粒子小起步，上升后膨胀再消散
      const count = 2;
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.0; // 稍宽
        const speed = Math.random() * 0.5 + 0.25;
        const maxLife = Math.random() * 30 + 50; // 矮一些寿命缩短
        particles.push({
          x: CX + (Math.random() - 0.5) * 30, // 更宽起始
          y: BASE_Y,
          vx: Math.cos(angle) * speed * 0.5,
          vy: Math.sin(angle) * speed,
          life: maxLife,
          maxLife,
          r: Math.random() * 4 + 3,  // 初始半径小
          type: "flame",
        });
      }
      // 火花：偶尔
      if (Math.random() < 0.15) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
        const speed = Math.random() * 1.2 + 0.8;
        particles.push({
          x: CX + (Math.random() - 0.5) * 16,
          y: BASE_Y - 25 - Math.random() * 15,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.3,
          life: Math.random() * 18 + 8,
          maxLife: 26,
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
        const progress = p.life / p.maxLife; // 1→0 as dying

        p.x += p.vx + Math.sin(p.life * 0.18) * 0.3;
        p.y += p.vy;
        p.vy -= 0.018;
        // 前半段膨胀，后半段收缩 —— 形成饱满火苗形态
        if (p.life > p.maxLife * 0.5) {
          p.r *= 1.018; // 上升时膨胀
        } else {
          p.r *= 0.972; // 顶部收缩消散
        }
        p.life--;

        if (p.life <= 0 || p.r < 0.3) {
          particles.splice(i, 1);
          continue;
        }

        if (p.type === "flame") {
          // 火焰颜色：核心白蓝 → 中层蓝 → 外层深蓝紫，随生命衰减
          const alpha = progress * 0.85;
          let color: string;
          if (progress > 0.7) {
            // 核心：白蓝
            color = `rgba(220, 240, 255, ${alpha})`;
          } else if (progress > 0.4) {
            // 中层：亮蓝
            color = `rgba(96, 165, 250, ${alpha})`;
          } else {
            // 外层：深蓝紫
            color = `rgba(59, 90, 220, ${alpha * 0.7})`;
          }

          const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
          grad.addColorStop(0, color);
          grad.addColorStop(0.5, color.replace(/[\d.]+\)$/, `${alpha * 0.5})`));
          grad.addColorStop(1, "rgba(30,60,180,0)");

          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
          ctx!.fillStyle = grad;
          ctx!.fill();
        } else {
          // 火花：亮白蓝小点
          const alpha = progress * 0.9;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(186, 230, 253, ${alpha})`;
          ctx!.fill();
          // 火花拖尾
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
          ctx!.strokeStyle = `rgba(147, 197, 253, ${alpha * 0.4})`;
          ctx!.lineWidth = p.r * 0.8;
          ctx!.stroke();
        }
      }

      // 底部辉光底座，围绕 BASE_Y，自然融入背景
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

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 260, height: 150, display: "block" }}
    />
  );
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
            <BlueFlame />
            <p
              className="text-sm tracking-widest animate-pulse"
              style={{ color: "#93c5fd" }}
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
