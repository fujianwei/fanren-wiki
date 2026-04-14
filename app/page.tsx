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
        {/* 左：网站介绍 */}
        <div className="flex-1 bg-bamboo-100 rounded-2xl p-8 border border-bamboo-200 flex flex-col justify-center">
          <p className="text-bamboo-400 text-sm tracking-widest mb-2">凡人修仙传 · 人界篇</p>
          <h1 className="text-3xl font-serif font-bold text-bamboo-700 tracking-wider mb-4">
            人界百科全书
          </h1>
          <p className="text-bamboo-600 text-sm leading-relaxed mb-6">
            从七玄门的懵懂少年，到天南大地的元婴老怪。<br />
            这里记录着人界篇的每一段传奇。
          </p>
          <Link
            href="/quiz"
            className="inline-block bg-bamboo-400 hover:bg-bamboo-500 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors w-fit"
          >
            探索人界 →
          </Link>
        </div>

        {/* 右：测试入口 */}
        <div className="md:w-72 bg-bamboo-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
          <div className="text-4xl">✨</div>
          <h2 className="text-white font-serif font-bold text-xl tracking-wide">
            你是哪位<br />修仙人物？
          </h2>
          <p className="text-bamboo-100 text-xs leading-relaxed">
            12道修仙情景题<br />测出你的人界人物原型
          </p>
          <Link
            href="/quiz"
            className="bg-white text-bamboo-600 font-medium text-sm px-6 py-2.5 rounded-full hover:bg-bamboo-50 transition-colors"
          >
            立即测试
          </Link>
        </div>
      </div>

      {/* 功能预览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURE_CARDS.map((item) => (
          <div
            key={item.title}
            className="bg-bamboo-100 rounded-xl p-6 border border-bamboo-200 opacity-60"
          >
            <div className="text-2xl mb-3">{item.icon}</div>
            <h3 className="font-serif font-bold text-bamboo-700 mb-2">{item.title}</h3>
            <p className="text-bamboo-500 text-xs leading-relaxed">{item.desc}</p>
            <p className="text-bamboo-400 text-xs mt-3 font-medium">敬请期待</p>
          </div>
        ))}
      </div>
    </div>
  );
}
