import type { MbtiType, Question } from "@/types";

export type Answers = Record<number, "A" | "B">;

/**
 * 根据答案计算 MBTI 类型
 * 每个维度取多数方向，平局时默认取 E/N/T/J（>= 时取左边）
 */
export function calculateMbti(
  answers: Answers,
  questions: Question[]
): MbtiType {
  const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  for (const question of questions) {
    const answer = answers[question.id];
    if (!answer) continue;
    const direction = answer === "A" ? question.aDirection : question.bDirection;
    scores[direction] = (scores[direction] || 0) + 1;
  }

  const ei = scores.E >= scores.I ? "E" : "I";
  const sn = scores.N >= scores.S ? "N" : "S";
  const tf = scores.T >= scores.F ? "T" : "F";
  const jp = scores.J >= scores.P ? "J" : "P";

  return `${ei}${sn}${tf}${jp}` as MbtiType;
}
