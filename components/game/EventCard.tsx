"use client";

import type { GameEvent, EventOption } from "@/types/game";
import { useGame } from "./GameProvider";

interface Props {
  event: GameEvent;
  onChoose: (option: EventOption, optionIndex: number) => void;
}

export default function EventCard({ event, onChoose }: Props) {
  const { state } = useGame();
  const { lingshi, inventory } = state;

  function canAfford(option: EventOption): boolean {
    if (!option.requires) return true;
    if (option.requires.lingshi && lingshi < option.requires.lingshi) return false;
    if (
      option.requires.itemId &&
      (inventory[option.requires.itemId] ?? 0) < 1
    )
      return false;
    return true;
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: "#1a2820",
            color: event.type === "passive" ? "#6a8878" : "#4ade9a",
            border: `1px solid ${event.type === "passive" ? "#2a3828" : "#4ade9a44"}`,
          }}
        >
          {event.type === "passive" ? "遭遇" : "主动"}
        </span>
        <span className="text-xs" style={{ color: "#4a6a58" }}>
          {event.category === "karma"
            ? "因果"
            : event.category === "dungeon"
            ? "副本"
            : event.category === "battle"
            ? "战斗"
            : "普通"}
        </span>
      </div>

      <h3 className="font-serif font-bold mb-3" style={{ color: "#e8f0ec" }}>
        {event.title}
      </h3>

      <p className="text-sm leading-relaxed mb-5" style={{ color: "#b8ccc2" }}>
        {event.description}
      </p>

      <div className="flex flex-col gap-2">
        {event.options.map((option, idx) => {
          const affordable = canAfford(option);
          return (
            <button
              key={idx}
              onClick={() => affordable && onChoose(option, idx)}
              disabled={!affordable}
              className="text-left px-4 py-3 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: affordable ? "#1a2820" : "#0e1610",
                border: `1px solid ${affordable ? "#2a3828" : "#1a2820"}`,
                color: affordable ? "#e8f0ec" : "#4a6a58",
                cursor: affordable ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => {
                if (affordable) e.currentTarget.style.borderColor = "#4ade9a44";
              }}
              onMouseLeave={(e) => {
                if (affordable) e.currentTarget.style.borderColor = "#2a3828";
              }}
            >
              <span className="mr-2" style={{ color: "#4ade9a" }}>
                {String.fromCharCode(65 + idx)}.
              </span>
              {option.text}
              {option.requires?.lingshi && (
                <span className="ml-2 text-xs" style={{ color: "#6a8878" }}>
                  （需要 {option.requires.lingshi} 灵石）
                </span>
              )}
              {option.requires?.itemId && (
                <span className="ml-2 text-xs" style={{ color: "#6a8878" }}>
                  （需要道具）
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
