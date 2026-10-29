import whispersData from "@/content/game/fate-whispers.json";
import { FATE_THREADS, getThreadTitle } from "@/lib/game/narrative";
import type { FateAtlasEntry, FateThreadState, MetaState } from "@/types/game";

const WHISPERS = whispersData as Array<{ threadId: string; hint: string }>;

export interface AtlasSummary {
  seen: number;
  resolved: number;
  broken: number;
  unseen: number;
  total: number;
}

export function recordLifeInAtlas(
  existing: Record<string, FateAtlasEntry> | undefined,
  threads: Record<string, FateThreadState>,
  lifeNumber: number
): Record<string, FateAtlasEntry> {
  const atlas = { ...(existing ?? {}) };
  for (const thread of Object.values(threads)) {
    const previous = atlas[thread.threadId];
    atlas[thread.threadId] = {
      threadId: thread.threadId,
      encountered: true,
      resolved: Boolean(previous?.resolved || thread.status === "resolved"),
      broken: Boolean(previous?.broken || thread.status === "broken"),
      lastLife: lifeNumber,
      resolution: thread.resolution ?? previous?.resolution,
    };
  }
  return atlas;
}

export function getAtlasSummary(meta: MetaState): AtlasSummary {
  const atlas = meta.fateAtlas ?? {};
  const entries = Object.values(atlas);
  return {
    seen: entries.filter((entry) => entry.encountered).length,
    resolved: entries.filter((entry) => entry.resolved).length,
    broken: entries.filter((entry) => entry.broken).length,
    unseen: FATE_THREADS.length - entries.filter((entry) => entry.encountered).length,
    total: FATE_THREADS.length,
  };
}

export function getUnseenWhisper(meta: MetaState, seed: number): { threadId: string; title: string; hint: string } | null {
  const seen = new Set(Object.keys(meta.fateAtlas ?? {}));
  const unseen = FATE_THREADS.filter((thread) => !seen.has(thread.id));
  if (unseen.length === 0) return null;
  const selected = unseen[Math.abs(seed) % unseen.length];
  return {
    threadId: selected.id,
    title: selected.title,
    hint: WHISPERS.find((item) => item.threadId === selected.id)?.hint ?? selected.theme,
  };
}

export function getThreadWhisper(threadId: string): string {
  return WHISPERS.find((item) => item.threadId === threadId)?.hint ?? getThreadTitle(threadId);
}
