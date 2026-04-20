"use client";

import { useState, useEffect, useRef } from "react";
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

const BATTLE_ENEMIES: Record<string, { name: string; desc: string }[]> = {
  lianqi: [
    { name: "野外散修", desc: "一名流浪的炼气期散修，衣衫褴褛，眼神凶狠。" },
    { name: "山中妖兽", desc: "一头炼气期妖兽，獠牙毕露，气息不稳但动作迅猛。" },
    { name: "采药弟子", desc: "他山宗门的外门弟子，看你独行，起了歹心。" },
    { name: "落魄修士", desc: "一名走火入魔的修士，神志不清，见人便攻。" },
  ],
  zhuji: [
    { name: "筑基散修", desc: "一名独行的筑基期散修，修为与你相当，神情傲慢。" },
    { name: "山贼修士", desc: "占山为王的修士，专门劫掠过路修士的财物。" },
    { name: "妖兽精怪", desc: "修炼多年的妖兽，已有几分灵智，凶悍异常。" },
    { name: "敌宗弟子", desc: "与你宗门有旧怨的敌对宗门弟子，主动挑衅。" },
  ],
  jiedan: [
    { name: "结丹修士", desc: "一名结丹期修士，正在争夺附近的灵脉，与你相遇。" },
    { name: "魔道散修", desc: "修炼魔功的散修，气息阴冷，杀气弥漫。" },
    { name: "妖族战士", desc: "化形妖族的战士，修为不俗，来历不明。" },
    { name: "赏金猎人", desc: "以追杀修士为生的结丹猎人，手段毒辣。" },
  ],
  yuanying: [
    { name: "元婴修士", desc: "一名元婴期修士，修为与你相当，道途不同。" },
    { name: "域外魔修", desc: "来自域外的魔道修士，修炼邪法，战力强横。" },
    { name: "上古妖兽", desc: "存活千年的上古妖兽，神识强大，不可小觑。" },
    { name: "叛道修士", desc: "背叛宗门的元婴修士，如今四处流亡，遇强则战。" },
  ],
  huashen: [
    { name: "化神修士", desc: "一名化神期修士，修为与你相当，因旧怨而来。" },
    { name: "天魔残影", desc: "天魔入侵留下的残影，虽非实体，但战力惊人。" },
    { name: "魔道宗主", desc: "魔道宗门的宗主，修为深不可测，野心勃勃。" },
    { name: "域外强敌", desc: "来自灵界边缘的强大修士，试探人界的防线。" },
  ],
};

const REALM_ORDER_LIST = ["lianqi", "zhuji", "jiedan", "yuanying", "huashen"] as const;

function pickBattleEnemy(realmSlug: string): { name: string; realm: RealmSlug; desc: string } {
  const pool = BATTLE_ENEMIES[realmSlug] ?? BATTLE_ENEMIES["lianqi"];
  const enemy = pool[Math.floor(Math.random() * pool.length)];
  // 50%同境界，30%低一级，20%高一级
  const idx = REALM_ORDER_LIST.indexOf(realmSlug as RealmSlug);
  const roll = Math.random();
  let enemyRealmIdx = idx;
  if (roll < 0.20 && idx < REALM_ORDER_LIST.length - 1) enemyRealmIdx = idx + 1;
  else if (roll < 0.50 && idx > 0) enemyRealmIdx = idx - 1;

  // 结丹期遇到高一级（元婴），60%概率触发大衍神君彩蛋
  if (realmSlug === "jiedan" && enemyRealmIdx === REALM_ORDER_LIST.indexOf("yuanying") && Math.random() < 0.60) {
    return {
      name: "紫袍奇人",
      realm: "yuanying",
      desc: "此人紫袍金冠，气度不凡，周身魔气缠绕。他自称来自乱星海，说是被天空某颗巨眼传送至此，神情颇为烦躁。嘴里还嘟囔着「所谓元婴以下第一人，说到底，也不过是个结丹修士罢了」之类让人摸不到头脑的话。提到一个姓韩的修士时，他眼中杀意涌现……",
    };
  }

  return { name: enemy.name, realm: REALM_ORDER_LIST[enemyRealmIdx], desc: enemy.desc };
}

function pickEvent(realmSlug: string, history: string[], sectPath: string | null): GameEvent | null {
  const pool = ALL_EVENTS.filter((e) => {
    if (e.realmSlug !== realmSlug) return false;
    if ((e as any).requires_sect && !sectPath) return false;
    const karma = (e as any).requires_karma as string | undefined;
    if (karma && !history.includes(karma)) return false;
    return true;
  });
  if (pool.length === 0) return null;
  const unseen = pool.filter((e) => !history.includes(e.id));
  const candidates = unseen.length > 0 ? unseen : pool;

  // 按权重随机抽取（weight 字段，默认 10）
  const totalWeight = candidates.reduce((s, e) => s + ((e as any).weight ?? 10), 0);
  let rand = Math.random() * totalWeight;
  for (const e of candidates) {
    rand -= (e as any).weight ?? 10;
    if (rand <= 0) return e;
  }
  return candidates[candidates.length - 1];
}

const REALM_ASCEND_TEXT: Record<string, { title: string; desc: string }> = {
  lianqi: { title: "筑基成功", desc: "灵力凝聚，根基已筑。你踏入筑基期，寿命大幅延长，修仙之路正式开启。" },
  zhuji:  { title: "结丹成功", desc: "一声轻响，金丹在丹田中成形。结丹期修士，从此与凡人彻底不同。" },
  jiedan: { title: "元婴出窍", desc: "心魔尽散，元婴破体而出。你历经九死一生，终于踏入元婴期，寿命再度飞跃。" },
  yuanying: { title: "化神成功", desc: "神识扩张，天地尽在感知之中。化神期，你已是人界顶尖的存在。" },
  huashen: { title: "飞升灵界", desc: "踏破虚空，你终于飞升灵界。那一刻，天地为之颤抖，万道金光将你笼罩。" },
};

function calcBreakthroughDetails(state: ReturnType<typeof useGame>["state"]) {
  const realm = getRealmConfig(state.realmSlug);
  const baseRate = realm.breakthroughRate;

  const arrayBonus = (() => {
    if ((state.inventory["tiangang_zhen"] ?? 0) > 0) return 0.20;
    if ((state.inventory["huti_zhen"] ?? 0) > 0) return 0.12;
    if ((state.inventory["juling_zhen"] ?? 0) > 0) return 0.08;
    return 0;
  })();

  const pillBonus = (() => {
    const realmPillMap: Record<string, string> = {
      lianqi: "zhuji_dan", zhuji: "jucheng_dan",
      jiedan: "butian_dan", yuanying: "jiangyun_dan",
    };
    const pillId = realmPillMap[state.realmSlug];
    if (pillId && (state.inventory[pillId as ItemId] ?? 0) > 0) return 0.25;
    return 0;
  })();

  const lingshiBonus = Math.min(0.05, Math.floor(state.lingshi / 500) * 0.02);
  const rootBonus = state.rootIntact ? 0.15 : 0;
  const rootDamage = state.rootDamageCount * 0.05;
  const expBonus = Math.min(0.15, state.breakthroughExp / 100);

  const total = calcBreakthroughRate({
    realmSlug: state.realmSlug,
    xp: state.xp,
    itemBonus: arrayBonus + pillBonus,
    lingshi: state.lingshi,
    rootIntact: state.rootIntact,
    rootDamageCount: state.rootDamageCount,
    breakthroughExp: state.breakthroughExp,
  });

  return { baseRate, arrayBonus, pillBonus, lingshiBonus, rootBonus, rootDamage, expBonus, total };
}

function BreakthroughPanel() {
  const { state, dispatch } = useGame();
  const realm = getRealmConfig(state.realmSlug);
  const [result, setResult] = useState<"success" | "fail" | null>(null);

  const NEXT_REALM: Record<string, string> = {
    lianqi: "筑基期", zhuji: "结丹期", jiedan: "元婴期",
    yuanying: "化神期", huashen: "飞升",
  };

  const details = calcBreakthroughDetails(state);
  const lifespanCost = Math.round(state.lifespanMax * 0.02);

  const jiuquBonus = (state.inventory["jiuqu_dan"] ?? 0) > 0 ? 0.20 : 0;
  const heartDemonRate = state.realmSlug === "jiedan"
    ? Math.min(1, calcHeartDemonRate(state.emotion.positive, state.emotion.negative) + jiuquBonus)
    : 1;
  const effectiveRate = details.total * heartDemonRate;

  function attempt() {
    // 消耗寿命
    dispatch({ type: "CONSUME_LIFESPAN", years: lifespanCost });

    // 消耗突破类丹药（成功失败都消耗）
    const realmPillMap: Record<string, ItemId> = {
      lianqi: "zhuji_dan", zhuji: "jucheng_dan",
      jiedan: "butian_dan", yuanying: "jiangyun_dan",
    };
    const pillId = realmPillMap[state.realmSlug];
    if (pillId && (state.inventory[pillId] ?? 0) > 0) {
      dispatch({ type: "REMOVE_ITEM", itemId: pillId });
    }
    // 消耗阵法加成（护体阵/天罡阵一次性，聚灵阵不消耗）
    if ((state.inventory["tiangang_zhen"] ?? 0) > 0) {
      dispatch({ type: "REMOVE_ITEM", itemId: "tiangang_zhen" });
    } else if ((state.inventory["huti_zhen"] ?? 0) > 0) {
      dispatch({ type: "REMOVE_ITEM", itemId: "huti_zhen" });
    }
    // 结丹→元婴消耗九曲灵参丸
    if (state.realmSlug === "jiedan" && (state.inventory["jiuqu_dan"] ?? 0) > 0) {
      dispatch({ type: "REMOVE_ITEM", itemId: "jiuqu_dan" });
    }

    const roll = Math.random();
    if (roll < effectiveRate) {
      setResult("success");
    } else {
      const failDeath = Math.random() < realm.failDeathRate;
      if (failDeath) {
        const endingType = state.realmSlug === "jiedan" ? "death_heart" : "death_break";
        dispatch({ type: "END_GAME", endingType });
      } else {
        setResult("fail");
      }
    }
  }

  function confirmSuccess() {
    dispatch({ type: "BREAKTHROUGH_SUCCESS" });
  }

  function confirmFail() {
    dispatch({ type: "BREAKTHROUGH_FAIL" });
    dispatch({ type: "ADD_EMOTION", positive: 0, negative: 8 });
    setResult(null);
  }

  // 渡劫结果弹窗
  if (result === "success") {
    const ascend = REALM_ASCEND_TEXT[state.realmSlug];
    return (
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#111a16", border: "1px solid #d4a84366" }}>
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="text-3xl mb-3">✦</div>
          <div className="font-serif font-bold text-lg mb-2" style={{ color: "#d4a843" }}>
            {ascend?.title ?? "突破成功"}
          </div>
          <p className="text-sm leading-relaxed mb-5" style={{ color: "#b8ccc2" }}>
            {ascend?.desc ?? "修为精进，境界提升。"}
          </p>
          <button onClick={confirmSuccess} className="w-full py-3 rounded-xl font-medium text-sm"
            style={{ backgroundColor: "#d4a843", color: "#0a0e0d" }}>
            踏入{NEXT_REALM[state.realmSlug]}
          </button>
        </div>
      </div>
    );
  }

  if (result === "fail") {
    const newExp = Math.min(15, state.breakthroughExp + 3);
    return (
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#111a16", border: "1px solid #ef444444" }}>
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="text-3xl mb-3">◆</div>
          <div className="font-serif font-bold text-lg mb-2" style={{ color: "#ef4444" }}>
            渡劫失败
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "#b8ccc2" }}>
            天雷轰鸣，你未能突破壁障，被迫退出渡劫状态，元气大伤。
          </p>
          <div className="rounded-xl px-4 py-3 mb-5 text-xs text-left" style={{ backgroundColor: "#0e1610", border: "1px solid #1a2820" }}>
            <div className="flex justify-between mb-1">
              <span style={{ color: "#6a8878" }}>消耗寿命</span>
              <span style={{ color: "#ef4444" }}>-{lifespanCost} 年</span>
            </div>
            <div className="flex justify-between mb-1">
              <span style={{ color: "#6a8878" }}>负面情绪</span>
              <span style={{ color: "#ef4444" }}>+8（恐惧）</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#6a8878" }}>冲关经验</span>
              <span style={{ color: "#d4a843" }}>+3% → 共 {newExp}%（上限15%）</span>
            </div>
          </div>
          <button onClick={confirmFail} className="w-full py-3 rounded-xl text-sm btn-secondary">
            继续修行
          </button>
        </div>
      </div>
    );
  }

  // 渡劫准备面板
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#111a16", border: "1px solid #d4a84344" }}>
      <div className="px-5 py-4" style={{ borderBottom: "1px solid #1a2820" }}>
        <div className="flex items-center justify-between">
          <span className="font-serif font-bold" style={{ color: "#d4a843" }}>
            冲关 → {NEXT_REALM[state.realmSlug]}
          </span>
          <span className="text-xs" style={{ color: "#6a4a18" }}>消耗 {lifespanCost} 年寿命</span>
        </div>
      </div>

      {/* 概率分解 */}
      <div className="px-5 py-4">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-sm" style={{ color: "#6a8878" }}>成功率</span>
          <span className="text-2xl font-bold font-serif" style={{ color: "#d4a843" }}>
            {Math.round(effectiveRate * 100)}%
          </span>
        </div>

        <div className="flex flex-col gap-1.5 text-xs mb-4">
          <div className="flex justify-between">
            <span style={{ color: "#4a6a58" }}>基础概率</span>
            <span style={{ color: "#6a8878" }}>{Math.round(details.baseRate * 100)}%</span>
          </div>
          {details.pillBonus > 0 && (
            <div className="flex justify-between">
              <span style={{ color: "#4a6a58" }}>突破丹药</span>
              <span style={{ color: "#4ade9a" }}>+{Math.round(details.pillBonus * 100)}%</span>
            </div>
          )}
          {details.arrayBonus > 0 && (
            <div className="flex justify-between">
              <span style={{ color: "#4a6a58" }}>阵法加持</span>
              <span style={{ color: "#4ade9a" }}>+{Math.round(details.arrayBonus * 100)}%</span>
            </div>
          )}
          {details.lingshiBonus > 0 && (
            <div className="flex justify-between">
              <span style={{ color: "#4a6a58" }}>灵石助力</span>
              <span style={{ color: "#4ade9a" }}>+{Math.round(details.lingshiBonus * 100)}%</span>
            </div>
          )}
          {details.rootBonus > 0 && (
            <div className="flex justify-between">
              <span style={{ color: "#4a6a58" }}>根基稳固</span>
              <span style={{ color: "#4ade9a" }}>+{Math.round(details.rootBonus * 100)}%</span>
            </div>
          )}
          {details.rootDamage > 0 && (
            <div className="flex justify-between">
              <span style={{ color: "#4a6a58" }}>根基受损</span>
              <span style={{ color: "#ef4444" }}>-{Math.round(details.rootDamage * 100)}%</span>
            </div>
          )}
          {details.expBonus > 0 && (
            <div className="flex justify-between">
              <span style={{ color: "#4a6a58" }}>冲关经验</span>
              <span style={{ color: "#d4a843" }}>+{Math.round(details.expBonus * 100)}%</span>
            </div>
          )}
          {state.realmSlug === "jiedan" && (
            <>
              <div style={{ borderTop: "1px solid #1a2820", margin: "4px 0" }} />
              <div className="flex justify-between">
                <span style={{ color: "#4a6a58" }}>心魔关</span>
                <span style={{ color: heartDemonRate >= 0.6 ? "#4ade9a" : "#ef4444" }}>
                  ×{Math.round(heartDemonRate * 100)}%
                </span>
              </div>
              {jiuquBonus > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: "#4a6a58" }}>九曲灵参丸</span>
                  <span style={{ color: "#4ade9a" }}>+20%</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2.5">
          <button onClick={attempt} className="flex-1 py-3 rounded-xl font-medium text-sm"
            style={{ backgroundColor: "#d4a843", color: "#0a0e0d" }}>
            渡劫！
          </button>
          <button onClick={() => dispatch({ type: "BREAKTHROUGH_FAIL" })}
            className="flex-1 py-3 rounded-xl text-sm btn-secondary">
            暂不冲关
          </button>
        </div>
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
  yao_dan:       { name: "妖丹", category: "mechanism", desc: "修为+5%（不受灵根影响）" },
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
                      {item.category === "mechanism" && item.id !== "xuming_dan" && item.id !== "yao_dan" && item.count > 0 && (
                        <button
                          onClick={() => dispatch({ type: "USE_ITEM", itemId: item.id as any })}
                          className="text-xs px-2 py-1 rounded ml-3 whitespace-nowrap"
                          style={{ backgroundColor: "#1a2820", color: "#4ade9a", border: "1px solid #4ade9a33" }}
                        >
                          使用
                        </button>
                      )}
                      {item.id === "yao_dan" && item.count > 0 && (
                        <button
                          onClick={() => dispatch({ type: "USE_ITEM", itemId: "yao_dan" })}
                          className="text-xs px-2 py-1 rounded ml-3 whitespace-nowrap"
                          style={{ backgroundColor: "#1a2820", color: "#d4a843", border: "1px solid #d4a84333" }}
                        >
                          服用
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
  const [log, setLog] = useState<{ age: number; text: string }[]>([]);
  const [toasts, setToasts] = useState<{ id: number; itemId: string; name: string; count: number }[]>([]);
  const [subRealmNotice, setSubRealmNotice] = useState<{ title: string; desc: string } | null>(null);
  const prevXpRef = useRef(0);

  // 监听修为变化，触发小境界突破提示
  useEffect(() => {
    const prev = prevXpRef.current;
    const curr = state.xp;
    prevXpRef.current = curr;

    const thresholds = [
      { at: 31, title: "踏入中期", desc: "灵力渐稳，修为迈入中期，前路渐宽。" },
      { at: 71, title: "踏入后期", desc: "根基已厚，后期之境触手可及，冲关在望。" },
      { at: 90, title: "后期巅峰", desc: "修为圆满在即，可尝试冲关突破大境界。" },
      { at: 100, title: "修为圆满", desc: "此境界修为已至圆满，冲关成功率最高。" },
    ];

    for (const t of thresholds) {
      if (prev < t.at && curr >= t.at) {
        setSubRealmNotice({ title: t.title, desc: t.desc });
        break;
      }
    }
  }, [state.xp]);
  const [eventResult, setEventResult] = useState<{
    eventTitle: string;
    optionText: string;
    narrative: string;
    narrativeTone: "good" | "bad" | "mixed" | "neutral";
    lines: { icon: string; text: string; positive: boolean }[];
  } | null>(null);

  function showItemToast(itemId: string, count: number) {
    const meta = ITEM_META[itemId];
    if (!meta) return;
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, itemId, name: meta.name, count }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  }

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
    setLog((prev) => [{ age: state.lifespan, text: msg }, ...prev].slice(0, 30));
  }

  function handleNextEvent() {
    const event = pickEvent(state.realmSlug, state.eventHistory, state.sectPath);
    if (!event) {
      addLog("此境界已无更多事件，请冲关或闭关。");
      return;
    }
    dispatch({ type: "RECORD_EVENT", eventId: event.id });
    setCurrentEvent(event);
  }

  function handleEventChoice(option: EventOption) {
    // 判断是否是"拒绝/无效果"选项
    const isRefuse = option.effects.length === 0;

    // 只有做出实际选择才消耗寿命和增加修为
    if (!isRefuse) {
      const cost = calcLifespanCost(state.realmSlug, "event", state.sectPath === "modao");
      dispatch({ type: "CONSUME_LIFESPAN", years: cost });
      const injuryXpMult = { none: 1.0, light: 0.8, heavy: 0.5, dying: 0.2 }[state.injury] ?? 1.0;
      dispatch({ type: "ADD_XP", points: Math.round(10 * injuryXpMult) });
      // 灵石自然增长：每年 20-30 灵石
      const naturalLingshi = Array.from({ length: cost }, () => Math.floor(Math.random() * 11) + 20)
        .reduce((a, b) => a + b, 0);
      dispatch({ type: "ADD_LINGSHI", amount: naturalLingshi });
      addLog(`消耗 ${cost} 年寿命，自然获得 ${naturalLingshi} 灵石`);
    }

    // 收集效果描述
    const lines: { icon: string; text: string; positive: boolean }[] = [];

    for (const effect of option.effects) {
      const line = applyEffect(effect);
      if (line) lines.push(line);
    }

    // 生成叙事文字 + 情绪色调
    const hasReward = lines.some(l => l.positive);
    const hasPenalty = lines.some(l => !l.positive);
    let narrative = "";
    let narrativeTone: "good" | "bad" | "mixed" | "neutral" = "neutral";
    if (isRefuse) { narrative = "你选择置身事外，未有所为，寿命未损。"; narrativeTone = "neutral"; }
    else if (hasReward && hasPenalty) { narrative = "此行有得有失，修仙路上本是如此。"; narrativeTone = "mixed"; }
    else if (hasReward) { narrative = "此行顺遂，你有所收获。"; narrativeTone = "good"; }
    else if (hasPenalty) { narrative = "此行不顺，你付出了代价。"; narrativeTone = "bad"; }
    else { narrative = "此行平淡无奇，未有所获。"; narrativeTone = "neutral"; }

    setEventResult({
      eventTitle: currentEvent?.title ?? "",
      optionText: option.text,
      narrative,
      narrativeTone,
      lines,
    });
    setCurrentEvent(null);
  }

  function applyEffect(effect: EventEffect): { icon: string; text: string; positive: boolean } | null {
    if (effect.type === "xp") {
      dispatch({ type: "ADD_XP", points: effect.amount });
      return { icon: "◈", text: `修为有所增进 +${effect.amount}（受灵根倍率）`, positive: true };
    } else if (effect.type === "lingshi") {
      dispatch({ type: "ADD_LINGSHI", amount: effect.amount });
      if (effect.amount === 0) return null;
      return {
        icon: effect.amount > 0 ? "✦" : "◆",
        text: effect.amount > 0 ? `获得灵石 +${effect.amount}` : `消耗灵石 ${effect.amount}`,
        positive: effect.amount > 0,
      };
    } else if (effect.type === "item") {
      dispatch({ type: "ADD_ITEM", itemId: effect.itemId, count: effect.count });
      showItemToast(effect.itemId, effect.count);
      const name = ITEM_META[effect.itemId]?.name ?? effect.itemId;
      return { icon: "✦", text: `获得道具：${name} ×${effect.count}`, positive: true };
    } else if (effect.type === "injury") {
      const currentInjury = state.injury;
      let newLevel = effect.level;
      if (currentInjury === "light" && effect.level === "light") newLevel = "heavy";
      else if (currentInjury === "heavy" && (effect.level === "light" || effect.level === "heavy")) newLevel = "dying";
      else if (currentInjury === "dying") newLevel = "dying";
      dispatch({ type: "SET_INJURY", level: newLevel });
      const label = newLevel === "light" ? "轻伤" : newLevel === "heavy" ? "重伤" : "濒死";
      return { icon: "⚠", text: `身受${label}，修炼受阻`, positive: false };
    } else if (effect.type === "emotion") {
      dispatch({
        type: "ADD_EMOTION",
        positive: effect.positive ?? 0,
        negative: effect.negative ?? 0,
      });
      const pos = effect.positive ?? 0;
      const neg = effect.negative ?? 0;
      if (pos > 0) return { icon: "◎", text: `心境向善，正面情绪 +${pos}`, positive: true };
      if (neg > 0) return { icon: "◎", text: `心绪动荡，负面情绪 +${neg}`, positive: false };
      return null;
    } else if (effect.type === "fate") {
      // 天命变化隐藏，不展示
      return null;
    } else if (effect.type === "trigger_karma") {
      dispatch({ type: "RECORD_EVENT", eventId: effect.karmaId });
      return { icon: "∞", text: "因果已种，他日自有回响", positive: true };
    } else if (effect.type === "add_enemy") {
      return { icon: "⚔", text: "此人已记恨于心，日后恐有仇家上门", positive: false };
    }
    return null;
  }

  function handleRetreat(duration: "short" | "mid" | "long") {
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
    // 灵石自然增长
    const naturalLingshi = Array.from({ length: cost }, () => Math.floor(Math.random() * 11) + 20)
      .reduce((a, b) => a + b, 0);
    dispatch({ type: "ADD_LINGSHI", amount: naturalLingshi });

    // 短期闭关可治轻伤
    if (duration === "short" && state.injury === "light") {
      dispatch({ type: "SET_INJURY", level: "none" });
      addLog(`闭关（短期）：消耗 ${cost} 年，轻伤已愈，获得 ${naturalLingshi} 灵石`);
    } else {
      const label = duration === "short" ? "短期" : duration === "mid" ? "中期" : "长期";
      addLog(`闭关（${label}）：消耗 ${cost} 年，获得 ${naturalLingshi} 灵石${state.injury !== "none" ? `，受伤减益×${injuryMult}` : ""}`);
    }
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

  const inventoryCount = Object.values(state.inventory).reduce((s, v) => s + (v ?? 0), 0);

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-6 flex gap-5" style={{ height: "calc(100vh - 64px)", alignItems: "stretch" }}>

      {/* 左侧：储物袋 */}
      <div className="w-64 flex-shrink-0 flex flex-col">
        <div className="rounded-2xl overflow-hidden flex flex-col flex-1" style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}>
          <div className="flex items-center justify-between px-4 py-3.5 flex-shrink-0" style={{ borderBottom: "1px solid #1a2820" }}>
            <span className="text-sm font-medium font-serif" style={{ color: "#e8f0ec" }}>储物袋</span>
            <span className="text-xs" style={{ color: "#4ade9a" }}>灵石 {state.lingshi}</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {inventoryCount === 0 && (
              <div className="px-4 py-6 text-xs text-center" style={{ color: "#4a6a58" }}>空空如也</div>
            )}

            {(["mechanism", "breakthrough", "array"] as const).map((cat) => {
              const items = Object.entries(ITEM_META)
                .filter(([, m]) => m.category === cat)
                .map(([id, m]) => ({ id, ...m, count: state.inventory[id as keyof typeof state.inventory] ?? 0 }));
              const labels = { mechanism: "机制类丹药", breakthrough: "突破类丹药", array: "阵法" };
              return (
                <div key={cat}>
                  <div className="px-4 py-2 text-xs tracking-wide" style={{ color: "#4a6a58", borderTop: "1px solid #1a2820", backgroundColor: "#0e1610" }}>
                    {labels[cat]}
                  </div>
                  <div className="px-3 py-2 flex flex-col gap-1.5">
                    {items.map(item => (
                      <div key={item.id}
                        className="flex items-center justify-between px-3 py-2 rounded-xl"
                        style={{ backgroundColor: item.count > 0 ? "#0e1610" : "transparent", opacity: item.count > 0 ? 1 : 0.35 }}>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs truncate" style={{ color: "#e8f0ec" }}>{item.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: "#4a6a58", fontSize: "10px" }}>{item.desc}</div>
                        </div>
                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          <span className="text-xs font-medium" style={{ color: item.count > 0 ? "#4ade9a" : "#2a3828" }}>
                            ×{item.count}
                          </span>
                          {item.category === "mechanism" && item.id !== "xuming_dan" && item.id !== "yao_dan" && item.count > 0 && (
                            <button onClick={() => dispatch({ type: "USE_ITEM", itemId: item.id as any })}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: "#1a2820", color: "#4ade9a", border: "1px solid #4ade9a33" }}>
                              用
                            </button>
                          )}
                          {item.id === "yao_dan" && item.count > 0 && (
                            <button onClick={() => dispatch({ type: "USE_ITEM", itemId: "yao_dan" })}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: "#1a2820", color: "#d4a843", border: "1px solid #d4a84333" }}>
                              用
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 中间：主内容 */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto">

      {/* 状态面板 */}
      <StatusPanel />

      {/* 主内容区 */}
      {state.phase === "breakthrough" ? (
        <BreakthroughPanel />
      ) : currentEvent ? (
        <EventCard event={currentEvent} onChoose={(option) => handleEventChoice(option)} />
      ) : state.injury === "dying" ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ backgroundColor: "#111a16", border: "1px solid #dc262644" }}
        >
          <div className="text-2xl mb-3">💀</div>
          <div className="font-serif font-bold mb-2" style={{ color: "#ef4444" }}>濒死状态</div>
          <p className="text-xs leading-relaxed" style={{ color: "#6a4040" }}>
            你已濒临陨落，无法进行任何主动行动。<br />请打开储物袋使用养伤丹治疗。
          </p>
        </div>
      ) : (
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}>

          {/* 主要行动 */}
          <div className="flex flex-col gap-2.5 mb-4">
            <button
              onClick={handleNextEvent}
              className="btn-primary py-3 rounded-xl text-sm font-medium"
            >
              寻求机缘
            </button>

            {/* 闭关三档 */}
            <div className="flex gap-2">
              {(["short", "mid", "long"] as const).map((d) => {
                const realm = getRealmConfig(state.realmSlug);
                const cost = realm.retreatCost[d];
                const xpGain = realm.retreatXp[d];
                const label = d === "short" ? "短期" : d === "mid" ? "中期" : "长期";
                return (
                  <button
                    key={d}
                    onClick={() => handleRetreat(d)}
                    className="flex-1 py-2.5 rounded-xl text-xs btn-secondary flex flex-col items-center gap-0.5"
                  >
                    <span>闭关{label}</span>
                    <span style={{ color: "#4a6a58" }}>{cost}年</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 分割线 */}
          <div style={{ borderTop: "1px solid #1a2820", marginBottom: 16 }} />

          {/* 次要行动 */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setShowMarket(true)}
                className="flex-1 btn-secondary py-2.5 rounded-xl text-sm"
              >
                前往灵市
              </button>
              <button
                onClick={() => {
                  setBattleEnemy(pickBattleEnemy(state.realmSlug));
                  setShowBattle(true);
                }}
                className="flex-1 btn-secondary py-2.5 rounded-xl text-sm"
              >
                外出历练
              </button>
            </div>

            {state.sectPath === null && (
              <button
                onClick={() => setShowSectChoice(true)}
                className="w-full py-2.5 rounded-xl text-sm"
                style={{ backgroundColor: "#0e1a14", border: "1px solid #4ade9a33", color: "#4ade9a" }}
              >
                选择修仙道路
              </button>
            )}
          </div>

          {/* 冲关/飞升 —— 修为≥90才显示，单独一块 */}
          {state.xp >= 90 && (
            <>
              <div style={{ borderTop: "1px solid #1a2820", margin: "16px 0" }} />
              {state.realmSlug === "huashen" ? (
                <button
                  onClick={handleAscend}
                  className="w-full py-3.5 rounded-xl text-sm font-bold tracking-widest"
                  style={{ backgroundColor: "#d4a843", color: "#0a0e0d", letterSpacing: "0.1em" }}
                >
                  ✦ 飞升灵界
                </button>
              ) : (
                <button
                  onClick={() => dispatch({ type: "ATTEMPT_BREAKTHROUGH" })}
                  className="w-full py-3 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#16140a", border: "1px solid #d4a84366", color: "#d4a843" }}
                >
                  冲关 → {NEXT_REALM_NAMES[state.realmSlug]}
                </button>
              )}
            </>
          )}
        </div>
      )}


      {showMarket && <MarketModal onClose={() => setShowMarket(false)} />}

      {/* 小境界突破提示 */}
      {subRealmNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setSubRealmNotice(null)}
        >
          <div
            className="w-full max-w-xs rounded-2xl px-6 py-5 text-center"
            style={{ backgroundColor: "#111a16", border: "1px solid #d4a84344" }}
          >
            <div className="text-base mb-1" style={{ color: "#d4a843" }}>✦</div>
            <div className="font-serif font-bold mb-2" style={{ color: "#d4a843" }}>
              {subRealmNotice.title}
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: "#b8ccc2" }}>
              {subRealmNotice.desc}
            </p>
            <button
              onClick={() => setSubRealmNotice(null)}
              className="text-xs px-4 py-1.5 rounded-full"
              style={{ backgroundColor: "#1a2820", border: "1px solid #d4a84333", color: "#d4a843" }}
            >
              知晓了
            </button>
          </div>
        </div>
      )}

      {/* 事件结果弹窗 */}
      {eventResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
          >
            {/* 标题 */}
            <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #1a2820" }}>
              <div className="text-xs mb-1" style={{ color: "#4a6a58" }}>{eventResult.eventTitle}</div>
              <div className="text-sm font-medium" style={{ color: "#e8f0ec" }}>
                「{eventResult.optionText}」
              </div>
            </div>

            {/* 叙事 */}
            <div className="px-5 py-4">
              {(() => {
                const tone = eventResult.narrativeTone;
                const cfg = {
                  good:    { icon: "✦", color: "#4ade9a", bg: "#16140a", border: "#d4a84333" },
                  bad:     { icon: "◆", color: "#ef4444", bg: "#1a0a0a", border: "#ef444433" },
                  mixed:   { icon: "◈", color: "#4ade9a", bg: "#0e1a14", border: "#4ade9a33" },
                  neutral: { icon: "·", color: "#6a8878", bg: "#0e1610", border: "#1a2820" },
                }[tone];
                return (
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
                    style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
                  >
                    <span className="text-lg flex-shrink-0" style={{ color: cfg.color }}>{cfg.icon}</span>
                    <p className="text-sm font-medium leading-relaxed" style={{ color: cfg.color }}>
                      {eventResult.narrative}
                    </p>
                  </div>
                );
              })()}

              {/* 效果明细 */}
              {eventResult.lines.length > 0 && (
                <div className="flex flex-col gap-2">
                  {eventResult.lines.map((line, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm">
                      <span style={{ color: line.positive ? "#4ade9a" : "#ef4444", flexShrink: 0, marginTop: 1 }}>
                        {line.icon}
                      </span>
                      <span style={{ color: line.positive ? "#b8ccc2" : "#c08080" }}>
                        {line.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {eventResult.lines.length === 0 && (
                <div className="text-xs" style={{ color: "#4a6a58" }}>此行无任何收获与损失。</div>
              )}
            </div>

            {/* 关闭按钮 */}
            <div className="px-5 pb-5">
              <button
                onClick={() => setEventResult(null)}
                className="w-full py-3 rounded-xl text-sm font-medium btn-secondary"
              >
                继续修行
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 道具获得 Toast */}
      <div className="fixed top-4 left-0 right-0 flex flex-col items-center gap-2 z-[60] pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="px-4 py-2.5 rounded-xl text-sm font-medium animate-[slideDown_0.3s_ease-out]"
            style={{
              backgroundColor: "#1a2820",
              border: "1px solid #4ade9a55",
              color: "#e8f0ec",
              boxShadow: "0 4px 20px rgba(74,222,154,0.15)",
            }}
          >
            <span style={{ color: "#4ade9a" }}>✦ 获得道具</span>
            <span className="mx-2" style={{ color: "#6a8878" }}>·</span>
            <span>{toast.name}</span>
            {toast.count > 1 && (
              <span className="ml-1" style={{ color: "#4ade9a" }}>×{toast.count}</span>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
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
      </div> {/* 中间主内容结束 */}

      {/* 右侧：玩法说明 + 修行记录 */}
      <div className="w-60 flex-shrink-0 flex flex-col gap-3">

        {/* 上方 2/5：玩法说明 */}
        <div className="rounded-2xl overflow-hidden flex flex-col" style={{ flex: "2", backgroundColor: "#111a16", border: "1px solid #1a2820" }}>
          <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid #1a2820" }}>
            <span className="text-sm font-medium font-serif" style={{ color: "#e8f0ec" }}>玩法说明</span>
          </div>
          <div className="overflow-y-auto px-4 py-3 flex flex-col gap-3 flex-1">
            {[
              { icon: "◈", title: "寻求机缘", desc: "随机触发一个事件，消耗寿命并增加修为。选择不同选项影响结局。" },
              { icon: "◎", title: "闭关修炼", desc: "短期可治轻伤。三档消耗不同寿命，增加修为。每年自然获得 20-30 灵石。" },
              { icon: "⚔", title: "外出历练", desc: "触发战斗，3回合决策定胜负。胜可获灵石，败则受伤。" },
              { icon: "✦", title: "前往灵市", desc: "随机展示3件商品，刷新免费。稀世丹药偶尔出现，价格极高。" },
              { icon: "↑", title: "冲关突破", desc: "修为≥90%可冲关。消耗当前寿命上限2%，丹药和阵法可提升成功率。失败积累经验。" },
              { icon: "∞", title: "因果链", desc: "某些选择会埋下因果，日后触发回报或报复。台词有暗示，留意细节。" },
            ].map(item => (
              <div key={item.title} className="flex gap-2">
                <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: "#4a6a58" }}>{item.icon}</span>
                <div>
                  <div className="text-xs font-medium mb-0.5" style={{ color: "#8a9a90" }}>{item.title}</div>
                  <div className="leading-relaxed" style={{ color: "#4a6a58", fontSize: "10px" }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 下方 3/5：修行记录 */}
        <div className="rounded-2xl overflow-hidden flex flex-col" style={{ flex: "3", backgroundColor: "#111a16", border: "1px solid #1a2820" }}>
          <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid #1a2820" }}>
            <span className="text-sm font-medium font-serif" style={{ color: "#e8f0ec" }}>修行记录</span>
          </div>
          {log.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-xs" style={{ color: "#4a6a58" }}>尚无记录</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
              {log.map((entry, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: i === 0 ? "#4ade9a" : "#2a3828" }} />
                    <span style={{ color: "#4a6a58", fontSize: "10px" }}>
                      寿元第 {entry.age} 年
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed pl-2.5"
                    style={{ color: i === 0 ? "#8a9a90" : "#3a4a40", borderLeft: `1px solid ${i === 0 ? "#2a3828" : "#1a2820"}` }}>
                    {entry.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default function GamePlayPage() {
  return <GamePlay />;
}
