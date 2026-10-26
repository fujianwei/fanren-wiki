import { pickStageEvent } from "@/lib/game/event-pool";
import { getStageYears, FOCUSES } from "@/lib/game/lifecycle";
import { buildEndingSummary, evaluateProphecy, computeTextureAxes, pickLifeThreads, pickProphecy } from "@/lib/game/narrative";
import { createInitialState, gameReducer } from "@/lib/game/reducer";
import { runBalanceSimulation } from "@/lib/game/simulation";
import { buildThreeLifeMirror } from "@/lib/game/mirror";
import type { LifeArchive, NarrativeAxis, SpiritRoot } from "@/types/game";

const ROOT: SpiritRoot = { type: "san", name: "三灵根", cultivationMult: 1, fortuneRange: [51, 80] };

function fresh() {
  return createInitialState(ROOT, 60);
}

describe("life simulation stage loop", () => {
  it("initializes age, prophecy, four relations, and a sampled fate pool", () => {
    const state = fresh();
    expect(state.age).toBe(12);
    expect(state.lifespan).toBe(88);
    expect(state.prophecy.text.length).toBeGreaterThan(5);
    expect(Object.values(state.relations)).toHaveLength(4);
    expect(state.lifeThreads).toHaveLength(4);
    expect(new Set(state.lifeThreads).size).toBe(4);
    expect(state.timeline[0].title).toBe("灵根初显");
  });

  it("advances exactly one stage with deterministic age and focus history", () => {
    let state = fresh();
    state = gameReducer(state, { type: "SET_HEART_INTENT", intent: "guard" });
    state = gameReducer(state, { type: "SET_STAGE_FOCUS", focusId: "cultivate" });
    const before = state.xp;
    state = gameReducer(state, { type: "ADVANCE_STAGE" });
    expect(state.stage).toBe(1);
    expect(state.age).toBe(12 + getStageYears("lianqi"));
    expect(state.xp).toBeGreaterThan(before);
    expect(state.focusHistory.at(-1)).toMatchObject({ focusId: "cultivate", fromAge: 12, toAge: 17 });
    expect(state.stageFocus).toBeNull();
    expect(state.lastSettlement?.eventDue).toBe(true);
  });

  it("keeps all four spirit roots in the same playable state model", () => {
    const roots: SpiritRoot[] = [
      { type: "tianling", name: "天灵根", cultivationMult: 1.3, fortuneRange: [91, 100] },
      { type: "shuang", name: "双灵根", cultivationMult: 1.15, fortuneRange: [81, 90] },
      { type: "san", name: "三灵根", cultivationMult: 1, fortuneRange: [51, 80] },
      { type: "wei", name: "伪灵根", cultivationMult: 0.85, fortuneRange: [1, 50] },
    ];
    for (const root of roots) {
      const state = createInitialState(root, 50);
      expect(state.relations).toBeDefined();
      expect(state.lifeThreads).toHaveLength(4);
      expect(state.heartIntent).toBeNull();
      expect(state.realmSlug).toBe("lianqi");
    }
  });

  it("offers conditioned life events and fate events without dead-ending", () => {
    let state = fresh();
    state = gameReducer(state, { type: "SET_HEART_INTENT", intent: "longevity" });
    state = gameReducer(state, { type: "SET_STAGE_FOCUS", focusId: "roam" });
    state = gameReducer(state, { type: "ADVANCE_STAGE" });
    const event = pickStageEvent(state);
    expect(event).not.toBeNull();
    expect(event!.options.length).toBeGreaterThan(0);
  });

  it("commits a completed life and preserves an archive for the next run", () => {
    let state = fresh();
    state = gameReducer(state, { type: "END_GAME", endingType: "natural" });
    expect(state.endingSummary).not.toBeNull();
    state = gameReducer(state, { type: "COMMIT_LIFE" });
    expect(state.archived).toBe(true);
    expect(state.meta.lives).toHaveLength(1);
    expect(state.meta.lives[0].finalAge).toBe(12);
    const second = createInitialState(ROOT, 50, state.meta);
    expect(second.lifeNumber).toBe(2);
    expect(second.meta.lives).toHaveLength(1);
  });
});

describe("destiny presentation", () => {
  it("evaluates prophecy and texture from narrative axes", () => {
    const state = fresh();
    state.narrative.axes.attachment = 14;
    state.narrative.axes.dao = 3;
    state.narrative.axes.compassion = 9;
    state.narrative.axes.loyalty = 7;
    expect(evaluateProphecy({ ...state, prophecy: { id: "p", title: "情", text: "情字", axis: "attachment" } })).toBe("fulfilled");
    const texture = computeTextureAxes(state.narrative);
    expect(Object.keys(texture)).toHaveLength(4);
    expect(texture.mortalVsAscension).toContain("人间");
  });

  it("has stable sampled prophecy and fate pools for a seed", () => {
    expect(pickProphecy(1234).id).toBe(pickProphecy(1234).id);
    expect(pickLifeThreads(1234)).toEqual(pickLifeThreads(1234));
    expect(FOCUSES).toHaveLength(6);
    const summary = buildEndingSummary({ ...fresh(), endingType: "natural" });
    expect(summary.finalAge).toBe(12);
    expect(summary.obsessions?.length).toBeGreaterThan(0);
  });
});

describe("balance simulation", () => {
  it("runs 1000 deterministic lives without invalid states", () => {
    const result = runBalanceSimulation(1000);
    expect(result.lives).toBe(1000);
    expect(result.invalidLives).toBe(0);
    expect(result.minAge).toBeGreaterThanOrEqual(12);
    expect(result.maxAge).toBeLessThanOrEqual(3000);
    expect(Object.keys(result.roots)).toHaveLength(4);
    expect(Object.values(result.endings).reduce((sum, count) => sum + count, 0)).toBe(1000);
    expect(result.fateSeen).toBeGreaterThan(0);
  });
});

describe("cross-life mirror", () => {
  it("summarizes repeated axes, prophecy verdicts, and endings", () => {
    const life = (index: number, verdict: "fulfilled" | "defied" | "unanswered", axis: NarrativeAxis): LifeArchive => ({
      id: `life-${index}`,
      lifeNumber: index,
      completedAt: new Date(0).toISOString(),
      name: "测试修士",
      finalAge: 60 + index,
      realmSlug: "zhuji" as const,
      endingType: "natural" as const,
      endingTitle: "守山人 · 寿尽归尘",
      heartIntent: "guard" as const,
      prophecyId: "p",
      prophecyText: "测试谶语",
      prophecyVerdict: verdict,
      dominantAxes: [axis, "loyalty", "compassion"],
      textureAxes: {},
      resolvedThreadIds: [],
      brokenThreadIds: [],
      relationEpitaphs: [],
      keyMemories: [],
      karmaMarks: [],
      obsessions: [],
      signature: `sig-${index}`,
    });
    const mirror = buildThreeLifeMirror([life(1, "fulfilled", "attachment"), life(2, "fulfilled", "attachment"), life(3, "defied", "dao")]);
    expect(mirror).not.toBeNull();
    expect(mirror?.verdicts.fulfilled).toBe(2);
    expect(mirror?.axisCounts.attachment).toBe(2);
    expect(mirror?.insight).toContain("忠义");
  });

  it("reproduces the same birth seed for same-fate replay", () => {
    const first = createInitialState(ROOT, 60, undefined, 424242);
    const second = createInitialState(ROOT, 60, undefined, 424242);
    expect(first.prophecy.id).toBe(second.prophecy.id);
    expect(first.lifeThreads).toEqual(second.lifeThreads);
    expect(Object.values(first.relations).map((relation) => relation.name)).toEqual(
      Object.values(second.relations).map((relation) => relation.name)
    );
  });

  it("creates four relations with unique display names", () => {
    for (let seed = 1; seed < 30; seed += 1) {
      const state = createInitialState(ROOT, 50, undefined, seed);
      const names = Object.values(state.relations).map((relation) => relation.name);
      expect(new Set(names).size).toBe(4);
    }
  });
});
