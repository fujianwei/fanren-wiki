"use client";

import { useGame } from "./GameProvider";
import { getRealmConfig, calcBreakthroughRate } from "@/lib/game/engine";
import type { RealmSlug, ItemId } from "@/types/game";

const REALM_NAMES: Record<RealmSlug, string> = {
  lianqi: "炼气期", zhuji: "筑基期", jiedan: "结丹期",
  yuanying: "元婴期", huashen: "化神期",
};

function getSubRealm(xp: number): string {
  if (xp >= 100) return "圆满";
  if (xp >= 90) return "巅峰";
  if (xp >= 71) return "后期";
  if (xp >= 31) return "中期";
  return "初期";
}

export default function StatusPanel() {
  const { state } = useGame();
  const { realmSlug, xp, lifespan, lifespanMax, lingshi, spiritRoot, sectPath, injury } = state;

  const lifespanPct = lifespanMax > 0 ? (lifespan / lifespanMax) * 100 : 0;
  const lifespanLow = lifespanPct < 20;
  const canBreakthrough = xp >= 90;

  const injuryColor: Record<string, string> = {
    light: "#f59e0b", heavy: "#ef4444", dying: "#dc2626", none: "transparent"
  };

  return (
    <div
      className="flex items-center gap-4 px-5 py-2.5 text-xs"
      style={{
        backgroundColor: "rgba(10,14,13,0.75)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(74,222,154,0.1)",
      }}
    >
      {/* 境界 */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="font-serif font-bold text-sm" style={{ color: "#e8f0ec" }}>
          {REALM_NAMES[realmSlug]}
        </span>
        <span style={{ color: canBreakthrough ? "#d4a843" : "#4a6a58" }}>
          · {getSubRealm(xp)}
        </span>
        <span style={{ color: "#2a3828" }}>·</span>
        <span style={{ color: "#4a6a58" }}>{spiritRoot.name}</span>
        {sectPath && (
          <span style={{ color: sectPath === "modao" ? "#ef4444" : sectPath === "sanxiu" ? "#d4a843" : "#4ade9a" }}>
            · {sectPath === "zhengdao" ? "正道" : sectPath === "modao" ? "魔道" : "散修"}
          </span>
        )}
      </div>

      <div className="w-px h-4 flex-shrink-0" style={{ backgroundColor: "#1a2820" }} />

      {/* 修为条 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span style={{ color: "#4a6a58" }}>修为</span>
        <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1a2820" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${xp}%`, backgroundColor: xp >= 100 ? "#d4a843" : "#4ade9a" }} />
        </div>
        <span style={{ color: canBreakthrough ? "#4ade9a" : "#4a6a58" }}>{xp}%</span>
      </div>

      {/* 寿命条 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span style={{ color: "#4a6a58" }}>寿命</span>
        <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1a2820" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${lifespanPct}%`, backgroundColor: lifespanLow ? "#ef4444" : "#6fedb5" }} />
        </div>
        <span style={{ color: lifespanLow ? "#ef4444" : "#4a6a58" }}>{lifespan}年</span>
      </div>

      <div className="w-px h-4 flex-shrink-0" style={{ backgroundColor: "#1a2820" }} />

      {/* 灵石 */}
      <span style={{ color: "#4ade9a" }}>灵石 {lingshi}</span>

      {/* 受伤状态 */}
      {injury !== "none" && (
        <>
          <div className="w-px h-4 flex-shrink-0" style={{ backgroundColor: "#1a2820" }} />
          <span style={{ color: injuryColor[injury] }}>
            ⚠ {injury === "light" ? "轻伤" : injury === "heavy" ? "重伤" : "濒死"}
          </span>
        </>
      )}
    </div>
  );
}
