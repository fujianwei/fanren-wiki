"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import type { SceneArt } from "@/lib/game/scene-art";

interface Props {
  scene: SceneArt;
  children?: ReactNode;
  className?: string;
  priority?: boolean;
  compact?: boolean;
}

export default function PixelScene({ scene, children, className = "", priority = false, compact = false }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const useFallback = failedSrc === scene.src && Boolean(scene.fallbackSrc);
  const src = useFallback ? scene.fallbackSrc! : scene.src;
  const alt = `${scene.label}场景`;

  return (
    <div
      className={`relative overflow-hidden ${compact ? "aspect-[16/10] sm:aspect-[2.35/1]" : "aspect-[4/3] sm:aspect-[16/8.7]"} ${className}`}
      style={{ backgroundColor: "#07100c", isolation: "isolate" }}
    >
      <Image
        key={src}
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 92vw, 1180px"
        className="object-cover"
        onError={() => {
          if (failedSrc !== scene.src && scene.fallbackSrc) setFailedSrc(scene.src);
        }}
        style={{
          imageRendering: scene.pixelated === false ? "auto" : "pixelated",
          transform: "scale(1.012)",
          filter: "brightness(1.12) saturate(1.06) contrast(1.02)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            "linear-gradient(180deg, rgba(4,8,6,.05) 0%, rgba(4,8,6,.02) 48%, rgba(4,8,6,.88) 100%)",
            "linear-gradient(90deg, rgba(4,8,6,.34), transparent 24%, transparent 76%, rgba(4,8,6,.34))",
            "radial-gradient(ellipse at center, transparent 42%, rgba(3,7,5,.28) 100%)",
          ].join(", "),
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[.08]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,.20) 3px 4px)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[.16]"
        style={{ backgroundImage: `linear-gradient(90deg, ${scene.accent}14, transparent 32%, transparent 70%, ${scene.accent}12)` }}
      />
      {children}
    </div>
  );
}
