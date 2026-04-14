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

      <div className="bg-white rounded-2xl border border-bamboo-200 p-8 shadow-sm">
        <p className="text-bamboo-400 text-xs tracking-widest mb-4">情景 {currentIndex + 1}</p>
        <h2 className="text-bamboo-700 font-serif text-lg leading-relaxed mb-8">
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
                className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200
                  ${isChosen
                    ? "border-bamboo-400 bg-bamboo-100 text-bamboo-700"
                    : selected
                    ? "border-bamboo-200 bg-bamboo-50 text-bamboo-400 opacity-50"
                    : "border-bamboo-200 bg-bamboo-50 text-bamboo-600 hover:border-bamboo-400 hover:bg-bamboo-100 cursor-pointer"
                  }`}
              >
                <span className="font-bold text-bamboo-400 mr-3">{choice}.</span>
                {text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
