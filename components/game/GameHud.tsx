"use client";

import { useGame } from "./GameProvider";
import type { HeartIntent, RealmSlug } from "@/types/game";

const REALM_NAMES: Record<RealmSlug, string> = {
  lianqi: "炼气",
  zhuji: "筑基",
  jiedan: "结丹",
  yuanying: "元婴",
  huashen: "化神",
};

const INTENT_NAMES: Record<HeartIntent, string> = {
  longevity: "求长生",
  revenge: "求复仇",
  guard: "求守护",
  freedom: "求自在",
};

interface Props {
  onOpenLife: () => void;
  onOpenInventory: () => void;
  onOpenMarket: () => void;
  onBattle: () => void;
}

function Metric({ label, value, accent = "#d8e5de", className = "" }: { label: string; value: string; accent?: string; className?: string }) {
  return (
    <div className={`min-w-0 px-2.5 md:px-3 ${className}`}>
      <div className="text-[8px] md:text-[9px] tracking-[.16em] uppercase" style={{ color: "#527064" }}>{label}</div>
      <div className="mt-0.5 font-serif text-[11px] md:text-sm font-bold truncate" style={{ color: accent }}>{value}</div>
    </div>
  );
}

export default function GameHud({ onOpenLife, onOpenInventory, onOpenMarket, onBattle }: Props) {
  const { state } = useGame();
  const subRealm = state.xp >= 90 ? "圆满" : state.xp >= 71 ? "后期" : state.xp >= 31 ? "中期" : "初期";
  const urgent = state.age >= state.lifespanMax * 0.82 || state.injury === "heavy" || state.injury === "dying";

  return (
    <header
      className="relative z-30 mb-3 overflow-hidden rounded-2xl"
      style={{
        backgroundColor: "rgba(10, 17, 13, .88)",
        border: "1px solid #26382f",
        boxShadow: "0 18px 50px rgba(0,0,0,.22)",
        backdropFilter: "blur(18px)",
      }}
    >
      <div className="flex items-stretch min-h-[70px]">
        <div className="hidden sm:flex items-center gap-3 px-4 pr-5" style={{ borderRight: "1px solid #1d2c25" }}>
          <div
            className="relative grid h-10 w-10 place-items-center rounded-xl font-serif text-lg font-bold"
            style={{ color: "#d4a843", background: "linear-gradient(145deg, #1b241b, #0b110e)", border: "1px solid #d4a84344" }}
          >
            {state.characterName.slice(0, 1)}
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full" style={{ backgroundColor: urgent ? "#ef6b62" : "#4ade9a", border: "2px solid #0a110d" }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm font-bold truncate" style={{ color: "#eef5f1" }}>{state.characterName}</span>
              <span className="rounded-full px-1.5 py-0.5 text-[8px]" style={{ color: "#d4a843", backgroundColor: "#1c180c" }}>第{state.lifeNumber}世</span>
            </div>
            <div className="mt-0.5 text-[10px]" style={{ color: "#698276" }}>
              {state.spiritRoot.name} · {state.heartIntent ? INTENT_NAMES[state.heartIntent] : "本心未明"}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center divide-x" style={{ borderColor: "#1d2c25" }}>
          <div className="block flex-shrink-0 sm:hidden px-3">
            <div className="font-serif text-xs font-bold" style={{ color: "#eef5f1" }}>{state.characterName}</div>
            <div className="mt-0.5 text-[8px]" style={{ color: "#698276" }}>{REALM_NAMES[state.realmSlug]} · 第{state.lifeNumber}世</div>
          </div>
          <div className="hidden md:block"><Metric label="境界" value={`${REALM_NAMES[state.realmSlug]} · ${subRealm}`} accent={state.xp >= 90 ? "#f0c96b" : "#d8e5de"} /></div>
          <Metric label="年岁" value={`${state.age} / ${state.lifespanMax} 岁`} accent={urgent ? "#ff8e86" : "#d8e5de"} />
          <Metric label="修为" value={`${state.xp}%`} accent={state.xp >= 90 ? "#f0c96b" : "#6fedb5"} />
          <div className="hidden md:block"><Metric label="灵石" value={String(state.lingshi)} accent="#f0c96b" /></div>
          <div className="hidden lg:block"><Metric label="天命" value={`${state.fate}`} accent="#a9d8ff" /></div>
        </div>

        <div className="flex items-center gap-1 px-2 md:px-3" style={{ borderLeft: "1px solid #1d2c25" }}>
          <button onClick={onOpenLife} className="game-tool-button flex items-center justify-center gap-1" title="查看此世命途">
            <span className="text-[13px]">命</span><span className="hidden xl:inline">命途</span>
          </button>
          <button onClick={onOpenInventory} className="game-tool-button flex items-center justify-center gap-1" title="打开储物袋">
            <span className="text-[13px]">囊</span><span className="hidden xl:inline">行囊</span>
          </button>
          <button onClick={onOpenMarket} className="game-tool-button hidden items-center justify-center gap-1 sm:flex" title="前往灵市">
            <span className="text-[13px]">市</span><span className="hidden xl:inline">灵市</span>
          </button>
          <button onClick={onBattle} className="game-tool-button hidden items-center justify-center gap-1 md:flex" title="外出历练">
            <span className="text-[13px]">战</span><span className="hidden xl:inline">历练</span>
          </button>
        </div>
      </div>
      <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, transparent, #4ade9a55, #d4a84377, #4ade9a55, transparent)" }} />
      <div className="absolute bottom-0 left-0 h-0.5 transition-all duration-700" style={{ width: `${Math.min(100, state.xp)}%`, backgroundColor: state.xp >= 90 ? "#d4a843" : "#4ade9a", boxShadow: "0 0 12px currentColor" }} />
    </header>
  );
}
