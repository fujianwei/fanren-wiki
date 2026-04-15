import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import RadarChart from "@/components/destiny/RadarChart";
import realmsData from "@/content/destiny/realms.json";
import outcomesData from "@/content/destiny/outcomes.json";
import charactersData from "@/content/quiz/characters.json";
import type { Realm, Outcome, RealmSlug, OutcomeSlug } from "@/types/destiny";
import type { Character, MbtiType } from "@/types";

const realms = realmsData as Realm[];
const outcomes = outcomesData as Outcome[];
const characters = charactersData as Character[];

const REALM_SLUGS: RealmSlug[] = ["lianqi", "zhuji", "jiedan", "yuanying", "huashen"];
const OUTCOME_SLUGS: OutcomeSlug[] = [
  "tupo", "shouhu", "yinshi", "doufa", "zuohua", "caidan",
  "moxiu", "bawang", "xinmo", "beici", "shuangxiu", "zongshi",
  "tiandi", "niepan", "fanchen", "xianyou",
];

export function generateStaticParams() {
  const params: { id: string }[] = [
    { id: "huashen-feisheng" },
    ...REALM_SLUGS.flatMap((r) =>
      OUTCOME_SLUGS.map((o) => ({ id: `${r}-${o}` }))
    ),
  ];
  return params;
}

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mbti?: string; lifespan?: string; c?: string; w?: string; l?: string; a?: string }>;
}

export default async function DestinyResultPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { mbti = "INTJ", lifespan = "0", c = "50", w = "50", l = "50", a = "50" } = await searchParams;
  const radarScores = {
    courage: Math.min(100, Math.max(0, Number(c))),
    wisdom: Math.min(100, Math.max(0, Number(w))),
    loyalty: Math.min(100, Math.max(0, Number(l))),
    ambition: Math.min(100, Math.max(0, Number(a))),
  };

  // 解析 id：最后一段是 outcomeSlug，前面是 realmSlug
  const parts = id.split("-");
  if (parts.length < 2) notFound();
  const outcomeSlug = parts[parts.length - 1] as OutcomeSlug;
  const realmSlug = parts.slice(0, -1).join("-") as RealmSlug;

  const realm = realms.find((r) => r.slug === realmSlug);
  const outcome = outcomes.find((o) => o.slug === outcomeSlug);
  if (!realm || !outcome) notFound();

  const mbtiUpper = mbti.toUpperCase() as MbtiType;
  const character = characters.find((c) => c.mbti === mbtiUpper) ?? characters[0];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fanren-wiki.vercel.app";
  const resultUrl = `${baseUrl}/destiny/result/${id}?mbti=${mbti}&lifespan=${lifespan}`;
  const isCaidan = outcomeSlug === "caidan";

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">

      {/* 第一层：修仙人生 */}
      <div className="bg-white rounded-2xl border border-bamboo-200 p-8 shadow-sm mb-6">
        <p className="text-bamboo-400 text-xs tracking-widest mb-2 text-center">你的修仙人生</p>
        <h1 className="text-4xl font-serif font-bold text-bamboo-700 text-center mb-1">{realm.name}</h1>
        <p className="text-bamboo-500 text-sm text-center mb-4">{realm.description}</p>
        <p className="text-center text-bamboo-600 mb-6">
          你活了 <span className="font-bold text-bamboo-700 text-xl">{lifespan}</span> 岁
        </p>
        <div className="flex justify-center mb-4">
          <span className={`text-white text-sm font-bold px-4 py-1.5 rounded-full tracking-widest ${isCaidan ? "bg-yellow-500" : "bg-bamboo-400"}`}>
            {outcome.name}
          </span>
        </div>
        <p className="text-bamboo-600 text-sm leading-relaxed text-center">{outcome.description}</p>
      </div>

      {/* 第二层：性格分析 */}
      <div className="bg-white rounded-2xl border border-bamboo-200 p-8 shadow-sm mb-6">
        <p className="text-bamboo-400 text-xs tracking-widest mb-4 text-center">你的性格分析</p>
        <div className="flex justify-center mb-4">
          <RadarChart
            dimensions={[
              { label: "勇气", value: radarScores.courage },
              { label: "智慧", value: radarScores.wisdom },
              { label: "情义", value: radarScores.loyalty },
              { label: "野心", value: radarScores.ambition },
            ]}
            size={180}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {outcome.keywords.map((kw) => (
            <span key={kw} className="bg-bamboo-100 text-bamboo-600 text-xs px-3 py-1 rounded-full border border-bamboo-200">
              {kw}
            </span>
          ))}
        </div>
        <p className="text-bamboo-600 text-sm leading-relaxed text-center">{outcome.personalityNote}</p>
      </div>

      {/* 第三层：命运镜像 */}
      <div className="bg-white rounded-2xl border border-bamboo-200 p-8 shadow-sm mb-6">
        <p className="text-bamboo-400 text-xs tracking-widest mb-4 text-center">你的命运镜像</p>
        <p className="text-bamboo-500 text-sm text-center mb-1">你与</p>
        <h2 className="text-3xl font-serif font-bold text-bamboo-700 text-center mb-1">{character.name}</h2>
        <p className="text-bamboo-500 text-xs text-center mb-4">{character.title} · {character.mbti}</p>
        <p className="text-bamboo-600 text-sm leading-relaxed text-center mb-4">{character.description}</p>
        <div className="bg-bamboo-50 border-l-4 border-bamboo-300 rounded-r-lg px-5 py-4">
          <p className="text-bamboo-500 text-xs mb-1">若你身处人界</p>
          <p className="text-bamboo-700 text-sm font-serif leading-relaxed italic">「{character.quote}」</p>
        </div>
      </div>

      {/* 底部操作 */}
      <div className="bg-bamboo-100 rounded-2xl border border-bamboo-200 p-6 mb-6">
        <p className="text-bamboo-600 text-sm text-center mb-4">分享你的修仙命运 ✨</p>
        <ShareButtons characterName={character.name} mbti={character.mbti} resultUrl={resultUrl} />
      </div>

      <div className="text-center">
        <Link href="/destiny" className="text-bamboo-500 text-sm hover:text-bamboo-700 underline underline-offset-4">
          重新测试
        </Link>
      </div>
    </div>
  );
}
