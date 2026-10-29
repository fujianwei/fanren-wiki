import oathsData from "@/content/game/life-oaths.json";
import { REALM_ORDER } from "@/lib/game/labels";
import type { GameState, LifeOathConfig, LifeOathStatus } from "@/types/game";

export const LIFE_OATHS = oathsData as LifeOathConfig[];

export function getLifeOath(id?: string | null): LifeOathConfig | undefined {
  return id ? LIFE_OATHS.find((oath) => oath.id === id) : undefined;
}

export function pickLifeOathChoices(seed: number, count = 3): LifeOathConfig[] {
  const start = Math.abs(seed) % LIFE_OATHS.length;
  return Array.from({ length: Math.min(count, LIFE_OATHS.length) }, (_, offset) => LIFE_OATHS[(start + offset * 3) % LIFE_OATHS.length]);
}

export function evaluateLifeOath(state: GameState, endingType: GameState["endingType"]): LifeOathStatus {
  if (!state.lifeOathId) return "unfinished";
  const realmIndex = REALM_ORDER.indexOf(state.realmSlug);

  switch (state.lifeOathId) {
    case "no_sect_core":
      if (state.sectPath) return "broken";
      return realmIndex >= REALM_ORDER.indexOf("jiedan") ? "fulfilled" : "unfinished";
    case "sea_return":
      return state.eventHistory.includes("life_sea_return") ? "fulfilled" : "unfinished";
    case "remembered_home":
      return state.eventHistory.includes("life_family_letter") && (state.relations.kin?.trust ?? 0) >= 55
        ? "fulfilled"
        : "unfinished";
    case "rival_peace":
      return state.narrative.tags["title.rival_peace"] ? "fulfilled" : "unfinished";
    case "wealth_5000":
      return state.lingshi >= 5000 ? "fulfilled" : "unfinished";
    case "long_300":
      return state.age >= 300 ? "fulfilled" : "unfinished";
    case "ascend_gate":
      return endingType === "ascend" ? "fulfilled" : "unfinished";
    case "master_truth":
      return state.narrative.tags["title.master_truth"] || state.narrative.tags["scar.burned_master_case"]
        ? "fulfilled"
        : "unfinished";
    default:
      return "unfinished";
  }
}
