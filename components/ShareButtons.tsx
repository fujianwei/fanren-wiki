"use client";

import { useState } from "react";

interface ShareButtonsProps {
  characterName: string;
  mbti: string;
  resultUrl: string;
}

export default function ShareButtons({ characterName, mbti, resultUrl }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = `我在凡人修仙传人界篇人物测试中，测出我最像「${characterName}」(${mbti})！你也来测测看 → ${resultUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("请手动复制以下内容：", text);
    }
  }

  const weiboText = encodeURIComponent(
    `我在凡人修仙传人界篇人物测试中，测出我最像「${characterName}」(${mbti})！你也来测测看 → ${resultUrl}`
  );
  const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(resultUrl)}&title=${weiboText}`;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button onClick={handleCopy} className="btn-primary flex-1">
        {copied ? "✓ 已复制！" : "复制分享文字"}
      </button>
      <a
        href={weiboUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-center font-bold text-sm tracking-widest rounded-full py-3 px-6 transition-all duration-200"
        style={{
          backgroundColor: "#b91c1c",
          color: "#fca5a5",
          border: "1px solid rgba(239,68,68,0.4)",
          boxShadow: "0 0 16px rgba(185,28,28,0.3)",
          fontFamily: "var(--font-serif)",
        }}
      >
        微博分享
      </a>
    </div>
  );
}
