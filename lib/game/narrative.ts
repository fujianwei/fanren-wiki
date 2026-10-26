import fateThreadsData from "@/content/game/fate-threads.json";
import propheciesData from "@/content/game/prophecies.json";
import { shuffle } from "@/lib/game/random";
import { relationMood } from "@/lib/game/relations";
import type {
  ChoiceMemory,
  EndingSummary,
  FateThreadConfig,
  FateThreadState,
  GameEvent,
  GameState,
  NarrativeAxis,
  NarrativeState,
  NarrativeTag,
  ObsessionOption,
  ProphecyConfig,
  ProphecyVerdict,
} from "@/types/game";

export const NARRATIVE_AXES: NarrativeAxis[] = [
  "dao",
  "compassion",
  "ambition",
  "guile",
  "ruthless",
  "freedom",
  "loyalty",
  "attachment",
];

export const AXIS_LABELS: Record<NarrativeAxis, string> = {
  dao: "求道",
  compassion: "慈悲",
  ambition: "野心",
  guile: "机谋",
  ruthless: "杀伐",
  freedom: "自在",
  loyalty: "忠义",
  attachment: "牵挂",
};

const AXIS_ARCHETYPES: Record<NarrativeAxis, string> = {
  dao: "问道者",
  compassion: "渡人者",
  ambition: "登天者",
  guile: "弈局者",
  ruthless: "修罗客",
  freedom: "云游者",
  loyalty: "守山人",
  attachment: "牵舟人",
};

const ENDING_FAMILIES: Record<NonNullable<GameState["endingType"]>, string> = {
  ascend: "飞升灵界",
  death_battle: "斗法陨落",
  death_heart: "心魔坐化",
  death_break: "渡劫成灰",
  natural: "寿尽归尘",
  ascend_fail: "天门遗恨",
};

const ENDING_NARRATIVES: Record<NonNullable<GameState["endingType"]>, string> = {
  ascend: "你踏破虚空，带着此世的因果进入灵界。",
  death_battle: "你在争斗中燃尽最后一缕生机，仍不肯后退。",
  death_heart: "你被自己的执念困住，最终没能走出心魔。",
  death_break: "天雷散尽时，你的道途停在最后一关之前。",
  natural: "寿元如潮水退去，你把自己活成了一段旧事。",
  ascend_fail: "天门曾在眼前打开，却最终在你面前合拢。",
};

const EPITAPHS: Partial<Record<`${NarrativeAxis}:${NarrativeAxis}`, string>> = {
  "dao:loyalty": "一生长守一山，一心只问一道。",
  "dao:freedom": "不为天地留名，只为心中一念。",
  "compassion:loyalty": "你把许多人的姓名，写进了自己的命里。",
  "compassion:attachment": "渡人亦渡己，终究没有放下那一盏灯。",
  "ambition:guile": "你曾把天下当棋局，最后也成了局中子。",
  "ambition:ruthless": "你走到无人敢挡之处，也失去回头的路。",
  "guile:freedom": "你把规则看透，却只换来一身自在。",
  "ruthless:attachment": "刀锋与牵挂同时留下，谁也说不清哪一道更深。",
  "freedom:attachment": "你一生远行，心里却始终留着一扇门。",
  "loyalty:attachment": "你守住旧人旧山，也守住了自己。",
};

export const FATE_THREADS = fateThreadsData as FateThreadConfig[];
export const PROPHECIES = propheciesData as ProphecyConfig[];

export function createEmptyNarrativeState(): NarrativeState {
  return {
    axes: Object.fromEntries(NARRATIVE_AXES.map((axis) => [axis, 0])) as Record<NarrativeAxis, number>,
    tags: {},
    threads: {},
    memories: [],
    titles: [],
    scars: [],
  };
}

export function pickProphecy(seed: number): ProphecyConfig {
  return PROPHECIES[Math.abs(seed) % PROPHECIES.length];
}

export function pickLifeThreads(seed: number, count = 4): string[] {
  const shuffled = shuffle(FATE_THREADS, (() => {
    let state = seed >>> 0;
    return () => {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  })());
  return shuffled.slice(0, count).map((thread) => thread.id);
}

export function getFateThread(threadId: string): FateThreadConfig | undefined {
  return FATE_THREADS.find((thread) => thread.id === threadId);
}

export function getThreadTitle(threadId: string): string {
  return getFateThread(threadId)?.title ?? threadId;
}

export function getThreadStageTitle(threadId: string, stage: number): string {
  return getFateThread(threadId)?.stageTitles[stage] ?? `第 ${stage + 1} 段`;
}

export function buildFateThreadEvent(
  thread: FateThreadConfig,
  stageIndex: number,
  realmSlug: GameState["realmSlug"]
): GameEvent | null {
  const stage = thread.stages[stageIndex];
  if (!stage) return null;

  return {
    id: `fate:${thread.id}:${stageIndex + 1}`,
    realmSlug,
    type: "passive",
    category: "karma",
    title: thread.stageTitles[stageIndex] ?? thread.title,
    description: stage.description,
    options: stage.options.map((option) => ({
      text: option.text,
      effects: option.effects,
      outcomeText: option.outcomeText,
      narrative: option.narrative,
    })),
    story: {
      threadId: thread.id,
      threadTitle: thread.title,
      stage: stageIndex + 1,
      stageCount: thread.stages.length,
    },
    source: "fate",
    priority: 20,
  };
}

/**
 * Fate is sampled at life level. Only 3–4 threads enter a life, and one thread
 * advances roughly every two stages. The player still has ordinary life events
 * in between, so fate feels discovered rather than checked off.
 */
export function pickFateThreadEvent(state: GameState): GameEvent | null {
  const lifeThreads = state.lifeThreads.length > 0
    ? state.lifeThreads
    : FATE_THREADS.slice(0, 4).map((thread) => thread.id);

  const openThreads = Object.values(state.narrative.threads)
    .filter((thread) => thread.status === "open" && thread.stage < 3 && lifeThreads.includes(thread.threadId))
    .sort((a, b) => a.lastAdvancedTurn - b.lastAdvancedTurn);

  const dueThreads = openThreads.filter((thread) => state.stage - thread.lastAdvancedTurn >= 2);
  if (dueThreads.length > 0) {
    const active = dueThreads[0];
    const config = getFateThread(active.threadId);
    if (config) return buildFateThreadEvent(config, active.stage, state.realmSlug);
  }

  const unstarted = lifeThreads
    .filter((threadId) => !state.narrative.threads[threadId])
    .map((threadId) => getFateThread(threadId))
    .filter((thread): thread is FateThreadConfig => Boolean(thread));

  if (unstarted.length > 0 && (state.stage === 0 || state.stage % 3 === 0)) {
    return buildFateThreadEvent(unstarted[0], 0, state.realmSlug);
  }

  return null;
}

export function registerThread(
  threads: Record<string, FateThreadState>,
  threadId: string,
  turn: number
): Record<string, FateThreadState> {
  if (threads[threadId]) return threads;
  return {
    ...threads,
    [threadId]: {
      threadId,
      stage: 0,
      status: "open",
      startedTurn: turn,
      lastAdvancedTurn: turn,
    },
  };
}

export function applyNarrativeUpdate(
  narrative: NarrativeState,
  choices: ChoiceMemory[],
  turn: number,
  record: ChoiceMemory,
  axes?: Partial<Record<NarrativeAxis, number>>,
  tags: Array<{ id: string; label: string; strength?: number }> = [],
  threadUpdate?: {
    threadId: string;
    action: "advance" | "resolve" | "break";
    resolution?: string;
  },
  storyTurn: number = turn
): Pick<GameState, "narrative" | "choiceHistory" | "lastThreadTurn"> {
  const nextAxes = { ...narrative.axes };
  for (const axis of NARRATIVE_AXES) {
    nextAxes[axis] = Math.max(-99, Math.min(99, nextAxes[axis] + (axes?.[axis] ?? 0)));
  }

  const nextTags: Record<string, NarrativeTag> = { ...narrative.tags };
  const nextTitles = [...narrative.titles];
  const nextScars = [...narrative.scars];

  for (const tag of tags) {
    nextTags[tag.id] = {
      id: tag.id,
      label: tag.label,
      strength: tag.strength ?? 1,
      sourceEventId: record.eventId,
      sinceTurn: turn,
    };
    if (tag.id.startsWith("title.") && !nextTitles.includes(tag.label)) nextTitles.push(tag.label);
    if (tag.id.startsWith("scar.") && !nextScars.includes(tag.label)) nextScars.push(tag.label);
  }

  const nextThreads = { ...narrative.threads };
  let lastThreadTurn = 0;
  if (threadUpdate) {
    const current = nextThreads[threadUpdate.threadId];
    const stage = (current?.stage ?? 0) + 1;
    const nextStatus =
      threadUpdate.action === "advance"
        ? "open"
        : threadUpdate.action === "resolve"
          ? "resolved"
          : "broken";

    nextThreads[threadUpdate.threadId] = {
      threadId: threadUpdate.threadId,
      stage,
      status: nextStatus,
      startedTurn: current?.startedTurn ?? turn,
      lastAdvancedTurn: storyTurn,
      resolution: threadUpdate.resolution,
    };
    lastThreadTurn = storyTurn;
  }

  const memory = record.outcomeText?.trim() || record.optionText;
  const nextMemory: ChoiceMemory = { ...record, turn, outcomeText: memory };
  const nextMemories = [...narrative.memories, nextMemory].slice(-60);

  return {
    narrative: {
      ...narrative,
      axes: nextAxes,
      tags: nextTags,
      threads: nextThreads,
      memories: nextMemories,
      titles: nextTitles,
      scars: nextScars,
    },
    choiceHistory: [...choices, nextMemory].slice(-60),
    lastThreadTurn,
  };
}

export function getDominantAxes(narrative: NarrativeState, count = 3): NarrativeAxis[] {
  return [...NARRATIVE_AXES]
    .sort((a, b) => narrative.axes[b] - narrative.axes[a] || NARRATIVE_AXES.indexOf(a) - NARRATIVE_AXES.indexOf(b))
    .slice(0, count);
}

export function evaluateProphecy(state: GameState): ProphecyVerdict {
  const value = state.narrative.axes[state.prophecy.axis];
  if (value >= 10) return "fulfilled";
  if (value <= 2) return "defied";
  return "unanswered";
}

export function computeTextureAxes(narrative: NarrativeState): Record<string, string> {
  const { dao, compassion, ambition, guile, ruthless, freedom, loyalty, attachment } = narrative.axes;
  const orient = dao + loyalty - ambition - guile;
  const connection = attachment + compassion - freedom;
  const mercy = compassion - ruthless;
  const worldly = attachment + loyalty - dao - ambition;
  return {
    guardVsChase: orient >= 4 ? "大幅偏向守道" : orient <= -4 ? "大幅偏向逐势" : orient > 0 ? "稍微偏向守道" : orient < 0 ? "稍微偏向逐势" : "各半",
    solitudeVsBonds: connection >= 9 ? "大幅偏向结缘" : connection <= -6 ? "大幅偏向独行" : connection > 0 ? "稍微偏向结缘" : connection < 0 ? "稍微偏向独行" : "各半",
    mercyVsRuthless: mercy >= 8 ? "大幅偏向慈悲" : mercy <= -5 ? "大幅偏向杀伐" : mercy > 0 ? "稍微偏向慈悲" : mercy < 0 ? "稍微偏向杀伐" : "各半",
    mortalVsAscension: worldly >= 6 ? "大幅偏向人间" : worldly <= -4 ? "大幅偏向天门" : worldly > 0 ? "稍微偏向人间" : worldly < 0 ? "稍微偏向天门" : "各半",
  };
}

export function buildRelationEpitaphs(state: GameState): string[] {
  return Object.values(state.relations)
    .sort((a, b) => Math.abs(b.affinity) + b.trust - Math.abs(a.affinity) - a.trust)
    .slice(0, 3)
    .map((relation) => `${relation.title} ${relation.name}：${relation.status === "dead" ? "已故" : relation.status === "lost" ? "失踪" : relationMood(relation.affinity, relation.trust)}${relation.memory ? `，${relation.memory}` : ""}`);
}

export function buildObsessions(state: GameState): ObsessionOption[] {
  const options: ObsessionOption[] = [];
  const open = Object.values(state.narrative.threads).filter((thread) => thread.status === "open");
  const broken = Object.values(state.narrative.threads).filter((thread) => thread.status === "broken");
  const strongestRelation = Object.values(state.relations).sort((a, b) => b.affinity + b.trust - a.affinity - a.trust)[0];
  const keyMemory = state.narrative.memories.at(-1);

  if (broken[0]) {
    options.push({
      id: `obsession-thread-${broken[0].threadId}`,
      title: `未走完的因果 · ${getThreadTitle(broken[0].threadId)}`,
      text: broken[0].resolution ?? "那条命运线最终断在你手里。",
      kind: "truth",
    });
  }
  if (open[0]) {
    options.push({
      id: `obsession-open-${open[0].threadId}`,
      title: `没有等到的人 · ${getThreadTitle(open[0].threadId)}`,
      text: "你走到生命尽头时，仍在想那条命运线如果没有停在这里，会通向哪里。",
      kind: "person",
    });
  }
  if (strongestRelation) {
    options.push({
      id: `obsession-relation-${strongestRelation.id}`,
      title: `放不下的人 · ${strongestRelation.name}`,
      text: strongestRelation.memory ?? `${strongestRelation.title}还在原地，而你已不能再回头。`,
      kind: "person",
    });
  }
  if (keyMemory) {
    options.push({
      id: `obsession-memory-${keyMemory.eventId}`,
      title: "没说完的话",
      text: keyMemory.outcomeText,
      kind: "truth",
    });
  }
  options.push({
    id: "obsession-dao",
    title: "未竟的道",
    text: "如果还能再来一次，你想知道自己究竟能走到哪一步。",
    kind: "dao",
  });
  return options.slice(0, 3);
}

export function buildEndingSummary(state: GameState): EndingSummary {
  const family = state.endingType ?? "natural";
  const dominantAxes = getDominantAxes(state.narrative);
  const primary = dominantAxes[0];
  const secondary = dominantAxes[1];
  const archetypeId = `${family}:${dominantAxes.slice(0, 2).join("+")}`;
  const archetype = AXIS_ARCHETYPES[primary];
  const title = `${archetype} · ${ENDING_FAMILIES[family]}`;
  const resolved = Object.values(state.narrative.threads).filter((thread) => thread.status === "resolved");
  const open = Object.values(state.narrative.threads).filter((thread) => thread.status === "open");
  const broken = Object.values(state.narrative.threads).filter((thread) => thread.status === "broken");
  const keyMemory = state.narrative.memories.at(-1)?.outcomeText;
  const threadLine =
    resolved.length + broken.length > 0
      ? `有 ${resolved.length + broken.length} 条命运线走到尽头，其中 ${resolved.length} 条得偿，${broken.length} 条断裂。`
      : "此世尚未走完一条完整的命运线。";
  const openLine = open.length > 0 ? `另有 ${open.length} 条命运线仍悬在身后。` : "";
  const prophecyVerdict = evaluateProphecy(state);
  const verdictLine =
    prophecyVerdict === "fulfilled"
      ? "命格谶语应验了。"
      : prophecyVerdict === "defied"
        ? "你走了一条与谶语相反的路。"
        : "这句谶语到最后也没有得到回答。";
  const epitaph =
    EPITAPHS[`${primary}:${secondary}` as keyof typeof EPITAPHS] ??
    (family === "ascend"
      ? "此身已渡，此心仍问。"
      : family.startsWith("death")
        ? "道途有尽，选择无回。"
        : "来如微尘，去时留痕。");

  return {
    archetypeId,
    family,
    title,
    subtitle: `${AXIS_LABELS[primary]}为骨 · ${AXIS_LABELS[secondary]}为念 · ${resolved.length + broken.length} 段因果落定`,
    narrative: [ENDING_NARRATIVES[family], threadLine, openLine, verdictLine].filter(Boolean).join(" "),
    epitaph,
    dominantAxes,
    resolvedThreads: resolved.map((thread) => thread.threadId),
    openThreads: open.map((thread) => thread.threadId),
    keyMemory,
    signature: `FATE-${state.runSeed}-${state.turn}-${family}-${dominantAxes.slice(0, 2).join("-")}`,
    finalAge: state.age,
    realmSlug: state.realmSlug,
    heartIntent: state.heartIntent,
    prophecyText: state.prophecy.text,
    prophecyVerdict,
    textureAxes: computeTextureAxes(state.narrative),
    relationEpitaphs: buildRelationEpitaphs(state),
    brokenThreads: broken.map((thread) => thread.threadId),
    achievements: state.narrative.titles,
    obsessions: buildObsessions(state),
    lifeNumber: state.lifeNumber,
  };
}
