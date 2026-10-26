import { randomPick } from "@/lib/game/random";
import type { RelationKind, RelationState } from "@/types/game";

const SURNAMES = ["沈", "陆", "顾", "谢", "苏", "温", "裴", "宁", "闻", "楚", "叶", "江"];
const GIVEN = ["青崖", "照微", "长风", "知白", "问川", "怀瑾", "疏影", "临渊", "归鹤", "若水", "无咎", "观澜"];
const TITLES: Record<RelationKind, string> = {
  master: "授业师尊",
  peer: "同门道友",
  rival: "宿怨之敌",
  kin: "凡人亲族",
  companion: "道侣",
  disciple: "门下弟子",
};

const INITIAL_KINDS: RelationKind[] = ["master", "peer", "rival", "kin"];

export function createCharacterName(random: () => number): string {
  return `${randomPick(SURNAMES, random)}${randomPick(GIVEN, random)}`;
}

export function createInitialRelations(
  seed: number,
  random: () => number,
  inheritedTag?: string
): Record<string, RelationState> {
  const relations: Record<string, RelationState> = {};
  const usedNames = new Set<string>();
  INITIAL_KINDS.forEach((kind) => {
    let name = `${randomPick(SURNAMES, random)}${randomPick(GIVEN, random)}`;
    let attempts = 0;
    while (usedNames.has(name) && attempts < 20) {
      name = `${randomPick(SURNAMES, random)}${randomPick(GIVEN, random)}`;
      attempts += 1;
    }
    usedNames.add(name);
    const baseAffinity = kind === "rival" ? -35 : kind === "kin" ? 35 : kind === "master" ? 20 : 10;
    const baseTrust = kind === "rival" ? 5 : kind === "kin" ? 50 : kind === "master" ? 45 : 30;
    relations[kind] = {
      id: kind,
      name,
      kind,
      title: TITLES[kind],
      affinity: baseAffinity,
      trust: baseTrust,
      status: "active",
      lastInteractionStage: 0,
      tags: inheritedTag && kind === "peer" ? [inheritedTag] : [],
      memory: inheritedTag && kind === "peer" ? "你第一次见到此人时，心里升起一种说不清的熟悉。" : undefined,
    };
  });
  return relations;
}

export function relationLabel(relation: RelationState): string {
  return `${relation.title} · ${relation.name}`;
}

export function relationMood(affinity: number, trust: number): string {
  if (trust >= 70 && affinity >= 50) return "生死相托";
  if (affinity >= 30) return "亲近";
  if (affinity <= -50) return "势不两立";
  if (affinity <= -20) return "疏离戒备";
  if (trust < 20) return "貌合神离";
  return "关系平顺";
}

export function driftRelations(
  relations: Record<string, RelationState>,
  drift: Partial<Record<RelationKind, number>>,
  stage: number,
  random: () => number
): Record<string, RelationState> {
  const next = { ...relations };
  for (const relation of Object.values(next)) {
    if (relation.status === "dead" || relation.status === "lost") continue;
    const base = drift[relation.kind] ?? 0;
    const jitter = Math.round((random() - 0.5) * 3);
    const affinity = Math.max(-100, Math.min(100, relation.affinity + base + jitter));
    const trust = Math.max(0, Math.min(100, relation.trust + Math.round(base / 2) + jitter));
    next[relation.id] = {
      ...relation,
      affinity,
      trust,
      status: affinity <= -70 && trust <= 15 ? "estranged" : relation.status,
      lastInteractionStage: base !== 0 ? stage : relation.lastInteractionStage,
    };
  }
  return next;
}

export function activeRelations(relations: Record<string, RelationState>): RelationState[] {
  return Object.values(relations).filter((relation) => relation.status === "active" || relation.status === "estranged");
}
