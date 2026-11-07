"use client";

import Image from "next/image";
import { getCelestialById } from "@/lib/game/daily";
import { getIntentScene, getSceneById } from "@/lib/game/scene-art";
import type { GameState, HeartIntent } from "@/types/game";
import PixelScene from "./PixelScene";
import { useGuidedStep } from "./useGuidedStep";

const INTENTS: Array<{ id: HeartIntent; icon: string; title: string; text: string; accent: string }> = [
  { id: "longevity", icon: "生", title: "求长生", text: "我想看看，这条路的尽头究竟有什么。", accent: "#6fedb5" },
  { id: "revenge", icon: "恨", title: "求复仇", text: "有一个人或一件事，我必须亲手做个了断。", accent: "#ef6b62" },
  { id: "guard", icon: "守", title: "求守护", text: "我不想再让重要的人独自面对风雨。", accent: "#6ea8fe" },
  { id: "freedom", icon: "游", title: "求自在", text: "谁也别替我决定，我该成为什么样的人。", accent: "#d4a843" },
];

export default function FateOpening({ state, onChoose }: { state: GameState; onChoose: (intent: HeartIntent) => void }) {
  const { step, goTo, leaving, panel } = useGuidedStep(0);
  const celestial = getCelestialById(state.celestialId);
  const lastLife = state.meta.lives.at(-1);
  const titles = ["你的命格谶语 · " + state.prophecy.title, "今日天象 · " + celestial.name, "入世之前，先问本心"];

  return (
    <section className="guided-card" aria-label="入世引导">
      <div className="guided-progress">
        <ol className="flex items-center gap-3" aria-label="引导进度">
          {["命格", "天象", "本心"].map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined} className={step === index ? "text-gold-bright" : "text-mist-200"}>{index + 1} · {label}</li>)}
        </ol>
        {step < 2 && <button disabled={leaving} onClick={() => goTo(2)} className="guided-back">跳过介绍</button>}
      </div>
      <div ref={panel} tabIndex={-1} aria-label={titles[step]} className={"guided-panel " + (leaving ? "is-leaving" : "")}>
        <div key={step} className="guided-enter">
          <PixelScene scene={getSceneById("cave")} priority compact>
            <div className="scene-caption text-center">
              {step === 2 && <div className="mb-2 text-[11px] tracking-[.36em]" style={{ color: "rgba(231,239,234,.55)" }}>FATE BEFORE THE FIRST STEP</div>}
              <h2 className="font-serif text-2xl font-bold text-mist-100 md:text-3xl">{titles[step]}</h2>
              {step === 2 && <p className="mt-2 text-[13px] leading-6 md:text-sm" style={{ color: "rgba(226,237,230,.78)" }}>灵根只决定你从哪里出发。此后每一步，都是你自己选的。</p>}
            </div>
          </PixelScene>
          <div className="guided-body">
            {step === 0 && <>
              <p className="text-center text-sm text-gold-bright">你的命格谶语 · {state.prophecy.title}</p>
              <blockquote className="guided-quote">「{state.prophecy.text}」</blockquote>
              <p className="text-center text-sm text-mist-200">它只是一个假设。你可以应验它，也可以逆着它活。</p>
              <button className="guided-primary" disabled={leaving} onClick={() => goTo(1)}>看看今日天象 →</button>
            </>}
            {step === 1 && <>
              <div className="text-center">
                <p className="font-serif text-2xl font-bold" style={{ color: celestial.color }}>{celestial.name}</p>
                <p className="mt-3 text-base leading-8 text-mist-100">{celestial.description}</p>
                <p className="mt-2 text-sm text-mist-200">{celestial.epithet}</p>
              </div>
              <button className="guided-primary" disabled={leaving} onClick={() => goTo(2)}>选择我的本心 →</button>
              <button className="guided-back" disabled={leaving} onClick={() => goTo(0)}>← 回看命格</button>
            </>}
            {step === 2 && <>
              <p className="text-sm text-mist-200">选择此世最放不下的执念</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {INTENTS.map((intent) => {
            const art = getIntentScene(intent.id);
            return (
              <button
                key={intent.id}
                disabled={leaving}
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
              <details className="guided-details">
                <summary>回看命格、天象与前世回响</summary>
                <p className="mt-3 text-gold-bright">{state.prophecy.title} · {state.prophecy.text}</p>
                <p className="mt-3">{celestial.name} · {celestial.description}</p>
                {lastLife && <p className="mt-3"><span className="block">前世留下的回响</span>第 {lastLife.lifeNumber} 世 · {lastLife.endingTitle}。{lastLife.karmaMarks[0] ? "还有一段因果没有走完：" + lastLife.karmaMarks[0] : "你把前世的一切都留在了身后。"}</p>}
                {state.meta.selectedObsession && <p className="mt-3">这一世，你还记得：{state.meta.selectedObsession.title}</p>}
              </details>
              <button className="guided-back" disabled={leaving} onClick={() => goTo(1)}>← 回看天象</button>
            </>}
          </div>
        </div>
      </div>
    </section>
  );
}
