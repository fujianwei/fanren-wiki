import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

export const metadata: Metadata = {
  title: "凡人修仙传·人界篇 | 修仙人生模拟",
  description: "一场从灵根、命格与选择开始的修仙人生模拟。灵根只决定起点，不决定你能走到哪里。",
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
