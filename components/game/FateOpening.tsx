"use client";

import { getCelestialById } from "@/lib/game/daily";
import { getSceneById } from "@/lib/game/scene-art";
import type { GameState, HeartIntent } from "@/types/game";
import PixelScene from "./PixelScene";

const INTENTS: Array<{ id: HeartIntent; icon: string; title: string; text: string; accent: string }> = [
  { id: "longevity", icon: "生", title: "求长生", text: "我想看看，这条路的尽头究竟有什么。", accent: "#6fedb5" },
  { id: "revenge", icon: "恨", title: "求复仇", text: "有一个人或一件事，我必须亲手做个了断。", accent: "#ef6b62" },
  { id: "guard", icon: "守", title: "求守护", text: "我不想再让重要的人独自面对风雨。", accent: "#6ea8fe" },
  { id: "freedom", icon: "游", title: "求自在", text: "谁也别替我决定，我该成为什么样的人。", accent: "#d4a843" },
];

export default function FateOpening({ state, onChoose }: { state: GameState; onChoose: (intent: HeartIntent) => void }) {
  const lastLife = state.meta.lives.at(-1);
  const celestial = getCelestialById(state.celestialId);
  const scene = getSceneById("cave");
  return (
    <section className="overflow-hidden rounded-[26px]" style={{ backgroundColor: "#0d1712", border: "1px solid #2d4438", boxShadow: "0 28px 100px rgba(0,0,0,.35)" }}>
      <PixelScene scene={scene} priority>
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 text-center md:px-8 md:pb-7">
          <div className="mb-2 text-[8px] tracking-[.36em]" style={{ color: "rgba(231,239,234,.55)" }}>FATE BEFORE THE FIRST STEP</div>
          <h2 className="font-serif text-2xl font-bold md:text-4xl" style={{ color: "#f2f7f4", textShadow: "0 2px 28px rgba(0,0,0,.9)" }}>入世之前，先问本心</h2>
          <p className="mt-2 text-[11px] leading-6 md:text-sm" style={{ color: "rgba(226,237,230,.78)" }}>灵根只决定你从哪里出发。此后每一步，都是你自己选的。</p>
        </div>
      </PixelScene>

      <div className="p-4 md:p-6">
        <div className="mb-3 rounded-xl px-4 py-3" style={{ backgroundColor: "#101915", border: `1px solid ${celestial.color}33` }}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[9px] tracking-[.16em]" style={{ color: celestial.color }}>今日天象 · {celestial.name}</span>
            <span className="text-[9px]" style={{ color: "#5d786a" }}>{celestial.epithet}</span>
          </div>
          <p className="mt-1 text-[10px] leading-5" style={{ color: "#708d7e" }}>{celestial.description}</p>
        </div>

        <div className="mb-4 rounded-2xl px-5 py-4 text-center" style={{ backgroundColor: "#17150b", border: "1px solid #d4a8433d" }}>
          <div className="mb-2 text-[9px] tracking-[.24em]" style={{ color: "#8e7440" }}>你的命格谶语 · {state.prophecy.title}</div>
          <p className="font-serif text-base leading-7 md:text-lg" style={{ color: "#e9d79f" }}>「{state.prophecy.text}」</p>
          <div className="mt-1.5 text-[9px]" style={{ color: "#6a5b35" }}>它只是一个假设。你可以应验它，也可以逆着它活。</div>
        </div>

        {lastLife && (
          <div className="mb-4 rounded-xl px-4 py-3" style={{ backgroundColor: "#0f1a14", border: "1px solid #243a2f" }}>
            <div className="text-[9px]" style={{ color: "#658074" }}>前世留下的回响</div>
            <div className="mt-1 text-xs leading-6" style={{ color: "#b8ccc2" }}>
              第 {lastLife.lifeNumber} 世 · {lastLife.endingTitle}。{lastLife.karmaMarks[0] ? `还有一段因果没有走完：${lastLife.karmaMarks[0]}` : "你把前世的一切都留在了身后。"}
            </div>
            {state.meta.selectedObsession && <div className="mt-1.5 text-[10px]" style={{ color: "#d4a843" }}>这一世，你还记得：{state.meta.selectedObsession.title}</div>}
          </div>
        )}

        <div className="mb-2 flex items-center gap-2">
          <span className="h-px w-7" style={{ backgroundColor: "#4ade9a" }} />
          <span className="text-[9px] tracking-[.22em]" style={{ color: "#668777" }}>选择此世最放不下的执念</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {INTENTS.map((intent) => (
            <button
              key={intent.id}
              onClick={() => onChoose(intent.id)}
              className="group flex min-h-[82px] items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: "#101b15", border: "1px solid #283e33" }}
            >
              <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl font-serif text-sm" style={{ color: intent.accent, border: `1px solid ${intent.accent}3d`, backgroundColor: `${intent.accent}0d` }}>{intent.icon}</div>
              <div>
                <div className="font-serif text-sm font-bold" style={{ color: "#edf4f0" }}>{intent.title}</div>
                <div className="mt-0.5 text-[10px] leading-5" style={{ color: "#6f897c" }}>{intent.text}</div>
              </div>
              <span className="ml-auto text-lg opacity-0 transition-opacity group-hover:opacity-100" style={{ color: intent.accent }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
