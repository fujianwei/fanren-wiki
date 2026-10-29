import celestialsData from "@/content/game/celestials.json";
import { getSpiritRoot } from "@/lib/game/engine";
import type { CelestialConfig, SpiritRoot } from "@/types/game";

export const CELESTIALS = celestialsData as CelestialConfig[];

export function getShanghaiDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function hashDateKey(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getDailySeed(dateKey = getShanghaiDateKey()): number {
  return hashDateKey(`fanren-daily:${dateKey}`);
}

export function getCelestialById(id: string): CelestialConfig {
  return CELESTIALS.find((celestial) => celestial.id === id) ?? CELESTIALS[0];
}

export function getDailyCelestial(dateKey = getShanghaiDateKey()): CelestialConfig {
  return CELESTIALS[getDailySeed(dateKey) % CELESTIALS.length];
}

export interface DailyContext {
  dateKey: string;
  seed: number;
  fortune: number;
  spiritRoot: SpiritRoot;
  celestial: CelestialConfig;
}

export function getDailyContext(dateKey = getShanghaiDateKey()): DailyContext {
  const seed = getDailySeed(dateKey);
  const fortune = 1 + (seed % 100);
  return {
    dateKey,
    seed,
    fortune,
    spiritRoot: getSpiritRoot(fortune),
    celestial: getDailyCelestial(dateKey),
  };
}

export function getCelestialWeight(celestialId: string, category: keyof CelestialConfig["categoryWeights"]): number {
  return getCelestialById(celestialId).categoryWeights[category] ?? 1;
}
