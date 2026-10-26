"use client";

import Image from "next/image";
import type { SceneArt } from "@/lib/game/scene-art";

interface Props {
  scene: SceneArt;
}

export default function SceneBackground({ scene }: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <Image
        key={scene.id}
        src={scene.src}
        alt=""
        fill
        unoptimized
        sizes="100vw"
        className="object-cover"
        style={{ imageRendering: "pixelated", filter: "blur(18px) saturate(.72)", transform: "scale(1.10)", opacity: .22 }}
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
