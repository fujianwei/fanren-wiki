import fs from "node:fs";
import path from "node:path";
import eventsLianqi from "@/content/game/events-lianqi.json";
import eventsZhuji from "@/content/game/events-zhuji.json";
import eventsJiedan from "@/content/game/events-jiedan.json";
import eventsYuanying from "@/content/game/events-yuanying.json";
import eventsHuashen from "@/content/game/events-huashen.json";
import eventsLife from "@/content/game/events-life.json";
import fateThreads from "@/content/game/fate-threads.json";
import {
  getActionArt,
  getEndingScene,
  getFocusScene,
  getIntentScene,
  getSceneForEvent,
} from "@/lib/game/scene-art";
import type { FocusId, GameEvent, HeartIntent } from "@/types/game";

const events = [
  ...eventsLianqi,
  ...eventsZhuji,
  ...eventsJiedan,
  ...eventsYuanying,
  ...eventsHuashen,
  ...eventsLife,
] as GameEvent[];

const fateEvents = fateThreads.flatMap((thread) =>
  thread.stages.map((stage, index) => ({
    id: `fate:${thread.id}:${index + 1}`,
    realmSlug: "lianqi",
    category: "karma",
    title: thread.stageTitles[index],
    description: stage.description,
    options: stage.options,
    source: "fate",
    story: { threadId: thread.id, threadTitle: thread.title, stage: index + 1, stageCount: 3 },
  })) as GameEvent[]
);

function expectPublicFile(publicPath: string) {
  expect(fs.existsSync(path.join(process.cwd(), "public", publicPath))).toBe(true);
}

describe("story image art", () => {
  it("maps every base event to its dedicated event artwork", () => {
    for (const event of events) {
      const art = getSceneForEvent(event, event.realmSlug);
      expect(art.src).toBe(`/game/scenes/events/${event.id}.webp`);
      expectPublicFile(art.src);
      expect(art.fallbackSrc).toMatch(/^\/game\/scenes\/.+\.png$/);
      expectPublicFile(art.fallbackSrc!);
    }
  });

  it("maps every fate stage to its dedicated three-act artwork", () => {
    for (const event of fateEvents) {
      const art = getSceneForEvent(event, event.realmSlug);
      expect(art.src).toBe(`/game/scenes/fate/${event.story!.threadId}-${event.story!.stage}.webp`);
      expectPublicFile(art.src);
      expect(art.fallbackSrc).toMatch(/^\/game\/scenes\/.+\.png$/);
    }
  });

  it("maps opening intents, life focuses and ending families", () => {
    const intents: HeartIntent[] = ["longevity", "revenge", "guard", "freedom"];
    const focuses: FocusId[] = ["cultivate", "roam", "craft", "sect", "bond", "heal"];
    const endings = ["ascend", "ascend_fail", "natural", "death_battle", "death_heart", "death_break"];

    for (const intent of intents) {
      const art = getIntentScene(intent);
      expect(art.src).toBe(`/game/scenes/opening/${intent}.webp`);
      expectPublicFile(art.src);
    }
    for (const focus of focuses) {
      const art = getFocusScene(focus);
      expect(art.src).toBe(`/game/scenes/focus/${focus}.webp`);
      expectPublicFile(art.src);
    }
    for (const ending of endings) {
      const art = getEndingScene(ending);
      expect(art.src).toBe(`/game/scenes/ending/${ending}.webp`);
      expectPublicFile(art.src);
    }
  });

  it("keeps a generic scene fallback when dedicated art is unavailable", () => {
    const unknownEvent = {
      ...events[0],
      id: "event-without-art",
      title: "不存在的事件",
      description: "用于验证回退",
      category: "normal",
    } as GameEvent;
    const art = getSceneForEvent(unknownEvent, "lianqi");
    expect(art.src).toBe("/game/scenes/events/event-without-art.webp");
    expect(art.fallbackSrc).toMatch(/^\/game\/scenes\/.+\.png$/);
    expectPublicFile(art.fallbackSrc!);
  });

  it("maps choices to one of the ten action illustrations", () => {
    const actions = new Set([
      "出门看看",
      "拔剑迎战",
      "闭关修炼",
      "买下丹药",
      "救下旧人",
      "服丹疗伤",
      "冒险一试",
      "拒绝请求",
      "仔细盘问",
      "点头答应",
    ].map((text) => getActionArt(text).id));
    expect(actions.size).toBeGreaterThanOrEqual(8);
    for (const text of ["出门看看", "拔剑迎战", "闭关修炼", "买下丹药", "救下旧人", "服丹疗伤", "冒险一试", "拒绝请求", "仔细盘问", "点头答应"]) {
      expectPublicFile(getActionArt(text).src);
    }
  });
});
