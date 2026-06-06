"use client";

import { useState, useEffect } from "react";
import type { RealmSlug } from "@/types/game";

interface Props {
  eventId: string | null;
  realmSlug: RealmSlug;
}

export default function SceneBackground({ eventId, realmSlug }: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    // 依次尝试加载图片
    const candidates = [
      eventId ? `/game/events/${eventId}.jpg` : null,
      `/game/realms/${realmSlug}.jpg`,
    ].filter(Boolean) as string[];

    let cancelled = false;

    async function tryLoad() {
      for (const url of candidates) {
        const ok = await new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });
        if (cancelled) return;
        if (ok) { setSrc(url); return; }
      }
      if (!cancelled) setSrc(null);
    }

    setSrc(null);
    tryLoad();
    return () => { cancelled = true; };
  }, [eventId, realmSlug]);

  if (!src) {
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: "radial-gradient(ellipse at 30% 20%, rgba(26,40,32,0.9) 0%, rgba(10,14,13,1) 70%)",
        }}
      />
    );
  }

  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
        style={{ zIndex: 0, backgroundImage: `url(${src})` }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.92) 100%)",
        }}
      />
    </>
  );
}
