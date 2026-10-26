"use client";

import Image from "next/image";
import type { GameEvent, EventOption } from "@/types/game";
import { getActionArt, getSceneForEvent } from "@/lib/game/scene-art";
import { useGame } from "./GameProvider";
import PixelScene from "./PixelScene";

interface Props {
  event: GameEvent;
  onChoose: (option: EventOption, optionIndex: number) => void;
}

export default function EventCard({ event, onChoose }: Props) {
  const { state } = useGame();
  const { inventory, lingshi } = state;
  const scene = getSceneForEvent(event, state.realmSlug);

  function canAfford(option: EventOption): boolean {
    if (!option.requires) return true;
    if (option.requires.lingshi && lingshi < option.requires.lingshi) return false;
    if (option.requires.itemId && (inventory[option.requires.itemId] ?? 0) < 1) return false;
    return true;
  }

  const isFate = event.source === "fate" || Boolean(event.story);
  const category = isFate ? "旧事回响" : event.source === "life" ? "世情" : event.category === "karma" ? "因果" : event.category === "battle" ? "争斗" : "机缘";

  return (
    <article
      className="relative overflow-hidden rounded-[26px]"
      style={{
        backgroundColor: "#0d1712",
        border: `1px solid ${isFate ? "#d4a84366" : "#2a4035"}`,
        boxShadow: `0 28px 100px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.025)`,
      }}
    >
      <PixelScene scene={scene} priority>
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2 md:left-6 md:top-6">
          <span
            className="rounded-full px-2.5 py-1 text-[9px] tracking-[.16em] backdrop-blur-md"
            style={{
              color: isFate ? "#f3d27d" : "#b9d0c3",
              backgroundColor: "rgba(7,14,10,.72)",
              border: `1px solid ${isFate ? "#d4a84355" : "#8fa79a44"}`,
            }}
          >
            {category}
          </span>
          {event.story && (
            <span className="rounded-full px-2.5 py-1 text-[9px] backdrop-blur-md" style={{ color: "#e9d8a4", backgroundColor: "rgba(7,14,10,.72)", border: "1px solid #ffffff18" }}>
              {event.story.threadTitle} · {event.story.stage}/{event.story.stageCount}
            </span>
          )}
        </div>
        <div className="absolute right-4 top-4 text-right md:right-6 md:top-6">
          <div className="text-[8px] tracking-[.24em]" style={{ color: "rgba(220,234,226,.55)" }}>SCENE</div>
          <div className="font-serif text-[11px]" style={{ color: "rgba(235,244,239,.78)" }}>{scene.label}</div>
        </div>
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 md:px-7 md:pb-6">
          <div className="mb-2 flex items-end justify-between gap-4">
            <h2 className="font-serif text-2xl font-bold leading-tight md:text-[32px]" style={{ color: "#f2f7f4", textShadow: "0 2px 24px rgba(0,0,0,.8)" }}>{event.title}</h2>
            {event.story && (
              <div className="mb-1 flex flex-shrink-0 gap-1">
                {Array.from({ length: event.story.stageCount }).map((_, index) => (
                  <span
                    key={index}
                    className="h-1 rounded-full transition-all"
                    style={{ width: index + 1 === event.story?.stage ? 20 : 7, backgroundColor: index + 1 <= (event.story?.stage ?? 0) ? "#d4a843" : "#ffffff2b" }}
                  />
                ))}
              </div>
            )}
          </div>
          <p className="max-w-3xl text-[13px] leading-7 md:text-sm" style={{ color: "rgba(224,235,229,.84)", textShadow: "0 1px 12px rgba(0,0,0,.72)" }}>{event.description}</p>
        </div>
      </PixelScene>

      <div className="px-4 py-4 md:px-6 md:py-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-px w-7" style={{ backgroundColor: isFate ? "#d4a843" : "#4ade9a" }} />
            <span className="text-[9px] tracking-[.22em]" style={{ color: isFate ? "#b89b57" : "#668777" }}>你会怎么做</span>
          </div>
          <span className="hidden text-[9px] sm:block" style={{ color: "#506a5e" }}>选择会改变关系、命运线与结局</span>
        </div>

        <div className="grid gap-2.5 md:grid-cols-2">
          {event.options.map((option, index) => {
            const affordable = canAfford(option);
            const action = getActionArt(option.text);
            return (
              <button
                key={`${option.text}-${index}`}
                onClick={() => affordable && onChoose(option, index)}
                disabled={!affordable}
                className="group relative flex min-h-[92px] items-center gap-3 overflow-hidden rounded-2xl px-3.5 py-3 text-left transition-all enabled:hover:-translate-y-0.5 md:px-4 md:py-4"
                style={{
                  backgroundColor: affordable ? "#111d16" : "#0a100d",
                  border: `1px solid ${affordable ? "#2b4237" : "#17241e"}`,
                  color: affordable ? "#e1ece6" : "#486254",
                  cursor: affordable ? "pointer" : "not-allowed",
                }}
              >
                <span
                  className="grid h-11 w-11 flex-shrink-0 place-items-center overflow-hidden rounded-xl"
                  style={{ backgroundColor: `${action.accent}0e`, border: `1px solid ${action.accent}2f` }}
                >
                  <Image src={action.src} alt="" width={32} height={32} unoptimized style={{ imageRendering: "pixelated", opacity: affordable ? 1 : .35 }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-1 flex items-center gap-2">
                    <span className="font-serif text-[10px]" style={{ color: action.accent }}>{String.fromCharCode(65 + index)}</span>
                    <span className="text-[9px] tracking-[.12em]" style={{ color: `${action.accent}aa` }}>{action.label}</span>
                  </span>
                  <span className="block text-[13px] leading-6">{option.text}</span>
                  {(option.requires?.lingshi || option.requires?.itemId) && (
                    <span className="mt-1 block text-[9px]" style={{ color: affordable ? "#789486" : "#8a4d4d" }}>
                      {option.requires.lingshi ? `需要 ${option.requires.lingshi} 灵石` : "需要对应物品"}
                    </span>
                  )}
                </span>
                <span className="text-lg opacity-0 transition-opacity group-hover:opacity-100" style={{ color: action.accent }}>›</span>
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}
