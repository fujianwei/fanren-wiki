import itemsData from "@/content/game/items.json";
import type { Inventory, ItemConfig, RealmSlug } from "@/types/game";

export const ITEMS = itemsData as ItemConfig[];
export const ITEM_MAP = Object.fromEntries(ITEMS.map((item) => [item.id, item])) as Record<string, ItemConfig>;

function getBreakthroughPill(realmSlug: RealmSlug, inventory: Inventory): ItemConfig | undefined {
  return ITEMS.find((item) => {
    if ((inventory[item.id as keyof Inventory] ?? 0) <= 0) return false;
    const effect = item.effect;
    return effect.type === "breakthrough_bonus" && effect.realmFrom === realmSlug;
  });
}

function getBestArray(inventory: Inventory): ItemConfig | undefined {
  return ITEMS
    .filter((item) => (inventory[item.id as keyof Inventory] ?? 0) > 0 && item.effect.type === "retreat_xp_bonus")
    .sort((a, b) => {
      const aBonus = a.effect.type === "retreat_xp_bonus" ? a.effect.breakthrough_bonus : 0;
      const bBonus = b.effect.type === "retreat_xp_bonus" ? b.effect.breakthrough_bonus : 0;
      return bBonus - aBonus;
    })[0];
}

export function getBreakthroughBonuses(realmSlug: RealmSlug, inventory: Inventory) {
  const pill = getBreakthroughPill(realmSlug, inventory);
  const array = getBestArray(inventory);
  const pillBonus = pill?.effect.type === "breakthrough_bonus" ? pill.effect.bonus : 0;
  const arrayBonus = array?.effect.type === "retreat_xp_bonus" ? array.effect.breakthrough_bonus : 0;
  return { pill, array, pillBonus, arrayBonus };
}

export function getHeartDemonBonus(inventory: Inventory): number {
  const item = ITEMS.find((candidate) => {
    if ((inventory[candidate.id as keyof Inventory] ?? 0) <= 0) return false;
    return candidate.effect.type === "heart_demon_bonus";
  });
  return item?.effect.type === "heart_demon_bonus" ? item.effect.bonus : 0;
}

export function getRetreatXpBonus(inventory: Inventory): number {
  const item = getBestArray(inventory);
  return item?.effect.type === "retreat_xp_bonus" ? item.effect.mult : 0;
}

export function getAutoSaveItem(inventory: Inventory): ItemConfig | undefined {
  return ITEMS.find((item) => (inventory[item.id as keyof Inventory] ?? 0) > 0 && item.effect.type === "auto_save");
}
