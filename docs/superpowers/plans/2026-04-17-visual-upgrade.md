# 全站视觉升级 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将凡人修仙传全站从浅绿灰风格升级为精致水墨夜墨风格，深色背景 + 翠玉绿主调 + 金色点睛 + 全程粒子光晕 + 陨落裂纹特效。

**Architecture:** 零新依赖，纯 CSS 变量 + radial-gradient + Canvas 粒子 + SVG 纹饰。新增全局 `ParticleBackground` 组件挂载在 layout 底层，各组件直接使用新 CSS 变量，无需 props 传递主题。

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4 (@theme inline), React 19, TypeScript

---

## 文件结构

| 操作 | 文件 | 说明 |
|------|------|------|
| Modify | `app/globals.css` | 新色彩变量 + body 背景 + 全局样式 |
| Create | `components/ParticleBackground.tsx` | 全局粒子 Canvas 组件 |
| Modify | `app/layout.tsx` | 注入 ParticleBackground |
| Modify | `components/Navbar.tsx` | 毛玻璃导航 |
| Modify | `components/Footer.tsx` | 暗色页脚 |
| Modify | `components/ProgressBar.tsx` | 细线发光进度条 |
| Modify | `components/destiny/ReincarnationGate.tsx` | 移除自有粒子，更新光环/灵根 |
| Modify | `components/destiny/DestinyQuiz.tsx` | 深墨卡片 + 发光选项 |
| Modify | `components/destiny/SliderQuestion.tsx` | 深墨卡片 + 自定义滑块 |
| Modify | `components/destiny/RankingQuestion.tsx` | 深墨卡片 + 发光拖拽项 |
| Modify | `components/destiny/RadarChart.tsx` | 深色网格 + 翠绿数据 |
| Modify | `app/destiny/result/[id]/page.tsx` | 境界色阶 + 结局色 + 陨落裂纹 |
| Modify | `components/ShareButtons.tsx` | 翠绿主按钮 |

---

### Task 1: 色彩体系 — globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: 替换 globals.css 全部内容**

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --font-serif: Georgia, "Noto Serif SC", serif;

  /* 背景层 */
  --color-ink-950: #0a0e0d;
  --color-ink-900: #111a16;
  --color-ink-800: #1a2820;

  /* 翠玉绿（主色） */
  --color-jade-500: #22c47a;
  --color-jade-400: #4ade9a;
  --color-jade-300: #6fedb5;
  --color-jade-200: #a8f5d4;
  --color-jade-100: #d4faea;

  /* 金色（点睛） */
  --color-gold-bright: #e8c86a;
  --color-gold-400: #d4a843;
  --color-gold-dim: #c8a85a;
  --color-gold-200: #f5e4a8;

  /* 陨落红 */
  --color-death-600: #7f1d1d;
  --color-death-500: #b91c1c;
  --color-death-400: #ef4444;
  --color-death-200: #fca5a5;

  /* 雾白（正文） */
  --color-mist-100: #e8f0ec;
  --color-mist-200: #b8ccc2;
  --color-mist-400: #6a8878;

  /* bamboo-* 别名（保持旧代码兼容） */
  --color-bamboo-50: #0a0e0d;
  --color-bamboo-100: #111a16;
  --color-bamboo-200: #1a2820;
  --color-bamboo-300: #22c47a;
  --color-bamboo-400: #4ade9a;
  --color-bamboo-500: #6fedb5;
  --color-bamboo-600: #a8f5d4;
  --color-bamboo-700: #e8f0ec;
}

body {
  background-color: #0a0e0d;
  background-image:
    radial-gradient(ellipse 80% 60% at 15% 20%, rgba(74, 222, 154, 0.10) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 80%, rgba(212, 168, 67, 0.07) 0%, transparent 55%),
    radial-gradient(ellipse 50% 70% at 50% 50%, rgba(34, 196, 122, 0.05) 0%, transparent 70%);
  color: #e8f0ec;
  font-family: var(--font-sans);
}

/* 通用卡片渐变描边（伪元素） */
.card-glow::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid transparent;
  background: linear-gradient(135deg, rgba(74,222,154,0.15), transparent 50%, rgba(212,168,67,0.08)) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
  pointer-events: none;
}

/* 陨落卡片裂纹背景纹理 */
.card-death::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid transparent;
  background: linear-gradient(135deg, rgba(239,68,68,0.25), transparent 50%, rgba(185,28,28,0.12)) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
  pointer-events: none;
}
.card-death::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Cline x1='80' y1='0' x2='60' y2='300' stroke='%23ef4444' stroke-width='0.8' opacity='0.06'/%3E%3Cline x1='200' y1='20' x2='170' y2='280' stroke='%23ef4444' stroke-width='0.6' opacity='0.05'/%3E%3Cline x1='320' y1='0' x2='290' y2='300' stroke='%23ef4444' stroke-width='0.7' opacity='0.04'/%3E%3Cline x1='140' y1='0' x2='160' y2='300' stroke='%23ef4444' stroke-width='0.5' opacity='0.04'/%3E%3C/svg%3E");
  background-size: cover;
  pointer-events: none;
}

/* 分隔线 */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
}
.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #1a2820, #22c47a, #1a2820, transparent);
}
.divider-diamond {
  width: 6px;
  height: 6px;
  background: #4ade9a;
  transform: rotate(45deg);
  box-shadow: 0 0 8px #4ade9a;
  flex-shrink: 0;
}

/* 水墨角落纹饰 */
.corner-ornament {
  position: absolute;
  width: 56px;
  height: 56px;
  opacity: 0.15;
  pointer-events: none;
}
.corner-ornament-tl { top: 12px; left: 12px; }
.corner-ornament-br { bottom: 12px; right: 12px; transform: rotate(180deg); }

/* 主按钮 */
.btn-primary {
  background: linear-gradient(135deg, #22c47a, #4ade9a);
  color: #0a0e0d;
  border: none;
  border-radius: 100px;
  padding: 12px 36px;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 0.2em;
  cursor: pointer;
  box-shadow: 0 0 24px rgba(74,222,154,0.3), 0 4px 12px rgba(0,0,0,0.4);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
  font-family: var(--font-serif);
}
.btn-primary:hover {
  box-shadow: 0 0 36px rgba(74,222,154,0.45), 0 4px 16px rgba(0,0,0,0.5);
  transform: translateY(-1px);
}

/* 次要按钮 */
.btn-secondary {
  background: transparent;
  color: #6fedb5;
  border: 1px solid rgba(74,222,154,0.35);
  border-radius: 100px;
  padding: 11px 32px;
  font-size: 14px;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  font-family: var(--font-serif);
}
.btn-secondary:hover {
  border-color: #4ade9a;
  box-shadow: 0 0 16px rgba(74,222,154,0.15);
}

/* 陨落按钮（裂纹） */
.btn-death {
  position: relative;
  background: linear-gradient(135deg, #7f1d1d, #b91c1c);
  color: #fca5a5;
  border: 1px solid rgba(239,68,68,0.5);
  border-radius: 100px;
  padding: 12px 36px;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 0.2em;
  cursor: pointer;
  box-shadow: 0 0 24px rgba(239,68,68,0.25), 0 4px 12px rgba(0,0,0,0.4);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
  font-family: var(--font-serif);
  overflow: hidden;
}
.btn-death::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='48'%3E%3Cpath d='M40 0 L35 48' stroke='%23ef4444' stroke-width='1' opacity='0.3'/%3E%3Cpath d='M90 5 L82 43' stroke='%23ef4444' stroke-width='0.8' opacity='0.25'/%3E%3Cpath d='M140 0 L135 48' stroke='%23ef4444' stroke-width='1' opacity='0.3'/%3E%3Cpath d='M170 8 L165 40' stroke='%23ef4444' stroke-width='0.6' opacity='0.2'/%3E%3C/svg%3E");
  background-size: cover;
  pointer-events: none;
}
.btn-death:hover {
  box-shadow: 0 0 36px rgba(239,68,68,0.4), 0 4px 16px rgba(0,0,0,0.5);
  transform: translateY(-1px);
}

/* 滑块自定义样式 */
input[type="range"].jade-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: #1a2820;
  border-radius: 100px;
  outline: none;
  cursor: pointer;
}
input[type="range"].jade-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4ade9a;
  box-shadow: 0 0 12px rgba(74,222,154,0.5);
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}
input[type="range"].jade-slider::-webkit-slider-thumb:hover {
  box-shadow: 0 0 20px rgba(74,222,154,0.7);
}
input[type="range"].jade-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4ade9a;
  box-shadow: 0 0 12px rgba(74,222,154,0.5);
  cursor: pointer;
  border: none;
}
input[type="range"].jade-slider:disabled {
  opacity: 0.4;
}
```

- [ ] **Step 2: 验证构建无报错**

```bash
cd /Users/fujianwei/fanren-wiki && npm run build 2>&1 | tail -20
```

期望：无 TypeScript/CSS 错误，build 成功。

- [ ] **Step 3: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add app/globals.css
git commit -m "feat(visual): 新色彩体系 ink/jade/gold/mist + 全局背景光晕 + 通用样式类"
```

---

### Task 2: 全局粒子组件 + layout 注入

**Files:**
- Create: `components/ParticleBackground.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: 创建 ParticleBackground.tsx**

```tsx
"use client";

import { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;

    interface Particle {
      x: number; y: number; r: number;
      speedX: number; speedY: number;
      opacity: number; opacityDir: number;
      isGold: boolean;
    }

    let particles: Particle[] = [];

    function init() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
      particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.3,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: -(Math.random() * 0.35 + 0.1),
        opacity: Math.random() * 0.5 + 0.1,
        opacityDir: Math.random() > 0.5 ? 1 : -1,
        isGold: Math.random() < 0.12,
      }));
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        const hue = p.isGold ? 42 : 152;
        const sat = p.isGold ? 65 : 55;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, ${sat}%, 65%, ${p.opacity})`;
        ctx.fill();

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        grad.addColorStop(0, `hsla(${hue}, ${sat}%, 70%, ${p.opacity * 0.35})`);
        grad.addColorStop(1, `hsla(${hue}, ${sat}%, 70%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.opacityDir * 0.008;
        if (p.opacity > 0.75 || p.opacity < 0.05) p.opacityDir *= -1;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
      }
      animRef.current = requestAnimationFrame(draw);
    }

    init();
    draw();

    const handleResize = () => init();
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
```

- [ ] **Step 2: 修改 layout.tsx**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

export const metadata: Metadata = {
  title: "凡人修仙传·人界篇 | 你是哪位修仙人物？",
  description: "凡人修仙传人界篇主题网站，完成12道修仙情景题，测试你最像哪位人界人物。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className="min-h-screen flex flex-col">
        <ParticleBackground />
        <Navbar />
        <main className="flex-1 relative" style={{ zIndex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: 验证构建**

```bash
cd /Users/fujianwei/fanren-wiki && npm run build 2>&1 | tail -20
```

期望：build 成功，无报错。

- [ ] **Step 4: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add components/ParticleBackground.tsx app/layout.tsx
git commit -m "feat(visual): 全局粒子背景组件，注入 layout"
```

---

### Task 3: 导航栏 + 页脚

**Files:**
- Modify: `components/Navbar.tsx`
- Modify: `components/Footer.tsx`

- [ ] **Step 1: 修改 Navbar.tsx**

```tsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      className="w-full border-b px-6 py-3 sticky top-0"
      style={{
        backgroundColor: "rgba(10,14,13,0.85)",
        backdropFilter: "blur(12px)",
        borderColor: "#1a2820",
        zIndex: 50,
      }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="font-serif font-bold text-lg tracking-widest"
          style={{
            background: "linear-gradient(90deg, #6fedb5, #d4a843)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          凡人修仙传·人界篇
        </Link>
        <div className="flex gap-6 text-sm" style={{ color: "#6a8878" }}>
          <span className="cursor-not-allowed opacity-50" title="敬请期待">人物百科</span>
          <span className="cursor-not-allowed opacity-50" title="敬请期待">地图势力</span>
          <span className="cursor-not-allowed opacity-50" title="敬请期待">剧情时间线</span>
          <Link
            href="/quiz"
            className="font-medium transition-colors"
            style={{ color: "#6fedb5" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#4ade9a")}
            onMouseLeave={e => (e.currentTarget.style.color = "#6fedb5")}
          >
            人物测试
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: 修改 Footer.tsx**

```tsx
export default function Footer() {
  return (
    <footer
      className="w-full py-6 mt-16 relative"
      style={{
        backgroundColor: "#0a0e0d",
        borderTop: "1px solid #1a2820",
        zIndex: 1,
      }}
    >
      <div className="max-w-5xl mx-auto text-center text-sm" style={{ color: "#6a8878" }}>
        <p>© 2026 凡人修仙传·人界篇 | 本站为粉丝创作，内容版权归原作者忘语所有</p>
        <p className="mt-1 text-xs opacity-70">非商业用途，仅供粉丝交流</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add components/Navbar.tsx components/Footer.tsx
git commit -m "feat(visual): 毛玻璃导航栏 + 暗色页脚"
```

---

### Task 4: 进度条

**Files:**
- Modify: `components/ProgressBar.tsx`

- [ ] **Step 1: 修改 ProgressBar.tsx**

```tsx
interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2" style={{ fontSize: "11px", color: "#6a8878", letterSpacing: "0.1em" }}>
        <span>第 {current} 题</span>
        <span>共 {total} 题</span>
      </div>
      <div className="w-full rounded-full" style={{ backgroundColor: "#1a2820", height: "3px" }}>
        <div
          className="rounded-full transition-all duration-300"
          style={{
            width: `${percent}%`,
            height: "3px",
            background: "linear-gradient(90deg, #22c47a, #4ade9a)",
            boxShadow: "0 0 8px rgba(74,222,154,0.5)",
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add components/ProgressBar.tsx
git commit -m "feat(visual): 细线发光进度条"
```

---

### Task 5: ReincarnationGate — 移除自有粒子 + 更新光环/灵根

**Files:**
- Modify: `components/destiny/ReincarnationGate.tsx`

背景说明：原组件有自己的 Canvas 粒子动画，现在全局已有 ParticleBackground，移除重复的 Canvas。灵根展示改为四级亮度圆圈（天灵根金色、双灵根翠绿、三灵根弱绿、伪灵根极弱绿）。

- [ ] **Step 1: 替换 ReincarnationGate.tsx 全部内容**

```tsx
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
                backgroundColor: `${root.glowColor}`,
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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add components/destiny/ReincarnationGate.tsx
git commit -m "feat(visual): ReincarnationGate 移除自有粒子，更新光环/灵根样式"
```

---

### Task 6: DestinyQuiz — 深墨卡片 + 发光选项

**Files:**
- Modify: `components/destiny/DestinyQuiz.tsx`

只改样式部分（JSX className 和 style），逻辑不动。

- [ ] **Step 1: 修改 DestinyQuiz.tsx 中的 JSX 渲染部分**

找到文件第 254 行开始的 `return (` 块，将整个返回的 JSX 替换为：

```tsx
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <ProgressBar current={currentIdx + 1} total={total} />
      </div>

      {timeLeft !== null && (
        <div className="text-center mb-4">
          <span
            className="text-2xl font-bold font-serif transition-colors duration-500"
            style={{ color: timeLeft <= 2 ? "#ef4444" : "#4ade9a" }}
          >
            {timeLeft}
          </span>
          <span className="text-sm ml-1" style={{ color: "#6a8878" }}>秒</span>
        </div>
      )}

      {(resolvedQuestion.type === "choice" || resolvedQuestion.type === "image-choice") && (() => {
        const q = resolvedQuestion as ChoiceQuestion;
        return (
          <div
            className="rounded-2xl p-8 relative overflow-hidden card-glow"
            style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
          >
            {/* 水墨角落纹饰 */}
            <svg className="corner-ornament corner-ornament-tl" viewBox="0 0 56 56" fill="none">
              <path d="M2 2 L2 28 Q2 54 28 54" stroke="#4ade9a" strokeWidth="1.5" fill="none"/>
              <circle cx="2" cy="2" r="2" fill="#4ade9a"/>
              <path d="M9 2 L9 21 Q9 47 35 47" stroke="#4ade9a" strokeWidth="0.7" fill="none" opacity="0.4"/>
            </svg>
            <svg className="corner-ornament corner-ornament-br" viewBox="0 0 56 56" fill="none">
              <path d="M2 2 L2 28 Q2 54 28 54" stroke="#4ade9a" strokeWidth="1.5" fill="none"/>
              <circle cx="2" cy="2" r="2" fill="#4ade9a"/>
              <path d="M9 2 L9 21 Q9 47 35 47" stroke="#4ade9a" strokeWidth="0.7" fill="none" opacity="0.4"/>
            </svg>

            <p className="text-xs tracking-widest mb-4" style={{ color: "#6a8878" }}>情景 {currentIdx + 1}</p>
            <h2 className="font-serif text-lg leading-relaxed mb-8" style={{ color: "#e8f0ec" }}>{q.text}</h2>
            <div className="flex flex-col gap-4">
              {q.options.map((opt, i) => {
                const isChosen = selectedChoice === opt.text;
                const isDisabled = !!selectedChoice && !isChosen;
                return (
                  <button
                    key={i}
                    onClick={() => handleChoiceConfirm(opt, scores, votes)}
                    disabled={!!selectedChoice}
                    className="w-full text-left p-5 rounded-xl transition-all duration-200"
                    style={{
                      border: isChosen ? "1px solid #4ade9a" : "1px solid #1a2820",
                      backgroundColor: isChosen ? "rgba(74,222,154,0.12)" : "rgba(26,40,32,0.6)",
                      color: isChosen ? "#d4faea" : isDisabled ? "#6a8878" : "#b8ccc2",
                      boxShadow: isChosen ? "0 0 20px rgba(74,222,154,0.18)" : "none",
                      opacity: isDisabled ? 0.35 : 1,
                      cursor: selectedChoice ? "default" : "pointer",
                    }}
                    onMouseEnter={e => {
                      if (!selectedChoice) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#22c47a";
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(74,222,154,0.08)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#a8f5d4";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 16px rgba(74,222,154,0.12)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!selectedChoice && !isChosen) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#1a2820";
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(26,40,32,0.6)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#b8ccc2";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                      }
                    }}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {resolvedQuestion.type === "slider" && (
        <SliderQuestion
          text={(resolvedQuestion as SliderQ).text}
          leftLabel={(resolvedQuestion as SliderQ).leftLabel}
          rightLabel={(resolvedQuestion as SliderQ).rightLabel}
          value={sliderValue}
          onChange={setSliderValue}
          onConfirm={handleSliderConfirm}
        />
      )}

      {resolvedQuestion.type === "ranking" && (
        <RankingQuestion
          text={(resolvedQuestion as RankingQ).text}
          options={(resolvedQuestion as RankingQ).options.map((o, i) => ({ id: String(i), text: o.text }))}
          order={rankOrder}
          onOrderChange={setRankOrder}
          onConfirm={handleRankingConfirm}
        />
      )}
    </div>
  );
```

- [ ] **Step 2: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add components/destiny/DestinyQuiz.tsx
git commit -m "feat(visual): 答题卡片深墨样式 + 发光选项按钮"
```

---

### Task 7: SliderQuestion + RankingQuestion

**Files:**
- Modify: `components/destiny/SliderQuestion.tsx`
- Modify: `components/destiny/RankingQuestion.tsx`

- [ ] **Step 1: 替换 SliderQuestion.tsx 全部内容**

```tsx
"use client";

interface Props {
  text: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
  onConfirm: () => void;
  disabled?: boolean;
}

export function sliderSegment(value: number): "left" | "middle" | "right" {
  if (value <= 33) return "left";
  if (value <= 66) return "middle";
  return "right";
}

export default function SliderQuestion({ text, leftLabel, rightLabel, value, onChange, onConfirm, disabled }: Props) {
  return (
    <div
      className="rounded-2xl p-8 relative overflow-hidden card-glow"
      style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
    >
      <p className="text-xs tracking-widest mb-4" style={{ color: "#6a8878" }}>程度选择</p>
      <h2 className="font-serif text-lg leading-relaxed mb-8" style={{ color: "#e8f0ec" }}>{text}</h2>

      <div className="flex justify-between text-sm mb-4" style={{ color: "#6a8878" }}>
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="jade-slider"
      />

      <div className="mt-8 text-center">
        <button
          disabled={disabled}
          onClick={onConfirm}
          className="btn-primary"
          style={{ opacity: disabled ? 0.5 : 1 }}
        >
          确认
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 替换 RankingQuestion.tsx 全部内容**

```tsx
"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface RankOption { id: string; text: string; }

interface Props {
  text: string;
  options: RankOption[];
  order: string[];
  onOrderChange: (newOrder: string[]) => void;
  onConfirm: () => void;
  disabled?: boolean;
}

function SortableItem({ id, text, rank }: { id: string; text: string; rank: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        border: isDragging ? "1px solid #4ade9a" : "1px solid #1a2820",
        backgroundColor: isDragging ? "rgba(74,222,154,0.08)" : "#111a16",
        boxShadow: isDragging ? "0 0 16px rgba(74,222,154,0.25)" : "none",
        opacity: isDragging ? 0.8 : 1,
        borderRadius: "12px",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: "grab",
        userSelect: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      {...attributes}
      {...listeners}
    >
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ backgroundColor: "#4ade9a", color: "#0a0e0d" }}
      >
        {rank}
      </span>
      <span className="text-sm" style={{ color: "#b8ccc2" }}>{text}</span>
    </div>
  );
}

export default function RankingQuestion({ text, options, order, onOrderChange, onConfirm, disabled }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = order.indexOf(String(active.id));
      const newIndex = order.indexOf(String(over.id));
      onOrderChange(arrayMove(order, oldIndex, newIndex));
    }
  }

  return (
    <div
      className="rounded-2xl p-8 relative overflow-hidden card-glow"
      style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
    >
      <p className="text-xs tracking-widest mb-4" style={{ color: "#6a8878" }}>拖拽排序</p>
      <h2 className="font-serif text-lg leading-relaxed mb-6" style={{ color: "#e8f0ec" }}>{text}</h2>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3 mb-6">
            {order.map((id, idx) => {
              const opt = options.find((o) => o.id === id)!;
              return <SortableItem key={id} id={id} text={opt.text} rank={idx + 1} />;
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div className="text-center">
        <button
          disabled={disabled}
          onClick={onConfirm}
          className="btn-primary"
          style={{ opacity: disabled ? 0.5 : 1 }}
        >
          确认排序
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add components/destiny/SliderQuestion.tsx components/destiny/RankingQuestion.tsx
git commit -m "feat(visual): 滑块题 + 排序题深墨样式"
```

---

### Task 8: RadarChart + ShareButtons

**Files:**
- Modify: `components/destiny/RadarChart.tsx`
- Modify: `components/ShareButtons.tsx`

- [ ] **Step 1: 替换 RadarChart.tsx 全部内容**

```tsx
interface Dimension {
  label: string;
  value: number; // 0-100
}

interface Props {
  dimensions: Dimension[];
  size?: number;
}

export default function RadarChart({ dimensions, size = 200 }: Props) {
  const center = size / 2;
  const radius = size * 0.38;
  const n = dimensions.length;

  function angleOf(i: number) {
    return (Math.PI * 2 * i) / n - Math.PI / 2;
  }

  function pointAt(i: number, r: number) {
    const a = angleOf(i);
    return { x: center + r * Math.cos(a), y: center + r * Math.sin(a) };
  }

  const gridLevels = [0.33, 0.66, 1.0];
  const dataPoints = dimensions.map((d, i) => pointAt(i, (d.value / 100) * radius));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <filter id="jade-glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* 网格 */}
      {gridLevels.map((level, li) => {
        const pts = Array.from({ length: n }, (_, i) => pointAt(i, radius * level));
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
        return <path key={li} d={path} fill="none" stroke="#1a2820" strokeWidth="1" />;
      })}

      {/* 轴线 */}
      {Array.from({ length: n }, (_, i) => {
        const p = pointAt(i, radius);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#1a2820" strokeWidth="1" />;
      })}

      {/* 数据面积 */}
      <path d={dataPath} fill="rgba(74,222,154,0.18)" stroke="#4ade9a" strokeWidth="2" filter="url(#jade-glow)" />

      {/* 数据点 */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#4ade9a" filter="url(#jade-glow)" />
      ))}

      {/* 标签 */}
      {dimensions.map((d, i) => {
        const p = pointAt(i, radius + 18);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill="#e8f0ec"
            fontFamily="serif"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: 替换 ShareButtons.tsx 全部内容**

```tsx
"use client";

import { useState } from "react";

interface ShareButtonsProps {
  characterName: string;
  mbti: string;
  resultUrl: string;
}

export default function ShareButtons({ characterName, mbti, resultUrl }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = `我在凡人修仙传人界篇人物测试中，测出我最像「${characterName}」(${mbti})！你也来测测看 → ${resultUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("请手动复制以下内容：", text);
    }
  }

  const weiboText = encodeURIComponent(
    `我在凡人修仙传人界篇人物测试中，测出我最像「${characterName}」(${mbti})！你也来测测看 → ${resultUrl}`
  );
  const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(resultUrl)}&title=${weiboText}`;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button onClick={handleCopy} className="btn-primary flex-1">
        {copied ? "✓ 已复制！" : "复制分享文字"}
      </button>
      <a
        href={weiboUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-center font-bold text-sm tracking-widest rounded-full py-3 px-6 transition-all duration-200"
        style={{
          backgroundColor: "#b91c1c",
          color: "#fca5a5",
          border: "1px solid rgba(239,68,68,0.4)",
          boxShadow: "0 0 16px rgba(185,28,28,0.3)",
          fontFamily: "var(--font-serif)",
        }}
      >
        微博分享
      </a>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add components/destiny/RadarChart.tsx components/ShareButtons.tsx
git commit -m "feat(visual): 雷达图深色配色 + 分享按钮翠绿/深红样式"
```

---

### Task 9: 结果页 — 境界色阶 + 结局徽章 + 陨落裂纹

**Files:**
- Modify: `app/destiny/result/[id]/page.tsx`

背景说明：
- 境界颜色：炼气/筑基→翠绿，结丹→淡金，元婴→中金，化神→亮金
- 结局分三类：飞升(feisheng)→金色，陨落类(tupo/doufa/xinmo/beici/moxiu/bawang)→红色+裂纹，其余→翠绿
- 陨落卡片：额外的 `card-death` class，背景裂纹纹理，徽章上叠加 SVG 裂纹线

- [ ] **Step 1: 在 page.tsx 顶部（import 之后）添加辅助函数**

在 `const realms = realmsData as Realm[];` 之前插入：

```tsx
const DEATH_OUTCOMES = new Set(["tupo", "doufa", "xinmo", "beici", "moxiu", "bawang"]);

function getRealmStyle(slug: string): { color: string; glow: string; filter?: string } {
  switch (slug) {
    case "jiedan": return { color: "#c8a85a", glow: "rgba(200,168,90,0.35)" };
    case "yuanying": return { color: "#d4a843", glow: "rgba(212,168,67,0.45)" };
    case "huashen": return {
      color: "#e8c86a",
      glow: "rgba(232,200,106,0.55)",
      filter: "drop-shadow(0 0 12px rgba(232,200,106,0.5))",
    };
    default: // lianqi, zhuji
      return { color: "#6fedb5", glow: "rgba(111,237,181,0.3)" };
  }
}

function getOutcomeStyle(slug: string): {
  bg: string; border: string; text: string; glow: string; isDeath: boolean; isAscend: boolean;
} {
  if (slug === "feisheng") return {
    bg: "rgba(212,168,67,0.15)", border: "rgba(212,168,67,0.5)",
    text: "#f5e4a8", glow: "rgba(212,168,67,0.2)", isDeath: false, isAscend: true,
  };
  if (DEATH_OUTCOMES.has(slug)) return {
    bg: "rgba(127,29,29,0.3)", border: "rgba(239,68,68,0.5)",
    text: "#fca5a5", glow: "rgba(239,68,68,0.2)", isDeath: true, isAscend: false,
  };
  return {
    bg: "rgba(74,222,154,0.1)", border: "rgba(74,222,154,0.4)",
    text: "#a8f5d4", glow: "rgba(74,222,154,0.15)", isDeath: false, isAscend: false,
  };
}

function getKeywordStyle(isDeath: boolean, isAscend: boolean): { color: string; border: string; bg: string } {
  if (isAscend) return { color: "#f5e4a8", border: "rgba(212,168,67,0.4)", bg: "rgba(212,168,67,0.08)" };
  if (isDeath) return { color: "#fca5a5", border: "rgba(239,68,68,0.35)", bg: "rgba(127,29,29,0.2)" };
  return { color: "#a8f5d4", border: "rgba(74,222,154,0.3)", bg: "rgba(74,222,154,0.08)" };
}
```

- [ ] **Step 2: 替换 DestinyResultPage 的 return 块**

找到 `return (` 开始的整个 JSX，替换为：

```tsx
  const realmStyle = getRealmStyle(realmSlug);
  const outcomeStyle = getOutcomeStyle(outcomeSlug);
  const kwStyle = getKeywordStyle(outcomeStyle.isDeath, outcomeStyle.isAscend);
  const cardClass = outcomeStyle.isDeath ? "card-death" : "card-glow";

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">

      {/* 第一层：修仙人生 */}
      <div
        className={`rounded-2xl p-8 mb-6 relative overflow-hidden ${cardClass}`}
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
      >
        <p className="text-xs tracking-widest mb-2 text-center" style={{ color: "#6a8878" }}>你的修仙人生</p>
        <h1
          className="text-4xl font-serif font-bold text-center mb-1"
          style={{
            background: `linear-gradient(135deg, ${realmStyle.color}, ${realmStyle.color}cc)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: realmStyle.filter,
          }}
        >
          {realm.name}
        </h1>
        <p className="text-sm text-center mb-4" style={{ color: "#6a8878" }}>{realm.description}</p>
        <p className="text-center mb-6" style={{ color: "#b8ccc2" }}>
          你活了{" "}
          <span className="font-bold text-xl" style={{ color: "#e8f0ec" }}>{lifespan}</span>
          {" "}岁
        </p>

        {/* 结局徽章 */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <span
              className="inline-block text-sm font-bold px-5 py-1.5 rounded-full tracking-widest"
              style={{
                backgroundColor: outcomeStyle.bg,
                border: `1px solid ${outcomeStyle.border}`,
                color: outcomeStyle.text,
                boxShadow: `0 0 16px ${outcomeStyle.glow}`,
              }}
            >
              {outcome.name}
            </span>
            {/* 陨落裂纹叠加 */}
            {outcomeStyle.isDeath && (
              <svg
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                viewBox="0 0 120 32"
                preserveAspectRatio="none"
              >
                <path d="M25 2 L22 15 L28 18 L24 30" stroke="#ef4444" strokeWidth="0.8" fill="none" opacity="0.5"/>
                <path d="M70 0 L68 32" stroke="#ef4444" strokeWidth="0.6" fill="none" opacity="0.4"/>
                <path d="M95 3 L92 14 L97 16 L94 29" stroke="#ef4444" strokeWidth="0.7" fill="none" opacity="0.45"/>
              </svg>
            )}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-center" style={{ color: "#b8ccc2" }}>{outcome.description}</p>
      </div>

      {/* 分隔线 */}
      <div className="divider">
        <div className="divider-line" />
        <div className="divider-diamond" />
        <div className="divider-line" />
      </div>

      {/* 第二层：性格分析 */}
      <div
        className="rounded-2xl p-8 mb-6 relative overflow-hidden card-glow"
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
      >
        <p className="text-xs tracking-widest mb-4 text-center" style={{ color: "#6a8878" }}>你的性格分析</p>
        <div className="flex justify-center mb-4">
          <RadarChart
            dimensions={[
              { label: "勇气", value: radarScores.courage },
              { label: "悟性", value: radarScores.wisdom },
              { label: "情义", value: radarScores.loyalty },
              { label: "野心", value: radarScores.ambition },
              { label: "向道之心", value: radarScores.perseverance },
            ]}
            size={200}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {outcome.keywords.map((kw) => (
            <span
              key={kw}
              className="text-xs px-3 py-1 rounded-full"
              style={{
                backgroundColor: kwStyle.bg,
                border: `1px solid ${kwStyle.border}`,
                color: kwStyle.color,
              }}
            >
              {kw}
            </span>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-center" style={{ color: "#b8ccc2" }}>{outcome.personalityNote}</p>
      </div>

      <div className="divider">
        <div className="divider-line" />
        <div className="divider-diamond" />
        <div className="divider-line" />
      </div>

      {/* 第三层：命运镜像 */}
      <div
        className="rounded-2xl p-8 mb-6 relative overflow-hidden card-glow"
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
      >
        <p className="text-xs tracking-widest mb-4 text-center" style={{ color: "#6a8878" }}>你的命运镜像</p>
        <p className="text-sm text-center mb-1" style={{ color: "#6a8878" }}>你与</p>
        <h2 className="text-3xl font-serif font-bold text-center mb-1" style={{ color: "#e8f0ec" }}>{character.name}</h2>
        <p className="text-xs text-center mb-4" style={{ color: "#6a8878" }}>{character.title} · {character.mbti}</p>
        <p className="text-sm leading-relaxed text-center mb-4" style={{ color: "#b8ccc2" }}>{character.description}</p>
        <div
          className="rounded-r-lg px-5 py-4"
          style={{ backgroundColor: "rgba(26,40,32,0.6)", borderLeft: "3px solid #22c47a" }}
        >
          <p className="text-xs mb-1" style={{ color: "#6a8878" }}>若你身处人界</p>
          <p className="text-sm font-serif leading-relaxed italic" style={{ color: "#e8f0ec" }}>「{character.quote}」</p>
        </div>
      </div>

      {/* 底部操作 */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
      >
        <p className="text-sm text-center mb-4" style={{ color: "#6a8878" }}>分享你的修仙命运</p>
        <ShareButtons characterName={character.name} mbti={character.mbti} resultUrl={resultUrl} />
      </div>

      <div className="text-center">
        <Link
          href="/destiny"
          className={outcomeStyle.isDeath ? "btn-death" : "btn-secondary"}
          style={{ display: "inline-block" }}
        >
          重新测试
        </Link>
      </div>
    </div>
  );
```

- [ ] **Step 3: 验证构建**

```bash
cd /Users/fujianwei/fanren-wiki && npm run build 2>&1 | tail -30
```

期望：build 成功，无 TypeScript 错误。

- [ ] **Step 4: 运行测试确认逻辑未破坏**

```bash
cd /Users/fujianwei/fanren-wiki && npm test 2>&1 | tail -20
```

期望：42 tests passed。

- [ ] **Step 5: Commit**

```bash
cd /Users/fujianwei/fanren-wiki
git add app/destiny/result/[id]/page.tsx
git commit -m "feat(visual): 结果页境界色阶 + 结局三色系 + 陨落裂纹特效"
```
