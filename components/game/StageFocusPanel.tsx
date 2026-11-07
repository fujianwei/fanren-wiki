"use client";

import { useRef, useState } from "react";
import { FOCUSES, getStageYears } from "@/lib/game/lifecycle";
import { getFocusScene } from "@/lib/game/scene-art";
import type { FocusId, GameState } from "@/types/game";
import PixelScene from "./PixelScene";
import { useGuidedStep } from "./useGuidedStep";

interface Props {
  state: GameState;
  onSelect: (focusId: FocusId) => void;
  onAdvance: () => void;
}

export default function StageFocusPanel({ state, onSelect, onAdvance }: Props) {
  const { step, goTo, leaving, panel } = useGuidedStep<"choose" | "confirm">("choose");
  const [advancing, setAdvancing] = useState(false);
  const submitted = useRef(false);
  const selected = FOCUSES.find(focus => focus.id === state.stageFocus);
  const years = getStageYears(state.realmSlug);

  function advance() {
    if (!selected || submitted.current) return;
    submitted.current = true;
    setAdvancing(true);
    onAdvance();
  }

  return (
    <section className="guided-card" aria-label="安排下一段人生">
      <div className="guided-progress">
        <span className="text-mist-200">第 {state.stage + 1} 段人生 · {years} 年</span>
        <span className="text-gold-bright">{step === "choose" ? "1 · 选择重心" : "2 · 启程"}</span>
      </div>
      <div ref={panel} tabIndex={-1} aria-label={step === "choose" ? "选择生活重心" : "确认人生安排"} className={"guided-panel " + (leaving ? "is-leaving" : "")}>
        <div key={step} className="guided-enter">
          <PixelScene scene={getFocusScene(step === "confirm" && selected ? selected.id : "cultivate")} priority compact>
        <div className="scene-caption absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-4 md:px-6 md:pb-5">
          <div>
            <div className="mb-1 text-[11px] tracking-[.3em]" style={{ color: "rgba(219,233,225,.56)" }}>LIFE CHAPTER</div>
            <h2 className="font-serif text-xl font-bold md:text-2xl" style={{ color: "#f1f7f4", textShadow: "0 2px 18px rgba(0,0,0,.8)" }}>这一段人生，你想怎么过？</h2>
            <p className="mt-1 text-[13px] md:text-sm" style={{ color: "rgba(223,234,227,.72)" }}>先选生活重心，再让 {years} 年岁月发生。</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="font-serif text-2xl font-bold md:text-3xl" style={{ color: "#d4a843" }}>{state.stage + 1}</div>
            <div className="text-[11px] tracking-[.2em]" style={{ color: "rgba(220,231,224,.55)" }}>CHAPTER</div>
          </div>
        </div>
          </PixelScene>
          <div className="guided-body">
            {step === "choose" ? <>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {FOCUSES.map((focus) => {
            const active = focus.id === state.stageFocus;
            return (
              <button
                key={focus.id}
                disabled={leaving}
                onClick={() => { onSelect(focus.id); goTo("confirm"); }}
                aria-pressed={active}
                className="group relative min-h-[102px] overflow-hidden rounded-2xl px-3 py-3 text-left transition-all hover:-translate-y-0.5 md:px-4 md:py-3.5"
                style={{
                  backgroundColor: active ? "#17251d" : "#0f1914",
                  border: `1px solid ${active ? `${focus.color}88` : "#22362c"}`,
                  boxShadow: active ? `inset 0 0 36px ${focus.color}09` : "none",
                }}
              >
                <span className="absolute -right-4 -top-5 h-16 w-16 rounded-full opacity-[.07]" style={{ backgroundColor: focus.color }} />
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg font-serif text-[13px]" style={{ color: focus.color, backgroundColor: `${focus.color}12`, border: `1px solid ${focus.color}2c` }}>{focus.icon}</span>
                  <span className="font-serif text-[15px] font-bold" style={{ color: active ? "#f3f8f5" : "#cbdcd3" }}>{focus.name}</span>
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ backgroundColor: focus.color, boxShadow: `0 0 8px ${focus.color}` }} />}
                </div>
                <div className="text-[13px] leading-5" style={{ color: active ? "#9bb3a6" : "#6c877a" }}>{focus.short}</div>
                <div className="mt-1.5 text-[11px] leading-5" style={{ color: focus.color }}>{focus.benefit}</div>
              </button>
            );
          })}
        </div>

              <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: "#0b130f", border: "1px solid #1d2c25" }}>
                <p className="text-[13px] text-mist-200">{selected ? selected.name : "尚未选择生活重心"}</p>
                <p className="mt-1 text-[13px] leading-5 text-mist-200">六种重心会改变事件、关系和修为，但不会锁死你的一生。</p>
              </div>
            </> : selected && <>
              <div className="guided-plan">
                <div><span className="text-sm text-mist-200">有所收获</span><p className="mt-1 text-base" style={{ color: selected.color }}>{selected.benefit}</p></div>
                <div><span className="text-sm" style={{ color: selected.color }}>{selected.name} · 代价</span><p className="mt-1 text-sm leading-6 text-mist-100">{selected.cost}</p></div>
              </div>
              <button className="guided-primary" disabled={leaving || advancing} onClick={advance}>{advancing ? "岁月正在展开…" : "推演这 " + years + " 年"}</button>
              <p className="text-center text-sm text-mist-200">点击后岁月才会前行，你会遇见这段人生的经历。</p>
              <button className="guided-back" disabled={leaving || advancing} onClick={() => goTo("choose")}>← 换一种过法</button>
            </>}
          </div>
        </div>
      </div>
    </section>
  );
}
