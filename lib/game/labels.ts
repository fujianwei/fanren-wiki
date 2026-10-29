import realmsData from "@/content/game/realms.json";
import type { HeartIntent, RealmConfig, RealmSlug, RelationKind, SectPath } from "@/types/game";

const REALMS = realmsData as RealmConfig[];

export const REALM_ORDER: RealmSlug[] = ["lianqi", "zhuji", "jiedan", "yuanying", "huashen"];

export const REALM_NAMES = Object.fromEntries(
  REALMS.map((realm) => [realm.slug, realm.name.replace(/期$/, "")])
) as Record<RealmSlug, string>;

export const NEXT_REALM_NAMES: Record<RealmSlug, string> = {
  lianqi: REALM_NAMES.zhuji,
  zhuji: REALM_NAMES.jiedan,
  jiedan: REALM_NAMES.yuanying,
  yuanying: REALM_NAMES.huashen,
  huashen: "飞升",
};

export const INTENT_LABELS: Record<HeartIntent, string> = {
  longevity: "求长生",
  revenge: "求复仇",
  guard: "求守护",
  freedom: "求自在",
};

export const SECT_LABELS: Record<SectPath, string> = {
  zhengdao: "正道",
  modao: "魔道",
  sanxiu: "散修",
};

export const RELATION_KIND_LABELS: Record<RelationKind, string> = {
  master: "师门",
  peer: "道友",
  rival: "仇怨",
  kin: "亲族",
  companion: "道侣",
  disciple: "弟子",
};
