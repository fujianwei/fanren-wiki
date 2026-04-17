"use client";

import { useGame } from "./GameProvider";
import type { RealmSlug } from "@/types/game";

const REALM_NAMES: Record<RealmSlug, string> = {
  lianqi: "炼气期",
  zhuji: "筑基期",
  jiedan: "结丹期",
  yuanying: "元婴期",
  huashen: "化神期",
};

const INJURY_LABELS = {
  none: null,
  light: { label: "轻伤", desc: "修炼速度-20%，闭关-20%", color: "#f59e0b" },
  heavy: { label: "重伤", desc: "修炼速度-50%，无法进副本", color: "#ef4444" },
  dying: { label: "濒死", desc: "修炼速度-80%，无法主动行动", color: "#7f1d1d" },
};

export default function StatusPanel() {
  const { state } = useGame();
  const {
    realmSlug, xp, lifespan, lifespanMax, injury, enemies,
    breakthroughExp, spiritRoot, sectPath,
  } = state;

  const lifespanPct = lifespanMax > 0 ? (lifespan / lifespanMax) * 100 : 0;
  const lifespanLow = lifespanPct < 20;
  const canBreakthrough = xp >= 90;
  const injuryInfo = INJURY_LABELS[injury];


  return (
    <div
      className="rounded-xl p-4 text-sm"
      style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-serif font-bold" style={{ color: "#e8f0ec" }}>
          {REALM_NAMES[realmSlug]}
        </span>
        <span className="text-xs flex items-center gap-1" style={{ color: "#6a8878" }}>
          {spiritRoot.name}
          {sectPath && (
            <span className="text-xs ml-2" style={{ color: sectPath === "modao" ? "#ef4444" : sectPath === "sanxiu" ? "#d4a843" : "#4ade9a" }}>
              {sectPath === "zhengdao" ? "正道" : sectPath === "modao" ? "魔道" : "散修"}
            </span>
          )}
        </span>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1" style={{ color: "#6a8878" }}>
          <span>修为</span>
          <span style={{ color: canBreakthrough ? "#4ade9a" : "#6a8878" }}>
            {xp}%{canBreakthrough ? " · 可冲关" : ""}
          </span>
        </div>
        <div className="h-1.5 rounded-full" style={{ backgroundColor: "#1a2820" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${xp}%`,
              backgroundColor: xp >= 100 ? "#d4a843" : "#4ade9a",
              boxShadow: xp >= 90 ? "0 0 6px #4ade9a88" : "none",
            }}
          />
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color: "#6a8878" }}>寿命</span>
          <span style={{ color: lifespanLow ? "#ef4444" : "#6a8878" }}>
            {lifespan}/{lifespanMax}年
          </span>
        </div>
        <div className="h-1.5 rounded-full" style={{ backgroundColor: "#1a2820" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${lifespanPct}%`,
              backgroundColor: lifespanLow ? "#ef4444" : "#6fedb5",
              boxShadow: lifespanLow ? "0 0 6px #ef444488" : "none",
            }}
          />
        </div>
      </div>

      {injuryInfo && (
        <div
          className="rounded-lg px-3 py-2 mb-3 text-xs"
          style={{ backgroundColor: "#1a0a0a", border: `1px solid ${injuryInfo.color}44` }}
        >
          <span style={{ color: injuryInfo.color }}>⚠ {injuryInfo.label}</span>
          <span className="ml-2" style={{ color: "#6a8878" }}>{injuryInfo.desc}</span>
        </div>
      )}

      {enemies.length > 0 && (
        <div className="text-xs mb-3" style={{ color: "#ef4444" }}>
          仇人 ×{enemies.length}
        </div>
      )}

      {breakthroughExp > 0 && (
        <div className="text-xs mb-3" style={{ color: "#6a8878" }}>
          冲关经验 +{breakthroughExp}%
        </div>
      )}

    </div>
  );
}
