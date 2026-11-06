"use client";

import Image from "next/image";
import { useState } from "react";
import type { SceneArt } from "@/lib/game/scene-art";

interface Props {
  scene: SceneArt;
}

export default function SceneBackground({ scene }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const useFallback = failedSrc === scene.src && Boolean(scene.fallbackSrc);
  const src = useFallback ? scene.fallbackSrc! : scene.src;

  return (
    <div aria-hidden="true" className="absolute inset-0 hidden pointer-events-none overflow-hidden md:block" style={{ zIndex: 0 }}>
      <Image
        key={`${scene.id}-${src}`}
        src={src}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        onError={() => {
          if (failedSrc !== scene.src && scene.fallbackSrc) setFailedSrc(scene.src);
        }}
        style={{
          imageRendering: scene.pixelated === false ? "auto" : "pixelated",
          filter: "blur(18px) saturate(.72)",
          transform: "scale(1.10)",
          opacity: .22,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: [
            "linear-gradient(180deg, rgba(7,13,10,.48) 0%, rgba(7,13,10,.86) 54%, #070d0a 100%)",
            `radial-gradient(ellipse at 48% 18%, ${scene.accent}0d, transparent 56%)`,
            "linear-gradient(90deg, rgba(7,13,10,.72), transparent 26%, transparent 74%, rgba(7,13,10,.72))",
          ].join(", "),
        }}
      />
    </div>
  );
}
