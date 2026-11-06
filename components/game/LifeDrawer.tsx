"use client";

import Link from "next/link";
import { useState } from "react";
import GameDialog from "./GameDialog";
import StatusPanel from "./StatusPanel";
import RelationsPanel from "./RelationsPanel";
import LifeTimeline from "./LifeTimeline";
import { useGame } from "./GameProvider";

type Tab = "self" | "relations" | "timeline";

const TABS: Array<{ id: Tab; label: string; hint: string }> = [
  { id: "self", label: "此身", hint: "属性与谶语" },
  { id: "relations", label: "此世缘", hint: "人物与状态" },
  { id: "timeline", label: "此生年轮", hint: "关键经历" },
];

export default function LifeDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useGame();
  const [tab, setTab] = useState<Tab>("self");


  if (!open) return null;
  const lastLife = state.meta.lives.at(-1);

  return (
    <GameDialog label="此生档案" onClose={onClose} drawer>
      <aside className="flex min-h-0 flex-1 flex-col" style={{ backgroundColor: "#0b130f", borderLeft: "1px solid #31463b", boxShadow: "-28px 0 80px rgba(0,0,0,.45)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #203129" }}>
          <div>
            <div className="text-[11px] tracking-[.32em]" style={{ color: "#5f7e6e" }}>LIFE LEDGER</div>
            <div className="font-serif text-lg font-bold" style={{ color: "#edf5f1" }}>{state.characterName} · 此生档案</div>
          </div>
          <button onClick={onClose} aria-label="关闭此生档案" className="dialog-close grid place-items-center rounded-full text-lg" style={{ color: "#8ba295", border: "1px solid #2a4035" }}>×</button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 p-3" style={{ borderBottom: "1px solid #203129" }}>
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              aria-pressed={tab === item.id}
              className="rounded-xl px-2 py-2.5 text-center"
              style={{
                color: tab === item.id ? "#eaf5ef" : "#6f8c7d",
                backgroundColor: tab === item.id ? "#16251d" : "#0e1712",
                border: `1px solid ${tab === item.id ? "#4ade9a55" : "#1b2b23"}`,
              }}
            >
              <span className="block font-serif text-sm font-bold">{item.label}</span>
              <span className="mt-0.5 block text-[11px]">{item.hint}</span>
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
          {tab === "self" && <StatusPanel />}
          {tab === "relations" && (
            <div className="space-y-3">
              <RelationsPanel state={state} />
              {lastLife && (
                <section className="rounded-2xl px-4 py-4" style={{ backgroundColor: "#111a16", border: "1px solid #26352d" }}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-serif text-sm" style={{ color: "#e8f0ec" }}>三生镜 · 前世一瞥</span>
                    <span className="text-[11px]" style={{ color: "#93ad9f" }}>第 {lastLife.lifeNumber} 世</span>
                  </div>
                  <p className="text-sm leading-6" style={{ color: "#b8ccc2" }}>{lastLife.endingTitle} · {lastLife.finalAge}岁</p>
                  <p className="mt-1 text-[13px]" style={{ color: "#d4a843" }}>{lastLife.prophecyText}</p>
                </section>
              )}
            </div>
          )}
          {tab === "timeline" && <LifeTimeline state={state} />}
          <Link href="/game/atlas" className="mt-3 block rounded-xl px-4 py-3 text-center text-[13px]" style={{ color: "#d4a843", border: "1px solid #d4a84333", backgroundColor: "#16140a" }} onClick={onClose}>
            打开命途图鉴
          </Link>
        </div>
      </aside>
    </GameDialog>
  );
}
