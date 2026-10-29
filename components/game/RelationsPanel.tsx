"use client";

import { relationMood } from "@/lib/game/relations";
import type { GameState } from "@/types/game";
import { RELATION_KIND_LABELS } from "@/lib/game/labels";

export default function RelationsPanel({ state }: { state: GameState }) {
  const relations = Object.values(state.relations);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #1a2820" }}>
        <span className="font-serif text-sm font-medium" style={{ color: "#e8f0ec" }}>此世人缘</span>
        <span className="text-[10px]" style={{ color: "#4a6a58" }}>{relations.length} 人</span>
      </div>
      <div className="p-3 flex flex-col gap-2">
        {relations.map((relation) => {
          const mood = relation.status === "dead" ? "已故" : relation.status === "lost" ? "失踪" : relationMood(relation.affinity, relation.trust);
          return (
            <div key={relation.id} className="rounded-xl px-3 py-3" style={{ backgroundColor: "#0e1610", border: "1px solid #1a2820" }}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full mr-1.5" style={{ color: relation.kind === "rival" ? "#ef4444" : "#6a8878", backgroundColor: "#111a16" }}>{RELATION_KIND_LABELS[relation.kind]}</span>
                  <span className="text-xs font-medium" style={{ color: "#d6e2db" }}>{relation.name}</span>
                </div>
                <span className="text-[10px] flex-shrink-0" style={{ color: relation.affinity < 0 ? "#ef8d8d" : relation.affinity > 40 ? "#4ade9a" : "#6a8878" }}>{mood}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <div className="flex-1">
                  <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#1a2820" }}><div className="h-full" style={{ width: `${Math.max(0, relation.affinity)}%`, backgroundColor: "#4ade9a" }} /></div>
                </div>
                <div className="flex-1">
                  <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#1a2820" }}><div className="h-full" style={{ width: `${relation.trust}%`, backgroundColor: "#6ea8fe" }} /></div>
                </div>
              </div>
              {relation.memory && <div className="text-[10px] leading-relaxed mt-2" style={{ color: "#4a6a58" }}>{relation.memory}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
