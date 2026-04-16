export type RealmSlug = "lianqi" | "zhuji" | "jiedan" | "yuanying" | "huashen";
export type OutcomeSlug =
  | "caidan" | "feisheng" | "tupo" | "shouhu" | "yinshi" | "doufa" | "zuohua"
  | "moxiu" | "bawang" | "xinmo" | "beici" | "shuangxiu" | "zongshi"
  | "tiandi" | "niepan" | "fanchen" | "xianyou";
export type PathId = "A1" | "A2" | "B1" | "B2";
export type MbtiDimension = "EI" | "SN" | "TF" | "JP";

export interface DestinyScores {
  courage: number;
  wisdom: number;
  loyalty: number;
  ambition: number;
  perseverance: number;
}

export interface MbtiVotes {
  E: number; I: number;
  S: number; N: number;
  T: number; F: number;
  J: number; P: number;
}

export interface ChoiceOption {
  text: string;
  scores: Partial<DestinyScores>;
  mbti?: Partial<Record<MbtiDimension, string>>;
  branch?: "A" | "B";
  branch2?: PathId;
}

export interface SliderQuestion {
  id: string;
  type: "slider";
  text: string;
  leftLabel: string;
  rightLabel: string;
  scoring: {
    left: { scores: Partial<DestinyScores>; mbti?: Partial<Record<MbtiDimension, string>> };
    middle: { scores: Partial<DestinyScores> };
    right: { scores: Partial<DestinyScores>; mbti?: Partial<Record<MbtiDimension, string>> };
  };
  timed?: false;
}

export interface RankingOption {
  text: string;
  dimension: keyof DestinyScores | "wisdom_sn";
  split?: boolean;
  splitDimensions?: (keyof DestinyScores)[];
}

export interface RankingQuestion {
  id: string;
  type: "ranking";
  text: string;
  options: RankingOption[];
  rankScores: [number, number, number, number];
  timed?: false;
}

export interface ChoiceQuestion {
  id: string;
  type: "choice" | "image-choice";
  text: string;
  options: ChoiceOption[];
  timed?: number;
}

export type DestinyQuestion = SliderQuestion | RankingQuestion | ChoiceQuestion;

export interface Realm {
  slug: RealmSlug;
  name: string;
  description: string;
  baseLifespan: number;
}

export interface Outcome {
  slug: OutcomeSlug;
  name: string;
  description: string;
  keywords: string[];
  personalityNote: string;
}

export interface DestinyResult {
  realm: Realm;
  outcome: Outcome;
  lifespan: number;
  scores: DestinyScores;
  mbtiType: string;
  resultId: string;
}

// ===== v3: 动态题目系统类型 =====

export type VersionCondition =
  | { type: "prevAnswer"; value: string }
  | { type: "score"; dimension: keyof DestinyScores; gte: number }
  | { type: "score"; dimension: keyof DestinyScores; lt: number }
  | { type: "default" };

export interface SliderScoring {
  left: { scores: Partial<DestinyScores>; mbti?: Partial<Record<MbtiDimension, string>> };
  middle: { scores: Partial<DestinyScores>; mbti?: Partial<Record<MbtiDimension, string>> };
  right: { scores: Partial<DestinyScores>; mbti?: Partial<Record<MbtiDimension, string>> };
}

export interface QuestionVersion {
  condition: VersionCondition;
  text: string;
  options?: ChoiceOption[];
  leftLabel?: string;
  rightLabel?: string;
  scoring?: SliderScoring;
  rankingTexts?: string[];
}

export interface DynamicQuestion {
  id: string;
  type: "choice" | "image-choice" | "slider" | "ranking";
  timed?: number;
  versions: QuestionVersion[];
}

export interface ResolvedQuestionVersion extends QuestionVersion {
  id: string;
  type: "choice" | "image-choice" | "slider" | "ranking";
  timed?: number;
  rankScores?: [number, number, number, number];
}
