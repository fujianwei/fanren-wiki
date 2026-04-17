"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const ENDING_TEXT: Record<string, { title: string; text: string; color: string }> = {
  ascend: {
    title: "飞升灵界",
    text: "踏破虚空，你终于飞升灵界。那一刻，天地为之颤抖，万道金光将你笼罩，修仙路上的一切悲欢离合，都化作了这一瞬的永恒。",
    color: "#d4a843",
  },
  natural: {
    title: "寿元耗尽，安然坐化",
    text: "你安然坐化，留下一缕残魂，融入天地之间。漫长的修仙岁月，每一个选择都已刻入天道，无悔无憾。",
    color: "#4ade9a",
  },
  death_battle: {
    title: "战斗陨落",
    text: "你倒在了修仙路上，鲜血染红了脚下的土地。修仙之路，从来都是以命相搏。",
    color: "#ef4444",
  },
  death_heart: {
    title: "心魔陨落",
    text: "心魔终究吞噬了你，你在自己的执念中永远沉沦。那些未曾放下的执念，成了困住你的囚笼。",
    color: "#ef4444",
  },
  death_break: {
    title: "冲关陨落",
    text: "天雷滚滚，你在渡劫中燃尽最后一丝神识，化为飞灰。渡劫之路，九死一生，你已无悔。",
    color: "#ef4444",
  },
  ascend_fail: {
    title: "飞升失败",
    text: "距离灵界只差一步，你却永远停在了这里。那道虚空之门在你眼前缓缓关闭，留下无尽遗憾。",
    color: "#6a8878",
  },
};

function EndingContent() {
  const params = useSearchParams();
  const endingType = params.get("type") ?? "natural";
  const ending = ENDING_TEXT[endingType] ?? ENDING_TEXT["natural"];
  const isDeath = endingType.startsWith("death");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div
        className={`w-full max-w-sm rounded-2xl p-8 text-center ${isDeath ? "card-death" : ""}`}
        style={{
          backgroundColor: "#111a16",
          border: `1px solid ${ending.color}44`,
        }}
      >
        <div
          className="text-4xl font-serif font-bold mb-4"
          style={{ color: ending.color }}
        >
          {ending.title}
        </div>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "#b8ccc2" }}>
          {ending.text}
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/game" className="btn-primary py-3 rounded-full font-medium text-sm">
            再入轮回
          </Link>
          <Link href="/" className="btn-secondary py-2.5 rounded-full text-sm">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EndingPage() {
  return (
    <Suspense>
      <EndingContent />
    </Suspense>
  );
}
