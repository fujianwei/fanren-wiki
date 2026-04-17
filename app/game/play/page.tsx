"use client";

import { useState, useEffect } from "react";
import { useGame } from "@/components/game/GameProvider";
import { GameProvider } from "@/components/game/GameProvider";
import StatusPanel from "@/components/game/StatusPanel";
import EventCard from "@/components/game/EventCard";
import MarketModal from "@/components/game/MarketModal";
import { calcLifespanCost, getRealmConfig } from "@/lib/game/engine";
import type { GameEvent, EventOption, EventEffect } from "@/types/game";
import eventsLianqi from "@/content/game/events-lianqi.json";
import { useRouter } from "next/navigation";

const ALL_EVENTS: GameEvent[] = eventsLianqi as GameEvent[];

function pickEvent(realmSlug: string, history: string[]): GameEvent | null {
  const pool = ALL_EVENTS.filter((e) => e.realmSlug === realmSlug);
  if (pool.length === 0) return null;
  const unseen = pool.filter((e) => !history.includes(e.id));
  const candidates = unseen.length > 0 ? unseen : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function GamePlay() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [showMarket, setShowMarket] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    if (state.phase === "gate") {
      router.replace("/game");
    }
  }, [state.phase, router]);

  useEffect(() => {
    if (state.phase === "ended") {
      router.push(`/game/ending?type=${state.endingType}`);
    }
  }, [state.phase, state.endingType, router]);

  function addLog(msg: string) {
    setLog((prev) => [msg, ...prev].slice(0, 5));
  }

  function handleNextEvent() {
    const event = pickEvent(state.realmSlug, state.eventHistory);
    if (!event) {
      addLog("此境界已无更多事件，请冲关或闭关。");
      return;
    }
    const cost = calcLifespanCost(state.realmSlug, "event", state.sectPath === "modao");
    dispatch({ type: "CONSUME_LIFESPAN", years: cost });
    dispatch({ type: "ADD_XP", points: 10 });
    dispatch({ type: "RECORD_EVENT", eventId: event.id });
    setCurrentEvent(event);
    addLog(`消耗 ${cost} 年寿命`);
  }

  function handleEventChoice(option: EventOption) {
    for (const effect of option.effects) {
      applyEffect(effect);
    }
    setCurrentEvent(null);
  }

  function applyEffect(effect: EventEffect) {
    if (effect.type === "lingshi") {
      dispatch({ type: "ADD_LINGSHI", amount: effect.amount });
      if (effect.amount > 0) addLog(`获得 ${effect.amount} 灵石`);
    } else if (effect.type === "item") {
      dispatch({ type: "ADD_ITEM", itemId: effect.itemId, count: effect.count });
      addLog(`获得道具`);
    } else if (effect.type === "injury") {
      dispatch({ type: "SET_INJURY", level: effect.level });
      addLog(`受伤：${effect.level}`);
    } else if (effect.type === "emotion") {
      dispatch({
        type: "ADD_EMOTION",
        positive: effect.positive ?? 0,
        negative: effect.negative ?? 0,
      });
    }
    // fate and karma effects are silent
  }

  function handleRetreat(duration: "short" | "mid" | "long") {
    const realm = getRealmConfig(state.realmSlug);
    const cost = realm.retreatCost[duration];
    const xpBase = realm.retreatXp[duration];
    dispatch({ type: "CONSUME_LIFESPAN", years: cost });
    dispatch({ type: "ADD_XP", points: xpBase });
    const label = duration === "short" ? "短期" : duration === "mid" ? "中期" : "长期";
    addLog(`闭关（${label}）：消耗 ${cost} 年`);
  }

  const NEXT_REALM_NAMES: Record<string, string> = {
    lianqi: "筑基期",
    zhuji: "结丹期",
    jiedan: "元婴期",
    yuanying: "化神期",
    huashen: "飞升",
  };

  if (state.phase === "gate" || state.phase === "ended") return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="mb-4">
        <StatusPanel />
      </div>

      {currentEvent ? (
        <div className="mb-4">
          <EventCard event={currentEvent} onChoose={(option) => handleEventChoice(option)} />
        </div>
      ) : (
        <div
          className="rounded-xl p-4 mb-4"
          style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
        >
          <p className="text-xs mb-4 text-center" style={{ color: "#6a8878" }}>
            选择下一步行动
          </p>
          <div className="flex flex-col gap-2">
            <button onClick={handleNextEvent} className="btn-primary py-2.5 rounded-lg text-sm">
              经历事件
            </button>

            <div className="flex gap-2">
              {(["short", "mid", "long"] as const).map((d) => {
                const realm = getRealmConfig(state.realmSlug);
                const cost = realm.retreatCost[d];
                const label = d === "short" ? "短期" : d === "mid" ? "中期" : "长期";
                return (
                  <button
                    key={d}
                    onClick={() => handleRetreat(d)}
                    className="flex-1 py-2 rounded-lg text-xs btn-secondary"
                  >
                    闭关{label}
                    <span className="block" style={{ color: "#4a6a58" }}>
                      {cost}年
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowMarket(true)}
              className="btn-secondary py-2.5 rounded-lg text-sm"
            >
              前往灵市
            </button>

            {state.xp >= 90 && (
              <button
                onClick={() => dispatch({ type: "ATTEMPT_BREAKTHROUGH" })}
                className="py-2.5 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: "#1a2820",
                  border: "1px solid #d4a84344",
                  color: "#d4a843",
                }}
              >
                尝试冲关 → {NEXT_REALM_NAMES[state.realmSlug]}
              </button>
            )}
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className="text-xs space-y-1" style={{ color: "#4a6a58" }}>
          {log.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}

      {showMarket && <MarketModal onClose={() => setShowMarket(false)} />}
    </div>
  );
}

export default function GamePlayPage() {
  return (
    <GameProvider>
      <GamePlay />
    </GameProvider>
  );
}
