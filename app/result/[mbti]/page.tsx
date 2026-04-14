import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import charactersData from "@/content/quiz/characters.json";
import type { Character, MbtiType } from "@/types";

const characters = charactersData as Character[];

interface Props {
  params: Promise<{ mbti: string }>;
}

export function generateStaticParams() {
  return characters.map((c) => ({ mbti: c.mbti.toLowerCase() }));
}

export default async function ResultPage({ params }: Props) {
  const { mbti } = await params;
  const mbtiUpper = mbti.toUpperCase() as MbtiType;
  const character = characters.find((c) => c.mbti === mbtiUpper);

  if (!character) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fanren-wiki.vercel.app";
  const resultUrl = `${baseUrl}/result/${mbti}`;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <p className="text-bamboo-400 text-sm tracking-widest mb-2">你的人界人物原型是</p>
        <h1 className="text-5xl font-serif font-bold text-bamboo-700 mb-2">{character.name}</h1>
        <p className="text-bamboo-500 text-sm">{character.title}</p>
      </div>

      <div className="bg-white rounded-2xl border border-bamboo-200 p-8 shadow-sm mb-6">
        <div className="flex justify-center mb-6">
          <span className="bg-bamboo-400 text-white text-sm font-bold px-4 py-1.5 rounded-full tracking-widest">
            {character.mbti}
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {character.traits.map((trait) => (
            <span
              key={trait}
              className="bg-bamboo-100 text-bamboo-600 text-xs px-3 py-1 rounded-full border border-bamboo-200"
            >
              {trait}
            </span>
          ))}
        </div>

        <p className="text-bamboo-600 text-sm leading-relaxed text-center mb-6">
          {character.description}
        </p>

        <div className="bg-bamboo-50 border-l-4 border-bamboo-300 rounded-r-lg px-5 py-4">
          <p className="text-bamboo-500 text-xs mb-1">经典语录</p>
          <p className="text-bamboo-700 text-sm font-serif leading-relaxed italic">
            「{character.quote}」
          </p>
        </div>
      </div>

      <div className="bg-bamboo-100 rounded-2xl border border-bamboo-200 p-6 mb-6">
        <p className="text-bamboo-600 text-sm text-center mb-4">分享给朋友，看看他们是哪位人物 ✨</p>
        <ShareButtons
          characterName={character.name}
          mbti={character.mbti}
          resultUrl={resultUrl}
        />
      </div>

      <div className="text-center">
        <Link
          href="/quiz"
          className="text-bamboo-500 text-sm hover:text-bamboo-700 underline underline-offset-4"
        >
          重新测试
        </Link>
      </div>
    </div>
  );
}
