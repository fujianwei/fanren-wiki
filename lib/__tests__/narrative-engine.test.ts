import {
  AXIS_LABELS,
  FATE_THREADS,
  NARRATIVE_AXES,
  buildEndingSummary,
  buildFateThreadEvent,
  pickFateThreadEvent,
  getThreadTitle,
} from "@/lib/game/narrative";
import { createInitialState, gameReducer } from "@/lib/game/reducer";
import type { ChoiceMemory, SpiritRoot } from "@/types/game";

const ROOT: SpiritRoot = {
  type: "san",
  name: "三灵根",
  cultivationMult: 1,
  fortuneRange: [51, 80],
};

function freshState() {
  return { ...createInitialState(ROOT, 60), runSeed: 1234 };
}

function memory(eventId: string, outcomeText: string): ChoiceMemory {
  return {
    turn: 1,
    eventId,
    optionIndex: 0,
    eventTitle: "测试事件",
    optionText: "测试选择",
    outcomeText,
    realmSlug: "lianqi",
  };
}

describe("fate thread content", () => {
  it("loads all 18 fate threads with three stages and valid options", () => {
    expect(FATE_THREADS).toHaveLength(18);
    for (const thread of FATE_THREADS) {
      expect(thread.stageTitles).toHaveLength(3);
      expect(thread.stages).toHaveLength(3);
      for (const stage of thread.stages) {
        expect(stage.description.length).toBeGreaterThan(10);
        expect(stage.options.length).toBeGreaterThanOrEqual(2);
        for (const option of stage.options) {
          expect(option.outcomeText.length).toBeGreaterThan(4);
          for (const axis of Object.keys(option.narrative?.axes ?? {})) {
            expect(NARRATIVE_AXES).toContain(axis);
          }
        }
      }
    }
  });

  it("adapts a content stage into the existing GameEvent shape", () => {
    const thread = FATE_THREADS[0];
    const event = buildFateThreadEvent(thread, 1, "zhuji");
    expect(event).not.toBeNull();
    expect(event?.realmSlug).toBe("zhuji");
    expect(event?.category).toBe("karma");
    expect(event?.story).toMatchObject({
      threadId: thread.id,
      threadTitle: thread.title,
      stage: 2,
      stageCount: 3,
    });
    expect(event?.options[0].text).toBe(thread.stages[1].options[0].text);
  });

  it("opens a fate thread on the first event and then advances it after an ordinary beat", () => {
    let state = freshState();
    const first = pickFateThreadEvent(state);
    expect(first?.story?.stage).toBe(1);
    expect(first?.story?.threadId).toBeTruthy();

    state = gameReducer(state, {
      type: "RECORD_EVENT",
      eventId: first!.id,
      threadId: first!.story!.threadId,
    });
    expect(state.narrative.threads[first!.story!.threadId].stage).toBe(0);

    state = gameReducer(state, {
      type: "APPLY_NARRATIVE",
      record: memory(first!.id, "第一阶段落定"),
      axes: { compassion: 3, loyalty: 1 },
      tags: [{ id: "deed.saved", label: "救过一人", strength: 2 }],
      threadUpdate: { threadId: first!.story!.threadId, action: "advance", resolution: "旧恩未结" },
    });
    expect(state.narrative.threads[first!.story!.threadId].stage).toBe(1);
    expect(state.narrative.threads[first!.story!.threadId].status).toBe("open");
    expect(state.narrative.axes.compassion).toBe(3);

    state = { ...state, stage: 3 };
    const second = pickFateThreadEvent(state);
    expect(second?.story?.threadId).toBe(first?.story?.threadId);
    expect(second?.story?.stage).toBe(2);
  });

  it("resolves a final thread and reflects it in the combined ending", () => {
    let state = freshState();
    const thread = FATE_THREADS[0];
    state = gameReducer(state, {
      type: "RECORD_EVENT",
      eventId: buildFateThreadEvent(thread, 0, "lianqi")!.id,
      threadId: thread.id,
    });
    state = gameReducer(state, {
      type: "APPLY_NARRATIVE",
      record: memory("stage-1", "你救下了那个人。"),
      axes: { compassion: 6, loyalty: 2 },
      tags: [{ id: "bond.ally", label: "与旧散修结盟", strength: 2 }],
      threadUpdate: { threadId: thread.id, action: "resolve", resolution: "一命还一命" },
    });
    state = gameReducer(state, { type: "END_GAME", endingType: "natural" });
    expect(state.endingSummary?.resolvedThreads).toContain(thread.id);
    expect(state.endingSummary?.title).toContain("渡人者");
    expect(state.narrative.threads[thread.id].resolution).toContain("一命还一命");
  });
});

describe("ending composition", () => {
  it("deterministically composes family, dominant axes and signatures", () => {
    const state = freshState();
    state.endingType = "ascend";
    state.turn = 12;
    state.narrative.axes = {
      dao: 20,
      compassion: 2,
      ambition: 9,
      guile: 0,
      ruthless: 0,
      freedom: 5,
      loyalty: 8,
      attachment: 1,
    };
    const summary = buildEndingSummary(state);
    expect(summary.title).toContain("问道者");
    expect(summary.title).toContain("飞升灵界");
    expect(summary.dominantAxes.slice(0, 2)).toEqual(["dao", "ambition"]);
    expect(summary.signature).toContain("1234");
    expect(summary.epitaph.length).toBeGreaterThan(0);
    expect(AXIS_LABELS[summary.dominantAxes[0]]).toBe("求道");
  });

  it("rebuilds the ending summary when a final fate choice lands after lethal effects", () => {
    let state = freshState();
    const thread = FATE_THREADS[0];
    state = gameReducer(state, { type: "END_GAME", endingType: "natural" });
    state = gameReducer(state, {
      type: "APPLY_NARRATIVE",
      record: memory("lethal-final", "最后一击落下。"),
      axes: { compassion: 5 },
      threadUpdate: { threadId: thread.id, action: "resolve", resolution: "最后一刻仍护住了旧人" },
    });
    expect(state.phase).toBe("ended");
    expect(state.endingSummary?.resolvedThreads).toContain(thread.id);
    expect(state.endingSummary?.keyMemory).toBe("最后一击落下。");
  });

  it("exposes thread titles for summary rendering", () => {
    expect(getThreadTitle("wanderer_debt")).toBe("雨夜旧恩");
    expect(getThreadTitle("missing-thread")).toBe("missing-thread");
  });
});
