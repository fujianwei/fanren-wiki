"use client";

import Link from "next/link";
import { useGame } from "./GameProvider";
import { INTENT_LABELS, REALM_NAMES } from "@/lib/game/labels";

interface Props {
  onOpenLife: () => void;
  onOpenInventory: () => void;
  onOpenMarket: () => void;
  onBattle: () => void;
  onOpenSect: () => void;
}

export default function GameHud({ onOpenLife, onOpenInventory, onOpenMarket, onBattle, onOpenSect }: Props) {
  const { state } = useGame();
  const subRealm = state.xp >= 90 ? "圆满" : state.xp >= 71 ? "后期" : state.xp >= 31 ? "中期" : "初期";
  const urgent = state.age >= state.lifespanMax * 0.82 || state.injury === "heavy" || state.injury === "dying";
  const actions = [
    { label: "命途", symbol: "命", action: onOpenLife },
    { label: "行囊", symbol: "囊", action: onOpenInventory },
    { label: "灵市", symbol: "市", action: onOpenMarket },
    { label: "历练", symbol: "剑", action: onBattle },
    ...(!state.sectPath ? [{ label: "择道", symbol: "道", action: onOpenSect }] : []),
  ];

  return (
    <div className="game-hud mb-3">
      <header className="game-status">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: urgent ? "#ef6b62" : "#4ade9a" }} />
            <span className="font-serif text-base font-bold text-mist-100">{state.characterName}</span>
            <span className="text-xs text-mist-200">第{state.lifeNumber}世</span>
          </div>
          <span className="text-sm text-gold-bright">{REALM_NAMES[state.realmSlug]} · {subRealm}</span>
        </div>
        <div className="grid grid-cols-4 gap-1 px-3 py-3">
          {[
            { label: "年岁 / 寿元", value: state.age + " / " + state.lifespanMax, color: urgent ? "#ff9f96" : "#d8e5de" },
            { label: "修为", value: state.xp + "%", color: "#6fedb5" },
            { label: "灵石", value: String(state.lingshi), color: "#f0c96b" },
            { label: "天命", value: String(state.fate), color: "#a9d8ff" },
          ].map((metric) => (
            <div key={metric.label} className="min-w-0 px-1">
              <div className="text-[11px] text-mist-200">{metric.label}</div>
              <div className="mt-1 break-words font-serif text-sm font-bold tabular-nums sm:text-base" style={{ color: metric.color }}>{metric.value}</div>
            </div>
          ))}
        </div>
        <div className="hidden px-4 pb-3 text-xs text-mist-200 lg:block">
          {state.spiritRoot.name} · {state.heartIntent ? INTENT_LABELS[state.heartIntent] : "本心未明"}
          {urgent && <span className="ml-3 text-death-200">寿元或伤势告急，请留意此身状态</span>}
        </div>
        <div className="h-1 overflow-hidden bg-ink-800" role="progressbar" aria-label="修为" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(0, Math.min(100, state.xp))}>
          <div className="h-full bg-jade-400 transition-[width] duration-500" style={{ width: Math.max(0, Math.min(100, state.xp)) + "%" }} />
        </div>
      </header>
      <nav className="game-toolbar" aria-label="修仙常用功能" style={{ gridTemplateColumns: "repeat(" + (actions.length + 1) + ", minmax(0, 1fr))" }}>
        {actions.map(({ label, symbol, action }) => (
          <button key={label} onClick={action} className="game-tool-button" aria-label={label} aria-haspopup="dialog">
            <span className="font-serif text-lg text-jade-200" aria-hidden="true">{symbol}</span>
            <span>{label}</span>
          </button>
        ))}
        <Link href="/game/atlas" className="game-tool-button" aria-label="图鉴">
          <span className="font-serif text-lg text-gold-bright" aria-hidden="true">卷</span><span>图鉴</span>
        </Link>
      </nav>
    </div>
  );
}
