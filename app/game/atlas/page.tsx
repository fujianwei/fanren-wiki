"use client";

import Link from "next/link";
import { useGame } from "@/components/game/GameProvider";
import { getAtlasSummary, getThreadWhisper } from "@/lib/game/atlas";
import { FATE_THREADS } from "@/lib/game/narrative";

export default function FateAtlasPage() {
  const { state } = useGame();
  const summary = getAtlasSummary(state.meta);
  const atlas = state.meta.fateAtlas ?? {};
  const hintedUnseen = FATE_THREADS.filter((thread) => !atlas[thread.id]?.encountered).slice(0, 3).map((thread) => thread.id);

  return (
    <div className="min-h-screen px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[9px] tracking-[.35em]" style={{ color: "#627f70" }}>THE ATLAS OF FATES</div>
            <h1 className="mt-2 font-serif text-3xl font-bold md:text-4xl" style={{ color: "#edf5f1" }}>命途图鉴</h1>
            <p className="mt-2 text-xs leading-6" style={{ color: "#789486" }}>你见过、走完、错过和从未靠近的命运，都会留在这里。</p>
          </div>
          <Link href="/game" className="rounded-full px-4 py-2 text-xs" style={{ color: "#d4a843", border: "1px solid #d4a84344" }}>回到轮回</Link>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            ["已见", summary.seen, "#8bc4ff"],
            ["得偿", summary.resolved, "#6fedb5"],
            ["断裂", summary.broken, "#ef6b62"],
            ["未见", summary.unseen, "#8fa79a"],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-2xl px-4 py-3" style={{ backgroundColor: "#0f1914", border: "1px solid #24382f" }}>
              <div className="text-[9px] tracking-[.18em]" style={{ color: "#5e7a6c" }}>{label}</div>
              <div className="mt-1 font-serif text-2xl font-bold" style={{ color: String(color) }}>{value}<span className="ml-1 text-xs" style={{ color: "#4e685b" }}>/{summary.total}</span></div>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-2xl px-4 py-3" style={{ backgroundColor: "#101915", border: "1px solid #263b31" }}>
          <div className="mb-2 flex items-center justify-between text-[9px]" style={{ color: "#627f70" }}>
            <span>命运显影</span><span>{Math.round(summary.seen / summary.total * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "#192a22" }}>
            <div className="h-full rounded-full" style={{ width: `${summary.seen / summary.total * 100}%`, background: "linear-gradient(90deg, #4ade9a, #d4a843)" }} />
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {FATE_THREADS.map((thread) => {
            const entry = atlas[thread.id];
            const seen = Boolean(entry?.encountered);
            const status = entry?.resolved ? "已得偿" : entry?.broken ? "已断裂" : seen ? "因果未竟" : "未见";
            const color = entry?.resolved ? "#6fedb5" : entry?.broken ? "#ef6b62" : seen ? "#d4a843" : "#526e60";
            return (
              <article key={thread.id} className="min-h-[150px] rounded-2xl px-4 py-4" style={{ backgroundColor: seen ? "#101915" : "#0b130f", border: `1px solid ${seen ? `${color}33` : "#1d2e26"}` }}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[9px] tracking-[.14em]" style={{ color }}>{status}</span>
                  {seen && <span className="text-[8px]" style={{ color: "#4e685b" }}>第 {entry.lastLife} 世</span>}
                </div>
                <h2 className="font-serif text-sm font-bold" style={{ color: seen ? "#e3eee8" : "#6c877a" }}>{seen ? thread.title : "未显之线"}</h2>
                <p className="mt-1 text-[9px]" style={{ color: "#5d786a" }}>{thread.theme}</p>
                <p className="mt-3 text-[10px] leading-5" style={{ color: seen ? "#769184" : "#5a7567" }}>
                  {seen
                    ? entry.resolution ?? `${thread.stageTitles[0]}之后，这段因果仍在继续。`
                    : hintedUnseen.includes(thread.id)
                      ? getThreadWhisper(thread.id)
                      : "命途仍被墨色遮住。继续轮回，下一世也许会显出一角。"}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
