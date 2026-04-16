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
        <p className="text-sm tracking-widest mb-2" style={{ color: "#6a8878" }}>你的人界人物原型是</p>
        <h1 className="text-5xl font-serif font-bold mb-2" style={{ color: "#e8f0ec" }}>{character.name}</h1>
        <p className="text-sm" style={{ color: "#6a8878" }}>{character.title}</p>
      </div>

      <div
        className="rounded-2xl p-8 shadow-sm mb-6"
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
      >
        <div className="flex justify-center mb-6">
          <span
            className="text-sm font-bold px-4 py-1.5 rounded-full tracking-widest"
            style={{ backgroundColor: "#1a3828", color: "#e8f0ec" }}
          >
            {character.mbti}
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {character.traits.map((trait) => (
            <span
              key={trait}
              className="text-xs px-3 py-1 rounded-full"
              style={{ backgroundColor: "#0a0e0d", color: "#b8ccc2", border: "1px solid #1a2820" }}
            >
              {trait}
            </span>
          ))}
        </div>

        <p className="text-sm leading-relaxed text-center mb-6" style={{ color: "#b8ccc2" }}>
          {character.description}
        </p>

        <div
          className="rounded-r-lg px-5 py-4"
          style={{ backgroundColor: "#0a0e0d", borderLeft: "4px solid #2a4a38" }}
        >
          <p className="text-xs mb-1" style={{ color: "#6a8878" }}>经典语录</p>
          <p className="text-sm font-serif leading-relaxed italic" style={{ color: "#e8f0ec" }}>
            「{character.quote}」
          </p>
        </div>
      </div>

      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
      >
        <p className="text-sm text-center mb-4" style={{ color: "#b8ccc2" }}>分享给朋友，看看他们是哪位人物 ✨</p>
        <ShareButtons
          characterName={character.name}
          mbti={character.mbti}
          resultUrl={resultUrl}
        />
      </div>

      <div className="text-center">
        <Link
          href="/quiz"
          className="text-sm underline underline-offset-4"
          style={{ color: "#6a8878" }}
        >
          重新测试
        </Link>
      </div>
    </div>
  );
}
