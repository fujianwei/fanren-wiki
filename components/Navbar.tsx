"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      className="w-full border-b px-6 py-3 sticky top-0"
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
          className="font-serif font-bold text-lg tracking-widest"
          style={{
            background: "linear-gradient(90deg, #6fedb5, #d4a843)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          凡人修仙传·人界篇
        </Link>
        <div className="flex gap-6 text-sm" style={{ color: "#6a8878" }}>
          <span className="cursor-not-allowed opacity-50" title="敬请期待">人物百科</span>
          <span className="cursor-not-allowed opacity-50" title="敬请期待">地图势力</span>
          <span className="cursor-not-allowed opacity-50" title="敬请期待">剧情时间线</span>
          <Link
            href="/quiz"
            className="font-medium transition-colors"
            style={{ color: "#6fedb5" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#4ade9a")}
            onMouseLeave={e => (e.currentTarget.style.color = "#6fedb5")}
          >
            人物测试
          </Link>
        </div>
      </div>
    </nav>
  );
}
