import realmsData from "@/content/game/realms.json";
import spiritRootsData from "@/content/game/spirit-roots.json";
import type {
  RealmSlug,
  SpiritRoot,
  RealmConfig,
  LifespanEventType,
  RetreatDuration,
} from "@/types/game";

const realms = realmsData as RealmConfig[];
const spiritRoots = spiritRootsData as SpiritRoot[];

export function getRealmConfig(slug: RealmSlug): RealmConfig {
  const realm = realms.find((r) => r.slug === slug);
  if (!realm) {
    throw new Error(`Unknown realm slug: ${slug}`);
  }
  return realm;
}

export function getSpiritRoot(fortune: number): SpiritRoot {
  const sortedRoots = [...spiritRoots].sort(
    (a, b) => a.fortuneRange[0] - b.fortuneRange[0]
  );
  const matched = sortedRoots.find(
    (r) => fortune >= r.fortuneRange[0] && fortune <= r.fortuneRange[1]
  );
  if (matched) return matched;
  if (fortune > sortedRoots[sortedRoots.length - 1].fortuneRange[1]) {
    return sortedRoots[sortedRoots.length - 1];
  }
  return sortedRoots[0];
}

export function calcXpGain(
  basePoints: number,
  cultivationMult: number,
  currentXp: number = 0
): number {
  const gained = Math.round(basePoints * cultivationMult);
  const capped = Math.min(100, currentXp + gained) - currentXp;
  return Math.max(0, capped);
}

export function calcLifespanCost(
  realmSlug: RealmSlug,
  eventType: LifespanEventType,
  isModao: boolean = false
): number {
  const realm = getRealmConfig(realmSlug);
  let min: number, max: number;

  if (eventType === "event") { min = realm.eventCost.min; max = realm.eventCost.max; }
  else if (eventType === "dungeon") { min = realm.dungeonCost.min; max = realm.dungeonCost.max; }
  else if (eventType === "battle") { min = realm.battleCost.min; max = realm.battleCost.max; }
  else if (eventType === "retreat_short") { min = max = realm.retreatCost.short; }
  else if (eventType === "retreat_mid") { min = max = realm.retreatCost.mid; }
  else { min = max = realm.retreatCost.long; }

  const modaoReduction: Record<RealmSlug, number> = {
    lianqi: 0.30,
    zhuji: 0.25,
    jiedan: 0.20,
    yuanying: 0.10,
    huashen: 0.05,
  };

  const rawCost = min === max ? min : Math.floor(Math.random() * (max - min + 1)) + min;

  if (!isModao) return rawCost;

  // Modao reduction is applied to the range minimum to guarantee the result
  // is always strictly below the minimum possible non-modao cost
  return Math.floor(min * (1 - modaoReduction[realmSlug]));
}

export function isBreakthroughUnlocked(xp: number): boolean {
  return xp >= 90;
}

function xpMultiplier(xp: number): number {
  if (xp >= 100) return 1.0;
  if (xp >= 99) return 0.85;
  if (xp >= 95) return 0.70;
  if (xp >= 90) return 0.50;
  return 0;
}

function toNonNegativeFinite(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

export interface BreakthroughParams {
  realmSlug: RealmSlug;
  xp: number;
  itemBonus: number;
  lingshi: number;
  rootIntact: boolean;
  rootDamageCount: number;
  breakthroughExp: number;
}

export function calcBreakthroughRate(params: BreakthroughParams): number {
  const realm = getRealmConfig(params.realmSlug);
  const normalizedXp = toNonNegativeFinite(params.xp);
  const normalizedLingshi = toNonNegativeFinite(params.lingshi);
  const normalizedRootDamage = toNonNegativeFinite(params.rootDamageCount);
  const normalizedBreakthroughExp = toNonNegativeFinite(params.breakthroughExp);
  const normalizedItemBonus = Number.isFinite(params.itemBonus) ? params.itemBonus : 0;
  const base = realm.breakthroughRate * xpMultiplier(normalizedXp);

  // 灵石加成上限降低：每500灵石+2%，上限+5%
  const lingshiBonus = Math.min(0.05, Math.floor(normalizedLingshi / 500) * 0.02);
  // 根基稳固加成提升
  const rootBonus = params.rootIntact ? 0.15 : 0;
  const rootDamage = normalizedRootDamage * 0.05;
  const expBonus = Math.min(0.15, normalizedBreakthroughExp / 100);

  const total = base + normalizedItemBonus + lingshiBonus + rootBonus - rootDamage + expBonus;
  return Math.min(0.99, Math.max(0.01, total));
}

export function calcHeartDemonRate(positive: number, negative: number): number {
  const diff = positive - negative;
  if (diff >= 50) return 0.80;
  if (diff >= 20) return 0.60;
  if (diff >= 0) return 0.40;
  if (diff >= -20) return 0.20;
  return 0.05;
}

export function calcFateAscendRate(fate: number): number {
  if (fate >= 81) return 0.85;
  if (fate >= 61) return 0.65;
  if (fate >= 41) return 0.45;
  if (fate >= 21) return 0.25;
  return 0.10;
}

export function calcRetreatXp(
  realmSlug: RealmSlug,
  duration: RetreatDuration,
  cultivationMult: number,
  arrayMult: number = 0
): number {
  const realm = getRealmConfig(realmSlug);
  const base = realm.retreatXp[duration];
  return Math.round(base * cultivationMult * (1 + arrayMult));
}
