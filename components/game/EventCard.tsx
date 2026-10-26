"use client";

import type { GameEvent, EventOption } from "@/types/game";
import { useGame } from "./GameProvider";

interface Props {
  event: GameEvent;
  onChoose: (option: EventOption, optionIndex: number) => void;
}

export default function EventCard({ event, onChoose }: Props) {
  const { state } = useGame();
  const { inventory, lingshi } = state;

  function canAfford(option: EventOption): boolean {
    if (!option.requires) return true;
    if (option.requires.lingshi && lingshi < option.requires.lingshi) return false;
    if (option.requires.itemId && (inventory[option.requires.itemId] ?? 0) < 1) return false;
    return true;
  }

  const isFate = event.source === "fate" || Boolean(event.story);
  const category = isFate ? "旧事回响" : event.source === "life" ? "世情" : event.category === "karma" ? "因果" : event.category === "battle" ? "争斗" : "机缘";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#111a16", border: `1px solid ${isFate ? "#d4a84344" : "#26352d"}`, boxShadow: isFate ? "0 24px 80px rgba(212,168,67,.06)" : "none" }}>
      <div className="px-5 md:px-7 pt-5 pb-4" style={{ borderBottom: "1px solid #1a2820", background: isFate ? "linear-gradient(135deg, rgba(212,168,67,.07), transparent 60%)" : "transparent" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: isFate ? "#16140a" : "#1a2820", color: isFate ? "#d4a843" : "#6a8878", border: `1px solid ${isFate ? "#d4a84333" : "#26352d"}` }}>{category}</span>
          {event.story && <span className="text-[10px] truncate" style={{ color: "#7d6b45" }}>{event.story.threadTitle}</span>}
          {event.source === "life" && <span className="text-[10px]" style={{ color: "#4a6a58" }}>有些选择，会在很多年后回响</span>}
        </div>
        <h2 className="font-serif text-xl md:text-2xl font-bold mb-3" style={{ color: "#e8f0ec" }}>{event.title}</h2>
        <p className="text-sm leading-7" style={{ color: "#a9bfb4" }}>{event.description}</p>
      </div>

      <div className="p-4 md:p-5 flex flex-col gap-2.5">
        {event.options.map((option, index) => {
          const affordable = canAfford(option);
          return (
            <button
              key={`${option.text}-${index}`}
              onClick={() => affordable && onChoose(option, index)}
              disabled={!affordable}
              className="group text-left px-4 py-3.5 rounded-xl text-sm transition-all enabled:hover:-translate-y-0.5"
              style={{
                backgroundColor: affordable ? "#0e1610" : "#0b110e",
                border: `1px solid ${affordable ? "#26352d" : "#1a2820"}`,
                color: affordable ? "#dce8e1" : "#4a6a58",
                cursor: affordable ? "pointer" : "not-allowed",
              }}
            >
              <span className="mr-2 font-serif" style={{ color: affordable ? "#d4a843" : "#4a6a58" }}>{String.fromCharCode(65 + index)}.</span>
              {option.text}
              {option.requires?.lingshi && <span className="ml-2 text-[10px]" style={{ color: "#6a8878" }}>（需要 {option.requires.lingshi} 灵石）</span>}
              {option.requires?.itemId && <span className="ml-2 text-[10px]" style={{ color: "#6a8878" }}>（需要道具）</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
