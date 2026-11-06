"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  if (pathname === "/game/play") return null;
  return (
    <nav
      aria-label="网站导航"
      className="site-nav w-full border-b sticky top-0"
      style={{
        backgroundColor: "rgba(10,14,13,0.85)",
        backdropFilter: "blur(12px)",
        borderColor: "#1a2820",
        zIndex: 50,
      }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center whitespace-nowrap font-serif font-bold text-base tracking-widest md:text-lg"
          style={{
            background: "linear-gradient(90deg, #6fedb5, #d4a843)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          凡人修仙传<span className="hidden sm:inline">· 人界篇</span>
        </Link>
        <div className="flex items-center gap-3 text-sm md:gap-6" style={{ color: "#6a8878" }}>
          <span className="hidden cursor-not-allowed opacity-50 md:inline" title="敬请期待">人物百科</span>
          <span className="hidden cursor-not-allowed opacity-50 md:inline" title="敬请期待">地图势力</span>
          <span className="hidden cursor-not-allowed opacity-50 md:inline" title="敬请期待">剧情时间线</span>
          <Link
            href="/game"
            className="inline-flex min-h-11 items-center font-medium transition-colors"
            style={{ color: "#d4a843" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#e8c86a")}
            onMouseLeave={e => (e.currentTarget.style.color = "#d4a843")}
          >
            修仙模拟
          </Link>
        </div>
      </div>
    </nav>
  );
}
