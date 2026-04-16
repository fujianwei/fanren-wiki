import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

export const metadata: Metadata = {
  title: "凡人修仙传·人界篇 | 你是哪位修仙人物？",
  description: "凡人修仙传人界篇主题网站，完成12道修仙情景题，测试你最像哪位人界人物。",
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
