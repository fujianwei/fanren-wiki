"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/components/game/GameProvider";
import StatusPanel from "@/components/game/StatusPanel";
import EventCard from "@/components/game/EventCard";
import MarketModal from "@/components/game/MarketModal";
import BattleModal from "@/components/game/BattleModal";
import SectChoiceModal from "@/components/game/SectChoiceModal";
import SceneBackground from "@/components/game/SceneBackground";
import FateOpening from "@/components/game/FateOpening";
import StageFocusPanel from "@/components/game/StageFocusPanel";
import RelationsPanel from "@/components/game/RelationsPanel";
import LifeTimeline from "@/components/game/LifeTimeline";
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

  if (result === "success") {
    return (
      <div className="rounded-2xl p-7 text-center" style={{ backgroundColor: "#111a16", border: "1px solid #d4a84366" }}>
        <div className="text-3xl mb-3" style={{ color: "#d4a843" }}>✦</div>
        <h2 className="font-serif text-xl font-bold mb-2" style={{ color: "#e8c86a" }}>冲关成功</h2>
        <p className="text-sm leading-7 mb-5" style={{ color: "#b8ccc2" }}>你从这一关活了下来。过去那些年里做错和做对的事，都成了此刻的一部分。</p>
        <button onClick={() => dispatch({ type: "BREAKTHROUGH_SUCCESS" })} className="btn-primary w-full py-3 rounded-xl text-sm">踏入{REALM_NEXT[state.realmSlug]}</button>
      </div>
    );
  }

  if (result === "fail") {
    return (
      <div className="rounded-2xl p-7 text-center" style={{ backgroundColor: "#111a16", border: "1px solid #ef444466" }}>
        <div className="text-2xl mb-3" style={{ color: "#ef4444" }}>◆</div>
        <h2 className="font-serif text-xl font-bold mb-2" style={{ color: "#ef8d8d" }}>冲关失败</h2>
        <p className="text-sm leading-7 mb-5" style={{ color: "#b8ccc2" }}>你退回了原来的境界。失败不会抹掉这一生，但会改变下一次面对天劫时的姿态。</p>
        <button onClick={() => { dispatch({ type: "BREAKTHROUGH_FAIL" }); dispatch({ type: "ADD_EMOTION", positive: 0, negative: 6 }); setResult(null); }} className="btn-secondary w-full py-3 rounded-xl text-sm">继续活下去</button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#111a16", border: "1px solid #d4a84344" }}>
      <div className="px-5 py-4" style={{ borderBottom: "1px solid #1a2820" }}>
        <div className="flex items-center justify-between">
          <span className="font-serif font-bold" style={{ color: "#d4a843" }}>冲关 · {REALM_NEXT[state.realmSlug]}</span>
          <span className="text-xs" style={{ color: "#6a8878" }}>寿元消耗 {lifespanCost} 年</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-xs" style={{ color: "#6a8878" }}>成功率</span>
          <span className="font-serif text-3xl font-bold" style={{ color: "#f0c96b" }}>{Math.round(finalRate * 100)}%</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-5" style={{ color: "#6a8878" }}>
          <div className="flex justify-between rounded-lg px-3 py-2" style={{ backgroundColor: "#0e1610" }}><span>基础</span><span>{Math.round(details.baseRate * 100)}%</span></div>
          <div className="flex justify-between rounded-lg px-3 py-2" style={{ backgroundColor: "#0e1610" }}><span>外物</span><span>+{Math.round((details.arrayBonus + details.pillBonus) * 100)}%</span></div>
          <div className="flex justify-between rounded-lg px-3 py-2" style={{ backgroundColor: "#0e1610" }}><span>根基</span><span>{state.rootIntact ? "+15%" : `-${state.rootDamageCount * 5}%`}</span></div>
          <div className="flex justify-between rounded-lg px-3 py-2" style={{ backgroundColor: "#0e1610" }}><span>心魔</span><span>×{Math.round(heartRate * 100)}%</span></div>
        </div>
        <p className="text-xs leading-relaxed mb-4" style={{ color: "#5f786a" }}>失败不一定死亡，但失败会留下痕迹。冲关不是唯一的路，换一条路继续走，也许更接近你真正想要的东西。</p>
        <div className="flex gap-2">
          <button onClick={attempt} className="btn-primary flex-1 py-3 rounded-xl text-sm">渡劫</button>
          <button onClick={() => dispatch({ type: "CANCEL_BREAKTHROUGH" })} className="btn-secondary flex-1 py-3 rounded-xl text-sm">再等等</button>
        </div>
      </div>
    </div>
  );
}

function InventoryPanel({ onOpen }: { onOpen: () => void }) {
  const { state } = useGame();
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #1a2820" }}>
        <span className="font-serif text-sm font-medium" style={{ color: "#e8f0ec" }}>随身之物</span>
        <span className="text-[10px]" style={{ color: "#4ade9a" }}>灵石 {state.lingshi}</span>
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        {ITEMS.filter((item) => (state.inventory[item.id] ?? 0) > 0).slice(0, 8).map((item) => (
          <div key={item.id} className="flex items-center justify-between text-xs rounded-lg px-2.5 py-2" style={{ backgroundColor: "#0e1610" }}>
            <span className="truncate" style={{ color: "#b8ccc2" }}>{item.name}</span>
            <span style={{ color: "#4ade9a" }}>×{state.inventory[item.id]}</span>
          </div>
        ))}
        {Object.values(state.inventory).every((count) => !count) && <div className="text-xs text-center py-5" style={{ color: "#4a6a58" }}>身无长物</div>}
      </div>
      <button onClick={onOpen} className="w-full text-xs py-2.5" style={{ color: "#6a8878", borderTop: "1px solid #1a2820" }}>查看全部</button>
    </div>
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

function PastLifeMirror({ state }: { state: GameState }) {
  const last = state.meta.lives.at(-1);
  if (!last) {
    return <div className="rounded-2xl px-4 py-4" style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}><div className="font-serif text-sm mb-2" style={{ color: "#e8f0ec" }}>三生镜</div><div className="text-xs leading-relaxed" style={{ color: "#4a6a58" }}>还没有前世的痕迹。第一世结束后，这里会留下你反复走的那一步。</div></div>;
  }
  const verdict = last.prophecyVerdict === "fulfilled" ? "谶语应验" : last.prophecyVerdict === "defied" ? "逆命而行" : "命格未答";
  return (
    <div className="rounded-2xl px-4 py-4" style={{ backgroundColor: "#111a16", border: "1px solid #26352d" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-serif text-sm" style={{ color: "#e8f0ec" }}>三生镜</span>
        <span className="text-[10px]" style={{ color: "#6a8878" }}>第 {last.lifeNumber} 世</span>
      </div>
      <div className="text-xs leading-relaxed" style={{ color: "#b8ccc2" }}>{last.name} · {last.finalAge}岁 · {last.endingTitle}</div>
      <div className="text-[10px] mt-2" style={{ color: "#d4a843" }}>{verdict} · {last.prophecyText}</div>
      {last.karmaMarks[0] && <div className="text-[10px] mt-2" style={{ color: "#6a8878" }}>前世因果：{last.karmaMarks[0]}</div>}
    </div>
  );
}

export default function GamePlayPage() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [eventResult, setEventResult] = useState<{ title: string; choice: string; outcome: string; lines: string[]; story?: string } | null>(null);
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

    setEventResult({ title: activeEvent.title, choice: option.text, outcome: toneText, lines, story: storyLabel });
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

  return (
    <div className="relative max-w-[1380px] mx-auto w-full px-4 md:px-6 py-4 md:py-6 flex flex-col lg:flex-row gap-4" style={{ minHeight: "calc(100vh - 64px)", alignItems: "stretch" }}>
      <SceneBackground eventId={currentEvent?.id ?? null} realmSlug={state.realmSlug} />

      <aside className="relative z-10 hidden lg:flex w-56 flex-shrink-0 flex-col gap-3">
        <InventoryPanel onOpen={() => setShowInventory(true)} />
        <div className="rounded-2xl p-4" style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}>
          <div className="text-xs font-medium mb-2" style={{ color: "#e8f0ec" }}>可选去处</div>
          <button onClick={() => setShowMarket(true)} className="w-full text-xs py-2.5 mb-2 rounded-lg btn-secondary">前往灵市</button>
          <button onClick={() => { setBattleEnemy(pickBattleEnemy(state.realmSlug)); setShowBattle(true); }} className="w-full text-xs py-2.5 rounded-lg btn-secondary">外出历练</button>
          {!state.sectPath && <button onClick={() => setShowSectChoice(true)} className="w-full text-xs py-2.5 mt-2 rounded-lg" style={{ color: "#4ade9a", border: "1px solid #4ade9a33" }}>选择道路</button>}
        </div>
        <div className="rounded-2xl p-4 flex-1" style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}>
          <div className="text-xs font-medium mb-2" style={{ color: "#e8f0ec" }}>玩家提示</div>
          <div className="text-[10px] leading-relaxed" style={{ color: "#4a6a58" }}>阶段重心会影响你会遇见什么。灵根决定起步，不决定终点。</div>
        </div>
      </aside>

      <main className="relative z-10 flex-1 min-w-0 flex flex-col gap-4">
        <div className="lg:hidden flex gap-2">
          <button onClick={() => setShowInventory(true)} className="flex-1 py-2.5 rounded-xl text-xs btn-secondary">储物袋</button>
          <button onClick={() => setShowMarket(true)} className="flex-1 py-2.5 rounded-xl text-xs btn-secondary">灵市</button>
        </div>

        <StatusPanel />

        {!state.heartIntent ? (
          <FateOpening state={state} onChoose={(intent) => dispatch({ type: "SET_HEART_INTENT", intent })} />
        ) : currentEvent ? (
          <EventCard event={currentEvent} onChoose={chooseOption} />
        ) : state.phase === "breakthrough" ? (
          <BreakthroughPanel />
        ) : isDying ? (
          <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: "#111a16", border: "1px solid #dc262644" }}>
            <div className="font-serif text-xl mb-2" style={{ color: "#ef8d8d" }}>你已濒临陨落</div>
            <p className="text-sm leading-7 mb-5" style={{ color: "#8f6d6d" }}>这一次，先活下来。你可以散财求医，也可以拿寿元换一条命。</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => {
                  if (state.lingshi < 120) return;
                  dispatch({ type: "ADD_LINGSHI", amount: -120 });
                  dispatch({ type: "SET_INJURY", level: "heavy" });
                }}
                disabled={state.lingshi < 120}
                className="btn-secondary px-5 py-2.5 rounded-xl text-sm"
                style={{ opacity: state.lingshi < 120 ? .35 : 1 }}
              >
                散尽 120 灵石求医
              </button>
              <button
                onClick={() => {
                  dispatch({ type: "CONSUME_LIFESPAN", years: 10 });
                  if (state.lifespan > 10) dispatch({ type: "SET_INJURY", level: "heavy" });
                }}
                className="px-5 py-2.5 rounded-xl text-sm"
                style={{ color: "#ef8d8d", border: "1px solid #ef444444", backgroundColor: "#160d0d" }}
              >
                以 10 年寿元换命
              </button>
              <button onClick={() => setShowInventory(true)} className="btn-secondary px-5 py-2.5 rounded-xl text-sm">打开储物袋</button>
            </div>
          </div>
        ) : (
          <>
            {state.lastSettlement && (
              <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: "#0e1610", border: "1px solid #26352d" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif text-sm font-bold" style={{ color: state.lastSettlement.breakthroughReady ? "#d4a843" : "#b8ccc2" }}>{state.lastSettlement.headline}</span>
                  <span className="text-[10px]" style={{ color: "#4a6a58" }}>{state.lastSettlement.fromAge}–{state.lastSettlement.toAge}岁</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {state.lastSettlement.lines.map((line) => <span key={line} className="text-[10px] px-2 py-1 rounded-full" style={{ color: "#6a8878", backgroundColor: "#111a16" }}>{line}</span>)}
                </div>
                {state.lastSettlement.breakthroughReady && <div className="text-[10px] mt-2" style={{ color: "#d4a843" }}>修为已至后期巅峰，可以冲关。</div>}
              </div>
            )}
            <StageFocusPanel state={state} onSelect={(focusId) => dispatch({ type: "SET_STAGE_FOCUS", focusId })} onAdvance={() => dispatch({ type: "ADVANCE_STAGE" })} />
            {state.xp >= 90 && (
              <button onClick={() => state.realmSlug === "huashen" ? handleAscend() : dispatch({ type: "ATTEMPT_BREAKTHROUGH" })} className="w-full py-3 rounded-xl text-sm font-bold tracking-wider" style={{ backgroundColor: "#d4a843", color: "#0a0e0d" }}>
                {state.realmSlug === "huashen" ? "✦ 飞升灵界" : `冲关 · ${REALM_NEXT[state.realmSlug]}`}
              </button>
            )}
          </>
        )}
      </main>

      <aside className="relative z-10 w-full lg:w-72 flex-shrink-0 flex flex-col gap-3">
        <PastLifeMirror state={state} />
        <RelationsPanel state={state} />
        <LifeTimeline state={state} />
      </aside>

      {showMarket && <MarketModal onClose={() => setShowMarket(false)} />}
      {showInventory && <InventoryModal onClose={() => setShowInventory(false)} />}
      {showSectChoice && <SectChoiceModal onClose={() => setShowSectChoice(false)} />}
      {showBattle && battleEnemy && <BattleModal enemyName={battleEnemy.name} enemyRealm={battleEnemy.realm} enemyDesc={battleEnemy.desc} onWin={() => {}} onLose={() => {}} onClose={() => { setShowBattle(false); setBattleEnemy(null); }} />}

      {eventResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,.72)" }} onClick={(event) => event.target === event.currentTarget && closeResult()}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ backgroundColor: "#111a16", border: "1px solid #26352d" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid #1a2820" }}>
              <div className="text-[10px] mb-1" style={{ color: "#6a8878" }}>{eventResult.title}</div>
              <div className="font-serif text-lg" style={{ color: "#e8f0ec" }}>「{eventResult.choice}」</div>
              {eventResult.story && <div className="text-[10px] mt-2" style={{ color: "#d4a843" }}>{eventResult.story}</div>}
            </div>
            <div className="px-5 py-5">
              <p className="text-sm leading-7 mb-4" style={{ color: "#b8ccc2" }}>{eventResult.outcome}</p>
              <div className="flex flex-wrap gap-1.5">
                {eventResult.lines.map((line) => <span key={line} className="text-[10px] px-2 py-1 rounded-full" style={{ color: "#8fa79a", backgroundColor: "#0e1610" }}>{line}</span>)}
              </div>
            </div>
            <div className="px-5 pb-5"><button onClick={closeResult} className="btn-secondary w-full py-3 rounded-xl text-sm">继续活下去</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
