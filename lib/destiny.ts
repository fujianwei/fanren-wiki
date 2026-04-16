import realmsData from "@/content/destiny/realms.json";
import outcomesData from "@/content/destiny/outcomes.json";
import type { DestinyScores, MbtiVotes, Realm, Outcome, RealmSlug, OutcomeSlug, PathId, DynamicQuestion, ResolvedQuestionVersion } from "@/types/destiny";

const realms = realmsData as Realm[];
const outcomes = outcomesData as Outcome[];

export function calcRealm(scores: DestinyScores): Realm {
  const sum = scores.courage + scores.ambition;
  let slug: RealmSlug;
  if (sum >= 90) slug = "huashen";
  else if (sum >= 75) slug = "yuanying";
  else if (sum >= 60) slug = "jiedan";
  else if (sum >= 40) slug = "zhuji";
  else slug = "lianqi";
  return realms.find((r) => r.slug === slug)!;
}

export function calcLifespan(baseLifespan: number, wisdom: number): number {
  return Math.round(baseLifespan * (0.8 + wisdom / 250));
}

export function calcOutcome(
  scores: DestinyScores,
  realmSlug: string,
  path: PathId = "A1"
): Outcome {
  const { wisdom, ambition, loyalty, courage } = scores;
  let slug: OutcomeSlug;

  // B2 路径：xianyou 是最高优先级（0.3%，无条件）
  if (path === "B2" && Math.random() < 0.003) {
    slug = "xianyou";
  }
  // 彩蛋先判断（各路径通用）
  else if (wisdom >= 85 && ambition >= 85 && Math.random() < 0.01) {
    slug = "caidan";
  } else {
    switch (path) {
      case "A1":
        if (realmSlug === "huashen" && ((scores as any).perseverance ?? 0) >= 80) slug = "feisheng";
        else if (courage >= 80 && wisdom < 30 && loyalty < 30) slug = "bawang";
        else if (courage >= 70 && loyalty < 30) slug = "moxiu";
        else if (loyalty >= 70) slug = "shouhu";
        else if (courage >= 70 && wisdom < 40) slug = "doufa";
        else if (ambition >= 80 && wisdom < 40) slug = "tupo";
        else slug = "zuohua";
        break;

      case "A2":
        if (realmSlug === "huashen" && ((scores as any).perseverance ?? 0) >= 80) slug = "feisheng";
        else if (loyalty >= 80 && courage >= 60) slug = "shuangxiu";
        else if (ambition >= 80 && loyalty < 25) slug = "xinmo";
        else if (loyalty >= 70 && wisdom < 35) slug = "beici";
        else if (wisdom >= 70 && ambition < 40 && courage >= 50) slug = "zongshi";
        else if (ambition >= 80 && wisdom < 40) slug = "tupo";
        else slug = "zuohua";
        break;

      case "B1": {
        const tupoCondition = ambition >= 80 && wisdom < 40;
        if (realmSlug === "huashen" && ((scores as any).perseverance ?? 0) >= 80) slug = "feisheng";
        else if (wisdom >= 85 && loyalty >= 70) slug = "tiandi";
        else if (tupoCondition && Math.random() < 0.05) slug = "niepan";
        else if (wisdom >= 70 && ambition < 40 && courage >= 50) slug = "zongshi";
        else if (wisdom >= 60 && ambition < 50) slug = "yinshi";
        else if (tupoCondition) slug = "tupo";
        else slug = "zuohua";
        break;
      }

      case "B2":
        if (realmSlug === "huashen" && ((scores as any).perseverance ?? 0) >= 80) slug = "feisheng";
        else if (loyalty >= 70 && wisdom < 35) slug = "beici";
        else if (loyalty >= 70) slug = "shouhu";
        else if (courage < 30 && ambition < 30) slug = "fanchen";
        else if (ambition >= 80 && wisdom < 40) slug = "tupo";
        else slug = "zuohua";
        break;

      default: {
        slug = "zuohua";
        break;
      }
    }
  }

  return outcomes.find((o) => o.slug === slug)!;
}

export function calcMbti(votes: MbtiVotes): string {
  // ties default to I, N, F, P
  const ei = votes.E > votes.I ? "E" : "I";
  const sn = votes.S > votes.N ? "S" : "N";
  const tf = votes.T > votes.F ? "T" : "F";
  const jp = votes.J > votes.P ? "J" : "P";
  return `${ei}${sn}${tf}${jp}`;
}

export function applyScores(
  current: DestinyScores,
  delta: Partial<DestinyScores>
): DestinyScores {
  const result = { ...current };
  for (const key of Object.keys(delta) as (keyof DestinyScores)[]) {
    result[key] = Math.max(0, Math.min(100, result[key] + (delta[key] ?? 0)));
  }
  return result;
}

export function resolveQuestion(
  question: DynamicQuestion,
  prevAnswer: string | null,
  scores: DestinyScores
): ResolvedQuestionVersion {
  let matched: (typeof question.versions)[number] | undefined;

  for (const version of question.versions) {
    const cond = version.condition;
    if (cond.type === "prevAnswer" && prevAnswer === cond.value) {
      matched = version; break;
    }
    if (cond.type === "score") {
      const val = scores[cond.dimension];
      if ("gte" in cond && val >= cond.gte) { matched = version; break; }
      if ("lt" in cond && val < cond.lt) { matched = version; break; }
    }
    if (cond.type === "default") { matched = version; break; }
  }

  const v = matched ?? question.versions[question.versions.length - 1];
  return { ...v, id: question.id, type: question.type, timed: question.timed } as ResolvedQuestionVersion;
}

interface RealmTrialResult {
  realm: Realm;
  diedInTrials: boolean;
}

function trialRate(base: number, p: number, pCoef: number, f: number, fCoef: number): number {
  return Math.min(1, Math.max(0.01, (base + p * pCoef + f * fCoef) / 100));
}

export function calcRealmWithTrials(scores: { courage: number; perseverance: number; [key: string]: number }, fortune: number): RealmTrialResult {
  const sum = scores.courage + scores.perseverance;
  const order: RealmSlug[] = ["lianqi", "zhuji", "jiedan", "yuanying", "huashen"];

  let targetSlug: RealmSlug;
  if (sum >= 90) targetSlug = "huashen";
  else if (sum >= 75) targetSlug = "yuanying";
  else if (sum >= 60) targetSlug = "jiedan";
  else if (sum >= 40) targetSlug = "zhuji";
  else targetSlug = "lianqi";

  const targetIdx = order.indexOf(targetSlug);
  const p = scores.perseverance;
  const f = fortune;

  const rates: Record<string, [number, number, number, number, number]> = {
    "lianqi->zhuji":    [70, p, 0.2, f, 0.1],
    "zhuji->jiedan":    [35, p, 0.3, f, 0.15],
    "jiedan->yuanying": [15, p, 0.4, f, 0.2],
    "yuanying->huashen":[10, p, 0.5, f, 0.25],
  };

  let currentIdx = 0;
  for (let i = 0; i < targetIdx; i++) {
    const key = `${order[i]}->${order[i + 1]}`;
    const [base, , pC, , fC] = rates[key];
    const rate = trialRate(base, p, pC, f, fC);
    if (Math.random() >= rate) {
      return {
        realm: realms.find((r) => r.slug === order[i])!,
        diedInTrials: true,
      };
    }
    currentIdx = i + 1;
  }

  return {
    realm: realms.find((r) => r.slug === order[currentIdx])!,
    diedInTrials: false,
  };
}
