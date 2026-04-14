export type MbtiDimension = "EI" | "SN" | "TF" | "JP";
export type MbtiType =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP"
  | "INFJ" | "INFP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"
  | "ISTP" | "ISFP" | "ESTP" | "ESFP";

export interface Question {
  id: number;
  scenario: string;
  optionA: string;
  optionB: string;
  dimension: MbtiDimension;
  aDirection: string;
  bDirection: string;
}

export interface Character {
  mbti: MbtiType;
  name: string;
  title: string;
  description: string;
  traits: string[];
  quote: string;
}
