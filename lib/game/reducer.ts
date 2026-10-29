import { calcXpGain, getRealmConfig } from "@/lib/game/engine";
import { recordLifeInAtlas } from "@/lib/game/atlas";
import { getDailyCelestial } from "@/lib/game/daily";
import { getAutoSaveItem, ITEM_MAP } from "@/lib/game/items";
import { REALM_ORDER } from "@/lib/game/labels";
import { advanceStage, applyHeartIntent } from "@/lib/game/lifecycle";
import {
  applyNarrativeUpdate,
  buildEndingSummary,
  buildObsessions,
  buildRelationEpitaphs,
  computeTextureAxes,
  createEmptyNarrativeState,
  getThreadTitle,
  pickLifeThreads,
  pickProphecy,
  registerThread,
} from "@/lib/game/narrative";
import { createRandom } from "@/lib/game/random";
import { createCharacterName, createInitialRelations } from "@/lib/game/relations";
import type { GameAction, GameState, LifeArchive, MetaState, SpiritRoot } from "@/types/game";

type RealmOrderSlug = (typeof REALM_ORDER)[number];

export const META_SCHEMA_VERSION = 3;
export const EMPTY_META: MetaState = { schemaVersion: META_SCHEMA_VERSION, lives: [], fateAtlas: {} };

function nextRealm(current: string): RealmOrderSlug | null {
  const idx = REALM_ORDER.indexOf(current as RealmOrderSlug);
  return idx >= 0 && idx < REALM_ORDER.length - 1 ? REALM_ORDER[idx + 1] : null;
}

function finishGame(
  state: GameState,
  endingType: NonNullable<GameState["endingType"]>
): GameState {
  const ended: GameState = { ...state, phase: "ended", endingType };
  return { ...ended, endingSummary: buildEndingSummary(ended) };
}

function appendTimeline(
  state: GameState,
  entry: Omit<GameState["timeline"][number], "id" | "stage" | "age"> & { id?: string; stage?: number; age?: number }
): GameState["timeline"] {
  return [
    ...state.timeline,
    {
      ...entry,
      id: entry.id ?? `${entry.kind}-${state.stage}-${state.timeline.length}-${state.runSeed}`,
      stage: entry.stage ?? state.stage,
      age: entry.age ?? state.age,
    },
  ].slice(-120);
}

export function createInitialState(
  spiritRoot: SpiritRoot,
  fortune: number,
  meta: MetaState = EMPTY_META,
  seed?: number,
  options: { runMode?: GameState["runMode"]; dailyKey?: string; celestialId?: string } = {}
): GameState {
  const realm = getRealmConfig("lianqi");
  const runSeed = seed != null ? seed >>> 0 : (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
  const celestialId = options.celestialId ?? getDailyCelestial(options.dailyKey).id;
  const age = 12;
  const prophecy = pickProphecy(runSeed);
  const inheritedTag = meta.selectedObsession?.kind === "person" ? `前世执念 · ${meta.selectedObsession.title}` : undefined;
  const relations = createInitialRelations(createRandom(runSeed, "relations"), inheritedTag);
  const characterName = createCharacterName(createRandom(runSeed, "name"));
  const lifeNumber = meta.lives.length + 1;
  const timeline = [{
    id: `birth-${runSeed}`,
    stage: 0,
    age,
    kind: "life" as const,
    title: "灵根初显",
    text: meta.selectedObsession
      ? `你在十二岁那年踏入仙途。心里有一件前世没有放下的事：${meta.selectedObsession.title}。`
      : "你在十二岁那年踏入仙途。此后的路，尚未有人替你写好。",
    accent: "jade" as const,
  }];

  return {
    fortune,
    spiritRoot,
    realmSlug: "lianqi",
    xp: 0,
    lifespan: Math.max(1, realm.normalLifespan - age),
    lifespanMax: realm.normalLifespan,
    lingshi: 0,
    inventory: {},
    injury: "none",
    sectPath: null,
    emotion: { positive: 0, negative: 0 },
    enemies: [],
    fate: 50,
    rootIntact: true,
    rootDamageCount: 0,
    breakthroughExp: 0,
    phase: "playing",
    endingType: null,
    eventHistory: [],
    runSeed,
    turn: 0,
    narrative: createEmptyNarrativeState(),
    endingSummary: null,
    runMode: options.runMode ?? "free",
    dailyKey: options.dailyKey,
    celestialId,
    lifeOathId: null,
    lifeOathSkipped: false,
    age,
    stage: 0,
    stageFocus: null,
    focusHistory: [],
    lastSettlement: null,
    resolvedEventStage: null,
    relations,
    timeline,
    flags: {},
    lifeThreads: pickLifeThreads(runSeed, 4),
    heartIntent: null,
    prophecy,
    meta: {
      ...meta,
      schemaVersion: META_SCHEMA_VERSION,
      lives: [...meta.lives],
      fateAtlas: { ...(meta.fateAtlas ?? {}) },
    },
    archived: false,
    lifeNumber,
    characterName,
  };
}

function buildArchive(state: GameState): LifeArchive {
  const summary = state.endingSummary ?? buildEndingSummary(state);
  const open = Object.values(state.narrative.threads).filter((thread) => thread.status === "open");
  const broken = Object.values(state.narrative.threads).filter((thread) => thread.status === "broken");
  return {
    id: summary.signature,
    lifeNumber: state.lifeNumber,
    completedAt: new Date().toISOString(),
    name: state.characterName,
    finalAge: state.age,
    realmSlug: state.realmSlug,
    endingType: state.endingType,
    endingTitle: summary.title,
    heartIntent: state.heartIntent,
    prophecyId: state.prophecy.id,
    prophecyText: state.prophecy.text,
    prophecyVerdict: summary.prophecyVerdict ?? "unanswered",
    dominantAxes: summary.dominantAxes,
    textureAxes: summary.textureAxes ?? computeTextureAxes(state.narrative),
    resolvedThreadIds: summary.resolvedThreads,
    brokenThreadIds: summary.brokenThreads ?? broken.map((thread) => thread.threadId),
    relationEpitaphs: summary.relationEpitaphs ?? buildRelationEpitaphs(state),
    keyMemories: state.narrative.memories.slice(-5).map((memory) => memory.outcomeText),
    karmaMarks: [...open.map((thread) => `未竟：${getThreadTitle(thread.threadId)}`), ...broken.map((thread) => `断裂：${getThreadTitle(thread.threadId)}`)].slice(0, 3),
    obsessions: summary.obsessions ?? buildObsessions(state),
    signature: summary.signature,
  };
}

function rehydrateRelations(state: GameState): GameState {
  const normalizedRelations = Object.values(state.relations ?? {}).reduce<GameState["relations"]>((result, relation) => {
    result[relation.kind] = { ...relation, id: relation.kind };
    return result;
  }, {});
  return {
    ...state,
    relations: normalizedRelations,
    timeline: state.timeline ?? [],
    resolvedEventStage: state.resolvedEventStage ?? null,
    flags: state.flags ?? {},
    focusHistory: state.focusHistory ?? [],
    runMode: state.runMode ?? "free",
    dailyKey: state.dailyKey,
    celestialId: state.celestialId ?? getDailyCelestial().id,
    lifeOathId: state.lifeOathId ?? null,
    lifeOathSkipped: state.lifeOathSkipped ?? false,
    meta: state.meta ? { ...state.meta, fateAtlas: state.meta.fateAtlas ?? {} } : EMPTY_META,
    lifeThreads: state.lifeThreads ?? pickLifeThreads(state.runSeed, 4),
    archived: state.archived ?? false,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return createInitialState(action.spiritRoot, action.fortune, state.meta, action.seed, {
        runMode: action.runMode,
        dailyKey: action.dailyKey,
        celestialId: action.celestialId,
      });

    case "HYDRATE_RUN":
      return rehydrateRelations(action.state);

    case "SET_HEART_INTENT":
      return applyHeartIntent(state, action.intent);

    case "SET_LIFE_OATH":
      return {
        ...state,
        lifeOathId: action.oathId,
        lifeOathSkipped: action.oathId === null,
        timeline: appendTimeline(state, {
          kind: "life",
          title: action.oathId ? "立下命誓" : "不立命誓",
          text: action.oathId ? "你把一个愿望留在了这一世，至于能不能做到，要看往后的选择。" : "你没有立誓。此后的路，只凭当下的本心。",
          accent: action.oathId ? "gold" : "mist",
        }),
      };

    case "SET_STAGE_FOCUS":
      if (state.phase !== "playing") return state;
      return {
        ...state,
        stageFocus: action.focusId,
        lastSettlement: null,
      };

    case "ADVANCE_STAGE": {
      if (state.phase !== "playing" || !state.stageFocus) return state;
      const { state: advanced } = advanceStage(state);
      const nextState = advanced.phase === "ended"
        ? { ...advanced, endingSummary: buildEndingSummary(advanced) }
        : advanced;
      return nextState;
    }

    case "CONSUME_LIFESPAN": {
      const newLifespan = Math.max(0, state.lifespan - action.years);
      const newAge = Math.min(state.lifespanMax, state.age + action.years);
      if (newLifespan === 0) return finishGame({ ...state, lifespan: 0, age: newAge }, "natural");
      return { ...state, lifespan: newLifespan, age: newAge };
    }

    case "ADD_XP": {
      const gained = calcXpGain(action.points, state.spiritRoot.cultivationMult, state.xp);
      return { ...state, xp: Math.min(100, state.xp + gained) };
    }

    case "ADD_LINGSHI":
      return { ...state, lingshi: Math.max(0, state.lingshi + action.amount) };

    case "ADD_FATE":
      return { ...state, fate: Math.max(0, Math.min(100, state.fate + action.amount)) };

    case "ADD_ITEM": {
      const current = state.inventory[action.itemId] ?? 0;
      return { ...state, inventory: { ...state.inventory, [action.itemId]: current + action.count } };
    }

    case "USE_ITEM": {
      const count = state.inventory[action.itemId] ?? 0;
      if (count <= 0) return state;
      const item = ITEM_MAP[action.itemId];
      if (!item || item.effect.type === "auto_save") return state;

      let next: GameState = {
        ...state,
        inventory: { ...state.inventory, [action.itemId]: count - 1 },
      };
      const effect = item.effect;

      if (effect.type === "heal_injury") {
        next = { ...next, injury: "none" };
      } else if (effect.type === "add_xp") {
        const gained = calcXpGain(effect.amount, state.spiritRoot.cultivationMult, state.xp);
        next = { ...next, xp: Math.min(100, state.xp + gained) };
      } else if (effect.type === "add_xp_flat") {
        next = { ...next, xp: Math.min(100, state.xp + effect.amount) };
      } else if (effect.type === "add_lifespan") {
        const realm = getRealmConfig(state.realmSlug);
        const newMax = Math.min(realm.limitLifespan, state.lifespanMax + effect.amount);
        const newLifespan = Math.min(newMax, state.lifespan + effect.amount);
        next = { ...next, lifespan: newLifespan, lifespanMax: newMax };
      } else if (effect.type === "clear_emotion") {
        next = { ...next, emotion: { ...state.emotion, negative: 0 } };
      }
      return next;
    }

    case "REMOVE_ITEM": {
      const count = state.inventory[action.itemId] ?? 0;
      if (count <= 0) return state;
      return { ...state, inventory: { ...state.inventory, [action.itemId]: count - 1 } };
    }

    case "SET_INJURY": {
      if (action.level === "dying") {
        const autoSave = getAutoSaveItem(state.inventory);
        if (autoSave) {
          const count = state.inventory[autoSave.id as keyof typeof state.inventory] ?? 0;
          return {
            ...state,
            injury: "heavy",
            rootIntact: false,
            rootDamageCount: state.rootDamageCount + 1,
            inventory: { ...state.inventory, [autoSave.id]: count - 1 },
          };
        }
        return finishGame(state, "death_battle");
      }
      return { ...state, injury: action.level };
    }

    case "ADD_EMOTION": {
      const positive = Math.min(100, Math.max(0, state.emotion.positive + action.positive));
      const negative = Math.min(100, Math.max(0, state.emotion.negative + action.negative));
      return { ...state, emotion: { positive, negative } };
    }

    case "ADD_ENEMY":
      return {
        ...state,
        enemies: state.enemies.some((enemy) => enemy.id === action.enemy.id)
          ? state.enemies.map((enemy) => enemy.id === action.enemy.id ? action.enemy : enemy)
          : [...state.enemies, action.enemy],
      };

    case "REMOVE_ENEMY":
      return { ...state, enemies: state.enemies.filter((enemy) => enemy.id !== action.enemyId) };

    case "RECORD_EVENT": {
      const turn = state.turn + 1;
      const threads = action.threadId ? registerThread(state.narrative.threads, action.threadId, state.stage) : state.narrative.threads;
      return {
        ...state,
        eventHistory: [...state.eventHistory, action.eventId],
        turn,
        narrative: { ...state.narrative, threads },
      };
    }

    case "APPLY_NARRATIVE": {
      const updated = applyNarrativeUpdate(
        state.narrative,
        state.turn,
        action.record,
        action.axes,
        action.tags,
        action.threadUpdate,
        state.stage
      );
      const nextState = { ...state, ...updated, resolvedEventStage: state.stage };
      return nextState.phase === "ended"
        ? { ...nextState, endingSummary: buildEndingSummary(nextState) }
        : nextState;
    }

    case "ADD_TIMELINE":
      return { ...state, timeline: appendTimeline(state, action.entry) };

    case "UPDATE_RELATION": {
      const relation = Object.values(state.relations).find((candidate) => candidate.kind === action.kind);
      if (!relation) return state;
      const affinity = Math.max(-100, Math.min(100, relation.affinity + (action.affinity ?? 0)));
      const trust = Math.max(0, Math.min(100, relation.trust + (action.trust ?? 0)));
      const tags = action.tag && !relation.tags.includes(action.tag) ? [...relation.tags, action.tag] : relation.tags;
      const updated = {
        ...relation,
        affinity,
        trust,
        status: action.status ?? relation.status,
        lastInteractionStage: state.stage,
        tags,
        memory: action.memory ?? relation.memory,
      };
      return {
        ...state,
        relations: { ...state.relations, [relation.id]: updated },
        timeline: appendTimeline(state, {
          kind: "relation",
          title: `${relation.title} · ${relation.name}`,
          text: action.memory ?? (action.affinity && action.affinity > 0 ? "你们之间似乎近了一点。" : action.affinity && action.affinity < 0 ? "你们之间多了一层看不见的隔阂。" : "有些话被留在了那一年。"),
          accent: affinity < 0 ? "red" : "jade",
          relationId: relation.id,
        }),
      };
    }

    case "SET_FLAG":
      return { ...state, flags: { ...state.flags, [action.key]: action.value } };

    case "ATTEMPT_BREAKTHROUGH":
      return { ...state, phase: "breakthrough" };

    case "CANCEL_BREAKTHROUGH":
      return { ...state, phase: "playing" };

    case "BREAKTHROUGH_SUCCESS": {
      const next = nextRealm(state.realmSlug);
      if (!next) return finishGame(state, "ascend");
      const newRealm = getRealmConfig(next);
      return {
        ...state,
        realmSlug: next,
        xp: 0,
        lifespanMax: newRealm.normalLifespan,
        lifespan: Math.max(1, newRealm.normalLifespan - state.age),
        breakthroughExp: 0,
        phase: "playing",
        lastSettlement: null,
        timeline: appendTimeline(state, {
          kind: "breakthrough",
          title: `踏入${newRealm.name}`,
          text: "境界一变，过去那些看似过不去的坎，忽然都成了很小的事。",
          accent: "gold",
        }),
      };
    }

    case "BREAKTHROUGH_FAIL":
      return {
        ...state,
        breakthroughExp: Math.min(15, state.breakthroughExp + 3),
        phase: "playing",
      };

    case "END_GAME":
      return finishGame(state, action.endingType ?? "natural");

    case "SET_SECT_PATH":
      return { ...state, sectPath: action.sectPath };

    case "APPLY_MODAO_PENALTY": {
      const newMax = Math.round(state.lifespanMax * 0.85);
      return { ...state, lifespanMax: newMax, lifespan: Math.min(state.lifespan, Math.max(0, newMax - state.age)) };
    }

    case "COMMIT_LIFE": {
      if (!state.endingSummary || state.archived) return state;
      const archive = buildArchive(state);
      const existing = state.meta.lives.some((life) => life.id === archive.id);
      const lives = existing ? state.meta.lives : [...state.meta.lives, archive].slice(-30);
      return {
        ...state,
        archived: true,
        meta: {
          ...state.meta,
          schemaVersion: META_SCHEMA_VERSION,
          lives,
          fateAtlas: recordLifeInAtlas(state.meta.fateAtlas, state.narrative.threads, state.lifeNumber),
        },
      };
    }

    case "SET_OBSESSION": {
      const lives = state.meta.lives.map((life, index) =>
        index === state.meta.lives.length - 1 ? { ...life, selectedObsession: action.obsession } : life
      );
      return {
        ...state,
        meta: { ...state.meta, selectedObsession: action.obsession, lives },
      };
    }

    default:
      return state;
  }
}
