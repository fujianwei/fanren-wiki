"use client";

import type { GameState } from "@/types/game";

const DOT_COLORS = { jade: "#4ade9a", gold: "#d4a843", red: "#ef4444", mist: "#6a8878" };

export default function LifeTimeline({ state }: { state: GameState }) {
  const entries = [...state.timeline].reverse().slice(0, 14);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #1a2820" }}>
        <span className="font-serif text-sm font-medium" style={{ color: "#e8f0ec" }}>此生年轮</span>
        <span className="text-[10px]" style={{ color: "#4a6a58" }}>{state.timeline.length} 条</span>
      </div>
      <div className="max-h-[520px] overflow-y-auto p-3">
        {entries.length === 0 ? <div className="text-xs py-5 text-center" style={{ color: "#4a6a58" }}>尚未留下痕迹</div> : entries.map((entry, index) => (
          <div key={entry.id} className="relative pl-4 pb-4 last:pb-0">
            {index < entries.length - 1 && <span className="absolute left-[5px] top-2 bottom-0 w-px" style={{ backgroundColor: "#1a2820" }} />}
            <span className="absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full" style={{ backgroundColor: DOT_COLORS[entry.accent ?? "mist"], boxShadow: `0 0 8px ${DOT_COLORS[entry.accent ?? "mist"]}44` }} />
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10px] font-medium" style={{ color: "#b8ccc2" }}>{entry.title}</span>
              <span className="text-[9px] flex-shrink-0" style={{ color: "#4a6a58" }}>{entry.age}岁</span>
            </div>
            <p className="text-[10px] leading-relaxed mt-1" style={{ color: "#6a8878" }}>{entry.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
