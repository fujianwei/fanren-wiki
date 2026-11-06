"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/game")) return null;
  return (
    <footer
      className="w-full px-4 py-6 mt-8 relative"
      style={{
        backgroundColor: "#0a0e0d",
        borderTop: "1px solid #1a2820",
        zIndex: 1,
      }}
    >
      <div className="max-w-5xl mx-auto text-center text-sm" style={{ color: "#6a8878" }}>
        <p>© 2026 凡人修仙传·人界篇 | 本站为粉丝创作，内容版权归原作者忘语所有</p>
        <p className="mt-1 text-xs opacity-70">非商业用途，仅供粉丝交流</p>
      </div>
    </footer>
  );
}
