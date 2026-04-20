export type SpiritRootType = "tianling" | "shuang" | "san" | "wei";
export type RealmSlug = "lianqi" | "zhuji" | "jiedan" | "yuanying" | "huashen";
export type SectPath = "zhengdao" | "modao" | "sanxiu";
export type InjuryLevel = "none" | "light" | "heavy" | "dying";
export type ItemId =
  | "yangshang_dan" | "huixue_dan" | "juqi_dan" | "yanshou_dan"
  | "dixin_dan" | "xuming_dan"
  | "zhuji_dan" | "jucheng_dan" | "butian_dan" | "jiuqu_dan" | "jiangyun_dan"
  | "juling_zhen" | "huti_zhen" | "tiangang_zhen"
  | "yao_dan";

export interface SpiritRoot {
  type: SpiritRootType;
  name: string;
  cultivationMult: number;
  fortuneRange: [number, number];
}

export interface RealmConfig {
  slug: RealmSlug;
  name: string;
  normalLifespan: number;
  limitLifespan: number;
  eventCost: { min: number; max: number };
  dungeonCost: { min: number; max: number };
  battleCost: { min: number; max: number };
  retreatCost: { short: number; mid: number; long: number };
  retreatXp: { short: number; mid: number; long: number };
  breakthroughRate: number;
  failDeathRate: number;
  breakthroughCost: number;
}

export interface ItemConfig {
  id: ItemId;
  name: string;
  category: "mechanism" | "breakthrough" | "array";
  description: string;
  buyPrice: number | null;
  sellPrice: number | null;
  effect: ItemEffect;
}

export type ItemEffect =
  | { type: "heal_injury" }
  | { type: "add_xp"; amount: number }
  | { type: "add_xp_flat"; amount: number }
  | { type: "add_lifespan"; amount: number }
  | { type: "clear_emotion" }
  | { type: "auto_save" }
  | { type: "breakthrough_bonus"; realmFrom: RealmSlug; bonus: number }
  | { type: "heart_demon_bonus"; bonus: number }
  | { type: "retreat_xp_bonus"; mult: number; breakthrough_bonus: number; dungeon_safe: boolean };

export type Inventory = Partial<Record<ItemId, number>>;

export interface EmotionState {
  positive: number;
  negative: number;
}

export interface Enemy {
  id: string;
  name: string;
  realmSlug: RealmSlug;
  sourceEventId: string;
}

export interface GameState {
  fortune: number;
  spiritRoot: SpiritRoot;
  realmSlug: RealmSlug;
  xp: number;
  lifespan: number;
  lifespanMax: number;
  lingshi: number;
  inventory: Inventory;
  injury: InjuryLevel;
  sectPath: SectPath | null;
  emotion: EmotionState;
  enemies: Enemy[];
  fate: number;
  rootIntact: boolean;
  rootDamageCount: number;
  breakthroughExp: number;
  phase: "gate" | "playing" | "breakthrough" | "ended";
  endingType: "ascend" | "death_battle" | "death_heart" | "death_break" | "natural" | "ascend_fail" | null;
  eventHistory: string[];
}

export type GameAction =
  | { type: "START_GAME"; spiritRoot: SpiritRoot; fortune: number }
  | { type: "CONSUME_LIFESPAN"; years: number }
  | { type: "ADD_XP"; points: number }
  | { type: "ADD_LINGSHI"; amount: number }
  | { type: "ADD_ITEM"; itemId: ItemId; count: number }
  | { type: "USE_ITEM"; itemId: ItemId }
  | { type: "REMOVE_ITEM"; itemId: ItemId }
  | { type: "SET_INJURY"; level: InjuryLevel }
  | { type: "ADD_EMOTION"; positive: number; negative: number }
  | { type: "ADD_ENEMY"; enemy: Enemy }
  | { type: "REMOVE_ENEMY"; enemyId: string }
  | { type: "RECORD_EVENT"; eventId: string }
  | { type: "ATTEMPT_BREAKTHROUGH" }
  | { type: "BREAKTHROUGH_SUCCESS" }
  | { type: "BREAKTHROUGH_FAIL" }
  | { type: "END_GAME"; endingType: GameState["endingType"] }
  | { type: "SET_SECT_PATH"; sectPath: SectPath }
  | { type: "APPLY_MODAO_PENALTY" };

export interface GameEvent {
  id: string;
  realmSlug: RealmSlug;
  type: "passive" | "active";
  category: "normal" | "karma" | "dungeon" | "battle";
  title: string;
  description: string;
  options: EventOption[];
}

export interface EventOption {
  text: string;
  requires?: { itemId?: ItemId; lingshi?: number };
  effects: EventEffect[];
}

export type EventEffect =
  | { type: "lingshi"; amount: number }
  | { type: "xp"; amount: number }
  | { type: "item"; itemId: ItemId; count: number }
  | { type: "injury"; level: InjuryLevel }
  | { type: "emotion"; positive?: number; negative?: number }
  | { type: "fate"; amount: number }
  | { type: "add_enemy"; enemyId: string }
  | { type: "trigger_karma"; karmaId: string };
