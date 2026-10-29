type SpiritRootType = "tianling" | "shuang" | "san" | "wei";
export type RealmSlug = "lianqi" | "zhuji" | "jiedan" | "yuanying" | "huashen";
export type SectPath = "zhengdao" | "modao" | "sanxiu";
type InjuryLevel = "none" | "light" | "heavy" | "dying";
export type HeartIntent = "longevity" | "revenge" | "guard" | "freedom";
export type FocusId = "cultivate" | "roam" | "craft" | "sect" | "bond" | "heal";
export type RelationKind = "master" | "peer" | "rival" | "kin" | "companion" | "disciple";
export type ProphecyVerdict = "fulfilled" | "defied" | "unanswered";
export type RunMode = "free" | "daily";
export type LifeOathStatus = "fulfilled" | "broken" | "unfinished";
export type NarrativeAxis =
  | "dao"
  | "compassion"
  | "ambition"
  | "guile"
  | "ruthless"
  | "freedom"
  | "loyalty"
  | "attachment";
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
  breakthroughRate: number;
  failDeathRate: number;
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

type ItemEffect =
  | { type: "heal_injury" }
  | { type: "add_xp"; amount: number }
  | { type: "add_xp_flat"; amount: number }
  | { type: "add_lifespan"; amount: number }
  | { type: "clear_emotion" }
  | { type: "auto_save" }
  | { type: "breakthrough_bonus"; realmFrom: RealmSlug; bonus: number }
  | { type: "heart_demon_bonus"; bonus: number }
  | { type: "retreat_xp_bonus"; mult: number; breakthrough_bonus: number };

export type Inventory = Partial<Record<ItemId, number>>;

interface EmotionState {
  positive: number;
  negative: number;
}

export interface Enemy {
  id: string;
  name: string;
  realmSlug: RealmSlug;
  sourceEventId: string;
}

export interface NarrativeTag {
  id: string;
  label: string;
  strength: number;
  sourceEventId: string;
  sinceTurn: number;
}

export interface FateThreadState {
  threadId: string;
  stage: number;
  status: "open" | "resolved" | "broken";
  startedTurn: number;
  lastAdvancedTurn: number;
  resolution?: string;
}

export interface ChoiceMemory {
  turn: number;
  eventId: string;
  optionIndex: number;
  eventTitle: string;
  optionText: string;
  outcomeText: string;
  realmSlug: RealmSlug;
}

export interface NarrativeState {
  axes: Record<NarrativeAxis, number>;
  tags: Record<string, NarrativeTag>;
  threads: Record<string, FateThreadState>;
  memories: ChoiceMemory[];
  titles: string[];
  scars: string[];
}

export interface EndingSummary {
  archetypeId: string;
  family: GameState["endingType"];
  title: string;
  subtitle: string;
  narrative: string;
  epitaph: string;
  dominantAxes: NarrativeAxis[];
  resolvedThreads: string[];
  openThreads: string[];
  keyMemory?: string;
  signature: string;
  finalAge?: number;
  realmSlug?: RealmSlug;
  heartIntent?: HeartIntent | null;
  prophecyText?: string;
  prophecyVerdict?: ProphecyVerdict;
  textureAxes?: Record<string, string>;
  relationEpitaphs?: string[];
  brokenThreads?: string[];
  achievements?: string[];
  obsessions?: ObsessionOption[];
  lifeNumber?: number;
  lifeOathTitle?: string;
  lifeOathText?: string;
  lifeOathStatus?: LifeOathStatus;
  celestialName?: string;
}

export interface RelationState {
  id: string;
  name: string;
  kind: RelationKind;
  title: string;
  affinity: number;
  trust: number;
  status: "active" | "estranged" | "dead" | "lost";
  lastInteractionStage: number;
  tags: string[];
  memory?: string;
}

type TimelineKind =
  | "life"
  | "focus"
  | "choice"
  | "relation"
  | "thread"
  | "breakthrough"
  | "death";

export interface TimelineEntry {
  id: string;
  stage: number;
  age: number;
  kind: TimelineKind;
  title: string;
  text: string;
  accent?: "jade" | "gold" | "red" | "mist";
  eventId?: string;
  threadId?: string;
  relationId?: string;
}

export interface StageSettlement {
  stage: number;
  fromAge: number;
  toAge: number;
  years: number;
  focusId: FocusId;
  headline: string;
  lines: string[];
  eventDue: boolean;
  breakthroughReady: boolean;
}

export interface ProphecyConfig {
  id: string;
  text: string;
  axis: NarrativeAxis;
  title: string;
}

export interface FocusConfig {
  id: FocusId;
  name: string;
  short: string;
  description: string;
  benefit: string;
  cost: string;
  color: string;
  icon: string;
  xpMult: number;
  stoneMult: number;
  fateDelta: number;
  heal: number;
  risk: number;
  relationDrift: Partial<Record<RelationKind, number>>;
}

export interface ObsessionOption {
  id: string;
  title: string;
  text: string;
  kind: "person" | "place" | "truth" | "power" | "dao";
}

export interface LifeArchive {
  id: string;
  lifeNumber: number;
  completedAt: string;
  name: string;
  finalAge: number;
  realmSlug: RealmSlug;
  endingType: GameState["endingType"];
  endingTitle: string;
  heartIntent: HeartIntent | null;
  prophecyId: string;
  prophecyText: string;
  prophecyVerdict: ProphecyVerdict;
  dominantAxes: NarrativeAxis[];
  textureAxes: Record<string, string>;
  resolvedThreadIds: string[];
  brokenThreadIds: string[];
  relationEpitaphs: string[];
  keyMemories: string[];
  karmaMarks: string[];
  obsessions: ObsessionOption[];
  selectedObsession?: ObsessionOption;
  signature: string;
  lifeOathId?: string;
  lifeOathStatus?: LifeOathStatus;
  celestialName?: string;
  runMode?: RunMode;
}

export interface FateAtlasEntry {
  threadId: string;
  encountered: boolean;
  resolved: boolean;
  broken: boolean;
  lastLife: number;
  resolution?: string;
}

export interface MetaState {
  schemaVersion: number;
  lives: LifeArchive[];
  selectedObsession?: ObsessionOption;
  fateAtlas?: Record<string, FateAtlasEntry>;
}

export interface CelestialConfig {
  id: string;
  name: string;
  epithet: string;
  description: string;
  color: string;
  categoryWeights: Partial<Record<GameEvent["category"], number>>;
}

export interface LifeOathConfig {
  id: string;
  title: string;
  text: string;
  short: string;
  icon: string;
  color: string;
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
  runSeed: number;
  turn: number;
  narrative: NarrativeState;
  endingSummary: EndingSummary | null;
  runMode: RunMode;
  dailyKey?: string;
  celestialId: string;
  lifeOathId: string | null;
  lifeOathSkipped: boolean;
  age: number;
  stage: number;
  stageFocus: FocusId | null;
  focusHistory: Array<{ stage: number; focusId: FocusId; fromAge: number; toAge: number }>;
  lastSettlement: StageSettlement | null;
  resolvedEventStage: number | null;
  relations: Record<string, RelationState>;
  timeline: TimelineEntry[];
  flags: Record<string, boolean | number | string>;
  lifeThreads: string[];
  heartIntent: HeartIntent | null;
  prophecy: ProphecyConfig;
  meta: MetaState;
  archived: boolean;
  lifeNumber: number;
  characterName: string;
}

export type GameAction =
  | { type: "START_GAME"; spiritRoot: SpiritRoot; fortune: number; seed?: number; runMode?: RunMode; dailyKey?: string; celestialId?: string }
  | { type: "CONSUME_LIFESPAN"; years: number }
  | { type: "ADD_XP"; points: number }
  | { type: "ADD_LINGSHI"; amount: number }
  | { type: "ADD_ITEM"; itemId: ItemId; count: number }
  | { type: "USE_ITEM"; itemId: ItemId }
  | { type: "REMOVE_ITEM"; itemId: ItemId }
  | { type: "SET_INJURY"; level: InjuryLevel }
  | { type: "ADD_EMOTION"; positive: number; negative: number }
  | { type: "ADD_FATE"; amount: number }
  | { type: "ADD_ENEMY"; enemy: Enemy }
  | { type: "REMOVE_ENEMY"; enemyId: string }
  | { type: "RECORD_EVENT"; eventId: string; threadId?: string }
  | {
      type: "APPLY_NARRATIVE";
      record: ChoiceMemory;
      axes?: Partial<Record<NarrativeAxis, number>>;
      tags?: Array<{ id: string; label: string; strength?: number }>;
      threadUpdate?: {
        threadId: string;
        action: "advance" | "resolve" | "break";
        resolution?: string;
      };
    }
  | { type: "ATTEMPT_BREAKTHROUGH" }
  | { type: "CANCEL_BREAKTHROUGH" }
  | { type: "BREAKTHROUGH_SUCCESS" }
  | { type: "BREAKTHROUGH_FAIL" }
  | { type: "END_GAME"; endingType: GameState["endingType"] }
  | { type: "SET_SECT_PATH"; sectPath: SectPath }
  | { type: "APPLY_MODAO_PENALTY" }
  | { type: "HYDRATE_RUN"; state: GameState }
  | { type: "SET_HEART_INTENT"; intent: HeartIntent }
  | { type: "SET_LIFE_OATH"; oathId: string | null }
  | { type: "SET_STAGE_FOCUS"; focusId: FocusId }
  | { type: "ADVANCE_STAGE" }
  | { type: "ADD_TIMELINE"; entry: Omit<TimelineEntry, "id" | "stage" | "age"> & { id?: string; stage?: number; age?: number } }
  | { type: "UPDATE_RELATION"; kind: RelationKind; affinity?: number; trust?: number; status?: RelationState["status"]; memory?: string; tag?: string }
  | { type: "SET_FLAG"; key: string; value: boolean | number | string }
  | { type: "COMMIT_LIFE" }
  | { type: "SET_OBSESSION"; obsession: ObsessionOption };

interface FateThreadOption {
  text: string;
  outcomeText: string;
  effects: EventEffect[];
  narrative?: {
    axes?: Partial<Record<NarrativeAxis, number>>;
    tags?: Array<{ id: string; label: string; strength?: number }>;
    memory?: string;
    threadResult?: string;
    threadAction?: "advance" | "resolve" | "break";
  };
}

interface FateThreadStage {
  description: string;
  options: FateThreadOption[];
}

export interface FateThreadConfig {
  id: string;
  title: string;
  theme: string;
  stageTitles: string[];
  stages: FateThreadStage[];
}

export interface GameEvent {
  id: string;
  realmSlug: RealmSlug;
  category: "normal" | "karma" | "dungeon" | "battle";
  title: string;
  description: string;
  options: EventOption[];
  story?: {
    threadId: string;
    threadTitle: string;
    stage: number;
    stageCount: number;
  };
  condition?: EventCondition;
  weight?: number;
  once?: boolean;
  cooldownStages?: number;
  priority?: number;
  source?: "base" | "life" | "fate";
  requiresKarma?: string;
  requiresSect?: boolean;
}

export interface EventCondition {
  minAge?: number;
  maxAge?: number;
  minStage?: number;
  maxStage?: number;
  realms?: RealmSlug[];
  focusAny?: FocusId[];
  axes?: Partial<Record<NarrativeAxis, { min?: number; max?: number }>>;
  tagsAny?: string[];
  tagsAll?: string[];
  scarsAny?: string[];
  relationsAny?: Array<{ kind: RelationKind; minAffinity?: number; maxAffinity?: number; minTrust?: number; maxTrust?: number; status?: RelationState["status"] }>;
  flags?: Record<string, boolean | number | string>;
}

export interface EventOption {
  text: string;
  requires?: { itemId?: ItemId; lingshi?: number };
  effects: EventEffect[];
  outcomeText?: string;
  narrative?: {
    axes?: Partial<Record<NarrativeAxis, number>>;
    tags?: Array<{ id: string; label: string; strength?: number }>;
    memory?: string;
    threadResult?: string;
    threadAction?: "advance" | "resolve" | "break";
  };
}

export type EventEffect =
  | { type: "lingshi"; amount: number }
  | { type: "xp"; amount: number }
  | { type: "item"; itemId: ItemId; count: number }
  | { type: "injury"; level: InjuryLevel }
  | { type: "emotion"; positive?: number; negative?: number }
  | { type: "fate"; amount: number }
  | { type: "add_enemy"; enemyId: string; name?: string }
  | { type: "trigger_karma"; karmaId: string }
  | { type: "relation"; kind: RelationKind; affinity?: number; trust?: number; status?: RelationState["status"]; memory?: string; tag?: string }
  | { type: "set_flag"; key: string; value: boolean | number | string }
  | { type: "age"; years: number };
