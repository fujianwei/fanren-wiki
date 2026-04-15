"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import SliderQuestion, { sliderSegment } from "@/components/destiny/SliderQuestion";
import RankingQuestion from "@/components/destiny/RankingQuestion";
import { applyScores, calcRealm, calcLifespan, calcOutcome, calcMbti } from "@/lib/destiny";
import questionsData from "@/content/destiny/questions.json";
import type {
  DestinyQuestion,
  ChoiceQuestion,
  SliderQuestion as SliderQ,
  RankingQuestion as RankingQ,
  DestinyScores,
  MbtiVotes,
  MbtiDimension,
} from "@/types/destiny";

const allQuestions = questionsData as DestinyQuestion[];

const INIT_SCORES: DestinyScores = { courage: 0, wisdom: 0, loyalty: 0, ambition: 0 };
const INIT_VOTES: MbtiVotes = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

function buildSequence(branch: "A" | "B"): string[] {
  const trunk = ["Q1", "Q2", "Q3", "Q4", "Q5"];
  const branchA = ["QA1", "QA2", "QA3", "QA4", "QA5", "QA6"];
  const branchB = ["QB1", "QB2", "QB3", "QB4", "QB5", "QB6"];
  const finale = ["QF1", "QF2", "QF3"];
  const mid = branch === "A" ? branchA : branchB;
  return [...trunk, ...mid, ...finale];
}

function applyMbtiVote(
  votes: MbtiVotes,
  mbti?: Partial<Record<MbtiDimension, string>>
): MbtiVotes {
  if (!mbti) return votes;
  const next = { ...votes };
  for (const dir of Object.values(mbti)) {
    if (dir in next) next[dir as keyof MbtiVotes] += 1;
  }
  return next;
}

export default function DestinyQuiz() {
  const router = useRouter();
  const [branch, setBranch] = useState<"A" | "B" | null>(null);
  const [sequence, setSequence] = useState<string[]>(["Q1", "Q2", "Q3", "Q4", "Q5"]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<DestinyScores>(INIT_SCORES);
  const [votes, setVotes] = useState<MbtiVotes>(INIT_VOTES);

  const [sliderValue, setSliderValue] = useState(50);
  const [rankOrder, setRankOrder] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerFired, setTimerFired] = useState(false);

  // Refs to avoid stale closure in the timerFired useEffect
  const scoresRef = useRef(scores);
  const votesRef = useRef(votes);
  useEffect(() => { scoresRef.current = scores; }, [scores]);
  useEffect(() => { votesRef.current = votes; }, [votes]);

  const currentId = sequence[currentIdx];
  const question = allQuestions.find((q) => q.id === currentId);
  const total = branch ? buildSequence(branch).length : 14;

  // 初始化当前题的临时状态
  useEffect(() => {
    setSliderValue(50);
    setSelectedChoice(null);
    setTimerFired(false);
    if (question?.type === "ranking") {
      const q = question as RankingQ;
      setRankOrder(q.options.map((_, i) => String(i)));
    }
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 限时题倒计时
  useEffect(() => {
    const q = question as ChoiceQuestion | undefined;
    if (!q || !q.timed) {
      setTimeLeft(null);
      return;
    }
    setTimeLeft(q.timed);
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null || t <= 1) {
          clearInterval(interval);
          setTimerFired(true);
          return null;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 超时自动随机选择
  useEffect(() => {
    if (!timerFired) return;
    const q = question as ChoiceQuestion | undefined;
    if (!q?.options?.length) return;
    const randomOpt = q.options[Math.floor(Math.random() * q.options.length)];
    handleChoiceConfirm(randomOpt, scoresRef.current, votesRef.current);
  }, [timerFired]); // eslint-disable-line react-hooks/exhaustive-deps

  function finish(finalScores: DestinyScores, finalVotes: MbtiVotes) {
    const realm = calcRealm(finalScores);
    const lifespan = calcLifespan(realm.baseLifespan, finalScores.wisdom);
    const outcome = calcOutcome(finalScores, realm.slug);
    const mbtiType = calcMbti(finalVotes);
    const id = `${realm.slug}-${outcome.slug}`;
    router.push(`/destiny/result/${id}?mbti=${mbtiType}&lifespan=${lifespan}`);
  }

  function handleChoiceConfirm(
    option: ChoiceQuestion["options"][number],
    currentScores: DestinyScores,
    currentVotes: MbtiVotes
  ) {
    if (selectedChoice) return;
    setSelectedChoice(option.text);

    const newScores = applyScores(currentScores, option.scores);
    const newVotes = applyMbtiVote(currentVotes, option.mbti);
    setScores(newScores);
    setVotes(newVotes);

    if (option.branch) {
      const newBranch = option.branch;
      setBranch(newBranch);
      const newSeq = buildSequence(newBranch);
      setSequence(newSeq);
      setTimeout(() => {
        setCurrentIdx(newSeq.indexOf(newBranch === "A" ? "QA1" : "QB1"));
        setSelectedChoice(null);
      }, 400);
      return;
    }

    setTimeout(() => {
      const nextIdx = currentIdx + 1;
      if (nextIdx >= sequence.length) {
        finish(newScores, newVotes);
      } else {
        setCurrentIdx(nextIdx);
        setSelectedChoice(null);
      }
    }, 400);
  }

  function handleSliderConfirm() {
    const q = question as SliderQ;
    const seg = sliderSegment(sliderValue);
    const scoring = q.scoring[seg];
    const newScores = applyScores(scores, scoring.scores);
    const newVotes = applyMbtiVote(votes, (scoring as { scores: Partial<DestinyScores>; mbti?: Partial<Record<MbtiDimension, string>> }).mbti);
    setScores(newScores);
    setVotes(newVotes);
    const nextIdx = currentIdx + 1;
    if (nextIdx >= sequence.length) {
      finish(newScores, newVotes);
    } else {
      setCurrentIdx(nextIdx);
    }
  }

  function handleRankingConfirm() {
    const q = question as RankingQ;
    const rankScores = q.rankScores;
    let newScores = { ...scores };
    let newVotes = { ...votes };

    rankOrder.forEach((idxStr, rank) => {
      const optIdx = Number(idxStr);
      const opt = q.options[optIdx];
      const pts = rankScores[rank];
      if (pts === 0) return;

      if (opt.split && opt.splitDimensions) {
        const half = Math.round(pts / 2);
        for (const dim of opt.splitDimensions) {
          newScores = applyScores(newScores, { [dim]: half });
        }
      } else if (opt.dimension === "wisdom_sn") {
        newScores = applyScores(newScores, { wisdom: pts });
        newVotes = applyMbtiVote(newVotes, { SN: "N" });
      } else {
        newScores = applyScores(newScores, { [opt.dimension as keyof DestinyScores]: pts });
      }
    });

    setScores(newScores);
    setVotes(newVotes);
    const nextIdx = currentIdx + 1;
    if (nextIdx >= sequence.length) {
      finish(newScores, newVotes);
    } else {
      setCurrentIdx(nextIdx);
    }
  }

  if (!question) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <ProgressBar current={currentIdx + 1} total={total} />
      </div>

      {timeLeft !== null && (
        <div className="text-center mb-4">
          <span className={`text-2xl font-bold font-serif ${timeLeft <= 2 ? "text-red-500" : "text-bamboo-500"}`}>
            {timeLeft}
          </span>
          <span className="text-bamboo-400 text-sm ml-1">秒</span>
        </div>
      )}

      {(question.type === "choice" || question.type === "image-choice") && (() => {
        const q = question as ChoiceQuestion;
        return (
          <div className="bg-white rounded-2xl border border-bamboo-200 p-8 shadow-sm">
            <p className="text-bamboo-400 text-xs tracking-widest mb-4">情景 {currentIdx + 1}</p>
            <h2 className="text-bamboo-700 font-serif text-lg leading-relaxed mb-8">{q.text}</h2>
            <div className="flex flex-col gap-4">
              {q.options.map((opt, i) => {
                const isChosen = selectedChoice === opt.text;
                return (
                  <button
                    key={i}
                    onClick={() => handleChoiceConfirm(opt, scores, votes)}
                    disabled={!!selectedChoice}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200
                      ${isChosen
                        ? "border-bamboo-400 bg-bamboo-100 text-bamboo-700"
                        : selectedChoice
                        ? "border-bamboo-200 bg-bamboo-50 text-bamboo-400 opacity-50"
                        : "border-bamboo-200 bg-bamboo-50 text-bamboo-600 hover:border-bamboo-400 hover:bg-bamboo-100 cursor-pointer"
                      }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {question.type === "slider" && (
        <SliderQuestion
          text={(question as SliderQ).text}
          leftLabel={(question as SliderQ).leftLabel}
          rightLabel={(question as SliderQ).rightLabel}
          value={sliderValue}
          onChange={setSliderValue}
          onConfirm={handleSliderConfirm}
        />
      )}

      {question.type === "ranking" && (
        <RankingQuestion
          text={(question as RankingQ).text}
          options={(question as RankingQ).options.map((o, i) => ({ id: String(i), text: o.text }))}
          order={rankOrder}
          onOrderChange={setRankOrder}
          onConfirm={handleRankingConfirm}
        />
      )}
    </div>
  );
}
