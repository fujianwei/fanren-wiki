import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-bamboo-200 border-b border-bamboo-300 px-6 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-bamboo-700 font-serif font-bold text-lg tracking-widest hover:text-bamboo-600">
          凡人修仙传·人界篇
        </Link>
        <div className="flex gap-6 text-sm text-bamboo-500">
          <span className="cursor-not-allowed opacity-50" title="敬请期待">人物百科</span>
          <span className="cursor-not-allowed opacity-50" title="敬请期待">地图势力</span>
          <span className="cursor-not-allowed opacity-50" title="敬请期待">剧情时间线</span>
          <Link href="/quiz" className="text-bamboo-600 font-medium hover:text-bamboo-700">人物测试</Link>
        </div>
      </div>
    </nav>
  );
}
