"use client";

import type { GameState, HeartIntent } from "@/types/game";

const INTENTS: Array<{ id: HeartIntent; icon: string; title: string; text: string }> = [
  { id: "longevity", icon: "生", title: "求长生", text: "我想看看，这条路的尽头究竟有什么。" },
  { id: "revenge", icon: "恨", title: "求复仇", text: "有一个人或一件事，我必须亲手做个了断。" },
  { id: "guard", icon: "守", title: "求守护", text: "我不想再让重要的人独自面对风雨。" },
  { id: "freedom", icon: "游", title: "求自在", text: "谁也别替我决定，我该成为什么样的人。" },
];

export default function FateOpening({ state, onChoose }: { state: GameState; onChoose: (intent: HeartIntent) => void }) {
  const lastLife = state.meta.lives.at(-1);
  return (
    <section className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: "#101915", border: "1px solid #26352d" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(212,168,67,.13), transparent 55%)" }} />
      <div className="relative px-5 md:px-8 py-7">
        <div className="text-center mb-6">
          <div className="text-[10px] tracking-[0.35em] mb-2" style={{ color: "#6a8878" }}>FATE BEFORE THE FIRST STEP</div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2" style={{ color: "#e8f0ec" }}>入世之前，先问本心</h2>
          <p className="text-sm leading-relaxed" style={{ color: "#8fa79a" }}>灵根只决定你从哪里出发。此后每一步，都是你自己选的。</p>
        </div>

        <div className="rounded-2xl px-5 py-4 mb-6 text-center" style={{ backgroundColor: "#16140a", border: "1px solid #d4a84333" }}>
          <div className="text-[10px] tracking-[0.25em] mb-2" style={{ color: "#8e7440" }}>你的命格谶语 · {state.prophecy.title}</div>
          <p className="font-serif text-lg leading-relaxed" style={{ color: "#e4cf92" }}>「{state.prophecy.text}」</p>
          <div className="text-[10px] mt-2" style={{ color: "#6a5b35" }}>它只是一个假设。你可以应验它，也可以逆着它活。</div>
        </div>

        {lastLife && (
          <div className="rounded-xl px-4 py-3 mb-6" style={{ backgroundColor: "#0e1610", border: "1px solid #1a2820" }}>
            <div className="text-[10px] mb-1" style={{ color: "#6a8878" }}>前世留下的回响</div>
            <div className="text-sm" style={{ color: "#b8ccc2" }}>
              第 {lastLife.lifeNumber} 世 · {lastLife.endingTitle}。{lastLife.karmaMarks[0] ? `还有一段因果没有走完：${lastLife.karmaMarks[0]}` : "你把前世的一切都留在了身后。"}
            </div>
            {state.meta.selectedObsession && <div className="text-xs mt-2" style={{ color: "#d4a843" }}>这一世，你还记得：{state.meta.selectedObsession.title}</div>}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          {INTENTS.map((intent) => (
            <button
              key={intent.id}
              onClick={() => onChoose(intent.id)}
              className="group text-left rounded-2xl px-5 py-5 transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: "#111a16", border: "1px solid #26352d" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-serif" style={{ color: "#d4a843", border: "1px solid #d4a84344", backgroundColor: "#16140a" }}>{intent.icon}</div>
                <div>
                  <div className="font-serif font-bold mb-1" style={{ color: "#e8f0ec" }}>{intent.title}</div>
                  <div className="text-xs leading-relaxed" style={{ color: "#6a8878" }}>{intent.text}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
