import spiritRootsData from "@/content/game/spirit-roots.json";
import { pickStageEvent } from "@/lib/game/event-pool";
import { FOCUSES } from "@/lib/game/lifecycle";
import { buildEndingSummary, FATE_THREADS } from "@/lib/game/narrative";
import { createInitialState, gameReducer } from "@/lib/game/reducer";
import type {
  EventEffect,
  EventOption,
  GameState,
  HeartIntent,
  SpiritRoot,
} from "@/types/game";

const ROOTS = spiritRootsData as SpiritRoot[];
const INTENTS: HeartIntent[] = ["longevity", "revenge", "guard", "freedom"];

function applySimulatedEffect(state: GameState, effect: EventEffect, eventId: string): GameState {
  switch (effect.type) {
    case "xp":
      return gameReducer(state, { type: "ADD_XP", points: effect.amount });
    case "lingshi":
      return gameReducer(state, { type: "ADD_LINGSHI", amount: effect.amount });
    case "fate":
      return gameReducer(state, { type: "ADD_FATE", amount: effect.amount });
    case "emotion":
      return gameReducer(state, { type: "ADD_EMOTION", positive: effect.positive ?? 0, negative: effect.negative ?? 0 });
    case "injury":
      return gameReducer(state, { type: "SET_INJURY", level: effect.level });
    case "age":
      return gameReducer(state, { type: "CONSUME_LIFESPAN", years: effect.years });
    case "relation":
      return gameReducer(state, {
        type: "UPDATE_RELATION",
        kind: effect.kind,
        affinity: effect.affinity,
        trust: effect.trust,
        status: effect.status,
        memory: effect.memory,
        tag: effect.tag,
      });
    case "set_flag":
      return gameReducer(state, { type: "SET_FLAG", key: effect.key, value: effect.value });
    case "add_enemy":
      return gameReducer(state, {
        type: "ADD_ENEMY",
        enemy: {
          id: effect.enemyId,
          name: effect.name ?? "未名仇家",
          realmSlug: state.realmSlug,
          sourceEventId: eventId,
        },
      });
    case "item":
      return gameReducer(state, { type: "ADD_ITEM", itemId: effect.itemId, count: effect.count });
    default:
      return state;
  }
}

function chooseSimulatedOption(state: GameState, option: EventOption, optionIndex: number, eventId: string, title: string, story?: { threadId: string; stage: number; stageCount: number }): GameState {
  let next = state;
  for (const effect of option.effects) next = applySimulatedEffect(next, effect, eventId);
  const finalStage = story ? story.stage >= story.stageCount : false;
  const scarred = option.narrative?.tags?.some((tag) => tag.id.startsWith("scar.")) ?? false;
  const threadAction = option.narrative?.threadAction ?? (story ? (finalStage ? (scarred ? "break" : "resolve") : "advance") : undefined);
  return gameReducer(next, {
    type: "APPLY_NARRATIVE",
    record: {
      turn: next.turn,
      eventId,
      optionIndex,
      eventTitle: title,
      optionText: option.text,
      outcomeText: option.outcomeText ?? "这一段被写进了一个人的一生。",
      realmSlug: next.realmSlug,
    },
    axes: option.narrative?.axes,
    tags: option.narrative?.tags,
    threadUpdate: story && threadAction
      ? { threadId: story.threadId, action: threadAction, resolution: option.narrative?.threadResult ?? option.outcomeText }
      : undefined,
  });
}

interface LifeSimulationResult {
  state: GameState;
  stages: number;
}

function simulateLife(seed: number, root: SpiritRoot, intent: HeartIntent, maxStages = 60): LifeSimulationResult {
  let state = createInitialState(root, 50 + (seed % 51), undefined, seed);
  state = gameReducer(state, { type: "SET_HEART_INTENT", intent });
  let stages = 0;

  while (state.phase === "playing" && stages < maxStages) {
    if (!state.stageFocus) {
      const focus = FOCUSES[(seed + state.stage * 3) % FOCUSES.length];
      state = gameReducer(state, { type: "SET_STAGE_FOCUS", focusId: focus.id });
    }
    state = gameReducer(state, { type: "ADVANCE_STAGE" });
    stages += 1;
    if (state.phase === "ended") break;

    const event = pickStageEvent(state);
    if (event) {
      state = gameReducer(state, { type: "RECORD_EVENT", eventId: event.id, threadId: event.story?.threadId });
      const optionIndex = event.options.findIndex((option) => !option.requires);
      const index = optionIndex >= 0 ? optionIndex : 0;
      const option = event.options[index];
      if (option) {
        state = chooseSimulatedOption(state, option, index, event.id, event.title, event.story);
      }
    }

    if (state.phase === "ended") break;
    if (state.xp >= 90) {
      if (state.realmSlug === "huashen") {
        state = gameReducer(state, { type: "END_GAME", endingType: "ascend" });
      } else {
        state = gameReducer(state, { type: "ATTEMPT_BREAKTHROUGH" });
        state = gameReducer(state, { type: "BREAKTHROUGH_SUCCESS" });
      }
    }
  }

  if (state.phase !== "ended") {
    state = gameReducer(state, { type: "END_GAME", endingType: "natural" });
  }
  if (!state.endingSummary) {
    state = { ...state, endingSummary: buildEndingSummary(state) };
  }
  return { state, stages };
}

interface BalanceSummary {
  lives: number;
  minAge: number;
  maxAge: number;
  meanAge: number;
  endings: Record<string, number>;
  realms: Record<string, number>;
  roots: Record<string, number>;
  fateSeen: number;
  fateTotal: number;
  invalidLives: number;
}

export function runBalanceSimulation(count = 1000): BalanceSummary {
  const endings: Record<string, number> = {};
  const realms: Record<string, number> = {};
  const rootCounts: Record<string, number> = {};
  const fateSeen = new Set<string>();
  let minAge = Infinity;
  let maxAge = 0;
  let totalAge = 0;
  let invalid = 0;

  for (let index = 0; index < count; index += 1) {
    const root = ROOTS[index % ROOTS.length];
    const intent = INTENTS[index % INTENTS.length];
    const { state } = simulateLife(100_000 + index * 7919, root, intent);
    totalAge += state.age;
    minAge = Math.min(minAge, state.age);
    maxAge = Math.max(maxAge, state.age);
    endings[state.endingType ?? "unknown"] = (endings[state.endingType ?? "unknown"] ?? 0) + 1;
    realms[state.realmSlug] = (realms[state.realmSlug] ?? 0) + 1;
    rootCounts[root.type] = (rootCounts[root.type] ?? 0) + 1;
    Object.keys(state.narrative.threads).forEach((threadId) => fateSeen.add(threadId));
    if (
      !state.endingSummary ||
      state.age < 0 ||
      state.lifespan < 0 ||
      state.phase !== "ended" ||
      state.age > state.lifespanMax + 10
    ) {
      invalid += 1;
    }
  }

  return {
    lives: count,
    minAge,
    maxAge,
    meanAge: Math.round((totalAge / count) * 10) / 10,
    endings,
    realms,
    roots: rootCounts,
    fateSeen: fateSeen.size,
    fateTotal: FATE_THREADS.length,
    invalidLives: invalid,
  };
}
