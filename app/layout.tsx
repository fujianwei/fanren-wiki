import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

export const metadata: Metadata = {
  title: "凡人修仙传·人界篇 | 修仙人生模拟",
  description: "一场从灵根、命格与选择开始的修仙人生模拟。灵根只决定起点，不决定你能走到哪里。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0e0d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <a href="#main-content" className="skip-link">跳到主要内容</a>
        <ParticleBackground />
        <Navbar />
        <main id="main-content" className="min-w-0 flex-1 relative" style={{ zIndex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
