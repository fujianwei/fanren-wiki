import { eventMatches } from "@/lib/game/event-pool";
import { calcBreakthroughRate } from "@/lib/game/engine";
import { advanceStage } from "@/lib/game/lifecycle";
import { getAutoSaveItem, getBreakthroughBonuses, getRetreatXpBonus } from "@/lib/game/items";
import { createInitialState, gameReducer } from "@/lib/game/reducer";
import type { Enemy, GameEvent, ItemId, SpiritRoot } from "@/types/game";

const ROOT: SpiritRoot = { type: "san", name: "三灵根", cultivationMult: 1, fortuneRange: [51, 80] };

function event(overrides: Partial<GameEvent> = {}): GameEvent {
  return {
    id: "test_event",
    realmSlug: "lianqi",
    category: "normal",
    title: "测试事件",
    description: "测试",
    options: [{ text: "继续", effects: [] }],
    ...overrides,
  };
}

describe("content conditions", () => {
  it("requires a recorded karma event before showing a follow-up", () => {
    const followUp = event({ requiresKarma: "lq_helped_wanderer" });
    const fresh = createInitialState(ROOT, 60, undefined, 1);
    expect(eventMatches(followUp, fresh)).toBe(false);
    expect(eventMatches(followUp, { ...fresh, eventHistory: ["lq_helped_wanderer"] })).toBe(true);
  });

  it("requires a sect path for sect-only events", () => {
    const sectEvent = event({ requiresSect: true });
    const fresh = createInitialState(ROOT, 60, undefined, 1);
    expect(eventMatches(sectEvent, fresh)).toBe(false);
    expect(eventMatches(sectEvent, { ...fresh, sectPath: "zhengdao" })).toBe(true);
  });
});

describe("item effects", () => {
  it("derives breakthrough bonuses from item data", () => {
    const inventory = { zhuji_dan: 1, huti_zhen: 1 };
    const result = getBreakthroughBonuses("lianqi", inventory);
    expect(result.pill?.id).toBe("zhuji_dan");
    expect(result.pillBonus).toBe(0.25);
    expect(result.array?.id).toBe("huti_zhen");
    expect(result.arrayBonus).toBe(0.12);
    expect(getRetreatXpBonus({ juling_zhen: 1 })).toBe(0.10);
  });

  it("auto-saves from dying with the configured life-saving item", () => {
    const state = createInitialState(ROOT, 60, undefined, 1);
    const withPill = { ...state, inventory: { xuming_dan: 1 } as Partial<Record<ItemId, number>> };
    expect(getAutoSaveItem(withPill.inventory)?.id).toBe("xuming_dan");
    const saved = gameReducer(withPill, { type: "SET_INJURY", level: "dying" });
    expect(saved.phase).toBe("playing");
    expect(saved.injury).toBe("heavy");
    expect(saved.rootIntact).toBe(false);
    expect(saved.inventory.xuming_dan).toBe(0);
  });
});

describe("sect and enemies", () => {
  it("applies a modest Zhengdao breakthrough bonus", () => {
    const base = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0, lingshi: 0,
      rootIntact: false, rootDamageCount: 0, breakthroughExp: 0,
    });
    const zhengdao = calcBreakthroughRate({
      realmSlug: "lianqi", xp: 100, itemBonus: 0, lingshi: 0,
      rootIntact: false, rootDamageCount: 0, breakthroughExp: 0, sectPath: "zhengdao",
    });
    expect(zhengdao - base).toBeCloseTo(0.05, 5);
  });

  it("applies the promised Modao cultivation and emotion tradeoff", () => {
    const base = gameReducer(createInitialState(ROOT, 60, undefined, 9), { type: "SET_STAGE_FOCUS", focusId: "cultivate" });
    const modao = gameReducer({ ...base, sectPath: "modao" }, { type: "SET_STAGE_FOCUS", focusId: "cultivate" });
    const normalAdvance = advanceStage(base).state;
    const modaoAdvance = advanceStage(modao).state;
    expect(modaoAdvance.xp).toBeGreaterThan(normalAdvance.xp);
    expect(modaoAdvance.emotion.negative).toBe(base.emotion.negative + 4);
  });

  it("deduplicates and removes tracked enemies", () => {
    const state = createInitialState(ROOT, 60, undefined, 1);
    const enemy: Enemy = { id: "enemy-1", name: "旧敌", realmSlug: "lianqi", sourceEventId: "test" };
    const once = gameReducer(state, { type: "ADD_ENEMY", enemy });
    const twice = gameReducer(once, { type: "ADD_ENEMY", enemy });
    expect(twice.enemies).toHaveLength(1);
    expect(gameReducer(twice, { type: "REMOVE_ENEMY", enemyId: enemy.id }).enemies).toHaveLength(0);
  });
});

describe("content schema", () => {
  const eventFiles = [
    "events-lianqi.json", "events-zhuji.json", "events-jiedan.json",
    "events-yuanying.json", "events-huashen.json", "events-life.json",
  ];

  it("contains no retired fields or ignored condition keys", async () => {
    const allowedEventKeys = new Set([
      "id", "realmSlug", "category", "title", "description", "options",
      "source", "weight", "priority", "once", "condition", "requiresKarma", "requiresSect",
    ]);
    const allowedConditionKeys = new Set([
      "minAge", "maxAge", "minStage", "maxStage", "realms", "focusAny", "axes",
      "tagsAny", "tagsAll", "scarsAny", "relationsAny", "flags",
    ]);
    for (const filename of eventFiles) {
      const events = JSON.parse(await import(`node:fs/promises`).then(({ readFile }) =>
        readFile(`content/game/${filename}`, "utf8")
      )) as GameEvent[];
      for (const item of events) {
        for (const key of Object.keys(item)) expect(allowedEventKeys.has(key)).toBe(true);
        for (const key of Object.keys(item.condition ?? {})) expect(allowedConditionKeys.has(key)).toBe(true);
      }
    }
  });

  it("keeps karma references and flag writes resolvable", async () => {
    const { readFile } = await import("node:fs/promises");
    const all = (await Promise.all(eventFiles.map(async (filename) =>
      JSON.parse(await readFile(`content/game/${filename}`, "utf8")) as GameEvent[]
    ))).flat();
    const triggered = new Set(
      all.flatMap((item) => item.options.flatMap((option) => option.effects))
        .filter((effect) => effect.type === "trigger_karma")
        .map((effect) => effect.type === "trigger_karma" ? effect.karmaId : "")
    );
    const readFlags = new Set(
      all.flatMap((item) => Object.keys(item.condition?.flags ?? {}))
    );
    for (const item of all) {
      if (item.requiresKarma) expect(triggered.has(item.requiresKarma)).toBe(true);
      for (const option of item.options) {
        for (const effect of option.effects) {
          if (effect.type === "set_flag") expect(readFlags.has(effect.key)).toBe(true);
        }
      }
    }
  });
});
