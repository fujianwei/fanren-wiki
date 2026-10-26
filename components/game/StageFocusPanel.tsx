"use client";

import { FOCUSES, getStageYears } from "@/lib/game/lifecycle";
import { getSceneById } from "@/lib/game/scene-art";
import type { FocusId, GameState } from "@/types/game";
import PixelScene from "./PixelScene";

interface Props {
  state: GameState;
  onSelect: (focusId: FocusId) => void;
  onAdvance: () => void;
}

const FOCUS_SCENES: Record<FocusId, string> = {
  cultivate: "cave",
  roam: "wilderness",
  craft: "medicine",
  sect: "sect",
  bond: "bonds",
  heal: "sea",
};

export default function StageFocusPanel({ state, onSelect, onAdvance }: Props) {
  const selected = FOCUSES.find((focus) => focus.id === state.stageFocus);
  const years = getStageYears(state.realmSlug);
  const scene = getSceneById(FOCUS_SCENES[(selected?.id ?? "cultivate") as FocusId]);

  return (
    <section className="overflow-hidden rounded-[26px]" style={{ backgroundColor: "#0d1712", border: "1px solid #2a4035", boxShadow: "0 24px 80px rgba(0,0,0,.28)" }}>
      <PixelScene scene={scene} compact>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-4 md:px-6 md:pb-5">
          <div>
            <div className="mb-1 text-[8px] tracking-[.3em]" style={{ color: "rgba(219,233,225,.56)" }}>LIFE CHAPTER</div>
            <h2 className="font-serif text-xl font-bold md:text-2xl" style={{ color: "#f1f7f4", textShadow: "0 2px 18px rgba(0,0,0,.8)" }}>这一段人生，你想怎么过？</h2>
            <p className="mt-1 text-[10px] md:text-xs" style={{ color: "rgba(223,234,227,.72)" }}>先选生活重心，再让 {years} 年岁月发生。</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="font-serif text-2xl font-bold md:text-3xl" style={{ color: "#d4a843" }}>{state.stage + 1}</div>
            <div className="text-[8px] tracking-[.2em]" style={{ color: "rgba(220,231,224,.55)" }}>CHAPTER</div>
          </div>
        </div>
      </PixelScene>

      <div className="p-4 md:p-5">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {FOCUSES.map((focus) => {
            const active = focus.id === state.stageFocus;
            return (
              <button
                key={focus.id}
                onClick={() => onSelect(focus.id)}
                className="group relative min-h-[102px] overflow-hidden rounded-2xl px-3 py-3 text-left transition-all hover:-translate-y-0.5 md:px-4 md:py-3.5"
                style={{
                  backgroundColor: active ? "#17251d" : "#0f1914",
                  border: `1px solid ${active ? `${focus.color}88` : "#22362c"}`,
                  boxShadow: active ? `inset 0 0 36px ${focus.color}09` : "none",
                }}
              >
                <span className="absolute -right-4 -top-5 h-16 w-16 rounded-full opacity-[.07]" style={{ backgroundColor: focus.color }} />
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg font-serif text-[11px]" style={{ color: focus.color, backgroundColor: `${focus.color}12`, border: `1px solid ${focus.color}2c` }}>{focus.icon}</span>
                  <span className="font-serif text-[13px] font-bold" style={{ color: active ? "#f3f8f5" : "#cbdcd3" }}>{focus.name}</span>
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ backgroundColor: focus.color, boxShadow: `0 0 8px ${focus.color}` }} />}
                </div>
                <div className="text-[10px] leading-5" style={{ color: active ? "#9bb3a6" : "#6c877a" }}>{focus.short}</div>
                <div className="mt-1.5 truncate text-[8px]" style={{ color: focus.color }}>{focus.benefit}</div>
              </button>
            );
          })}
        </div>

        <div
          className="mt-3 flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          style={{ backgroundColor: selected ? "#111d16" : "#0b130f", border: `1px solid ${selected ? "#31493d" : "#1d2c25"}` }}
        >
          <div className="min-w-0">
            <div className="text-[10px] font-medium" style={{ color: selected?.color ?? "#6c877a" }}>
              {selected ? `${selected.name} · 代价` : "尚未选择生活重心"}
            </div>
            <div className="mt-1 text-[10px] leading-5" style={{ color: "#708d7e" }}>
              {selected?.cost ?? "六种重心会改变事件、关系和修为，但不会锁死你的一生。"}
            </div>
          </div>
          <button
            onClick={onAdvance}
            disabled={!selected}
            className="w-full flex-shrink-0 rounded-xl px-5 py-3 font-serif text-xs font-bold tracking-[.14em] transition-all sm:w-auto"
            style={{
              color: selected ? "#07100c" : "#476052",
              backgroundColor: selected ? "#62dca0" : "#132019",
              cursor: selected ? "pointer" : "not-allowed",
              boxShadow: selected ? "0 8px 30px rgba(74,222,154,.16)" : "none",
            }}
          >
            推演这 {years} 年
          </button>
        </div>
      </div>
    </section>
  );
}
