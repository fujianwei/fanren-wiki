"use client";

import { useState, useEffect } from "react";
import { useGame } from "@/components/game/GameProvider";
import StatusPanel from "@/components/game/StatusPanel";
import EventCard from "@/components/game/EventCard";
import MarketModal from "@/components/game/MarketModal";
import SectChoiceModal from "@/components/game/SectChoiceModal";
import { calcLifespanCost, getRealmConfig, calcBreakthroughRate, calcHeartDemonRate, calcFateAscendRate } from "@/lib/game/engine";
import type { GameEvent, EventOption, EventEffect, ItemId } from "@/types/game";
import eventsLianqi from "@/content/game/events-lianqi.json";
import eventsZhuji from "@/content/game/events-zhuji.json";
import eventsJiedan from "@/content/game/events-jiedan.json";
import eventsYuanying from "@/content/game/events-yuanying.json";
import eventsHuashen from "@/content/game/events-huashen.json";
import { useRouter } from "next/navigation";
import BattleModal from "@/components/game/BattleModal";
import type { RealmSlug } from "@/types/game";

const ALL_EVENTS: GameEvent[] = [
  ...(eventsLianqi as GameEvent[]),
  ...(eventsZhuji as GameEvent[]),
  ...(eventsJiedan as GameEvent[]),
  ...(eventsYuanying as GameEvent[]),
  ...(eventsHuashen as GameEvent[]),
];

function pickEvent(realmSlug: string, history: string[], sectPath: string | null): GameEvent | null {
  const pool = ALL_EVENTS.filter((e) => {
    if (e.realmSlug !== realmSlug) return false;
    // 宗门任务只有加入宗门才出现
    if ((e as any).requires_sect && !sectPath) return false;
    // 因果前置条件
    const karma = (e as any).requires_karma as string | undefined;
    if (karma && !history.includes(karma)) return false;
    return true;
  });
  if (pool.length === 0) return null;
  const unseen = pool.filter((e) => !history.includes(e.id));
  const candidates = unseen.length > 0 ? unseen : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function BreakthroughPanel() {
  const { state, dispatch } = useGame();
  const realm = getRealmConfig(state.realmSlug);

  const arrayBonus = (() => {
    let bonus = 0;
    if ((state.inventory["tiangang_zhen"] ?? 0) > 0) bonus += 0.20;
    else if ((state.inventory["huti_zhen"] ?? 0) > 0) bonus += 0.12;
    else if ((state.inventory["juling_zhen"] ?? 0) > 0) bonus += 0.08;
    return bonus;
  })();

  const pillBonus = (() => {
    const pillMap: Record<string, number> = {
      zhuji_dan: 0.15,
      jucheng_dan: 0.15,
      butian_dan: 0.15,
      jiangyun_dan: 0.15,
    };
    const realmPillMap: Record<string, string> = {
      lianqi: "zhuji_dan",
      zhuji: "jucheng_dan",
      jiedan: "butian_dan",
      yuanying: "jiangyun_dan",
    };
    const pillId = realmPillMap[state.realmSlug];
    if (pillId && (state.inventory[pillId as ItemId] ?? 0) > 0) {
      return pillMap[pillId];
    }
    return 0;
  })();

  const successRate = calcBreakthroughRate({
    realmSlug: state.realmSlug,
    xp: state.xp,
    itemBonus: arrayBonus + pillBonus,
    lingshi: state.lingshi,
    rootIntact: state.rootIntact,
    rootDamageCount: state.rootDamageCount,
    breakthroughExp: state.breakthroughExp,
  });

  const NEXT_REALM: Record<string, string> = {
    lianqi: "筑基期",
    zhuji: "结丹期",
    jiedan: "元婴期",
    yuanying: "化神期",
    huashen: "飞升",
  };

  function attempt() {
    const roll = Math.random();
    let effectiveRate = successRate;

    // 结丹→元婴：额外乘以心魔概率
    if (state.realmSlug === "jiedan") {
      const jiuquBonus = (state.inventory["jiuqu_dan"] ?? 0) > 0 ? 0.20 : 0;
      const heartDemonRate = calcHeartDemonRate(state.emotion.positive, state.emotion.negative) + jiuquBonus;
      effectiveRate = successRate * Math.min(1, heartDemonRate);
    }

    if (roll < effectiveRate) {
      dispatch({ type: "BREAKTHROUGH_SUCCESS" });
    } else {
      const failDeath = Math.random() < realm.failDeathRate;
      if (failDeath) {
        // 结丹→元婴失败90%陨落：心魔陨落
        const endingType = state.realmSlug === "jiedan" ? "death_heart" : "death_break";
        dispatch({ type: "END_GAME", endingType });
      } else {
        dispatch({ type: "BREAKTHROUGH_FAIL" });
        dispatch({ type: "ADD_EMOTION", positive: 0, negative: 8 }); // 冲关失败积累恐惧
      }
    }
  }

  return (
    <div
      className="rounded-xl p-6 text-center"
      style={{ backgroundColor: "#111a16", border: "1px solid #d4a84344" }}
    >
      <div className="font-serif font-bold mb-2" style={{ color: "#d4a843" }}>
        冲关 → {NEXT_REALM[state.realmSlug]}
      </div>
      <div className="text-sm mb-4" style={{ color: "#6a8878" }}>
        成功率：{Math.round(successRate * 100)}%
      </div>
      {state.realmSlug === "jiedan" && (
        <div className="mt-3 pt-3 text-xs" style={{ borderTop: "1px solid #1a2820" }}>
          <div className="flex justify-between mb-1">
            <span style={{ color: "#6a8878" }}>心魔关</span>
            <span style={{ color: state.emotion.positive >= state.emotion.negative ? "#4ade9a" : "#ef4444" }}>
              {Math.round((calcHeartDemonRate(state.emotion.positive, state.emotion.negative) + ((state.inventory["jiuqu_dan"] ?? 0) > 0 ? 0.20 : 0)) * 100)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#4ade9a" }}>正面情绪 {state.emotion.positive}</span>
            <span style={{ color: "#ef4444" }}>负面情绪 {state.emotion.negative}</span>
          </div>
          <div className="mt-1" style={{ color: "#6a8878" }}>
            综合成功率：{Math.round(successRate * Math.min(1, calcHeartDemonRate(state.emotion.positive, state.emotion.negative) + ((state.inventory["jiuqu_dan"] ?? 0) > 0 ? 0.20 : 0)) * 100)}%
          </div>
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={attempt}
          className="flex-1 py-3 rounded-lg font-medium text-sm"
          style={{ backgroundColor: "#d4a843", color: "#0a0e0d" }}
        >
          渡劫！
        </button>
        <button
          onClick={() => dispatch({ type: "BREAKTHROUGH_FAIL" })}
          className="flex-1 py-3 rounded-lg text-sm btn-secondary"
        >
          暂不冲关
        </button>
      </div>
    </div>
  );
}

const ITEM_META: Record<string, { name: string; category: "mechanism" | "breakthrough" | "array"; desc: string }> = {
  yangshang_dan: { name: "养伤丹", category: "mechanism", desc: "消除任意受伤" },
  huixue_dan:    { name: "回血丹", category: "mechanism", desc: "消除受伤状态" },
  juqi_dan:      { name: "聚气丹", category: "mechanism", desc: "修为+10（受灵根倍率）" },
  yanshou_dan:   { name: "延寿丹", category: "mechanism", desc: "寿命+50年" },
  dixin_dan:     { name: "涤心丹", category: "mechanism", desc: "清除负面情绪" },
  xuming_dan:    { name: "续命丹", category: "mechanism", desc: "濒死自动保命" },
  zhuji_dan:     { name: "筑基丹", category: "breakthrough", desc: "炼气→筑基 +25%" },
  jucheng_dan:   { name: "降尘丹", category: "breakthrough", desc: "筑基→结丹 +25%" },
  butian_dan:    { name: "补天丹", category: "breakthrough", desc: "结丹→元婴 +25%" },
  jiuqu_dan:     { name: "九曲灵参丸", category: "breakthrough", desc: "心魔概率 +20%" },
  jiangyun_dan:  { name: "绛云丹", category: "breakthrough", desc: "元婴→化神 +25%" },
  juling_zhen:   { name: "聚灵阵", category: "array", desc: "冲关+8%，闭关+10%" },
  huti_zhen:     { name: "护体阵", category: "array", desc: "冲关+12%，副本护盾" },
  tiangang_zhen: { name: "天罡阵", category: "array", desc: "冲关+20%，闭关+25%" },
};

const CATEGORY_LABELS = {
  mechanism: "机制类丹药",
  breakthrough: "突破类丹药",
  array: "阵法",
};

function InventoryModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useGame();
  const { inventory, lingshi } = state;
  const [openCat, setOpenCat] = useState<Record<string, boolean>>({
    mechanism: true,
    breakthrough: true,
    array: true,
  });

  const byCategory = (cat: "mechanism" | "breakthrough" | "array") =>
    Object.entries(ITEM_META)
      .filter(([, m]) => m.category === cat)
      .map(([id, m]) => ({ id, ...m, count: inventory[id as keyof typeof inventory] ?? 0 }));

  const totalCount = Object.values(ITEM_META).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820", maxHeight: "75vh", overflowY: "auto" }}
      >
        {/* 标题 */}
        <div className="flex items-center justify-between px-4 py-3 sticky top-0" style={{ backgroundColor: "#111a16", borderBottom: "1px solid #1a2820" }}>
          <span className="font-serif font-bold text-sm" style={{ color: "#e8f0ec" }}>储物袋</span>
          <button onClick={onClose} className="text-xs" style={{ color: "#6a8878" }}>关闭</button>
        </div>

        {(["mechanism", "breakthrough", "array"] as const).map((cat) => {
          const items = byCategory(cat);
          const isOpen = openCat[cat];
          return (
            <div key={cat}>
              <button
                onClick={() => setOpenCat((prev) => ({ ...prev, [cat]: !prev[cat] }))}
                className="w-full flex items-center justify-between px-4 py-2 text-xs"
                style={{ color: "#6a8878", borderTop: "1px solid #1a2820" }}
              >
                <span>{CATEGORY_LABELS[cat]}</span>
                <span style={{ color: "#4a6a58" }}>{isOpen ? "▲" : "▼"} {items.length}种</span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3 flex flex-col gap-1.5">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ backgroundColor: "#0e1610" }}
                    >
                      <div>
                        <span className="text-sm" style={{ color: item.count > 0 ? "#e8f0ec" : "#4a6a58" }}>{item.name}</span>
                        <span
                          className="text-xs ml-2 px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: "#1a2820", color: item.count > 0 ? "#4ade9a" : "#2a3828" }}
                        >
                          ×{item.count}
                        </span>
                        <div className="text-xs mt-0.5" style={{ color: "#4a6a58" }}>{item.desc}</div>
                      </div>
                      {item.category === "mechanism" && item.id !== "xuming_dan" && item.count > 0 && (
                        <button
                          onClick={() => dispatch({ type: "USE_ITEM", itemId: item.id as any })}
                          className="text-xs px-2 py-1 rounded ml-3 whitespace-nowrap"
                          style={{ backgroundColor: "#1a2820", color: "#4ade9a", border: "1px solid #4ade9a33" }}
                        >
                          使用
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GamePlay() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [showMarket, setShowMarket] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showBattle, setShowBattle] = useState(false);
  const [battleEnemy, setBattleEnemy] = useState<{ name: string; realm: RealmSlug; desc: string } | null>(null);
  const [showSectChoice, setShowSectChoice] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    if (state.phase === "gate") {
      router.replace("/game");
    }
  }, [state.phase, router]);

  useEffect(() => {
    if (state.phase === "ended") {
      const fateParam = (state.endingType === "ascend" || state.endingType === "ascend_fail")
        ? `&fate=${state.fate}`
        : "";
      router.push(`/game/ending?type=${state.endingType}${fateParam}`);
    }
  }, [state.phase, state.endingType, state.fate, router]);

  function addLog(msg: string) {
    setLog((prev) => [msg, ...prev].slice(0, 5));
  }

  function handleNextEvent() {
    const event = pickEvent(state.realmSlug, state.eventHistory, state.sectPath);
    if (!event) {
      addLog("此境界已无更多事件，请冲关或闭关。");
      return;
    }
    const cost = calcLifespanCost(state.realmSlug, "event", state.sectPath === "modao");
    dispatch({ type: "CONSUME_LIFESPAN", years: cost });
    const injuryXpMult = { none: 1.0, light: 0.8, heavy: 0.5, dying: 0.2 }[state.injury] ?? 1.0;
    dispatch({ type: "ADD_XP", points: Math.round(10 * injuryXpMult) });
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
      // 叠加规则：已有轻伤再受伤→重伤，已有重伤再受伤→濒死
      const currentInjury = state.injury;
      let newLevel = effect.level;
      if (currentInjury === "light" && effect.level === "light") newLevel = "heavy";
      else if (currentInjury === "heavy" && (effect.level === "light" || effect.level === "heavy")) newLevel = "dying";
      else if (currentInjury === "dying") newLevel = "dying";
      dispatch({ type: "SET_INJURY", level: newLevel });
      addLog(`受伤：${newLevel === "light" ? "轻伤" : newLevel === "heavy" ? "重伤" : "濒死"}`);
    } else if (effect.type === "emotion") {
      dispatch({
        type: "ADD_EMOTION",
        positive: effect.positive ?? 0,
        negative: effect.negative ?? 0,
      });
    } else if (effect.type === "trigger_karma") {
      dispatch({ type: "RECORD_EVENT", eventId: effect.karmaId });
    }
    // fate effects are silent
  }

  function handleRetreat(duration: "short" | "mid" | "long") {
    // 濒死无法主动行动
    if (state.injury === "dying") {
      addLog("濒死状态下无法闭关，请先治疗。");
      return;
    }
    const realm = getRealmConfig(state.realmSlug);
    const cost = realm.retreatCost[duration];
    const xpBase = realm.retreatXp[duration];
    const injuryMult = state.injury === "heavy" ? 0.5 : state.injury === "light" ? 0.8 : 1.0;
    dispatch({ type: "CONSUME_LIFESPAN", years: cost });
    dispatch({ type: "ADD_XP", points: Math.round(xpBase * injuryMult) });
    const label = duration === "short" ? "短期" : duration === "mid" ? "中期" : "长期";
    addLog(`闭关（${label}）：消耗 ${cost} 年${state.injury !== "none" ? `，受伤减益×${injuryMult}` : ""}`);
  }

  function handleAscend() {
    const roll = Math.random();
    const ascendRate = calcFateAscendRate(state.fate);
    const endingType = roll < ascendRate ? "ascend" : "ascend_fail";
    dispatch({ type: "END_GAME", endingType });
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
      {/* 顶部：状态面板 + 储物袋按钮 */}
      <div className="mb-4 flex items-start gap-2">
        <div className="flex-1">
          <StatusPanel />
        </div>
        <button
          onClick={() => setShowInventory(true)}
          className="mt-0 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap"
          style={{ backgroundColor: "#111a16", border: "1px solid #1a2820", color: "#6a8878" }}
        >
          储物袋
          {Object.values(state.inventory).reduce((s, v) => s + (v ?? 0), 0) > 0 && (
            <span
              className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
              style={{ backgroundColor: "#1a2820", color: "#4ade9a" }}
            >
              {Object.values(state.inventory).reduce((s, v) => s + (v ?? 0), 0)}
            </span>
          )}
        </button>
      </div>

      {state.phase === "breakthrough" ? (
        <div className="mb-4">
          <BreakthroughPanel />
        </div>
      ) : currentEvent ? (
        <div className="mb-4">
          <EventCard event={currentEvent} onChoose={(option) => handleEventChoice(option)} />
        </div>
      ) : state.injury === "dying" ? (
        <div
          className="rounded-xl p-6 text-center mb-4"
          style={{ backgroundColor: "#111a16", border: "1px solid #7f1d1d" }}
        >
          <div className="text-sm font-bold mb-2" style={{ color: "#ef4444" }}>濒死状态</div>
          <p className="text-xs" style={{ color: "#6a8878" }}>
            你已濒临陨落，无法进行任何主动行动。<br />请使用养伤丹或续命丹治疗。
          </p>
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

            <button
              onClick={() => {
                setBattleEnemy({ name: "野外散修", realm: state.realmSlug, desc: "一名与你同境界的散修，眼神凶狠。" });
                setShowBattle(true);
              }}
              className="btn-secondary py-2.5 rounded-lg text-sm"
            >
              外出历练
            </button>

            {state.sectPath === null && (
              <button
                onClick={() => setShowSectChoice(true)}
                className="py-2.5 rounded-lg text-sm"
                style={{
                  backgroundColor: "#1a2820",
                  border: "1px solid #4ade9a33",
                  color: "#4ade9a",
                }}
              >
                选择修仙道路
              </button>
            )}

            {state.xp >= 90 && (
              state.realmSlug === "huashen" ? (
                <button
                  onClick={handleAscend}
                  className="py-2.5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#d4a843", color: "#0a0e0d" }}
                >
                  ✦ 飞升灵界
                </button>
              ) : (
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
              )
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
      {showInventory && <InventoryModal onClose={() => setShowInventory(false)} />}
      {showSectChoice && <SectChoiceModal onClose={() => setShowSectChoice(false)} />}
      {showBattle && battleEnemy && (
        <BattleModal
          enemyName={battleEnemy.name}
          enemyRealm={battleEnemy.realm}
          enemyDesc={battleEnemy.desc}
          onWin={() => {}}
          onLose={() => {}}
          onClose={() => { setShowBattle(false); setBattleEnemy(null); }}
        />
      )}
    </div>
  );
}

export default function GamePlayPage() {
  return <GamePlay />;
}
