"use client";

import { useGame } from "./GameProvider";
import { calcBreakthroughRate, getRealmConfig } from "@/lib/game/engine";
import type { RealmSlug, ItemId } from "@/types/game";

function getSubRealm(xp: number): string {
  if (xp >= 100) return "圆满";
  if (xp >= 90) return "后期巅峰";
  if (xp >= 71) return "后期";
  if (xp >= 31) return "中期";
  return "初期";
}

const REALM_NAMES: Record<RealmSlug, string> = {
  lianqi: "炼气期",
  zhuji: "筑基期",
  jiedan: "结丹期",
  yuanying: "元婴期",
  huashen: "化神期",
};

const INJURY_LABELS = {
  none: null,
  light: { label: "轻伤", desc: "修炼-20%，可短期闭关恢复", color: "#f59e0b" },
  heavy: { label: "重伤", desc: "修炼-50%，无法进副本", color: "#ef4444" },
  dying: { label: "濒死", desc: "无法主动行动", color: "#dc2626" },
};

export default function StatusPanel() {
  const { state } = useGame();
  const { realmSlug, xp, lifespan, lifespanMax, injury, enemies, breakthroughExp, spiritRoot, sectPath, lingshi, inventory } = state;

  const lifespanPct = lifespanMax > 0 ? (lifespan / lifespanMax) * 100 : 0;
  const lifespanLow = lifespanPct < 20;
  const canBreakthrough = xp >= 90;
  const injuryInfo = INJURY_LABELS[injury];

  const lifespanCost = Math.round(lifespanMax * 0.02);

  // 冲关概率分解
  const arrayBonus = (() => {
    if ((inventory["tiangang_zhen"] ?? 0) > 0) return 0.20;
    if ((inventory["huti_zhen"] ?? 0) > 0) return 0.12;
    if ((inventory["juling_zhen"] ?? 0) > 0) return 0.08;
    return 0;
  })();
  const pillBonus = (() => {
    const map: Record<string, string> = { lianqi: "zhuji_dan", zhuji: "jucheng_dan", jiedan: "butian_dan", yuanying: "jiangyun_dan" };
    const id = map[realmSlug];
    return id && (inventory[id as ItemId] ?? 0) > 0 ? 0.25 : 0;
  })();
  const lingshiBonus = Math.min(0.05, Math.floor(lingshi / 500) * 0.02);
  const rootBonus = state.rootIntact ? 0.15 : 0;
  const rootDamage = state.rootDamageCount * 0.05;
  const expBonus = Math.min(0.15, breakthroughExp / 100);
  const totalRate = calcBreakthroughRate({
    realmSlug, xp, itemBonus: arrayBonus + pillBonus,
    lingshi, rootIntact: state.rootIntact, rootDamageCount: state.rootDamageCount,
    breakthroughExp,
  });

  const showRateBreakdown = canBreakthrough && realmSlug !== "huashen";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}>
      <div className="p-5">

        {/* 境界 + 灵根 + 宗门 */}
        <div className="flex items-center justify-between mb-5">
          <span className="font-serif font-bold text-base" style={{ color: "#e8f0ec" }}>
            {REALM_NAMES[realmSlug]}
            <span className="ml-2 text-xs font-normal" style={{ color: xp >= 90 ? "#d4a843" : "#4a6a58" }}>
              · {getSubRealm(xp)}
            </span>
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span style={{ color: "#6a8878" }}>{spiritRoot.name}</span>
            {sectPath && (
              <>
                <span style={{ color: "#2a3828" }}>·</span>
                <span style={{ color: sectPath === "modao" ? "#ef4444" : sectPath === "sanxiu" ? "#d4a843" : "#4ade9a" }}>
                  {sectPath === "zhengdao" ? "正道" : sectPath === "modao" ? "魔道" : "散修"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* 修为 */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: "#6a8878" }}>修为</span>
            <span style={{ color: canBreakthrough ? "#4ade9a" : "#4a6a58" }}>
              {xp}%{canBreakthrough ? "  ↑ 可冲关" : ""}
            </span>
          </div>
          <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#0e1610" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${xp}%`,
                backgroundColor: xp >= 100 ? "#d4a843" : "#4ade9a",
                boxShadow: xp >= 90 ? "0 0 8px #4ade9a55" : "none",
              }}
            />
            {/* 小境界刻度线 */}
            {[30, 70, 90].map(mark => (
              <div key={mark} className="absolute top-0 bottom-0 w-px"
                style={{ left: `${mark}%`, backgroundColor: "#0e1610", opacity: 0.8 }} />
            ))}
          </div>
        </div>

        {/* 寿命 */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: "#6a8878" }}>寿命</span>
            <div className="flex items-center gap-2">
              <span style={{ color: lifespanLow ? "#ef4444" : "#4a6a58" }}>
                {lifespan} / {lifespanMax} 年
              </span>
              {lifespanCost > 0 && (
                <span style={{ color: "#6a4a18", fontSize: "10px" }}>
                  渡劫消耗 -{lifespanCost}年
                </span>
              )}
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#0e1610" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${lifespanPct}%`,
                backgroundColor: lifespanLow ? "#ef4444" : "#6fedb5",
                boxShadow: lifespanLow ? "0 0 8px #ef444455" : "none",
              }}
            />
          </div>
        </div>

        {/* 状态标签 */}
        {(injuryInfo || enemies.length > 0 || breakthroughExp > 0 || showRateBreakdown) && (
          <div className="flex flex-col gap-2 pt-4" style={{ borderTop: "1px solid #1a2820" }}>
            {/* 受伤 / 仇人 / 经验 标签行 */}
            {(injuryInfo || enemies.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {injuryInfo && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
                    style={{ backgroundColor: "#160a0a", border: `1px solid ${injuryInfo.color}33`, color: injuryInfo.color }}>
                    ⚠ {injuryInfo.label}
                    <span style={{ color: "#6a4040", fontSize: "10px" }}>· {injuryInfo.desc}</span>
                  </div>
                )}
                {enemies.length > 0 && (
                  <div className="px-2.5 py-1.5 rounded-lg text-xs"
                    style={{ backgroundColor: "#160a0a", border: "1px solid #ef444433", color: "#ef4444" }}>
                    仇人 ×{enemies.length}
                  </div>
                )}
              </div>
            )}

            {/* 冲关概率分解 */}
            {showRateBreakdown && (
              <div className="rounded-xl px-3 py-3" style={{ backgroundColor: "#16140a", border: "1px solid #d4a84322" }}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs" style={{ color: "#6a8878" }}>冲关成功率</span>
                  <span className="font-bold text-sm" style={{ color: "#d4a843" }}>{Math.round(totalRate * 100)}%</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "#4a4a2a" }}>基础</span>
                    <span style={{ color: "#6a6a3a" }}>{Math.round(getRealmConfig(realmSlug).breakthroughRate * 100)}%</span>
                  </div>
                  {pillBonus > 0 && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "#4a4a2a" }}>突破丹药</span>
                      <span style={{ color: "#4ade9a88" }}>+{Math.round(pillBonus * 100)}%</span>
                    </div>
                  )}
                  {arrayBonus > 0 && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "#4a4a2a" }}>阵法</span>
                      <span style={{ color: "#4ade9a88" }}>+{Math.round(arrayBonus * 100)}%</span>
                    </div>
                  )}
                  {lingshiBonus > 0 && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "#4a4a2a" }}>灵石</span>
                      <span style={{ color: "#4ade9a88" }}>+{Math.round(lingshiBonus * 100)}%</span>
                    </div>
                  )}
                  {rootBonus > 0 && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "#4a4a2a" }}>根基稳固</span>
                      <span style={{ color: "#4ade9a88" }}>+{Math.round(rootBonus * 100)}%</span>
                    </div>
                  )}
                  {rootDamage > 0 && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "#4a4a2a" }}>根基受损</span>
                      <span style={{ color: "#ef444488" }}>-{Math.round(rootDamage * 100)}%</span>
                    </div>
                  )}
                  {expBonus > 0 && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "#4a4a2a" }}>冲关经验</span>
                      <span style={{ color: "#d4a84388" }}>+{Math.round(expBonus * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 经验标签（修为未满时仍显示） */}
            {breakthroughExp > 0 && !showRateBreakdown && (
              <div className="px-2.5 py-1.5 rounded-lg text-xs"
                style={{ backgroundColor: "#16140a", border: "1px solid #d4a84333", color: "#d4a843" }}>
                冲关经验 +{breakthroughExp}%
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
