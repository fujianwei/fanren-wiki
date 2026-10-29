"use client";

import { pickLifeOathChoices } from "@/lib/game/oaths";
import type { GameState } from "@/types/game";

interface Props {
  state: GameState;
  onChoose: (oathId: string | null) => void;
}

export default function LifeOathPanel({ state, onChoose }: Props) {
  const choices = pickLifeOathChoices(state.runSeed, 3);
  return (
    <section className="overflow-hidden rounded-[26px]" style={{ backgroundColor: "#101915", border: "1px solid #2d4438", boxShadow: "0 24px 90px rgba(0,0,0,.3)" }}>
      <div className="px-5 pt-5 md:px-7">
        <div className="mb-2 text-[9px] tracking-[.3em]" style={{ color: "#6f8c7d" }}>A VOW FOR THIS LIFE</div>
        <h2 className="font-serif text-2xl font-bold" style={{ color: "#edf5f1" }}>这一世，你想留下什么？</h2>
        <p className="mt-2 text-xs leading-6" style={{ color: "#779285" }}>命誓不是职业，也不会锁死结局。它只是给这一世一个值得回望的答案。</p>
      </div>
      <div className="grid gap-2.5 p-4 md:grid-cols-3 md:p-5">
        {choices.map((oath) => (
          <button
            key={oath.id}
            onClick={() => onChoose(oath.id)}
            className="group min-h-[150px] rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: "#0d1712", border: "1px solid #243a2f" }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg font-serif text-xs" style={{ color: oath.color, backgroundColor: `${oath.color}0e`, border: `1px solid ${oath.color}33` }}>{oath.icon}</span>
              <span className="text-[9px] tracking-[.12em]" style={{ color: `${oath.color}aa` }}>{oath.short}</span>
            </div>
            <div className="font-serif text-sm font-bold leading-6" style={{ color: "#dfece5" }}>{oath.title}</div>
            <p className="mt-2 text-[10px] leading-5" style={{ color: "#6f897c" }}>{oath.text}</p>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 px-5 pb-5 md:px-6">
        <span className="text-[9px] leading-5" style={{ color: "#526e60" }}>命誓会在死亡时揭示是否得偿，不会提前告诉你答案。</span>
        <button onClick={() => onChoose(null)} className="flex-shrink-0 rounded-full px-4 py-2 text-[10px]" style={{ color: "#7d998a", border: "1px solid #2b4136" }}>不立命誓</button>
      </div>
    </section>
  );
}
