import { AXIS_LABELS } from "@/lib/game/narrative";
import type { LifeArchive, NarrativeAxis } from "@/types/game";

export interface MirrorInsight {
  headline: string;
  insight: string;
  axisCounts: Record<string, number>;
  verdicts: { fulfilled: number; defied: number; unanswered: number };
  endingFamilies: Record<string, number>;
  selectionBias: string;
}

function topEntry(record: Record<string, number>): [string, number] | null {
  const entries = Object.entries(record).sort((a, b) => b[1] - a[1]);
  return entries[0] ?? null;
}

export function buildThreeLifeMirror(lives: LifeArchive[]): MirrorInsight | null {
  const recent = lives.slice(-3);
  if (recent.length === 0) return null;
  const axisCounts: Record<string, number> = {};
  const verdicts = { fulfilled: 0, defied: 0, unanswered: 0 };
  const endingFamilies: Record<string, number> = {};

  for (const life of recent) {
    for (const axis of life.dominantAxes) {
      axisCounts[axis] = (axisCounts[axis] ?? 0) + 1;
    }
    verdicts[life.prophecyVerdict] += 1;
    const family = life.endingType ?? "natural";
    endingFamilies[family] = (endingFamilies[family] ?? 0) + 1;
  }

  const topAxis = topEntry(axisCounts)?.[0] as NarrativeAxis | undefined;
  const axisLabel = topAxis ? AXIS_LABELS[topAxis] : "未知";
  const fulfilled = verdicts.fulfilled;
  const defied = verdicts.defied;
  const headline =
    recent.length === 1
      ? "第一世留下的，不是答案，是一个问题。"
      : fulfilled > defied
        ? "你总是活成别人替你写好的那句话。"
        : defied > fulfilled
          ? "你总是在最后一刻，把命往另一个方向拧。"
          : "你介于顺命与逆命之间，像一条被反复改写的河。";

  const insight =
    recent.length === 1
      ? `第 1 世 · ${recent[0].endingTitle}。下一世，你会知道自己会不会做出同样的选择。`
      : `最近 ${recent.length} 世里，“${axisLabel}”出现了 ${axisCounts[topAxis ?? ""] ?? recent.length} 次。${
          fulfilled === recent.length
            ? "你每次都把谶语活成了事实。"
            : defied > 0
              ? `你有 ${defied} 次走到谶语的反面，也有 ${fulfilled} 次回到了它里面。`
              : "命运还没有给出明确的答案。"
        }`;

  const family = topEntry(endingFamilies);
  const selectionBias = family
    ? `你最常抵达的结局是“${family[0] === "ascend" ? "飞升灵界" : family[0] === "natural" ? "寿尽归尘" : family[0] === "death_battle" ? "战斗陨落" : family[0] === "death_heart" ? "心魔陨落" : family[0] === "death_break" ? "冲关陨落" : "天门遗恨"}”，${family[1]}/${recent.length} 世。`
    : "还没有足够的人生可以对照。";

  return { headline, insight, axisCounts, verdicts, endingFamilies, selectionBias };
}
