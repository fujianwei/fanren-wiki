import eventsHuashen from "@/content/game/events-huashen.json";
import eventsJiedan from "@/content/game/events-jiedan.json";
import eventsLianqi from "@/content/game/events-lianqi.json";
import eventsYuanying from "@/content/game/events-yuanying.json";
import eventsZhuji from "@/content/game/events-zhuji.json";
import eventsLife from "@/content/game/events-life.json";
import { pickFateThreadEvent } from "@/lib/game/narrative";
import { createRandom } from "@/lib/game/random";
import type { EventCondition, GameEvent, GameState } from "@/types/game";

const BASE_EVENTS = [
  ...(eventsLianqi as GameEvent[]),
  ...(eventsZhuji as GameEvent[]),
  ...(eventsJiedan as GameEvent[]),
  ...(eventsYuanying as GameEvent[]),
  ...(eventsHuashen as GameEvent[]),
  ...(eventsLife as GameEvent[]),
];

function flagsMatch(condition: EventCondition["flags"], state: GameState): boolean {
  if (!condition) return true;
  return Object.entries(condition).every(([key, value]) => state.flags[key] === value);
}

export function eventMatches(event: GameEvent, state: GameState): boolean {
  if (event.requiresKarma && !state.eventHistory.includes(event.requiresKarma)) return false;
  if (event.requiresSect && !state.sectPath) return false;
  const condition = event.condition;
  if (!condition) {
    return event.realmSlug === state.realmSlug;
  }
  if (condition.realms && !condition.realms.includes(state.realmSlug)) return false;
  if (!condition.realms && event.source === "life" && event.realmSlug !== state.realmSlug && state.realmSlug !== "lianqi") {
    // Life events are realm-agnostic and use stage gates instead.
  }
  if (condition.minAge != null && state.age < condition.minAge) return false;
  if (condition.maxAge != null && state.age > condition.maxAge) return false;
  if (condition.minStage != null && state.stage < condition.minStage) return false;
  if (condition.maxStage != null && state.stage > condition.maxStage) return false;
  const recentFocus = state.stageFocus ?? state.focusHistory.at(-1)?.focusId;
  if (condition.focusAny && (!recentFocus || !condition.focusAny.includes(recentFocus))) return false;
  if (condition.axes) {
    for (const [axis, range] of Object.entries(condition.axes)) {
      const value = state.narrative.axes[axis as keyof typeof state.narrative.axes];
      if (range.min != null && value < range.min) return false;
      if (range.max != null && value > range.max) return false;
    }
  }
  if (condition.tagsAny && !condition.tagsAny.some((tag) => state.narrative.tags[tag])) return false;
  if (condition.tagsAll && !condition.tagsAll.every((tag) => state.narrative.tags[tag])) return false;
  if (condition.scarsAny && !condition.scarsAny.some((scar) => state.narrative.scars.includes(scar))) return false;
  if (condition.relationsAny) {
    const matches = condition.relationsAny.every((requirement) => {
      const relation = Object.values(state.relations).find((candidate) => candidate.kind === requirement.kind);
      if (!relation) return false;
      if (requirement.minAffinity != null && relation.affinity < requirement.minAffinity) return false;
      if (requirement.maxAffinity != null && relation.affinity > requirement.maxAffinity) return false;
      if (requirement.minTrust != null && relation.trust < requirement.minTrust) return false;
      if (requirement.maxTrust != null && relation.trust > requirement.maxTrust) return false;
      if (requirement.status && relation.status !== requirement.status) return false;
      return true;
    });
    if (!matches) return false;
  }
  return flagsMatch(condition.flags, state);
}

function buildObsessionEcho(state: GameState): GameEvent | null {
  const obsession = state.meta.selectedObsession;
  if (!obsession || state.flags.obsessionEchoSeen || state.stage > 4) return null;
  return {
    id: `obsession:${obsession.id}`,
    realmSlug: state.realmSlug,
    category: "karma",
    title: "似曾相识",
    description: `你第一次听见“${obsession.title}”这几个字时，心里莫名停了一拍。${obsession.text} 这件事按理说与你无关，可你总觉得，自己曾经错过它一次。`,
    source: "life",
    priority: 30,
    once: true,
    options: [
      {
        text: "顺着这股熟悉感追下去",
        effects: [
          { type: "fate", amount: 5 },
          { type: "emotion", positive: 2, negative: 2 },
          { type: "relation", kind: "peer", affinity: 4, trust: 3, memory: "你们在一件本不该有关的事上同时停了脚。", tag: "前世残响" },
          { type: "set_flag", key: "obsessionEchoSeen", value: true },
        ],
        outcomeText: "你不知道自己为什么追上去。只是那一刻，你不想再让同一种遗憾发生第二次。",
        narrative: {
          axes: { attachment: 3, freedom: -1 },
          tags: [{ id: "deed.followed_echo", label: "追随过前世残响", strength: 2 }],
          memory: "有一件前世没有放下的事，在这一世第一次露出了痕迹。",
        },
      },
      {
        text: "把它当作错觉，继续赶路",
        effects: [
          { type: "xp", amount: 4 },
          { type: "emotion", negative: 3 },
          { type: "set_flag", key: "obsessionEchoSeen", value: true },
        ],
        outcomeText: "你告诉自己那只是错觉。可走出很远以后，你还是回头看了一眼。",
        narrative: {
          axes: { dao: 2, attachment: -2 },
          tags: [{ id: "scar.denied_echo", label: "否认过前世的回响", strength: 2 }],
          memory: "你曾经回头看了一眼，却最终没有停下。",
        },
      },
    ],
  };
}

export function pickStageEvent(state: GameState): GameEvent | null {
  const obsessionEcho = buildObsessionEcho(state);
  if (obsessionEcho) return obsessionEcho;

  if (state.stage > 0 && state.stage % 2 === 0) {
    const fateEvent = pickFateThreadEvent(state);
    if (fateEvent) return fateEvent;
  }

  const random = createRandom(state.runSeed, `event-${state.stage}-${state.turn}-${state.realmSlug}`);
  const candidates = BASE_EVENTS.filter((event) => {
    if (event.once && state.eventHistory.includes(event.id)) return false;
    if (state.eventHistory.slice(-Math.max(4, event.cooldownStages ?? 0)).includes(event.id)) return false;
    return eventMatches(event, state);
  });

  if (candidates.length === 0) {
    return pickFateThreadEvent(state);
  }

  const lifeCandidates = candidates.filter((event) => event.source === "life");
  const baseCandidates = candidates.filter((event) => event.source !== "life");
  const sourcePool = lifeCandidates.length > 0 && random() < 0.68 ? lifeCandidates : baseCandidates.length > 0 ? baseCandidates : candidates;
  const sorted = [...sourcePool].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  const topPriority = sorted[0]?.priority ?? 0;
  const priorityPool = sorted.filter((event) => (event.priority ?? 0) === topPriority);
  const totalWeight = priorityPool.reduce((sum, event) => sum + (event.weight ?? 10), 0);
  let roll = random() * totalWeight;
  for (const event of priorityPool) {
    roll -= event.weight ?? 10;
    if (roll <= 0) return event;
  }
  return priorityPool.at(-1) ?? null;
}
