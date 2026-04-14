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
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const weiboText = encodeURIComponent(
    `我在凡人修仙传人界篇人物测试中，测出我最像「${characterName}」(${mbti})！你也来测测看 → ${resultUrl}`
  );
  const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(resultUrl)}&title=${weiboText}`;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={handleCopy}
        className="flex-1 bg-bamboo-400 hover:bg-bamboo-500 text-white text-sm font-medium px-6 py-3 rounded-full transition-colors"
      >
        {copied ? "✓ 已复制！" : "📋 复制分享文字"}
      </button>
      <a
        href={weiboUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 bg-red-400 hover:bg-red-500 text-white text-sm font-medium px-6 py-3 rounded-full transition-colors text-center"
      >
        微博分享
      </a>
    </div>
  );
}
