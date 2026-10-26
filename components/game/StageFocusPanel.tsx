"use client";

import { FOCUSES, getStageYears } from "@/lib/game/lifecycle";
import type { FocusId, GameState } from "@/types/game";

interface Props {
  state: GameState;
  onSelect: (focusId: FocusId) => void;
  onAdvance: () => void;
}

export default function StageFocusPanel({ state, onSelect, onAdvance }: Props) {
  const selected = FOCUSES.find((focus) => focus.id === state.stageFocus);
  const years = getStageYears(state.realmSlug);

  return (
    <section className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}>
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4" style={{ borderBottom: "1px solid #1a2820" }}>
        <div>
          <div className="text-[10px] tracking-[0.25em] mb-1" style={{ color: "#4a6a58" }}>THIS CHAPTER</div>
          <h2 className="font-serif text-xl font-bold" style={{ color: "#e8f0ec" }}>这一段人生，你想怎么过？</h2>
          <p className="text-xs mt-1" style={{ color: "#6a8878" }}>每推进一次，时间会向前走 {years} 年。先选重心，再让岁月发生。</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-serif text-2xl font-bold" style={{ color: "#d4a843" }}>{state.stage + 1}</div>
          <div className="text-[10px]" style={{ color: "#4a6a58" }}>人生阶段</div>
        </div>
      </div>

      <div className="p-4 md:p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {FOCUSES.map((focus) => {
            const active = focus.id === state.stageFocus;
            return (
              <button
                key={focus.id}
                onClick={() => onSelect(focus.id)}
                className="text-left rounded-xl px-3.5 py-3.5 transition-all hover:-translate-y-0.5"
                style={{
                  backgroundColor: active ? "#17241d" : "#0e1610",
                  border: `1px solid ${active ? `${focus.color}99` : "#1a2820"}`,
                  boxShadow: active ? `0 0 24px ${focus.color}12` : "none",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center font-serif text-xs" style={{ color: focus.color, backgroundColor: `${focus.color}12`, border: `1px solid ${focus.color}33` }}>{focus.icon}</span>
                  <span className="font-serif font-bold" style={{ color: active ? "#f1f7f3" : "#b8ccc2" }}>{focus.name}</span>
                </div>
                <div className="text-[11px] leading-relaxed" style={{ color: "#6a8878" }}>{focus.short}</div>
                <div className="flex gap-1 mt-2.5 flex-wrap">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ color: focus.color, backgroundColor: `${focus.color}0d` }}>{focus.benefit}</span>
                </div>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-4 rounded-xl px-4 py-4" style={{ backgroundColor: "#0d1411", border: "1px solid #26352d" }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium mb-1" style={{ color: selected.color }}>{selected.name}的代价</div>
                <div className="text-xs leading-relaxed" style={{ color: "#6a8878" }}>{selected.cost}</div>
              </div>
              <button
                onClick={onAdvance}
                className="btn-primary px-5 py-3 rounded-xl text-sm font-medium flex-shrink-0"
              >
                推演这 {years} 年
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
