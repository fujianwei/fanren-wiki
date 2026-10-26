"use client";

import type { RealmSlug } from "@/types/game";

interface Props {
  eventId: string | null;
  realmSlug: RealmSlug;
}

const REALM_GLOW: Record<RealmSlug, string> = {
  lianqi: "rgba(74,222,154,.10)",
  zhuji: "rgba(87,175,235,.10)",
  jiedan: "rgba(212,168,67,.11)",
  yuanying: "rgba(183,139,255,.11)",
  huashen: "rgba(232,200,106,.13)",
};

/**
 * The repository does not ship raster backgrounds for every event. Rather than
 * probing missing files on every render, render a stable ink-wash atmosphere.
 * Event and realm still alter the composition so future content can tune it.
 */
export default function SceneBackground({ eventId, realmSlug }: Props) {
  const glow = REALM_GLOW[realmSlug];
  const eventShift = eventId
    ? (eventId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 36) - 18
    : 0;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        background: [
          `radial-gradient(ellipse at ${28 + eventShift}% 18%, ${glow} 0%, transparent 52%)`,
          "radial-gradient(ellipse at 82% 74%, rgba(212,168,67,.045) 0%, transparent 48%)",
          "linear-gradient(165deg, rgba(14,22,18,.72), rgba(7,12,10,.96))",
        ].join(", "),
      }}
    />
  );
}
