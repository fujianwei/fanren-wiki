import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

export const metadata: Metadata = {
  title: "凡人修仙传·人界篇 | 人物测试与修仙模拟",
  description: "凡人修仙传人界篇主题网站，包含人物性格测试与修仙模拟玩法。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className="min-h-screen flex flex-col">
        <ParticleBackground />
        <Navbar />
        <main className="flex-1 relative" style={{ zIndex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
