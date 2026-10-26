"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/components/game/GameProvider";
import EventCard from "@/components/game/EventCard";
import MarketModal from "@/components/game/MarketModal";
import BattleModal from "@/components/game/BattleModal";
import SectChoiceModal from "@/components/game/SectChoiceModal";
import SceneBackground from "@/components/game/SceneBackground";
import FateOpening from "@/components/game/FateOpening";
import StageFocusPanel from "@/components/game/StageFocusPanel";
import GameHud from "@/components/game/GameHud";
import LifeDrawer from "@/components/game/LifeDrawer";
import PixelScene from "@/components/game/PixelScene";
import { AXIS_LABELS, getDominantAxes, getThreadTitle } from "@/lib/game/narrative";
import { getActionArt, getSceneById, getSceneForEvent } from "@/lib/game/scene-art";
import itemsData from "@/content/game/items.json";
import { calcBreakthroughRate, calcFateAscendRate, calcHeartDemonRate, getRealmConfig } from "@/lib/game/engine";
import { pickStageEvent } from "@/lib/game/event-pool";
import type {
  ChoiceMemory,
  EventEffect,
  EventOption,
  GameEvent,
  GameState,
  ItemConfig,
  ItemId,
  RealmSlug,
} from "@/types/game";

const ITEMS = itemsData as ItemConfig[];
const ITEM_MAP = Object.fromEntries(ITEMS.map((item) => [item.id, item])) as Record<string, ItemConfig>;

const BATTLE_POOL: Record<RealmSlug, Array<{ name: string; desc: string }>> = {
  lianqi: [
    { name: "负伤散修", desc: "他在山道尽头拦住你，眼里没有退路。" },
    { name: "黑鳞妖蛇", desc: "妖气裹着湿冷的腥味，从石缝里游出来。" },
  ],
  zhuji: [
    { name: "敌对宗门弟子", desc: "他认出你腰间的令牌，手已经按在剑上。" },
    { name: "古墓守灵兽", desc: "守灵兽从阴影里站起，双眼像两点冷火。" },
  ],
  jiedan: [
    { name: "走私海船的修士", desc: "对方不问你姓名，只问你身上带了多少灵石。" },
    { name: "失控的丹傀", desc: "丹傀胸口裂开，炉火从裂缝里喷出来。" },
  ],
  yuanying: [
    { name: "海外岛主", desc: "他站在潮头，身后整片海都像他的法域。" },
    { name: "堕魔旧修", desc: "那名旧修已经认不出你，只认得杀意。" },
  ],
  huashen: [
    { name: "天门守关者", desc: "守关者抬起眼，问你是否还知道自己为何而来。" },
    { name: "域外魔影", desc: "魔影没有人形，却在模仿你说话。" },
  ],
};

function pickBattleEnemy(realmSlug: RealmSlug) {
  const pool = BATTLE_POOL[realmSlug] ?? BATTLE_POOL.lianqi;
  const enemy = pool[Math.floor(Math.random() * pool.length)];
  return { ...enemy, realm: realmSlug };
}

function calcBreakthroughDetails(state: GameState) {
  const realm = getRealmConfig(state.realmSlug);
  const arrayBonus = (state.inventory.tiangang_zhen ?? 0) > 0 ? 0.2 : (state.inventory.huti_zhen ?? 0) > 0 ? 0.12 : (state.inventory.juling_zhen ?? 0) > 0 ? 0.08 : 0;
  const pillMap: Record<string, ItemId> = { lianqi: "zhuji_dan", zhuji: "jucheng_dan", jiedan: "butian_dan", yuanying: "jiangyun_dan" };
  const pillId = pillMap[state.realmSlug];
  const pillBonus = pillId && (state.inventory[pillId] ?? 0) > 0 ? 0.25 : 0;
  const total = calcBreakthroughRate({
    realmSlug: state.realmSlug,
    xp: state.xp,
    itemBonus: arrayBonus + pillBonus,
    lingshi: state.lingshi,
    rootIntact: state.rootIntact,
    rootDamageCount: state.rootDamageCount,
    breakthroughExp: state.breakthroughExp,
  });
  return { baseRate: realm.breakthroughRate, arrayBonus, pillBonus, total };
}

const REALM_NEXT: Record<string, string> = {
  lianqi: "筑基期",
  zhuji: "结丹期",
  jiedan: "元婴期",
  yuanying: "化神期",
  huashen: "飞升",
};

function BreakthroughPanel() {
  const { state, dispatch } = useGame();
  const realm = getRealmConfig(state.realmSlug);
  const details = calcBreakthroughDetails(state);
  const [result, setResult] = useState<"success" | "fail" | null>(null);
  const lifespanCost = Math.max(1, Math.round((state.lifespanMax - state.age) * 0.02));
  const heartRate = state.realmSlug === "jiedan"
    ? Math.min(1, calcHeartDemonRate(state.emotion.positive, state.emotion.negative) + ((state.inventory.jiuqu_dan ?? 0) > 0 ? 0.2 : 0))
    : 1;
  const finalRate = details.total * heartRate;
  const scene = getSceneById(state.realmSlug === "huashen" ? "ascension_choice" : "tribulation");

  function attempt() {
    dispatch({ type: "CONSUME_LIFESPAN", years: lifespanCost });
    const pillMap: Record<string, ItemId> = { lianqi: "zhuji_dan", zhuji: "jucheng_dan", jiedan: "butian_dan", yuanying: "jiangyun_dan" };
    const pill = pillMap[state.realmSlug];
    if (pill && (state.inventory[pill] ?? 0) > 0) dispatch({ type: "REMOVE_ITEM", itemId: pill });
    if ((state.inventory.tiangang_zhen ?? 0) > 0) dispatch({ type: "REMOVE_ITEM", itemId: "tiangang_zhen" });
    else if ((state.inventory.huti_zhen ?? 0) > 0) dispatch({ type: "REMOVE_ITEM", itemId: "huti_zhen" });
    if (Math.random() < finalRate) {
      setResult("success");
      return;
    }
    if (Math.random() < realm.failDeathRate) {
      dispatch({ type: "END_GAME", endingType: state.realmSlug === "jiedan" ? "death_heart" : "death_break" });
    } else {
      setResult("fail");
    }
  }

  return (
    <section className="overflow-hidden rounded-[26px]" style={{ backgroundColor: "#0d1712", border: `1px solid ${result === "fail" ? "#ef6b6255" : "#d4a84355"}`, boxShadow: "0 28px 100px rgba(0,0,0,.34)" }}>
      <PixelScene scene={scene} priority compact>
        <div className="absolute inset-x-0 bottom-0 px-5 pb-4 md:px-6 md:pb-5">
          <div className="mb-1 text-[8px] tracking-[.28em]" style={{ color: "rgba(221,231,225,.55)" }}>{state.realmSlug === "huashen" ? "THE FINAL GATE" : "TRIBULATION"}</div>
          <h2 className="font-serif text-2xl font-bold" style={{ color: result === "fail" ? "#ff9d95" : "#f1f7f4", textShadow: "0 2px 20px rgba(0,0,0,.9)" }}>
            {result === "success" ? "冲关成功" : result === "fail" ? "冲关失败" : `冲关 · ${REALM_NEXT[state.realmSlug]}`}
          </h2>
          <p className="mt-1 max-w-2xl text-[10px] leading-5 md:text-xs" style={{ color: "rgba(225,235,229,.72)" }}>
            {result === "success" ? "你从这一关活了下来。过去那些年里做错和做对的事，都成了此刻的一部分。" : result === "fail" ? "你退回了原来的境界。失败不会抹掉这一生，但会改变下一次面对天劫时的姿态。" : "失败不一定死亡。冲关不是唯一的路，换一条路继续走，也许更接近你真正想要的东西。"}
          </p>
        </div>
      </PixelScene>

      <div className="p-4 md:p-5">
        {result === "success" ? (
          <button onClick={() => dispatch({ type: "BREAKTHROUGH_SUCCESS" })} className="w-full rounded-xl py-3.5 font-serif text-sm font-bold" style={{ color: "#09110d", backgroundColor: "#d4a843", boxShadow: "0 10px 32px rgba(212,168,67,.18)" }}>踏入{REALM_NEXT[state.realmSlug]}</button>
        ) : result === "fail" ? (
          <button onClick={() => { dispatch({ type: "BREAKTHROUGH_FAIL" }); dispatch({ type: "ADD_EMOTION", positive: 0, negative: 6 }); setResult(null); }} className="w-full rounded-xl py-3.5 font-serif text-sm font-bold" style={{ color: "#ffaaa3", border: "1px solid #ef6b6266", backgroundColor: "#1b1010" }}>继续活下去</button>
        ) : (
          <>
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[9px] tracking-[.2em]" style={{ color: "#617f70" }}>成功概率</div>
                <div className="mt-1 font-serif text-3xl font-bold" style={{ color: "#f0c96b" }}>{Math.round(finalRate * 100)}%</div>
              </div>
              <div className="text-right text-[9px] leading-5" style={{ color: "#668375" }}>
                <div>寿元消耗 {lifespanCost} 年</div>
                <div>{state.realmSlug === "jiedan" ? "心魔会直接干扰此关" : "失败未必陨落"}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex justify-between rounded-xl px-3 py-2" style={{ color: "#789385", backgroundColor: "#0a120e" }}><span>基础</span><span>{Math.round(details.baseRate * 100)}%</span></div>
              <div className="flex justify-between rounded-xl px-3 py-2" style={{ color: "#789385", backgroundColor: "#0a120e" }}><span>外物</span><span>+{Math.round((details.arrayBonus + details.pillBonus) * 100)}%</span></div>
              <div className="flex justify-between rounded-xl px-3 py-2" style={{ color: "#789385", backgroundColor: "#0a120e" }}><span>根基</span><span>{state.rootIntact ? "+15%" : `-${state.rootDamageCount * 5}%`}</span></div>
              <div className="flex justify-between rounded-xl px-3 py-2" style={{ color: "#789385", backgroundColor: "#0a120e" }}><span>心魔</span><span>×{Math.round(heartRate * 100)}%</span></div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={attempt} className="flex-1 rounded-xl py-3 font-serif text-sm font-bold" style={{ color: "#0b110d", backgroundColor: "#d4a843" }}>渡劫</button>
              <button onClick={() => dispatch({ type: "CANCEL_BREAKTHROUGH" })} className="flex-1 rounded-xl py-3 font-serif text-sm" style={{ color: "#91aa9d", border: "1px solid #30453a" }}>再等等</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function InventoryModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useGame();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,.7)" }} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ backgroundColor: "#111a16", border: "1px solid #26352d" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #1a2820" }}>
          <span className="font-serif font-bold" style={{ color: "#e8f0ec" }}>储物袋 · {state.lingshi} 灵石</span>
          <button onClick={onClose} className="text-xs" style={{ color: "#6a8878" }}>关闭</button>
        </div>
        <div className="p-4 grid sm:grid-cols-2 gap-2 max-h-[65vh] overflow-y-auto">
          {ITEMS.map((item) => {
            const count = state.inventory[item.id] ?? 0;
            return (
              <div key={item.id} className="rounded-xl px-3 py-3" style={{ backgroundColor: count ? "#0e1610" : "#0b110e", opacity: count ? 1 : .42 }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium" style={{ color: "#dce8e1" }}>{item.name}</span>
                  <span className="text-xs" style={{ color: "#4ade9a" }}>×{count}</span>
                </div>
                <div className="text-[10px] leading-relaxed mt-1" style={{ color: "#4a6a58" }}>{item.description}</div>
                {count > 0 && item.category !== "breakthrough" && <button onClick={() => dispatch({ type: "USE_ITEM", itemId: item.id })} className="text-[10px] mt-2 px-2 py-1 rounded-full" style={{ color: "#4ade9a", border: "1px solid #4ade9a33" }}>使用</button>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function JourneyCompanion({ state, onOpenLife }: { state: GameState; onOpenLife: () => void }) {
  const axes = getDominantAxes(state.narrative, 3);
  const relation = Object.values(state.relations)
    .filter((item) => item.status === "active" || item.status === "estranged")
    .sort((a, b) => (b.affinity + b.trust) - (a.affinity + a.trust))[0];
  const threads = Object.values(state.narrative.threads)
    .filter((thread) => thread.status === "open")
    .slice(0, 3);
  const lastLife = state.meta.lives.at(-1);
  const maxAxis = Math.max(1, ...axes.map((axis) => state.narrative.axes[axis]));

  return (
    <aside className="relative z-10 hidden w-[272px] flex-shrink-0 flex-col gap-3 xl:flex">
      <section className="overflow-hidden rounded-2xl" style={{ backgroundColor: "rgba(12,21,16,.86)", border: "1px solid #273c31", backdropFilter: "blur(14px)" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #1d2e26" }}>
          <span className="font-serif text-sm font-bold" style={{ color: "#e8f0ec" }}>此生正在成为</span>
          <span className="text-[8px] tracking-[.18em]" style={{ color: "#587466" }}>INNER COMPASS</span>
        </div>
        <div className="space-y-3 px-4 py-4">
          {axes.map((axis, index) => (
            <div key={axis}>
              <div className="mb-1 flex items-center justify-between text-[10px]">
                <span style={{ color: index === 0 ? "#d4a843" : "#9cb1a5" }}>{AXIS_LABELS[axis]}</span>
                <span style={{ color: "#526e60" }}>{state.narrative.axes[axis] > 0 ? "+" : ""}{state.narrative.axes[axis]}</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full" style={{ backgroundColor: "#1a2922" }}>
                <div className="h-full rounded-full" style={{ width: `${Math.max(4, Math.abs(state.narrative.axes[axis]) / maxAxis * 100)}%`, backgroundColor: index === 0 ? "#d4a843" : "#4f8b70" }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl px-4 py-4" style={{ backgroundColor: "rgba(12,21,16,.86)", border: "1px solid #273c31", backdropFilter: "blur(14px)" }}>
        <div className="mb-2 text-[8px] tracking-[.2em]" style={{ color: "#587466" }}>NEAREST BOND</div>
        {relation ? (
          <>
            <div className="font-serif text-sm font-bold" style={{ color: "#dfece5" }}>{relation.name}</div>
            <div className="mt-1 text-[10px]" style={{ color: relation.affinity < 0 ? "#ef8d8d" : "#7fa08e" }}>{relation.title} · {relation.affinity >= 0 ? "亲近" : "疏离"}</div>
          </>
        ) : <div className="text-xs" style={{ color: "#5d786a" }}>此世尚无牵挂之人</div>}
      </section>

      <section className="rounded-2xl px-4 py-4" style={{ backgroundColor: "rgba(12,21,16,.86)", border: "1px solid #273c31", backdropFilter: "blur(14px)" }}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[8px] tracking-[.2em]" style={{ color: "#587466" }}>OPEN THREADS</span>
          <span className="text-[9px]" style={{ color: "#8a7442" }}>{threads.length} 条</span>
        </div>
        {threads.length ? threads.map((thread) => (
          <div key={thread.threadId} className="mb-1.5 flex items-center gap-2 text-[10px]" style={{ color: "#9fb4a8" }}>
            <span className="h-1 w-1 rounded-full" style={{ backgroundColor: "#d4a843" }} />
            {getThreadTitle(thread.threadId)}
          </div>
        )) : <div className="text-[10px] leading-5" style={{ color: "#587466" }}>尚无旧事悬在身后。</div>}
      </section>

      {lastLife && (
        <section className="rounded-2xl px-4 py-4" style={{ backgroundColor: "rgba(16,14,8,.8)", border: "1px solid #493a1f" }}>
          <div className="mb-1 text-[8px] tracking-[.2em]" style={{ color: "#786334" }}>THREE-LIFE MIRROR</div>
          <div className="text-[11px] leading-5" style={{ color: "#b9aa7a" }}>前世：{lastLife.endingTitle} · {lastLife.finalAge}岁</div>
        </section>
      )}

      <button onClick={onOpenLife} className="mt-auto w-full rounded-2xl px-4 py-3 text-center font-serif text-xs" style={{ color: "#a3b8ab", backgroundColor: "rgba(12,21,16,.86)", border: "1px solid #2b4136" }}>
        查看完整人生档案
      </button>
    </aside>
  );
}

export default function GamePlayPage() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [eventResult, setEventResult] = useState<{
    title: string;
    choice: string;
    outcome: string;
    lines: string[];
    story?: string;
    sceneId: string;
    action: ReturnType<typeof getActionArt>;
  } | null>(null);
  const [showLife, setShowLife] = useState(false);
  const [showMarket, setShowMarket] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showBattle, setShowBattle] = useState(false);
  const [battleEnemy, setBattleEnemy] = useState<{ name: string; realm: RealmSlug; desc: string } | null>(null);
  const [showSectChoice, setShowSectChoice] = useState(false);
  const processedStage = useRef(-1);

  useEffect(() => {
    if (state.phase === "gate") router.replace("/game");
    if (state.phase === "ended") router.push(`/game/ending?type=${state.endingType ?? "natural"}`);
  }, [state.phase, state.endingType, router]);

  useEffect(() => {
    if (state.phase !== "playing" || !state.lastSettlement || currentEvent || eventResult || state.injury === "dying") return;
    if (processedStage.current === state.lastSettlement.stage || state.resolvedEventStage === state.lastSettlement.stage) return;
    processedStage.current = state.lastSettlement.stage;
    const event = pickStageEvent(state);
    if (!event) return;
    dispatch({ type: "RECORD_EVENT", eventId: event.id, threadId: event.story?.threadId });
    dispatch({
      type: "ADD_TIMELINE",
      entry: {
        kind: event.story ? "thread" : "life",
        title: event.story ? "旧事重提" : event.title,
        text: event.description,
        accent: event.story ? "gold" : "mist",
        eventId: event.id,
        threadId: event.story?.threadId,
      },
    });
    setTimeout(() => setCurrentEvent(event), 0);
  }, [state, currentEvent, eventResult, dispatch]);

  function applyEffect(effect: EventEffect, activeEvent: GameEvent): string | null {
    if (effect.type === "xp") {
      dispatch({ type: "ADD_XP", points: effect.amount });
      return `修为有所增进 +${effect.amount}%（受灵根倍率）`;
    }
    if (effect.type === "lingshi") {
      dispatch({ type: "ADD_LINGSHI", amount: effect.amount });
      return effect.amount >= 0 ? `灵石 +${effect.amount}` : `灵石 ${effect.amount}`;
    }
    if (effect.type === "item") {
      dispatch({ type: "ADD_ITEM", itemId: effect.itemId, count: effect.count });
      return `获得 ${ITEM_MAP[effect.itemId]?.name ?? effect.itemId} ×${effect.count}`;
    }
    if (effect.type === "injury") {
      const next = state.injury === "light" && effect.level === "light" ? "heavy" : state.injury === "heavy" && effect.level === "light" ? "dying" : effect.level;
      dispatch({ type: "SET_INJURY", level: next });
      return `受伤：${next === "light" ? "轻伤" : next === "heavy" ? "重伤" : "濒死"}`;
    }
    if (effect.type === "emotion") {
      dispatch({ type: "ADD_EMOTION", positive: effect.positive ?? 0, negative: effect.negative ?? 0 });
      return effect.positive ? `心境 +${effect.positive}` : effect.negative ? `心绪不宁 +${effect.negative}` : null;
    }
    if (effect.type === "fate") {
      dispatch({ type: "ADD_FATE", amount: effect.amount });
      return effect.amount >= 0 ? `天命 +${effect.amount}` : `天命 ${effect.amount}`;
    }
    if (effect.type === "add_enemy") {
      dispatch({ type: "ADD_ENEMY", enemy: { id: effect.enemyId, name: effect.name ?? "未名仇家", realmSlug: state.realmSlug, sourceEventId: activeEvent.id } });
      return "从此多了一个记得你的人";
    }
    if (effect.type === "trigger_karma") {
      dispatch({ type: "RECORD_EVENT", eventId: effect.karmaId });
      return "种下一段因果";
    }
    if (effect.type === "relation") {
      dispatch({ type: "UPDATE_RELATION", kind: effect.kind, affinity: effect.affinity, trust: effect.trust, status: effect.status, memory: effect.memory, tag: effect.tag });
      return `${effect.kind === "rival" ? "仇怨" : "关系"}发生变化`;
    }
    if (effect.type === "set_flag") {
      dispatch({ type: "SET_FLAG", key: effect.key, value: effect.value });
      return "有些事被记了下来";
    }
    if (effect.type === "age") {
      dispatch({ type: "CONSUME_LIFESPAN", years: effect.years });
      return `时间又过去 ${effect.years} 年`;
    }
    return null;
  }

  function chooseOption(option: EventOption, optionIndex: number) {
    if (!currentEvent) return;
    const activeEvent = currentEvent;
    const lines: string[] = [];
    for (const effect of option.effects) {
      const line = applyEffect(effect, activeEvent);
      if (line) lines.push(line);
    }

    const isRefuse = option.effects.length === 0;
    const toneText = isRefuse
      ? "你没有插手。很多年后，你已经想不起当时为什么没有回头。"
      : option.outcomeText ?? "这一选择落在了你的命里，暂时还看不出它会把你带向哪里。";

    let threadUpdate: { threadId: string; action: "advance" | "resolve" | "break"; resolution?: string } | undefined;
    let storyLabel: string | undefined;
    if (activeEvent.story) {
      const finalStage = activeEvent.story.stage >= activeEvent.story.stageCount;
      const scarred = option.narrative?.tags?.some((tag) => tag.id.startsWith("scar.")) ?? false;
      const action = option.narrative?.threadAction ?? (finalStage ? (scarred ? "break" : "resolve") : "advance");
      threadUpdate = { threadId: activeEvent.story.threadId, action, resolution: option.narrative?.threadResult ?? option.outcomeText };
      storyLabel = action === "advance" ? "旧事又向前走了一步" : action === "resolve" ? "这段旧事终于有了结果" : "这段旧事断了";
    }

    const record: ChoiceMemory = {
      turn: state.turn,
      eventId: activeEvent.id,
      optionIndex,
      eventTitle: activeEvent.title,
      optionText: option.text,
      outcomeText: toneText,
      realmSlug: state.realmSlug,
    };
    dispatch({ type: "APPLY_NARRATIVE", record, axes: option.narrative?.axes, tags: option.narrative?.tags, threadUpdate });
    dispatch({
      type: "ADD_TIMELINE",
      entry: {
        kind: activeEvent.story ? "thread" : "choice",
        title: option.text,
        text: toneText,
        accent: threadUpdate?.action === "break" ? "red" : threadUpdate?.action === "resolve" ? "gold" : "mist",
        eventId: activeEvent.id,
        threadId: activeEvent.story?.threadId,
      },
    });

    setEventResult({
      title: activeEvent.title,
      choice: option.text,
      outcome: toneText,
      lines,
      story: storyLabel,
      sceneId: getSceneForEvent(activeEvent, state.realmSlug).id,
      action: getActionArt(option.text),
    });
    setCurrentEvent(null);
  }

  function closeResult() {
    setEventResult(null);
  }

  function handleAscend() {
    const random = (Math.sin(state.runSeed + state.stage) + 1) / 2;
    dispatch({ type: "END_GAME", endingType: random < calcFateAscendRate(state.fate) ? "ascend" : "ascend_fail" });
  }

  if (state.phase === "gate" || state.phase === "ended") return null;

  const isDying = state.injury === "dying";
  const focusSceneMap: Record<string, string> = {
    cultivate: "cave",
    roam: "wilderness",
    craft: "medicine",
    sect: "sect",
    bond: "bonds",
    heal: "sea",
  };
  const latestFocus = state.stageFocus ?? state.focusHistory.at(-1)?.focusId;
  const currentScene = currentEvent
    ? getSceneForEvent(currentEvent, state.realmSlug)
    : state.phase === "breakthrough"
      ? getSceneById(state.realmSlug === "huashen" ? "ascension_choice" : "tribulation")
      : isDying
        ? getSceneById("battle")
        : getSceneById(latestFocus ? focusSceneMap[latestFocus] ?? "cave" : "cave");

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden px-2.5 pb-10 pt-2.5 md:px-4 md:pt-4">
      <SceneBackground scene={currentScene} />

      <div className="relative z-10 mx-auto w-full max-w-[1440px]">
        <GameHud
          onOpenLife={() => setShowLife(true)}
          onOpenInventory={() => setShowInventory(true)}
          onOpenMarket={() => setShowMarket(true)}
          onBattle={() => { setBattleEnemy(pickBattleEnemy(state.realmSlug)); setShowBattle(true); }}
        />

        <div className="flex items-start gap-4">
          <main className="min-w-0 flex-1">
            {!state.heartIntent ? (
              <FateOpening state={state} onChoose={(intent) => dispatch({ type: "SET_HEART_INTENT", intent })} />
            ) : currentEvent ? (
              <EventCard event={currentEvent} onChoose={chooseOption} />
            ) : state.phase === "breakthrough" ? (
              <BreakthroughPanel />
            ) : isDying ? (
              <section className="overflow-hidden rounded-[26px]" style={{ backgroundColor: "#0d1712", border: "1px solid #ef6b6266", boxShadow: "0 28px 100px rgba(0,0,0,.38)" }}>
                <PixelScene scene={getSceneById("battle")} priority compact>
                  <div className="absolute inset-x-0 bottom-0 px-5 pb-5 md:px-6">
                    <div className="mb-1 text-[8px] tracking-[.3em]" style={{ color: "rgba(255,190,184,.6)" }}>BETWEEN LIFE AND DEATH</div>
                    <h1 className="font-serif text-2xl font-bold" style={{ color: "#ff9f96", textShadow: "0 2px 20px rgba(0,0,0,.9)" }}>你已濒临陨落</h1>
                    <p className="mt-1 text-[10px] leading-5 md:text-xs" style={{ color: "rgba(239,205,200,.72)" }}>这一次，先活下来。你可以散财求医，也可以拿寿元换一条命。</p>
                  </div>
                </PixelScene>
                <div className="flex flex-col gap-2 p-4 sm:flex-row md:p-5">
                  <button
                    onClick={() => {
                      if (state.lingshi < 120) return;
                      dispatch({ type: "ADD_LINGSHI", amount: -120 });
                      dispatch({ type: "SET_INJURY", level: "heavy" });
                    }}
                    disabled={state.lingshi < 120}
                    className="flex-1 rounded-xl px-4 py-3 font-serif text-xs"
                    style={{ opacity: state.lingshi < 120 ? .35 : 1, color: "#f0c96b", border: "1px solid #d4a84355", backgroundColor: "#191409" }}
                  >
                    散尽 120 灵石求医
                  </button>
                  <button
                    onClick={() => {
                      dispatch({ type: "CONSUME_LIFESPAN", years: 10 });
                      if (state.lifespan > 10) dispatch({ type: "SET_INJURY", level: "heavy" });
                    }}
                    className="flex-1 rounded-xl px-4 py-3 font-serif text-xs"
                    style={{ color: "#ff9f96", border: "1px solid #ef6b6255", backgroundColor: "#1b0e0e" }}
                  >
                    以 10 年寿元换命
                  </button>
                  <button onClick={() => setShowInventory(true)} className="rounded-xl px-4 py-3 font-serif text-xs" style={{ color: "#94ad9f", border: "1px solid #31473a" }}>打开储物袋</button>
                </div>
              </section>
            ) : (
              <div className="space-y-3">
                {state.lastSettlement && (
                  <section className="flex flex-col gap-2 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: "rgba(13,23,18,.90)", border: "1px solid #273c31", backdropFilter: "blur(14px)" }}>
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg font-serif text-[11px]" style={{ color: state.lastSettlement.breakthroughReady ? "#d4a843" : "#6fedb5", backgroundColor: "#111d17", border: "1px solid #2b4236" }}>
                        {state.lastSettlement.breakthroughReady ? "破" : "岁"}
                      </span>
                      <div>
                        <div className="font-serif text-xs font-bold" style={{ color: state.lastSettlement.breakthroughReady ? "#e8c86a" : "#d8e6df" }}>{state.lastSettlement.headline}</div>
                        <div className="mt-0.5 text-[9px]" style={{ color: "#678274" }}>{state.lastSettlement.fromAge}–{state.lastSettlement.toAge}岁 · {state.lastSettlement.lines.join(" · ")}</div>
                      </div>
                    </div>
                    {state.lastSettlement.breakthroughReady && <span className="rounded-full px-2.5 py-1 text-[9px]" style={{ color: "#d4a843", backgroundColor: "#1a160b", border: "1px solid #d4a84333" }}>修为已至巅峰</span>}
                  </section>
                )}
                <StageFocusPanel state={state} onSelect={(focusId) => dispatch({ type: "SET_STAGE_FOCUS", focusId })} onAdvance={() => dispatch({ type: "ADVANCE_STAGE" })} />
                {state.xp >= 90 && (
                  <button
                    onClick={() => state.realmSlug === "huashen" ? handleAscend() : dispatch({ type: "ATTEMPT_BREAKTHROUGH" })}
                    className="w-full rounded-2xl py-3.5 font-serif text-sm font-bold tracking-[.16em]"
                    style={{ background: "linear-gradient(135deg, #d4a843, #f0cf78)", color: "#0a0e0d", boxShadow: "0 12px 40px rgba(212,168,67,.16)" }}
                  >
                    {state.realmSlug === "huashen" ? "✦ 飞升灵界" : `冲关 · ${REALM_NEXT[state.realmSlug]}`}
                  </button>
                )}
              </div>
            )}
          </main>

          <JourneyCompanion state={state} onOpenLife={() => setShowLife(true)} />
        </div>
      </div>

      <LifeDrawer open={showLife} onClose={() => setShowLife(false)} />
      {showMarket && <MarketModal onClose={() => setShowMarket(false)} />}
      {showInventory && <InventoryModal onClose={() => setShowInventory(false)} />}
      {showSectChoice && <SectChoiceModal onClose={() => setShowSectChoice(false)} />}
      {showBattle && battleEnemy && <BattleModal enemyName={battleEnemy.name} enemyRealm={battleEnemy.realm} enemyDesc={battleEnemy.desc} onWin={() => {}} onLose={() => {}} onClose={() => { setShowBattle(false); setBattleEnemy(null); }} />}

      {eventResult && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-3 py-6" style={{ backgroundColor: "rgba(0,0,0,.76)", backdropFilter: "blur(8px)" }} onClick={(event) => event.target === event.currentTarget && closeResult()}>
          <div className="w-full max-w-lg overflow-hidden rounded-[24px]" style={{ backgroundColor: "#0d1712", border: "1px solid #30473b", boxShadow: "0 32px 120px rgba(0,0,0,.55)" }}>
            <PixelScene scene={getSceneById(eventResult.sceneId)} compact>
              <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 px-4 pb-4 md:px-5">
                <span className="grid h-11 w-11 flex-shrink-0 place-items-center overflow-hidden rounded-xl backdrop-blur-md" style={{ color: eventResult.action.accent, backgroundColor: "rgba(7,13,10,.75)", border: `1px solid ${eventResult.action.accent}55` }}>
                  <Image src={eventResult.action.src} alt="" width={30} height={30} unoptimized style={{ imageRendering: "pixelated" }} />
                </span>
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2 text-[8px] tracking-[.2em]" style={{ color: "rgba(218,232,224,.55)" }}>
                    <span>{eventResult.title}</span><span>·</span><span style={{ color: eventResult.action.accent }}>{eventResult.action.label}</span>
                  </div>
                  <div className="font-serif text-lg font-bold leading-6" style={{ color: "#edf5f1", textShadow: "0 2px 18px rgba(0,0,0,.8)" }}>「{eventResult.choice}」</div>
                  {eventResult.story && <div className="mt-1 text-[9px]" style={{ color: "#d4a843" }}>{eventResult.story}</div>}
                </div>
              </div>
            </PixelScene>
            <div className="p-4 md:p-5">
              <p className="mb-4 text-[13px] leading-7" style={{ color: "#b8ccc2" }}>{eventResult.outcome}</p>
              <div className="flex flex-wrap gap-1.5">
                {eventResult.lines.map((line) => <span key={line} className="rounded-full px-2 py-1 text-[9px]" style={{ color: "#8fa79a", backgroundColor: "#0b130f", border: "1px solid #1e3027" }}>{line}</span>)}
              </div>
              <button onClick={closeResult} className="mt-4 w-full rounded-xl py-3 font-serif text-xs font-bold tracking-[.12em]" style={{ color: "#07100c", backgroundColor: "#62dca0", boxShadow: "0 8px 28px rgba(74,222,154,.14)" }}>继续活下去</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
