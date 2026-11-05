import type { FocusId, GameEvent, HeartIntent, RealmSlug } from "@/types/game";

type ActionArtId =
  | "talk"
  | "fight"
  | "travel"
  | "cultivate"
  | "trade"
  | "bond"
  | "heal"
  | "risk"
  | "refuse"
  | "observe";

type EndingArtId =
  | "ascend"
  | "ascend_fail"
  | "natural"
  | "death_battle"
  | "death_heart"
  | "death_break";

export interface SceneArt {
  id: string;
  src: string;
  fallbackSrc?: string;
  label: string;
  accent: string;
  pixelated?: boolean;
}

const SCENES: Record<string, Omit<SceneArt, "src">> = {
  wanderer_debt: { id: "wanderer_debt", label: "雨夜山道", accent: "#d4a843" },
  beast_bond: { id: "beast_bond", label: "山野灵兽", accent: "#6fedb5" },
  ancient_tomb: { id: "ancient_tomb", label: "无主古墓", accent: "#80c8b5" },
  sect_purge: { id: "sect_purge", label: "山门风雨", accent: "#ef6b62" },
  mortal_kin: { id: "mortal_kin", label: "故乡灯火", accent: "#f0c96b" },
  demonic_bargain: { id: "demonic_bargain", label: "黑市禁术", accent: "#ef6b62" },
  sword_grave: { id: "sword_grave", label: "夜半剑冢", accent: "#8bc4ff" },
  pill_toxin: { id: "pill_toxin", label: "丹炉余烬", accent: "#f0c96b" },
  array_legacy: { id: "array_legacy", label: "残阵山河", accent: "#6fedb5" },
  rival_brother: { id: "rival_brother", label: "同门对决", accent: "#ef6b62" },
  master_secret: { id: "master_secret", label: "师尊旧案", accent: "#d4a843" },
  lost_soul: { id: "lost_soul", label: "器中之魂", accent: "#8bc4ff" },
  merchant_ledger: { id: "merchant_ledger", label: "坊市账簿", accent: "#f0c96b" },
  border_war: { id: "border_war", label: "边地狼烟", accent: "#ef6b62" },
  false_accusation: { id: "false_accusation", label: "执法堂旧案", accent: "#8bc4ff" },
  spirit_vein: { id: "spirit_vein", label: "地脉微光", accent: "#6fedb5" },
  ancient_artifact: { id: "ancient_artifact", label: "器灵开价", accent: "#cdb0ff" },
  ascension_choice: { id: "ascension_choice", label: "天门之前", accent: "#cdb0ff" },
  market: { id: "market", label: "人间坊市", accent: "#f0c96b" },
  village: { id: "village", label: "凡俗故乡", accent: "#f0c96b" },
  bonds: { id: "bonds", label: "旧人重逢", accent: "#f09aa8" },
  battle: { id: "battle", label: "生死斗法", accent: "#ef6b62" },
  cave: { id: "cave", label: "洞府静修", accent: "#6fedb5" },
  sea: { id: "sea", label: "乱星海外", accent: "#8bc4ff" },
  tribulation: { id: "tribulation", label: "渡劫之夜", accent: "#cdb0ff" },
  sect: { id: "sect", label: "宗门殿宇", accent: "#6fedb5" },
  ruins: { id: "ruins", label: "上古遗迹", accent: "#80c8b5" },
  medicine: { id: "medicine", label: "丹火药理", accent: "#f0c96b" },
  wilderness: { id: "wilderness", label: "山野独行", accent: "#a4b8ca" },
};

const SCENE_ART_SOURCES: Record<string, string> = {
  wanderer_debt: "/game/scenes/fate/wanderer_debt-1.webp",
  beast_bond: "/game/scenes/fate/beast_bond-1.webp",
  ancient_tomb: "/game/scenes/fate/ancient_tomb-1.webp",
  sect_purge: "/game/scenes/fate/sect_purge-1.webp",
  mortal_kin: "/game/scenes/fate/mortal_kin-1.webp",
  demonic_bargain: "/game/scenes/fate/demonic_bargain-1.webp",
  sword_grave: "/game/scenes/fate/sword_grave-1.webp",
  pill_toxin: "/game/scenes/fate/pill_toxin-1.webp",
  array_legacy: "/game/scenes/fate/array_legacy-1.webp",
  rival_brother: "/game/scenes/fate/rival_brother-1.webp",
  master_secret: "/game/scenes/fate/master_secret-1.webp",
  lost_soul: "/game/scenes/fate/lost_soul-1.webp",
  merchant_ledger: "/game/scenes/fate/merchant_ledger-1.webp",
  border_war: "/game/scenes/fate/border_war-1.webp",
  false_accusation: "/game/scenes/fate/false_accusation-1.webp",
  spirit_vein: "/game/scenes/fate/spirit_vein-1.webp",
  ancient_artifact: "/game/scenes/fate/ancient_artifact-1.webp",
  ascension_choice: "/game/scenes/fate/ascension_choice-1.webp",
  market: "/game/scenes/events/lq_006.webp",
  village: "/game/scenes/events/life_village_famine.webp",
  bonds: "/game/scenes/events/life_friend_wedding.webp",
  battle: "/game/scenes/events/zj_003.webp",
  cave: "/game/scenes/focus/cultivate.webp",
  sea: "/game/scenes/events/life_sea_storm.webp",
  tribulation: "/game/scenes/events/hs_001.webp",
  sect: "/game/scenes/events/lq_014.webp",
  ruins: "/game/scenes/events/jd_004.webp",
  medicine: "/game/scenes/events/lq_007.webp",
  wilderness: "/game/scenes/events/life_lonely_rain.webp",
};

const ACTION_ART: Record<ActionArtId, { src: string; label: string; accent: string }> = {
  talk: { src: "/game/actions/talk.webp", label: "交谈", accent: "#d4a843" },
  fight: { src: "/game/actions/fight.webp", label: "争斗", accent: "#ef6b62" },
  travel: { src: "/game/actions/travel.webp", label: "远行", accent: "#6ea8fe" },
  cultivate: { src: "/game/actions/cultivate.webp", label: "修行", accent: "#6fedb5" },
  trade: { src: "/game/actions/trade.webp", label: "交易", accent: "#f0c96b" },
  bond: { src: "/game/actions/bond.webp", label: "结缘", accent: "#f09aa8" },
  heal: { src: "/game/actions/heal.webp", label: "疗愈", accent: "#80c8b5" },
  risk: { src: "/game/actions/risk.webp", label: "涉险", accent: "#cdb0ff" },
  refuse: { src: "/game/actions/refuse.webp", label: "拒绝", accent: "#8fa79a" },
  observe: { src: "/game/actions/observe.webp", label: "观察", accent: "#a4b8ca" },
};

const INTENT_ART: Record<HeartIntent, { label: string; accent: string; fallback: string }> = {
  longevity: { label: "求长生", accent: "#6fedb5", fallback: "cave" },
  revenge: { label: "求复仇", accent: "#ef6b62", fallback: "battle" },
  guard: { label: "求守护", accent: "#6ea8fe", fallback: "bonds" },
  freedom: { label: "求自在", accent: "#d4a843", fallback: "sea" },
};

const FOCUS_ART: Record<FocusId, { label: string; accent: string; fallback: string }> = {
  cultivate: { label: "苦修", accent: "#6fedb5", fallback: "cave" },
  roam: { label: "游历", accent: "#8bc4ff", fallback: "wilderness" },
  craft: { label: "炼丹阵法", accent: "#f0c96b", fallback: "medicine" },
  sect: { label: "宗门事务", accent: "#6fedb5", fallback: "sect" },
  bond: { label: "人情往来", accent: "#f09aa8", fallback: "bonds" },
  heal: { label: "养伤隐居", accent: "#80c8b5", fallback: "sea" },
};

const ENDING_ART: Record<EndingArtId, { label: string; accent: string; fallback: string }> = {
  ascend: { label: "飞升灵界", accent: "#d4a843", fallback: "ascension_choice" },
  ascend_fail: { label: "天门遗恨", accent: "#8fa79a", fallback: "ascension_choice" },
  natural: { label: "寿尽归尘", accent: "#4ade9a", fallback: "wilderness" },
  death_battle: { label: "斗法陨落", accent: "#ef6b62", fallback: "battle" },
  death_heart: { label: "心魔坐化", accent: "#ef6b62", fallback: "tribulation" },
  death_break: { label: "渡劫成灰", accent: "#ef6b62", fallback: "tribulation" },
};

const FALLBACK_SCENE: Record<RealmSlug, string> = {
  lianqi: "wilderness",
  zhuji: "cave",
  jiedan: "medicine",
  yuanying: "array_legacy",
  huashen: "ascension_choice",
};

const KEYWORD_SCENES: Array<[RegExp, string]> = [
  [/乱星海|海潮|海图|出海|船|岛上|潮水/, "sea"],
  [/灵脉|地脉/, "spirit_vein"],
  [/妖兽|灵兽|兽潮|幼崽|兽群/, "beast_bond"],
  [/古墓|遗迹|秘境|矿洞|地宫|残阵/, "ruins"],
  [/剑冢|旧剑|剑鸣|试锋|剑心/, "sword_grave"],
  [/丹炉|炼丹|药毒|成丹|药库|药师|丹药|灵草|药方/, "medicine"],
  [/坊市|拍卖|商队|账簿|铺子|交易|灵市|护送|灵石|投资/, "market"],
  [/故乡|家书|亲族|村里|凡俗|后人|凡人|城门口/, "village"],
  [/执法|惩戒|长老|宗主|执事|山门|宗门|大殿|审判/, "sect"],
  [/师尊|同门|旧友|道友|弟子|道侣|旧人|人情|婚宴|拜访/, "bonds"],
  [/魔|禁术|反噬|血印|黑册/, "demonic_bargain"],
  [/天文|天门|飞升|灵界|天道/, "ascension_choice"],
  [/天劫|渡劫|雷劫|冲关|突破|走火入魔|瓶颈/, "tribulation"],
  [/战|敌|劫道|突袭|挑战|厮杀|攻打|狼烟|兽潮|魔道大军/, "battle"],
  [/器灵|古器|古鼎|铜镜|残魂|旧器/, "ancient_artifact"],
  [/器中之魂|记忆|识海/, "lost_soul"],
  [/洞府|闭关|修炼|吐纳|吐息|打坐|静修/, "cave"],
];

function makeArtwork(
  id: string,
  src: string,
  label: string,
  accent: string,
  fallbackId: string
): SceneArt {
  const fallback = getSceneById(fallbackId);
  return {
    ...fallback,
    id,
    src,
    fallbackSrc: fallback.src,
    label,
    accent,
    pixelated: false,
  };
}

function getEventFallback(event: GameEvent, realmSlug: RealmSlug): SceneArt {
  const haystack = `${event.id} ${event.title} ${event.description} ${event.category}`;
  for (const [pattern, sceneId] of KEYWORD_SCENES) {
    if (pattern.test(haystack)) return getSceneById(sceneId);
  }
  return getSceneById(FALLBACK_SCENE[realmSlug]);
}

export function getSceneById(id: string): SceneArt {
  const scene = SCENES[id] ?? SCENES.wilderness;
  return {
    ...scene,
    src: SCENE_ART_SOURCES[scene.id] ?? SCENE_ART_SOURCES.wilderness,
    pixelated: false,
  };
}

export function getSceneForEvent(event: GameEvent | null, realmSlug: RealmSlug): SceneArt {
  if (!event) return getSceneById(FALLBACK_SCENE[realmSlug]);

  const fallback = getEventFallback(event, realmSlug);

  if (event.story?.threadId) {
    const stage = Math.max(1, Math.min(event.story.stageCount, event.story.stage || 1));
    return makeArtwork(
      `fate-${event.story.threadId}-${stage}`,
      `/game/scenes/fate/${event.story.threadId}-${stage}.webp`,
      event.story.threadTitle,
      fallback.accent,
      fallback.id
    );
  }

  if (event.id.startsWith("fate:")) {
    const [, threadId, rawStage] = event.id.split(":");
    if (threadId) {
      const stage = Math.max(1, Math.min(3, Number(rawStage) || 1));
      return makeArtwork(
        `fate-${threadId}-${stage}`,
        `/game/scenes/fate/${threadId}-${stage}.webp`,
        fallback.label,
        fallback.accent,
        fallback.id
      );
    }
  }

  if (event.id) {
    return makeArtwork(
      `event-${event.id}`,
      `/game/scenes/events/${event.id}.webp`,
      fallback.label,
      fallback.accent,
      fallback.id
    );
  }

  return fallback;
}

export function getIntentScene(intent: HeartIntent): SceneArt {
  const key = (intent in INTENT_ART ? intent : "longevity") as HeartIntent;
  const art = INTENT_ART[key];
  return makeArtwork(
    `opening-${key}`,
    `/game/scenes/opening/${key}.webp`,
    art.label,
    art.accent,
    art.fallback
  );
}

export function getFocusScene(focusId: FocusId): SceneArt {
  const key = (focusId in FOCUS_ART ? focusId : "cultivate") as FocusId;
  const art = FOCUS_ART[key];
  return makeArtwork(
    `focus-${key}`,
    `/game/scenes/focus/${key}.webp`,
    art.label,
    art.accent,
    art.fallback
  );
}

export function getEndingScene(endingType: string): SceneArt {
  const key = (endingType in ENDING_ART ? endingType : "natural") as EndingArtId;
  const art = ENDING_ART[key];
  return makeArtwork(
    `ending-${key}`,
    `/game/scenes/ending/${key}.webp`,
    art.label,
    art.accent,
    art.fallback
  );
}

export function getActionArt(text: string): { id: ActionArtId; src: string; label: string; accent: string } {
  const rules: Array<[ActionArtId, RegExp]> = [
    ["heal", /疗伤|养伤|治伤|服药|服丹|养病|续命|延寿|恢复/],
    ["fight", /战|击杀|出手|攻击|决战|镇压|斗法|杀|斩|劈|灭|逼问|强行闯|迎战|处决/],
    ["travel", /出海|远行|游历|离开|启程|踏入|进入|探索|下山|动身|前往|追寻/],
    ["cultivate", /修炼|闭关|吐纳|冲关|突破|渡劫|悟道|炼化|打坐|守心|凝聚|参悟/],
    ["trade", /买|卖|交易|灵石|价钱|报酬|收下|借|送|赠|投资|换取|账|委托|取走|拿走|占为己有/],
    ["bond", /救|护|陪|答应|帮助|相信|同门|旧友|师尊|弟子|亲人|家人|故人|人情|等他|等她|同行/],
    ["observe", /留给有缘|不动|原封|打量|查看|辨认/],
    ["risk", /赌|冒险|催火|抢|吞|血|禁术|魔气|强压|硬闯|放手一搏|以命/],
    ["observe", /问|看|观察|调查|查|试探|打听|听|追问|审查|寻找|辨认/],
    ["refuse", /拒绝|不做|不去|不见|沉默|闭门|放手|转身|离开|不争|不插手|无视/],
  ];
  for (const [id, pattern] of rules) {
    if (pattern.test(text)) return { id, ...ACTION_ART[id] };
  }
  return { id: "talk", ...ACTION_ART.talk };
}
