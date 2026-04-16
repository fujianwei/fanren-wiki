import Link from "next/link";

const FEATURE_CARDS = [
  { icon: "👤", title: "人物百科", desc: "韩立、南宫婉、墨大夫……人界篇所有主要人物档案" },
  { icon: "🗺️", title: "地图势力", desc: "七玄门、黄枫谷、乱星海……人界势力分布全览" },
  { icon: "📜", title: "剧情时间线", desc: "从凡人少年到元婴老怪，完整剧情脉络一览" },
] as const;

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Hero 区域 */}
      <div className="flex flex-col md:flex-row gap-6 mb-16">
        {/* 左：命运测试入口 */}
        <div
          className="md:w-72 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4"
          style={{ backgroundColor: "#1a3828" }}
        >
          <div className="text-4xl">🗡️</div>
          <h2 className="font-serif font-bold text-xl tracking-wide" style={{ color: "#e8f0ec" }}>
            你的修仙<br />命运如何？
          </h2>
          <p className="text-xs leading-relaxed" style={{ color: "#b8ccc2" }}>
            命运几何，唯天知晓<br />
            一念之间，定你此生修仙造化<br />
            天机不可泄露，唯有亲历方知<br />
            入此门者，命运自现
          </p>
          <Link
            href="/destiny"
            className="btn-primary font-medium text-sm px-6 py-2.5 rounded-full"
          >
            踏入修仙之路
          </Link>
        </div>

        {/* 右：网站介绍 */}
        <div
          className="flex-1 rounded-2xl p-8 flex flex-col justify-center"
          style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
        >
          <p className="text-sm tracking-widest mb-2" style={{ color: "#6a8878" }}>凡人修仙传 · 人界篇</p>
          <h1 className="text-3xl font-serif font-bold tracking-wider mb-4" style={{ color: "#e8f0ec" }}>
            人界百科全书
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "#b8ccc2" }}>
            从七玄门的懵懂少年，到天南大地的元婴老怪。<br />
            这里记录着人界篇的每一段传奇。
          </p>
          <span
            className="btn-secondary inline-block text-sm px-6 py-2.5 rounded-full w-fit cursor-not-allowed opacity-50"
            title="敬请期待"
          >
            敬请期待
          </span>
        </div>
      </div>

      {/* 功能预览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURE_CARDS.map((item) => (
          <div
            key={item.title}
            className="rounded-xl p-6 opacity-60"
            style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
          >
            <div className="text-2xl mb-3">{item.icon}</div>
            <h3 className="font-serif font-bold mb-2" style={{ color: "#e8f0ec" }}>{item.title}</h3>
            <p className="text-xs leading-relaxed" style={{ color: "#6a8878" }}>{item.desc}</p>
            <p className="text-xs mt-3 font-medium" style={{ color: "#6a8878" }}>敬请期待</p>
          </div>
        ))}
      </div>
    </div>
  );
}
