"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import SliderQuestion, { sliderSegment } from "@/components/destiny/SliderQuestion";
import RankingQuestion from "@/components/destiny/RankingQuestion";
import { applyScores, calcRealmWithTrials, calcLifespan, calcOutcome, calcMbti, resolveQuestion } from "@/lib/destiny";
import ReincarnationGate from "@/components/destiny/ReincarnationGate";
import questionsData from "@/content/destiny/questions.json";
import type {
  DestinyQuestion,
  ChoiceQuestion,
  SliderQuestion as SliderQ,
  RankingQuestion as RankingQ,
  DestinyScores,
  MbtiVotes,
  MbtiDimension,
  PathId,
  DynamicQuestion,
  ResolvedQuestionVersion,
} from "@/types/destiny";

const allQuestions = questionsData as DestinyQuestion[];

const INIT_SCORES: DestinyScores = { courage: 0, wisdom: 0, loyalty: 0, ambition: 0, perseverance: 0 };
const INIT_VOTES: MbtiVotes = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

function buildSequence(branch: "A" | "B", path: PathId | null): string[] {
  const trunk = ["Q1", "Q2", "Q3", "Q4", "Q5"];
  const finale = ["QF1", "QF2", "QF3"];

  if (branch === "A") {
    const shared = ["QA1", "QA2", "QA3", "QAX"];
    if (path === "A1") return [...trunk, ...shared, "QAA1", "QAA2", "QAA3", "QAA4", ...finale];
    if (path === "A2") return [...trunk, ...shared, "QAB1", "QAB2", "QAB3", "QAB4", ...finale];
    return [...trunk, ...shared, ...finale];
  } else {
    const shared = ["QB1", "QB2", "QB3", "QBX"];
    if (path === "B1") return [...trunk, ...shared, "QBA1", "QBA2", "QBA3", "QBA4", ...finale];
    if (path === "B2") return [...trunk, ...shared, "QBB1", "QBB2", "QBB3", "QBB4", ...finale];
    return [...trunk, ...shared, ...finale];
  }
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
  const [gateCleared, setGateCleared] = useState(false);
  const [branch, setBranch] = useState<"A" | "B" | null>(null);
  const [fortune, setFortune] = useState<number>(1);
  const [path, setPath] = useState<PathId | null>(null);
  const [sequence, setSequence] = useState<string[]>(["Q1", "Q2", "Q3", "Q4", "Q5"]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<DestinyScores>(INIT_SCORES);
  const [votes, setVotes] = useState<MbtiVotes>(INIT_VOTES);

  const [sliderValue, setSliderValue] = useState(50);
  const [rankOrder, setRankOrder] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerFired, setTimerFired] = useState(false);
  const [prevAnswer, setPrevAnswer] = useState<string | null>(null);

  const scoresRef = useRef(scores);
  const votesRef = useRef(votes);
  useEffect(() => { scoresRef.current = scores; }, [scores]);
  useEffect(() => { votesRef.current = votes; }, [votes]);

  const currentId = sequence[currentIdx];
  const question = allQuestions.find((q) => q.id === currentId);
  const resolvedQuestion: ResolvedQuestionVersion | DestinyQuestion | undefined =
    question && "versions" in question
      ? resolveQuestion(question as DynamicQuestion, prevAnswer, scores)
      : question;
  const total = branch && path ? buildSequence(branch, path).length : 16;

  useEffect(() => {
    setSliderValue(50);
    setSelectedChoice(null);
    setTimerFired(false);
    if (resolvedQuestion?.type === "ranking") {
      const q = resolvedQuestion as RankingQ;
      setRankOrder(q.options.map((_, i) => String(i)));
    }
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const q = resolvedQuestion as ChoiceQuestion | undefined;
    if (!q || !q.timed) { setTimeLeft(null); return; }
    setTimeLeft(q.timed);
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null || t <= 1) { clearInterval(interval); setTimerFired(true); return null; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!timerFired) return;
    const q = resolvedQuestion as ChoiceQuestion | undefined;
    if (!q?.options?.length) return;
    const randomOpt = q.options[Math.floor(Math.random() * q.options.length)];
    handleChoiceConfirm(randomOpt, scoresRef.current, votesRef.current);
  }, [timerFired]); // eslint-disable-line react-hooks/exhaustive-deps

  function finish(finalScores: DestinyScores, finalVotes: MbtiVotes, finalPath: PathId) {
    const { realm, diedInTrials } = calcRealmWithTrials(finalScores, fortune);
    const lifespan = calcLifespan(realm.baseLifespan, finalScores.wisdom);
    const outcomeSuffix = diedInTrials
      ? "tupo"
      : calcOutcome(finalScores, realm.slug, finalPath).slug;
    const mbtiType = calcMbti(finalVotes);
    const id = `${realm.slug}-${outcomeSuffix}`;
    const { courage, wisdom, loyalty, ambition, perseverance } = finalScores;
    router.push(`/destiny/result/${id}?mbti=${mbtiType}&lifespan=${lifespan}&c=${courage}&w=${wisdom}&l=${loyalty}&a=${ambition}&p=${perseverance}&ft=${fortune}`);
  }

  function handleChoiceConfirm(
    option: ChoiceQuestion["options"][number],
    currentScores: DestinyScores,
    currentVotes: MbtiVotes
  ) {
    if (selectedChoice) return;
    setSelectedChoice(option.text);
    setPrevAnswer(option.text);

    const newScores = applyScores(currentScores, option.scores);
    const newVotes = applyMbtiVote(currentVotes, option.mbti);
    setScores(newScores);
    setVotes(newVotes);

    // 一级分支（Q5）
    if (option.branch) {
      const newBranch = option.branch;
      setBranch(newBranch);
      const tempSeq = buildSequence(newBranch, null);
      setSequence(tempSeq);
      setTimeout(() => {
        setCurrentIdx(tempSeq.indexOf(newBranch === "A" ? "QA1" : "QB1"));
        setSelectedChoice(null);
      }, 400);
      return;
    }

    // 二级分支（QAX / QBX）
    if (option.branch2) {
      const newPath = option.branch2;
      setPath(newPath);
      const parentBranch = newPath.startsWith("A") ? "A" : "B" as "A" | "B";
      const newSeq = buildSequence(parentBranch, newPath);
      setSequence(newSeq);
      const firstId = newPath === "A1" ? "QAA1" : newPath === "A2" ? "QAB1" : newPath === "B1" ? "QBA1" : "QBB1";
      setTimeout(() => {
        setCurrentIdx(newSeq.indexOf(firstId));
        setSelectedChoice(null);
      }, 400);
      return;
    }

    setTimeout(() => {
      const nextIdx = currentIdx + 1;
      if (nextIdx >= sequence.length) {
        finish(newScores, newVotes, path ?? "A1");
      } else {
        setCurrentIdx(nextIdx);
        setSelectedChoice(null);
      }
    }, 400);
  }

  function handleSliderConfirm() {
    const q = resolvedQuestion as SliderQ;
    const seg = sliderSegment(sliderValue);
    const segLabel = seg === "left" ? (q.leftLabel ?? "left") : seg === "right" ? (q.rightLabel ?? "right") : "middle";
    setPrevAnswer(segLabel);
    const scoring = q.scoring[seg];
    const newScores = applyScores(scores, scoring.scores);
    const newVotes = applyMbtiVote(votes, (scoring as { scores: Partial<DestinyScores>; mbti?: Partial<Record<MbtiDimension, string>> }).mbti);
    setScores(newScores);
    setVotes(newVotes);
    const nextIdx = currentIdx + 1;
    if (nextIdx >= sequence.length) {
      finish(newScores, newVotes, path ?? "A1");
    } else {
      setCurrentIdx(nextIdx);
    }
  }

  function handleRankingConfirm() {
    const q = resolvedQuestion as RankingQ;
    const originalQ = question as RankingQ;
    const rankScores = originalQ.rankScores ?? [20, 10, 5, 0] as [number, number, number, number];
    const firstOptIdx = Number(rankOrder[0]);
    setPrevAnswer(q.options[firstOptIdx]?.text ?? null);
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
      finish(newScores, newVotes, path ?? "A1");
    } else {
      setCurrentIdx(nextIdx);
    }
  }

  if (!gateCleared) {
    return (
      <ReincarnationGate
        onComplete={(f) => {
          setFortune(f);
          setGateCleared(true);
        }}
      />
    );
  }

  if (!resolvedQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <ProgressBar current={currentIdx + 1} total={total} />
      </div>

      {timeLeft !== null && (
        <div className="text-center mb-4">
          <span
            className="text-2xl font-bold font-serif transition-colors duration-500"
            style={{ color: timeLeft <= 2 ? "#ef4444" : "#4ade9a" }}
          >
            {timeLeft}
          </span>
          <span className="text-sm ml-1" style={{ color: "#6a8878" }}>秒</span>
        </div>
      )}

      {(resolvedQuestion.type === "choice" || resolvedQuestion.type === "image-choice") && (() => {
        const q = resolvedQuestion as ChoiceQuestion;
        return (
          <div
            className="rounded-2xl p-8 relative overflow-hidden card-glow"
            style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
          >
            {/* 水墨角落纹饰 */}
            <svg className="corner-ornament corner-ornament-tl" viewBox="0 0 56 56" fill="none">
              <path d="M2 2 L2 28 Q2 54 28 54" stroke="#4ade9a" strokeWidth="1.5" fill="none"/>
              <circle cx="2" cy="2" r="2" fill="#4ade9a"/>
              <path d="M9 2 L9 21 Q9 47 35 47" stroke="#4ade9a" strokeWidth="0.7" fill="none" opacity="0.4"/>
            </svg>
            <svg className="corner-ornament corner-ornament-br" viewBox="0 0 56 56" fill="none">
              <path d="M2 2 L2 28 Q2 54 28 54" stroke="#4ade9a" strokeWidth="1.5" fill="none"/>
              <circle cx="2" cy="2" r="2" fill="#4ade9a"/>
              <path d="M9 2 L9 21 Q9 47 35 47" stroke="#4ade9a" strokeWidth="0.7" fill="none" opacity="0.4"/>
            </svg>

            <p className="text-xs tracking-widest mb-4" style={{ color: "#6a8878" }}>情景 {currentIdx + 1}</p>
            <h2 className="font-serif text-lg leading-relaxed mb-8" style={{ color: "#e8f0ec" }}>{q.text}</h2>
            <div className="flex flex-col gap-4">
              {q.options.map((opt, i) => {
                const isChosen = selectedChoice === opt.text;
                const isDisabled = !!selectedChoice && !isChosen;
                return (
                  <button
                    key={i}
                    onClick={() => handleChoiceConfirm(opt, scores, votes)}
                    disabled={!!selectedChoice}
                    className="w-full text-left p-5 rounded-xl transition-all duration-200"
                    style={{
                      border: isChosen ? "1px solid #4ade9a" : "1px solid #1a2820",
                      backgroundColor: isChosen ? "rgba(74,222,154,0.12)" : "rgba(26,40,32,0.6)",
                      color: isChosen ? "#d4faea" : isDisabled ? "#6a8878" : "#b8ccc2",
                      boxShadow: isChosen ? "0 0 20px rgba(74,222,154,0.18)" : "none",
                      opacity: isDisabled ? 0.35 : 1,
                      cursor: selectedChoice ? "default" : "pointer",
                    }}
                    onMouseEnter={e => {
                      if (!selectedChoice) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#22c47a";
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(74,222,154,0.08)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#a8f5d4";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 16px rgba(74,222,154,0.12)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!selectedChoice && !isChosen) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#1a2820";
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(26,40,32,0.6)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#b8ccc2";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                      }
                    }}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {resolvedQuestion.type === "slider" && (
        <SliderQuestion
          text={(resolvedQuestion as SliderQ).text}
          leftLabel={(resolvedQuestion as SliderQ).leftLabel}
          rightLabel={(resolvedQuestion as SliderQ).rightLabel}
          value={sliderValue}
          onChange={setSliderValue}
          onConfirm={handleSliderConfirm}
        />
      )}

      {resolvedQuestion.type === "ranking" && (
        <RankingQuestion
          text={(resolvedQuestion as RankingQ).text}
          options={(resolvedQuestion as RankingQ).options.map((o, i) => ({ id: String(i), text: o.text }))}
          order={rankOrder}
          onOrderChange={setRankOrder}
          onConfirm={handleRankingConfirm}
        />
      )}
    </div>
  );
}
