import fs from "node:fs";
import path from "node:path";
import eventsLianqi from "@/content/game/events-lianqi.json";
import eventsZhuji from "@/content/game/events-zhuji.json";
import eventsJiedan from "@/content/game/events-jiedan.json";
import eventsYuanying from "@/content/game/events-yuanying.json";
import eventsHuashen from "@/content/game/events-huashen.json";
import eventsLife from "@/content/game/events-life.json";
import fateThreads from "@/content/game/fate-threads.json";
import { getActionArt, getSceneForEvent } from "@/lib/game/scene-art";
import type { GameEvent } from "@/types/game";

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
    type: "passive",
    category: "karma",
    title: thread.stageTitles[index],
    description: stage.description,
    options: stage.options,
    source: "fate",
    story: { threadId: thread.id, threadTitle: thread.title, stage: index + 1, stageCount: 3 },
  })) as GameEvent[]
);

describe("pixel scene art", () => {
  it("maps every base and fate event to an existing scene image", () => {
    for (const event of [...events, ...fateEvents]) {
      const art = getSceneForEvent(event, event.realmSlug);
      expect(fs.existsSync(path.join(process.cwd(), "public", art.src))).toBe(true);
    }
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
  });
});
