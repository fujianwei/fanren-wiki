"use client";

import { useGame } from "./GameProvider";
import { calcBreakthroughRate } from "@/lib/game/engine";
import { AXIS_LABELS, getDominantAxes, getThreadTitle } from "@/lib/game/narrative";
import { getFocusConfig, getStageYears } from "@/lib/game/lifecycle";
import type { HeartIntent, ItemId, RealmSlug } from "@/types/game";

const REALM_NAMES: Record<RealmSlug, string> = {
  lianqi: "炼气期",
  zhuji: "筑基期",
  jiedan: "结丹期",
  yuanying: "元婴期",
  huashen: "化神期",
};

const INTENT_LABELS: Record<HeartIntent, string> = {
  longevity: "求长生",
  revenge: "求复仇",
  guard: "求守护",
  freedom: "求自在",
};

const INJURY_LABELS = {
  none: null,
  light: { label: "轻伤", color: "#f59e0b" },
  heavy: { label: "重伤", color: "#ef4444" },
  dying: { label: "濒死", color: "#dc2626" },
};

function getSubRealm(xp: number): string {
  if (xp >= 100) return "圆满";
  if (xp >= 90) return "后期巅峰";
  if (xp >= 71) return "后期";
  if (xp >= 31) return "中期";
  return "初期";
}

export default function StatusPanel() {
  const { state } = useGame();
  const { realmSlug, xp, lifespanMax, age, injury, enemies, breakthroughExp, spiritRoot, lingshi, inventory, narrative, prophecy, heartIntent, stageFocus, lifeNumber } = state;
  const injuryInfo = INJURY_LABELS[injury];
  const canBreakthrough = xp >= 90;
  const dominant = getDominantAxes(narrative, 3);
  const activeThreads = Object.values(narrative.threads).filter((thread) => thread.status === "open");
  const endedThreads = Object.values(narrative.threads).filter((thread) => thread.status !== "open");
  const arrayBonus = (inventory.tiangang_zhen ?? 0) > 0 ? 0.20 : (inventory.huti_zhen ?? 0) > 0 ? 0.12 : (inventory.juling_zhen ?? 0) > 0 ? 0.08 : 0;
  const pillMap: Record<string, ItemId> = { lianqi: "zhuji_dan", zhuji: "jucheng_dan", jiedan: "butian_dan", yuanying: "jiangyun_dan" };
  const pillBonus = (inventory[pillMap[realmSlug]] ?? 0) > 0 ? 0.25 : 0;
  const rate = calcBreakthroughRate({
    realmSlug,
    xp,
    itemBonus: arrayBonus + pillBonus,
    lingshi,
    rootIntact: state.rootIntact,
    rootDamageCount: state.rootDamageCount,
    breakthroughExp,
  });

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}>
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif text-lg font-bold" style={{ color: "#e8f0ec" }}>{state.characterName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: "#d4a843", backgroundColor: "#16140a", border: "1px solid #d4a84333" }}>
                第 {lifeNumber} 世
              </span>
              <span className="text-xs" style={{ color: "#6a8878" }}>{spiritRoot.name}</span>
            </div>
            <div className="text-xs mt-1" style={{ color: "#6a8878" }}>
              {REALM_NAMES[realmSlug]} · {getSubRealm(xp)}
              {heartIntent ? ` · ${INTENT_LABELS[heartIntent]}` : " · 尚未立心"}
            </div>
          </div>
          <div className="text-right">
            <div className="font-serif text-2xl font-bold" style={{ color: age >= lifespanMax * 0.8 ? "#ef4444" : "#4ade9a" }}>{age}岁</div>
            <div className="text-[10px]" style={{ color: "#4a6a58" }}>此阶段约 {getStageYears(realmSlug)} 年</div>
          </div>
        </div>

        <div className="rounded-xl px-4 py-3 mb-4" style={{ backgroundColor: "#0e1610", border: "1px solid #1a2820" }}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span style={{ color: "#6a8878" }}>命格谶语</span>
            <span style={{ color: "#4a6a58" }}>{prophecy.title}</span>
          </div>
          <p className="text-sm leading-relaxed font-serif" style={{ color: "#d9c58f" }}>「{prophecy.text}」</p>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: "#6a8878" }}>修为</span>
            <span style={{ color: canBreakthrough ? "#f0c96b" : "#4ade9a" }}>{xp}%{canBreakthrough ? " · 可冲关" : ""}</span>
          </div>
          <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#0e1610" }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${xp}%`, backgroundColor: xp >= 100 ? "#d4a843" : "#4ade9a", boxShadow: xp >= 90 ? "0 0 10px #4ade9a55" : "none" }} />
            {[31, 71, 90].map((mark) => <span key={mark} className="absolute top-0 h-full w-px" style={{ left: `${mark}%`, backgroundColor: "#ffffff18" }} />)}
          </div>
          <div className="flex justify-between text-[10px] mt-1.5" style={{ color: "#4a6a58" }}>
            <span>寿元剩余 {Math.max(0, lifespanMax - age)} 年</span>
            <span>境界上限 {lifespanMax} 岁</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {dominant.map((axis) => (
            <div key={axis} className="rounded-lg px-2.5 py-2" style={{ backgroundColor: "#0e1610", border: "1px solid #1a2820" }}>
              <div className="text-[10px]" style={{ color: "#4a6a58" }}>{AXIS_LABELS[axis]}</div>
              <div className="text-sm font-bold" style={{ color: narrative.axes[axis] >= 8 ? "#d4a843" : "#b8ccc2" }}>{narrative.axes[axis] > 0 ? "+" : ""}{narrative.axes[axis]}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] px-2 py-1 rounded-full" style={{ color: "#d4a843", backgroundColor: "#16140a" }}>灵石 {lingshi}</span>
          <span className="text-[10px] px-2 py-1 rounded-full" style={{ color: "#6a8878", backgroundColor: "#0e1610" }}>因果 {endedThreads.length}/{lifeNumber > 0 ? activeThreads.length + endedThreads.length : 0}</span>
          {stageFocus && <span className="text-[10px] px-2 py-1 rounded-full" style={{ color: getFocusConfig(stageFocus).color, backgroundColor: "#0e1610" }}>{getFocusConfig(stageFocus).name}</span>}
          {injuryInfo && <span className="text-[10px] px-2 py-1 rounded-full" style={{ color: injuryInfo.color, backgroundColor: "#160a0a" }}>⚠ {injuryInfo.label}</span>}
          {enemies.length > 0 && <span className="text-[10px] px-2 py-1 rounded-full" style={{ color: "#ef4444", backgroundColor: "#160a0a" }}>仇敌 {enemies.length}</span>}
        </div>
      </div>

      <div className="px-5 py-3" style={{ borderTop: "1px solid #1a2820", backgroundColor: "#0d1411" }}>
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: "#6a8878" }}>当前因果</span>
          <span style={{ color: "#4a6a58" }}>{activeThreads.length} 未决 · {endedThreads.length} 落定</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {activeThreads.slice(0, 2).map((thread) => <span key={thread.threadId} className="text-[10px] px-2 py-1 rounded-full" style={{ color: "#c7b57e", backgroundColor: "#16140a" }}>{getThreadTitle(thread.threadId)} · 未落定</span>)}
          {endedThreads.slice(-2).map((thread) => <span key={thread.threadId} className="text-[10px] px-2 py-1 rounded-full" style={{ color: thread.status === "broken" ? "#ef4444" : "#4ade9a", backgroundColor: "#0e1610" }}>{getThreadTitle(thread.threadId)} · {thread.status === "broken" ? "断" : "落定"}</span>)}
          {activeThreads.length === 0 && endedThreads.length === 0 && <span className="text-[10px]" style={{ color: "#4a6a58" }}>尚未牵起命运线</span>}
        </div>
      </div>

      {canBreakthrough && realmSlug !== "huashen" && (
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid #1a2820", backgroundColor: "#16140a" }}>
          <span className="text-xs" style={{ color: "#d4a843" }}>冲关成功率</span>
          <span className="font-serif font-bold" style={{ color: "#f0c96b" }}>{Math.round(rate * 100)}%</span>
        </div>
      )}
    </div>
  );
}
