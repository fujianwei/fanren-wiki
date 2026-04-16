"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import { calculateMbti, type Answers } from "@/lib/mbti";
import questionsData from "@/content/quiz/questions.json";
import type { Question } from "@/types";

const questions = questionsData as Question[];

export default function QuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [selected, setSelected] = useState<"A" | "B" | null>(null);

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  function handleSelect(choice: "A" | "B") {
    if (selected) return;
    setSelected(choice);

    const newAnswers = { ...answers, [question.id]: choice };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (isLast) {
        const mbti = calculateMbti(newAnswers, questions);
        router.push(`/result/${mbti.toLowerCase()}`);
      } else {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
      }
    }, 400);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <ProgressBar current={currentIndex + 1} total={questions.length} />
      </div>

      <div
        className="rounded-2xl p-8 shadow-sm"
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
      >
        <p className="text-xs tracking-widest mb-4" style={{ color: "#6a8878" }}>情景 {currentIndex + 1}</p>
        <h2 className="font-serif text-lg leading-relaxed mb-8" style={{ color: "#e8f0ec" }}>
          {question.scenario}
        </h2>

        <div className="flex flex-col gap-4">
          {(["A", "B"] as const).map((choice) => {
            const text = choice === "A" ? question.optionA : question.optionB;
            const isChosen = selected === choice;
            return (
              <button
                key={choice}
                onClick={() => handleSelect(choice)}
                disabled={!!selected}
                className="w-full text-left p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer"
                style={
                  isChosen
                    ? { borderColor: "#4a7a5a", backgroundColor: "#1a3828", color: "#e8f0ec" }
                    : selected
                    ? { borderColor: "#1a2820", backgroundColor: "#0a0e0d", color: "#6a8878", opacity: 0.5 }
                    : { borderColor: "#1a2820", backgroundColor: "#0a0e0d", color: "#b8ccc2" }
                }
              >
                <span className="font-bold mr-3" style={{ color: "#6a8878" }}>{choice}.</span>
                {text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
