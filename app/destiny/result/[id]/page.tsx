import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import RadarChart from "@/components/destiny/RadarChart";
import realmsData from "@/content/destiny/realms.json";
import outcomesData from "@/content/destiny/outcomes.json";
import charactersData from "@/content/quiz/characters.json";
import type { Realm, Outcome, RealmSlug, OutcomeSlug } from "@/types/destiny";
import type { Character, MbtiType } from "@/types";

const DEATH_OUTCOMES = new Set(["tupo", "doufa", "xinmo", "beici", "moxiu", "bawang"]);

function getRealmStyle(slug: string): { color: string; glow: string; filter?: string } {
  switch (slug) {
    case "jiedan": return { color: "#c8a85a", glow: "rgba(200,168,90,0.35)" };
    case "yuanying": return { color: "#d4a843", glow: "rgba(212,168,67,0.45)" };
    case "huashen": return {
      color: "#e8c86a",
      glow: "rgba(232,200,106,0.55)",
      filter: "drop-shadow(0 0 12px rgba(232,200,106,0.5))",
    };
    default:
      return { color: "#6fedb5", glow: "rgba(111,237,181,0.3)" };
  }
}

function getOutcomeStyle(slug: string): {
  bg: string; border: string; text: string; glow: string; isDeath: boolean; isAscend: boolean;
} {
  if (slug === "feisheng") return {
    bg: "rgba(212,168,67,0.15)", border: "rgba(212,168,67,0.5)",
    text: "#f5e4a8", glow: "rgba(212,168,67,0.2)", isDeath: false, isAscend: true,
  };
  if (DEATH_OUTCOMES.has(slug)) return {
    bg: "rgba(127,29,29,0.3)", border: "rgba(239,68,68,0.5)",
    text: "#fca5a5", glow: "rgba(239,68,68,0.2)", isDeath: true, isAscend: false,
  };
  return {
    bg: "rgba(74,222,154,0.1)", border: "rgba(74,222,154,0.4)",
    text: "#a8f5d4", glow: "rgba(74,222,154,0.15)", isDeath: false, isAscend: false,
  };
}

function getKeywordStyle(isDeath: boolean, isAscend: boolean): { color: string; border: string; bg: string } {
  if (isAscend) return { color: "#f5e4a8", border: "rgba(212,168,67,0.4)", bg: "rgba(212,168,67,0.08)" };
  if (isDeath) return { color: "#fca5a5", border: "rgba(239,68,68,0.35)", bg: "rgba(127,29,29,0.2)" };
  return { color: "#a8f5d4", border: "rgba(74,222,154,0.3)", bg: "rgba(74,222,154,0.08)" };
}

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
  searchParams: Promise<{ mbti?: string; lifespan?: string; c?: string; w?: string; l?: string; a?: string; p?: string }>;
}

export default async function DestinyResultPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { mbti = "INTJ", lifespan = "0", c = "50", w = "50", l = "50", a = "50", p = "50" } = await searchParams;
  const radarScores = {
    courage: Math.min(100, Math.max(0, Number(c))),
    wisdom: Math.min(100, Math.max(0, Number(w))),
    loyalty: Math.min(100, Math.max(0, Number(l))),
    ambition: Math.min(100, Math.max(0, Number(a))),
    perseverance: Math.min(100, Math.max(0, Number(p))),
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
  const realmStyle = getRealmStyle(realmSlug);
  const outcomeStyle = getOutcomeStyle(outcomeSlug);
  const kwStyle = getKeywordStyle(outcomeStyle.isDeath, outcomeStyle.isAscend);
  const cardClass = outcomeStyle.isDeath ? "card-death" : "card-glow";

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">

      {/* 第一层：修仙人生 */}
      <div
        className={`rounded-2xl p-8 mb-6 relative overflow-hidden ${cardClass}`}
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
      >
        <p className="text-xs tracking-widest mb-2 text-center" style={{ color: "#6a8878" }}>你的修仙人生</p>
        <h1
          className="text-4xl font-serif font-bold text-center mb-1"
          style={{
            background: `linear-gradient(135deg, ${realmStyle.color}, ${realmStyle.color}cc)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: realmStyle.filter,
          }}
        >
          {realm.name}
        </h1>
        <p className="text-sm text-center mb-4" style={{ color: "#6a8878" }}>{realm.description}</p>
        <p className="text-center mb-6" style={{ color: "#b8ccc2" }}>
          你活了{" "}
          <span className="font-bold text-xl" style={{ color: "#e8f0ec" }}>{lifespan}</span>
          {" "}岁
        </p>

        {/* 结局徽章 */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <span
              className="inline-block text-sm font-bold px-5 py-1.5 rounded-full tracking-widest"
              style={{
                backgroundColor: outcomeStyle.bg,
                border: `1px solid ${outcomeStyle.border}`,
                color: outcomeStyle.text,
                boxShadow: `0 0 16px ${outcomeStyle.glow}`,
              }}
            >
              {outcome.name}
            </span>
            {outcomeStyle.isDeath && (
              <svg
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                viewBox="0 0 120 32"
                preserveAspectRatio="none"
              >
                <path d="M25 2 L22 15 L28 18 L24 30" stroke="#ef4444" strokeWidth="0.8" fill="none" opacity="0.5"/>
                <path d="M70 0 L68 32" stroke="#ef4444" strokeWidth="0.6" fill="none" opacity="0.4"/>
                <path d="M95 3 L92 14 L97 16 L94 29" stroke="#ef4444" strokeWidth="0.7" fill="none" opacity="0.45"/>
              </svg>
            )}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-center" style={{ color: "#b8ccc2" }}>{outcome.description}</p>
      </div>

      {/* 分隔线 */}
      <div className="divider">
        <div className="divider-line" />
        <div className="divider-diamond" />
        <div className="divider-line" />
      </div>

      {/* 第二层：性格分析 */}
      <div
        className="rounded-2xl p-8 mb-6 relative overflow-hidden card-glow"
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
      >
        <p className="text-xs tracking-widest mb-4 text-center" style={{ color: "#6a8878" }}>你的性格分析</p>
        <div className="flex justify-center mb-4">
          <RadarChart
            dimensions={[
              { label: "勇气", value: radarScores.courage },
              { label: "悟性", value: radarScores.wisdom },
              { label: "情义", value: radarScores.loyalty },
              { label: "野心", value: radarScores.ambition },
              { label: "向道之心", value: radarScores.perseverance },
            ]}
            size={200}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {outcome.keywords.map((kw) => (
            <span
              key={kw}
              className="text-xs px-3 py-1 rounded-full"
              style={{
                backgroundColor: kwStyle.bg,
                border: `1px solid ${kwStyle.border}`,
                color: kwStyle.color,
              }}
            >
              {kw}
            </span>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-center" style={{ color: "#b8ccc2" }}>{outcome.personalityNote}</p>
      </div>

      <div className="divider">
        <div className="divider-line" />
        <div className="divider-diamond" />
        <div className="divider-line" />
      </div>

      {/* 第三层：命运镜像 */}
      <div
        className="rounded-2xl p-8 mb-6 relative overflow-hidden card-glow"
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
      >
        <p className="text-xs tracking-widest mb-4 text-center" style={{ color: "#6a8878" }}>你的命运镜像</p>
        <p className="text-sm text-center mb-1" style={{ color: "#6a8878" }}>你与</p>
        <h2 className="text-3xl font-serif font-bold text-center mb-1" style={{ color: "#e8f0ec" }}>{character.name}</h2>
        <p className="text-xs text-center mb-4" style={{ color: "#6a8878" }}>{character.title} · {character.mbti}</p>
        <p className="text-sm leading-relaxed text-center mb-4" style={{ color: "#b8ccc2" }}>{character.description}</p>
        <div
          className="rounded-r-lg px-5 py-4"
          style={{ backgroundColor: "rgba(26,40,32,0.6)", borderLeft: "3px solid #22c47a" }}
        >
          <p className="text-xs mb-1" style={{ color: "#6a8878" }}>若你身处人界</p>
          <p className="text-sm font-serif leading-relaxed italic" style={{ color: "#e8f0ec" }}>「{character.quote}」</p>
        </div>
      </div>

      {/* 底部操作 */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
      >
        <p className="text-sm text-center mb-4" style={{ color: "#6a8878" }}>分享你的修仙命运</p>
        <ShareButtons characterName={character.name} mbti={character.mbti} resultUrl={resultUrl} />
      </div>

      <div className="text-center">
        <Link
          href="/destiny"
          className={outcomeStyle.isDeath ? "btn-death" : "btn-secondary"}
          style={{ display: "inline-block" }}
        >
          重新测试
        </Link>
      </div>
    </div>
  );
}
