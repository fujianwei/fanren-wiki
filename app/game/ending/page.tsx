"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "@/components/game/GameProvider";
import PixelScene from "@/components/game/PixelScene";
import { getSceneById } from "@/lib/game/scene-art";
import { AXIS_LABELS, buildEndingSummary, getThreadTitle } from "@/lib/game/narrative";
import type { HeartIntent } from "@/types/game";

const ENDING_TEXT: Record<string, { title: string; text: string; color: string }> = {
  ascend: { title: "飞升灵界", text: "踏破虚空，你终于飞升灵界。此生的悲欢都化作了身后的一场风。", color: "#d4a843" },
  natural: { title: "寿元耗尽，安然坐化", text: "你安然坐化，把自己的名字留在了某段旧事里。", color: "#4ade9a" },
  death_battle: { title: "战斗陨落", text: "你倒在了修仙路上，鲜血染红了脚下的土地。", color: "#ef4444" },
  death_heart: { title: "心魔陨落", text: "心魔终究吞噬了你，你把最后一眼留给了自己的执念。", color: "#ef4444" },
  death_break: { title: "冲关陨落", text: "天雷散尽，你在最后一关前化成了灰。", color: "#ef4444" },
  ascend_fail: { title: "飞升失败", text: "天门曾在眼前打开，却最终在你面前合拢。", color: "#6a8878" },
};

const INTENTS: Record<HeartIntent, string> = {
  longevity: "求长生",
  revenge: "求复仇",
  guard: "求守护",
  freedom: "求自在",
};

const TEXTURE_LABELS: Record<string, string> = {
  guardVsChase: "守道 / 逐势",
  solitudeVsBonds: "独行 / 结缘",
  mercyVsRuthless: "慈悲 / 杀伐",
  mortalVsAscension: "人间 / 天门",
};

function EndingContent() {
  const params = useSearchParams();
  const { state, dispatch } = useGame();
  const router = useRouter();
  const summary = state.endingSummary ?? (state.phase === "ended" ? buildEndingSummary(state) : null);
  const endingType = summary?.family ?? params.get("type") ?? "natural";
  const fallback = ENDING_TEXT[endingType] ?? ENDING_TEXT.natural;
  const lastLife = state.meta.lives.at(-1);
  const obsession = lastLife?.selectedObsession ?? state.meta.selectedObsession;
  const color = endingType === "ascend" ? "#d4a843" : fallback.color;
  const scene = getSceneById(
    endingType === "ascend" || endingType === "ascend_fail"
      ? "ascension_choice"
      : endingType === "death_battle"
        ? "battle"
        : endingType === "natural"
          ? "wilderness"
          : "tribulation"
  );

  useEffect(() => {
    if (state.phase === "ended" && summary && !state.archived) dispatch({ type: "COMMIT_LIFE" });
  }, [state.phase, state.archived, summary, dispatch]);

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="w-full max-w-md rounded-2xl p-8 text-center" style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}>
          <h1 className="font-serif text-3xl font-bold mb-4" style={{ color: fallback.color }}>{fallback.title}</h1>
          <p className="text-sm leading-7 mb-7" style={{ color: "#b8ccc2" }}>{fallback.text}</p>
          <Link href="/game" className="btn-primary block py-3 rounded-full text-sm">再入轮回</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 py-5 md:px-6 md:py-9">
      <div className="max-w-5xl mx-auto">
        <section className="mb-4 overflow-hidden rounded-[26px]" style={{ border: `1px solid ${color}55`, boxShadow: `0 28px 100px ${color}12` }}>
          <PixelScene scene={scene} priority>
            <div className="absolute inset-x-0 bottom-0 px-5 pb-6 text-center md:px-8 md:pb-8">
              <div className="mb-2 text-[9px] tracking-[0.4em]" style={{ color: "rgba(231,239,234,.55)" }}>THE LEDGER OF A LIFE</div>
              <h1 className="font-serif text-3xl font-bold md:text-5xl" style={{ color, textShadow: "0 3px 28px rgba(0,0,0,.9)" }}>{summary.title}</h1>
              <p className="mt-2 text-[11px] md:text-sm" style={{ color: "#ead597", textShadow: "0 1px 12px rgba(0,0,0,.8)" }}>{summary.subtitle}</p>
            </div>
          </PixelScene>
          <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-3" style={{ backgroundColor: "#0c1510", borderTop: "1px solid #263a30" }}>
            <span className="rounded-full px-2.5 py-1 text-[9px]" style={{ color: "#d4a843", backgroundColor: "#181408" }}>第 {state.lifeNumber} 世</span>
            <span className="rounded-full px-2.5 py-1 text-[9px]" style={{ color: "#8fa79a", backgroundColor: "#101a14" }}>{state.characterName} · {state.age}岁</span>
            <span className="rounded-full px-2.5 py-1 text-[9px]" style={{ color: "#8fa79a", backgroundColor: "#101a14" }}>{state.heartIntent ? INTENTS[state.heartIntent] : "本心未明"}</span>
          </div>
        </section>

        <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-4">
          <div className="flex flex-col gap-4">
            <section className="rounded-2xl p-6" style={{ backgroundColor: "#111a16", border: `1px solid ${color}44`, boxShadow: `0 24px 90px ${color}0d` }}>
              <p className="text-sm md:text-base leading-8 text-center mb-6" style={{ color: "#b8ccc2" }}>{summary.narrative}</p>
              <div className="rounded-xl px-5 py-4 mb-4" style={{ backgroundColor: "#0e1610", border: "1px solid #1a2820" }}>
                <div className="text-[10px] mb-1" style={{ color: "#6a8878" }}>命格谶语 · {state.prophecy.title}</div>
                <p className="font-serif text-base leading-7" style={{ color: "#e4cf92" }}>「{summary.prophecyText ?? state.prophecy.text}」</p>
                <div className="text-[10px] mt-2" style={{ color: summary.prophecyVerdict === "fulfilled" ? "#d4a843" : summary.prophecyVerdict === "defied" ? "#4ade9a" : "#6a8878" }}>
                  {summary.prophecyVerdict === "fulfilled" ? "应验 · 你活成了谶语" : summary.prophecyVerdict === "defied" ? "逆命 · 你走了相反的路" : "未答 · 这句话到最后也没有答案"}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(summary.textureAxes ?? {}).map(([key, value]) => (
                  <div key={key} className="rounded-xl px-3 py-3 text-center" style={{ backgroundColor: "#0e1610", border: "1px solid #1a2820" }}>
                    <div className="text-[9px] mb-1" style={{ color: "#4a6a58" }}>{TEXTURE_LABELS[key] ?? key}</div>
                    <div className="text-[11px] leading-relaxed" style={{ color: "#b8ccc2" }}>{value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl p-5" style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-bold" style={{ color: "#e8f0ec" }}>这一生留下的因果</h2>
                <span className="text-[10px]" style={{ color: "#6a8878" }}>{summary.resolvedThreads.length + (summary.brokenThreads?.length ?? 0)} 段落定</span>
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                {summary.resolvedThreads.map((threadId) => {
                  const thread = state.narrative.threads[threadId];
                  return (
                    <div key={threadId} className="rounded-xl px-4 py-3" style={{ backgroundColor: "#0e1610", border: "1px solid #26352d" }}>
                      <div className="text-xs font-medium mb-1" style={{ color: "#4ade9a" }}>◆ {getThreadTitle(threadId)} · 得偿</div>
                      <div className="text-[10px] leading-relaxed" style={{ color: "#6a8878" }}>{thread?.resolution ?? "这一段因果最终有了结果。"}</div>
                    </div>
                  );
                })}
                {(summary.brokenThreads ?? []).map((threadId) => (
                  <div key={threadId} className="rounded-xl px-4 py-3" style={{ backgroundColor: "#160d0d", border: "1px solid #ef444422" }}>
                    <div className="text-xs font-medium mb-1" style={{ color: "#ef8d8d" }}>× {getThreadTitle(threadId)} · 断裂</div>
                    <div className="text-[10px] leading-relaxed" style={{ color: "#806363" }}>{state.narrative.threads[threadId]?.resolution ?? "你最终没有走完这段因果。"}</div>
                  </div>
                ))}
                {summary.openThreads.map((threadId) => (
                  <div key={threadId} className="rounded-xl px-4 py-3" style={{ backgroundColor: "#0e1610", border: "1px solid #1a2820" }}>
                    <div className="text-xs font-medium mb-1" style={{ color: "#6a8878" }}>◇ {getThreadTitle(threadId)} · 未竟</div>
                    <div className="text-[10px]" style={{ color: "#4a6a58" }}>你到最后也没有知道这条路会通向哪里。</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl p-5" style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}>
              <h2 className="font-serif text-lg font-bold mb-3" style={{ color: "#e8f0ec" }}>此生关系</h2>
              <div className="flex flex-col gap-2">
                {(summary.relationEpitaphs ?? []).map((line) => <div key={line} className="text-xs rounded-xl px-4 py-3" style={{ color: "#b8ccc2", backgroundColor: "#0e1610" }}>{line}</div>)}
              </div>
              {summary.keyMemory && <div className="mt-4 rounded-xl px-4 py-4" style={{ backgroundColor: "#16140a", border: "1px solid #d4a84322" }}><div className="text-[10px] mb-1" style={{ color: "#8e7440" }}>最后留下的记忆</div><p className="text-sm leading-7" style={{ color: "#d8c58f" }}>{summary.keyMemory}</p></div>}
            </section>
          </div>

          <div className="flex flex-col gap-4">
            <section className="rounded-2xl p-5" style={{ backgroundColor: "#111a16", border: "1px solid #26352d" }}>
              <h2 className="font-serif text-lg font-bold mb-2" style={{ color: "#e8f0ec" }}>留下一个执念</h2>
              <p className="text-xs leading-relaxed mb-4" style={{ color: "#6a8878" }}>下一世不会给你更多属性。它只会让你在第一眼看见某个人、某件事时，心里多停顿一瞬。</p>
              <div className="flex flex-col gap-2">
                {(summary.obsessions ?? []).map((item) => {
                  const active = obsession?.id === item.id;
                  return (
                    <button key={item.id} onClick={() => dispatch({ type: "SET_OBSESSION", obsession: item })} className="text-left rounded-xl px-4 py-3 transition-all" style={{ backgroundColor: active ? "#16140a" : "#0e1610", border: `1px solid ${active ? "#d4a84377" : "#1a2820"}` }}>
                      <div className="text-xs font-medium mb-1" style={{ color: active ? "#d4a843" : "#b8ccc2" }}>{item.title}</div>
                      <div className="text-[10px] leading-relaxed" style={{ color: "#6a8878" }}>{item.text}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl p-5" style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}>
              <div className="text-[10px] tracking-[0.25em] mb-2" style={{ color: "#6a8878" }}>三生镜</div>
              <h2 className="font-serif text-lg font-bold mb-2" style={{ color: "#e8f0ec" }}>你总是怎样做选择？</h2>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {summary.dominantAxes.map((axis) => <span key={axis} className="text-[10px] px-2 py-1 rounded-full" style={{ color: "#d4a843", backgroundColor: "#16140a" }}>{AXIS_LABELS[axis]}</span>)}
              </div>
              <p className="text-xs leading-6" style={{ color: "#8fa79a" }}>{summary.epitaph}</p>
              <div className="text-[9px] tracking-widest mt-4" style={{ color: "#3a4a40" }}>{summary.signature}</div>
            </section>

            <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: "#0e1610", border: "1px solid #26352d" }}>
              <p className="font-serif text-base leading-7 mb-5" style={{ color: "#d9e5de" }}>{summary.epitaph}</p>
              <button
                onClick={() => {
                  dispatch({ type: "START_GAME", spiritRoot: state.spiritRoot, fortune: state.fortune, seed: state.runSeed });
                  router.push("/game/play");
                }}
                className="btn-primary w-full py-3 rounded-full text-sm"
              >
                同命重开 · 这次换一条路
              </button>
              <Link href="/game" className="btn-secondary block py-2.5 rounded-full text-sm mt-2">重新抽灵根，再入轮回</Link>
              <Link href="/" className="block py-2 text-xs mt-1" style={{ color: "#4a6a58" }}>回到现世</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EndingPage() {
  return <Suspense><EndingContent /></Suspense>;
}
