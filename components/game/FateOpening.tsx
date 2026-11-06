"use client";

import Image from "next/image";
import { getCelestialById } from "@/lib/game/daily";
import { getIntentScene, getSceneById } from "@/lib/game/scene-art";
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
        <div className="scene-caption absolute inset-x-0 bottom-0 px-5 pb-5 text-center md:px-8 md:pb-7">
          <div className="mb-2 text-[11px] tracking-[.36em]" style={{ color: "rgba(231,239,234,.55)" }}>FATE BEFORE THE FIRST STEP</div>
          <h2 className="font-serif text-2xl font-bold md:text-4xl" style={{ color: "#f2f7f4", textShadow: "0 2px 28px rgba(0,0,0,.9)" }}>入世之前，先问本心</h2>
          <p className="mt-2 text-[13px] leading-6 md:text-sm" style={{ color: "rgba(226,237,230,.78)" }}>灵根只决定你从哪里出发。此后每一步，都是你自己选的。</p>
        </div>
      </PixelScene>

      <div className="p-4 md:p-6">
        <div className="mb-3 rounded-xl px-4 py-3" style={{ backgroundColor: "#101915", border: `1px solid ${celestial.color}33` }}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] tracking-[.16em]" style={{ color: celestial.color }}>今日天象 · {celestial.name}</span>
            <span className="text-[11px]" style={{ color: "#8da998" }}>{celestial.epithet}</span>
          </div>
          <p className="mt-1 text-[13px] leading-5" style={{ color: "#708d7e" }}>{celestial.description}</p>
        </div>

        <div className="mb-4 rounded-2xl px-5 py-4 text-center" style={{ backgroundColor: "#17150b", border: "1px solid #d4a8433d" }}>
          <div className="mb-2 text-[11px] tracking-[.24em]" style={{ color: "#bfa76d" }}>你的命格谶语 · {state.prophecy.title}</div>
          <p className="font-serif text-base leading-7 md:text-lg" style={{ color: "#e9d79f" }}>「{state.prophecy.text}」</p>
          <div className="mt-1.5 text-[11px]" style={{ color: "#b5a16c" }}>它只是一个假设。你可以应验它，也可以逆着它活。</div>
        </div>

        {lastLife && (
          <div className="mb-4 rounded-xl px-4 py-3" style={{ backgroundColor: "#0f1a14", border: "1px solid #243a2f" }}>
            <div className="text-[11px]" style={{ color: "#658074" }}>前世留下的回响</div>
            <div className="mt-1 text-sm leading-6" style={{ color: "#b8ccc2" }}>
              第 {lastLife.lifeNumber} 世 · {lastLife.endingTitle}。{lastLife.karmaMarks[0] ? `还有一段因果没有走完：${lastLife.karmaMarks[0]}` : "你把前世的一切都留在了身后。"}
            </div>
            {state.meta.selectedObsession && <div className="mt-1.5 text-[13px]" style={{ color: "#d4a843" }}>这一世，你还记得：{state.meta.selectedObsession.title}</div>}
          </div>
        )}

        <div className="mb-2 flex items-center gap-2">
          <span className="h-px w-7" style={{ backgroundColor: "#4ade9a" }} />
          <span className="text-[11px] tracking-[.22em]" style={{ color: "#93ad9f" }}>选择此世最放不下的执念</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {INTENTS.map((intent) => {
            const art = getIntentScene(intent.id);
            return (
              <button
                key={intent.id}
                onClick={() => onChoose(intent.id)}
                className="group relative flex min-h-[112px] items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-left transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: "#101b15", border: `1px solid ${intent.accent}38` }}
              >
                <Image
                  src={art.src}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover opacity-40 transition-transform duration-500 group-hover:scale-[1.035]"
                  style={{ objectPosition: "center 44%" }}
                />
                <span
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(90deg, rgba(7,13,10,.96) 0%, rgba(7,13,10,.78) 54%, rgba(7,13,10,.34) 100%)" }}
                />
                <div className="relative z-10 grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl font-serif text-sm backdrop-blur-sm" style={{ color: intent.accent, border: `1px solid ${intent.accent}55`, backgroundColor: "rgba(7,13,10,.62)" }}>{intent.icon}</div>
                <div className="relative z-10 min-w-0">
                  <div className="font-serif text-sm font-bold" style={{ color: "#edf4f0" }}>{intent.title}</div>
                  <div className="mt-0.5 text-[13px] leading-5" style={{ color: "#9aafa3", textShadow: "0 1px 8px rgba(0,0,0,.75)" }}>{intent.text}</div>
                </div>
                <span className="relative z-10 ml-auto text-lg opacity-60 transition-opacity group-hover:opacity-100" style={{ color: intent.accent }}>›</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
