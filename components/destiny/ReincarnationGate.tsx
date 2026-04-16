"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  onComplete: (fortune: number, cycles: number) => void;
}

function getRootType(fortune: number): { label: string; color: string; desc: string } {
  if (fortune >= 91) return { label: "天灵根", color: "#f0c040", desc: "万中无一，天道垂青" };
  if (fortune >= 81) return { label: "双灵根", color: "#7a9e72", desc: "资质上乘，前途无量" };
  if (fortune >= 51) return { label: "三灵根", color: "#5a7e52", desc: "资质中等，勤能补拙" };
  return { label: "伪灵根", color: "#b8cdb0", desc: "资质平平，唯有坚韧" };
}

export default function ReincarnationGate({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"spinning" | "revealed">("spinning");
  const [cycles, setCycles] = useState(0);
  const [fortune, setFortune] = useState(0);
  const animFrameRef = useRef<number>(0);
  const cyclesRef = useRef(0);

  // 粒子动画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -(Math.random() * 0.6 + 0.2),
      opacity: Math.random(),
      opacitySpeed: Math.random() * 0.015 + 0.005,
      hue: 100 + Math.random() * 40, // 绿色系
    }));

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 50%, 60%, ${p.opacity})`;
        ctx.fill();

        // 光晕
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grad.addColorStop(0, `hsla(${p.hue}, 60%, 70%, ${p.opacity * 0.4})`);
        grad.addColorStop(1, `hsla(${p.hue}, 60%, 70%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.opacitySpeed * (p.opacity > 0.9 ? -1 : p.opacity < 0.1 ? 1 : Math.random() > 0.5 ? 1 : -1);

        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
      }
      animFrameRef.current = requestAnimationFrame(draw);
    }
    draw();

    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bamboo-50">
      {/* 粒子 canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* 内容 */}
      <div className="relative z-10 text-center px-8 max-w-sm mx-auto">
        {phase === "spinning" && (
          <div className="flex flex-col items-center gap-8">
            {/* 旋转光环 */}
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-2 border-bamboo-300 animate-spin" style={{ animationDuration: "3s" }} />
              <div className="absolute inset-2 rounded-full border border-bamboo-200 animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
              <div className="absolute inset-4 rounded-full border border-bamboo-400 animate-spin" style={{ animationDuration: "1.5s" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-bamboo-400 animate-pulse" />
              </div>
            </div>

            <div>
              <p className="text-bamboo-500 text-sm tracking-widest animate-pulse">
                经历轮回转世中...
              </p>
            </div>
          </div>
        )}

        {phase === "revealed" && (
          <div className="flex flex-col items-center gap-6 animate-[fadeIn_0.8s_ease-in]">
            {/* 灵根光晕 */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full opacity-20 animate-pulse"
                style={{ backgroundColor: root.color, filter: "blur(12px)" }}
              />
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center border-2"
                style={{ borderColor: root.color, boxShadow: `0 0 20px ${root.color}60` }}
              >
                <span className="text-xs font-bold" style={{ color: root.color }}>
                  {root.label[0]}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-bamboo-600 text-sm leading-relaxed">
                经历了{" "}
                <span className="font-bold text-bamboo-700 text-base">{cycles}</span>
                {" "}世轮回后，
              </p>
              <p className="text-bamboo-700 font-serif text-base">
                这一世你终于有了灵根。
              </p>
            </div>

            <div
              className="px-6 py-3 rounded-xl border text-center"
              style={{ borderColor: root.color + "80", backgroundColor: root.color + "15" }}
            >
              <p className="text-xs tracking-widest mb-1" style={{ color: root.color }}>你的灵根</p>
              <p className="font-serif font-bold text-lg" style={{ color: root.color }}>
                {root.label}
              </p>
              <p className="text-xs mt-1 text-bamboo-500">{root.desc}</p>
            </div>

            <button
              onClick={() => onComplete(fortune, cycles)}
              className="mt-2 bg-bamboo-400 text-white px-10 py-3 rounded-full text-sm font-medium hover:bg-bamboo-500 transition-colors tracking-widest"
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
              className="text-bamboo-400 text-xs hover:text-bamboo-600 transition-colors underline underline-offset-4"
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
