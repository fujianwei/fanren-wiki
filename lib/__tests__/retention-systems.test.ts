import { getDailyContext, getDailySeed } from "@/lib/game/daily";
import { getAtlasSummary, getUnseenWhisper, recordLifeInAtlas } from "@/lib/game/atlas";
import { evaluateLifeOath, pickLifeOathChoices } from "@/lib/game/oaths";
import { EMPTY_META, createInitialState, gameReducer } from "@/lib/game/reducer";
import { buildEndingSummary } from "@/lib/game/narrative";
import type { SpiritRoot } from "@/types/game";

const ROOT: SpiritRoot = { type: "san", name: "三灵根", cultivationMult: 1, fortuneRange: [51, 80] };

describe("daily reincarnation", () => {
  it("produces the same daily seed and context for the same Shanghai date", () => {
    expect(getDailySeed("2026-10-29")).toBe(getDailySeed("2026-10-29"));
    expect(getDailyContext("2026-10-29")).toMatchObject({
      dateKey: "2026-10-29",
      fortune: getDailyContext("2026-10-29").fortune,
      celestial: getDailyContext("2026-10-29").celestial,
    });
  });

  it("offers three unique life oaths", () => {
    const oaths = pickLifeOathChoices(1234, 3);
    expect(oaths).toHaveLength(3);
    expect(new Set(oaths.map((oath) => oath.id)).size).toBe(3);
  });

  it("evaluates a resolved life oath at the ending", () => {
    const state = createInitialState(ROOT, 60, undefined, 7);
    const selected = gameReducer({ ...state, realmSlug: "jiedan" }, { type: "SET_LIFE_OATH", oathId: "no_sect_core" });
    expect(evaluateLifeOath(selected, "natural")).toBe("fulfilled");
    expect(evaluateLifeOath({ ...selected, sectPath: "zhengdao" }, "natural")).toBe("broken");
    const ended = { ...selected, phase: "ended" as const, endingType: "natural" as const };
    expect(buildEndingSummary(ended).lifeOathStatus).toBe("fulfilled");
  });
});

describe("fate atlas", () => {
  it("records encountered fate threads and exposes an unseen whisper", () => {
    const state = createInitialState(ROOT, 60, EMPTY_META, 11);
    const played = gameReducer(state, { type: "RECORD_EVENT", eventId: "fate:wanderer_debt:1", threadId: "wanderer_debt" });
    const atlas = recordLifeInAtlas(EMPTY_META.fateAtlas, played.narrative.threads, 1);
    const meta = { ...EMPTY_META, fateAtlas: atlas };
    expect(getAtlasSummary(meta).seen).toBe(1);
    expect(getUnseenWhisper(meta, 11)).not.toBeNull();
  });
});
