import focusesData from "@/content/game/focuses.json";
import { calcXpGain } from "@/lib/game/engine";
import { driftRelations } from "@/lib/game/relations";
import { createRandom } from "@/lib/game/random";
import type {
  FocusConfig,
  FocusId,
  GameState,
  StageSettlement,
  TimelineEntry,
} from "@/types/game";

export const FOCUSES = focusesData as FocusConfig[];

const STAGE_YEARS: Record<GameState["realmSlug"], number> = {
  lianqi: 5,
  zhuji: 10,
  jiedan: 20,
  yuanying: 40,
  huashen: 80,
};

export function getFocusConfig(focusId: FocusId): FocusConfig {
  const focus = FOCUSES.find((item) => item.id === focusId);
  if (!focus) throw new Error(`Unknown focus: ${focusId}`);
  return focus;
}

export function getStageYears(realmSlug: GameState["realmSlug"]): number {
  return STAGE_YEARS[realmSlug];
}

function timelineId(state: GameState, suffix: string): string {
  return `stage-${state.stage}-${suffix}-${state.runSeed}`;
}

function makeTimeline(
  state: GameState,
  kind: TimelineEntry["kind"],
  title: string,
  text: string,
  accent: TimelineEntry["accent"]
): TimelineEntry {
  return {
    id: timelineId(state, kind),
    stage: state.stage,
    age: state.age,
    kind,
    title,
    text,
    accent,
  };
}

export interface StageAdvanceResult {
  state: GameState;
  settlement: StageSettlement;
}

/**
 * Advances one life stage. This function is pure except for deterministic
 * random streams derived from runSeed + stage.
 */
export function advanceStage(state: GameState): StageAdvanceResult {
  const focusId = state.stageFocus ?? "cultivate";
  const focus = getFocusConfig(focusId);
  const years = getStageYears(state.realmSlug);
  const random = createRandom(state.runSeed, `stage-${state.stage}-${state.realmSlug}`);
  const fromAge = state.age;
  const toAge = state.age + years;
  const remaining = Math.max(0, state.lifespan - years);
  const injuryMultiplier = state.injury === "heavy" ? 0.5 : state.injury === "light" ? 0.8 : state.injury === "dying" ? 0.15 : 1;
  const variation = 0.88 + random() * 0.24;
  const baseXp = Math.max(2, Math.round(9 * focus.xpMult * state.spiritRoot.cultivationMult * injuryMultiplier * variation));
  const gainedXp = calcXpGain(baseXp, 1, state.xp);
  const nextXp = Math.min(100, state.xp + gainedXp);
  const lingshiGain = Math.round(years * 8 * focus.stoneMult * (0.8 + random() * 0.45));
  const nextFate = Math.max(0, Math.min(100, state.fate + focus.fateDelta));
  const riskChance = focus.risk * (1.2 - nextFate / 240) + (state.injury === "heavy" ? 0.08 : 0);
  const riskTriggered = random() < riskChance;

  let injury = state.injury;
  if (focus.heal > 0) {
    if (injury === "heavy" && random() < focus.heal) injury = "light";
    else if (injury === "light" && random() < focus.heal + 0.25) injury = "none";
  } else if (focusId === "heal") {
    injury = "none";
  }
  if (riskTriggered) {
    injury = injury === "none" ? "light" : injury === "light" ? "heavy" : "dying";
  }

  const relations = driftRelations(state.relations, focus.relationDrift, state.stage + 1, createRandom(state.runSeed, `relations-${state.stage}-${focusId}`));
  const lines = [
    `${focus.name} ${years} 年：修为 ${state.xp}% → ${nextXp}%`,
    `灵石 ${state.lingshi} → ${state.lingshi + lingshiGain}`,
    `天命 ${state.fate} → ${nextFate}`,
  ];
  if (riskTriggered) lines.push("此段岁月暗藏波折，你留下了伤势。");
  if (focus.heal > 0 && injury !== state.injury) lines.push("旧伤得到缓解。");

  const timeline: TimelineEntry[] = [
    ...state.timeline,
    makeTimeline(state, "focus", `${fromAge}–${toAge}岁 · ${focus.name}`, focus.description, "mist"),
  ];
  if (riskTriggered) {
    timeline.push(makeTimeline(state, "life", "岁月有劫", "这一段没有白过，但也不是没有代价。", "red"));
  }

  const nextStateBase: GameState = {
    ...state,
    age: toAge,
    lifespan: remaining,
    lifespanMax: state.lifespanMax,
    xp: nextXp,
    lingshi: Math.max(0, state.lingshi + lingshiGain),
    fate: nextFate,
    injury,
    relations,
    stage: state.stage + 1,
    stageFocus: null,
    focusHistory: [
      ...state.focusHistory,
      { stage: state.stage + 1, focusId, fromAge, toAge },
    ],
    timeline,
  };

  const settlement: StageSettlement = {
    stage: state.stage + 1,
    fromAge,
    toAge,
    years,
    focusId,
    headline: riskTriggered ? `${focus.name}途中生变` : `${focus.name}有成`,
    lines,
    eventDue: true,
    breakthroughReady: nextXp >= 90,
  };

  const nextState: GameState = { ...nextStateBase, lastSettlement: settlement };
  if (remaining <= 0 || toAge >= state.lifespanMax) {
    return {
      state: {
        ...nextState,
        age: state.lifespanMax,
        lifespan: 0,
        phase: "ended",
        endingType: "natural",
        lastSettlement: { ...settlement, toAge: state.lifespanMax },
      },
      settlement: { ...settlement, toAge: state.lifespanMax },
    };
  }

  return { state: nextState, settlement };
}

export function applyHeartIntent(state: GameState, intent: GameState["heartIntent"]): GameState {
  if (!intent) return state;
  const axisByIntent = {
    longevity: { dao: 4, ambition: 2 },
    revenge: { ruthless: 4, ambition: 2 },
    guard: { loyalty: 4, compassion: 3 },
    freedom: { freedom: 4, attachment: -1 },
  } as const;
  const axes = { ...state.narrative.axes };
  for (const [key, value] of Object.entries(axisByIntent[intent])) {
    axes[key as keyof typeof axes] += value;
  }
  return {
    ...state,
    heartIntent: intent,
    narrative: { ...state.narrative, axes },
    timeline: [
      ...state.timeline,
      makeTimeline(
        state,
        "life",
        "立下本心",
        intent === "longevity"
          ? "你不求一时胜负，只想看看这条路究竟能走多远。"
          : intent === "revenge"
            ? "你把一个名字刻进心里，提醒自己不要忘记。"
            : intent === "guard"
              ? "你想守住一些人，哪怕他们从未要求。"
              : "你不愿意被任何人替你决定要去哪里。",
        "gold"
      ),
    ],
  };
}

export function applyStageDeathSummary(state: GameState, buildSummary: (value: GameState) => GameState["endingSummary"]): GameState {
  if (state.phase !== "ended") return state;
  return { ...state, endingSummary: buildSummary(state) };
}
