"use client";

import { useState } from "react";
import { useGame } from "./GameProvider";
import type { RealmSlug } from "@/types/game";

const REALM_ORDER: RealmSlug[] = ["lianqi", "zhuji", "jiedan", "yuanying", "huashen"];

interface BattleOption {
  text: string;
  score: number; // +1, 0, -1
  cost?: { lingshi?: number; itemId?: string };
  desc: string;
}

interface BattleConfig {
  enemyName: string;
  enemyRealm: RealmSlug;
  enemyDesc: string;
  rounds?: BattleOption[][];  // 3个回合，每回合3个选项
  onWin: () => void;
  onLose: (severity: "light" | "heavy" | "dying") => void;
  onClose: () => void;
}

// 默认3回合选项（通用）
const DEFAULT_ROUNDS: BattleOption[][] = [
  [
    { text: "全力出击，先发制人", score: 1, desc: "主动进攻，占据先机" },
    { text: "以守代攻，伺机反击", score: 0, desc: "稳扎稳打，消耗对方" },
    { text: "施展身法，拉开距离", score: -1, desc: "保存实力，避免硬拼" },
  ],
  [
    { text: "催动法宝，全力一击", score: 1, desc: "消耗法宝能量，重创对方" },
    { text: "布下阵法，困住对方", score: 1, cost: { lingshi: 200 }, desc: "消耗200灵石，限制敌人行动" },
    { text: "使出看家本领", score: 0, desc: "稳定发挥，不冒险" },
    { text: "假装败退，引诱对方", score: -1, desc: "诱敌深入，风险较高" },
  ],
  [
    { text: "趁胜追击，一举击溃", score: 1, desc: "乘胜追击，彻底击败对方" },
    { text: "稳住阵脚，正面决战", score: 0, desc: "正面对决，凭实力说话" },
    { text: "见好就收，鸣金收兵", score: -1, desc: "适可而止，保存实力" },
  ],
];

export default function BattleModal({
  enemyName,
  enemyRealm,
  enemyDesc,
  rounds = DEFAULT_ROUNDS,
  onWin,
  onLose,
  onClose,
}: BattleConfig) {
  const { state, dispatch } = useGame();
  const [currentRound, setCurrentRound] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [phase, setPhase] = useState<"intro" | "fighting" | "result">("intro");
  const [result, setResult] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(0);

  // 境界差距修正
  const playerIdx = REALM_ORDER.indexOf(state.realmSlug);
  const enemyIdx = REALM_ORDER.indexOf(enemyRealm);
  const realmBonus = playerIdx - enemyIdx; // 玩家高则为正

  // 散修加成
  const sanxiuBonus = state.sectPath === "sanxiu" ? 1 : 0;

  function handleOption(option: BattleOption) {
    // 检查消耗
    if (option.cost?.lingshi && state.lingshi < option.cost.lingshi) return;

    // 扣除消耗
    if (option.cost?.lingshi) {
      dispatch({ type: "ADD_LINGSHI", amount: -option.cost.lingshi });
    }

    const newScores = [...scores, option.score];
    setScores(newScores);

    if (currentRound < rounds.length - 1) {
      setCurrentRound(currentRound + 1);
    } else {
      // 计算最终结果
      const rawTotal = newScores.reduce((a, b) => a + b, 0);
      const finalTotal = rawTotal + realmBonus + sanxiuBonus * rounds.length;
      setTotalScore(finalTotal);
      setPhase("result");

      let resultText = "";
      if (finalTotal >= 2) {
        resultText = "完胜";
        dispatch({ type: "ADD_LINGSHI", amount: 200 });
        dispatch({ type: "ADD_EMOTION", positive: 5, negative: 0 });
        onWin();
      } else if (finalTotal === 1) {
        resultText = "小胜";
        dispatch({ type: "ADD_LINGSHI", amount: 100 });
        dispatch({ type: "ADD_EMOTION", positive: 3, negative: 0 });
        onWin();
      } else if (finalTotal === 0) {
        resultText = "平局";
        dispatch({ type: "SET_INJURY", level: "light" });
        dispatch({ type: "ADD_EMOTION", positive: 1, negative: 2 });
      } else if (finalTotal === -1) {
        resultText = "小败";
        dispatch({ type: "SET_INJURY", level: "light" });
        dispatch({ type: "ADD_EMOTION", positive: 0, negative: 5 });
        onLose("light");
      } else if (finalTotal === -2) {
        resultText = "败北";
        dispatch({ type: "SET_INJURY", level: "heavy" });
        dispatch({ type: "ADD_EMOTION", positive: 0, negative: 8 });
        onLose("heavy");
      } else {
        resultText = "惨败";
        dispatch({ type: "SET_INJURY", level: "dying" });
        dispatch({ type: "ADD_EMOTION", positive: 0, negative: 12 });
        dispatch({ type: "ADD_EMOTION", positive: 0, negative: 8 }); // 恐惧
        onLose("dying");
      }
      setResult(resultText);
    }
  }

  const RESULT_COLORS: Record<string, string> = {
    "完胜": "#d4a843",
    "小胜": "#4ade9a",
    "平局": "#6a8878",
    "小败": "#f59e0b",
    "败北": "#ef4444",
    "惨败": "#7f1d1d",
  };

  const currentRoundOptions = rounds[currentRound] ?? DEFAULT_ROUNDS[Math.min(currentRound, 2)];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
      >
        {/* 标题 */}
        <div className="px-5 py-4" style={{ borderBottom: "1px solid #1a2820" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-serif font-bold text-sm" style={{ color: "#ef4444" }}>战斗</span>
            <span className="text-xs" style={{ color: "#6a8878" }}>
              {REALM_ORDER.indexOf(enemyRealm) > playerIdx ? "⚠ 对方境界更高" :
               REALM_ORDER.indexOf(enemyRealm) < playerIdx ? "对方境界较低" : "势均力敌"}
            </span>
          </div>
          <div className="font-bold" style={{ color: "#e8f0ec" }}>{enemyName}</div>
          <div className="text-xs mt-1" style={{ color: "#6a8878" }}>{enemyDesc}</div>
        </div>

        {phase === "intro" && (
          <div className="px-5 py-5">
            <p className="text-sm mb-5" style={{ color: "#b8ccc2" }}>
              战斗一触即发，你需要做出三次关键决策。每次选择都将影响战局走向。
            </p>
            {realmBonus !== 0 && (
              <p className="text-xs mb-4" style={{ color: realmBonus > 0 ? "#4ade9a" : "#ef4444" }}>
                境界修正：{realmBonus > 0 ? `+${realmBonus}` : realmBonus}（{realmBonus > 0 ? "你境界更高" : "对方境界更高"}）
              </p>
            )}
            {state.sectPath === "sanxiu" && (
              <p className="text-xs mb-4" style={{ color: "#4ade9a" }}>散修加成：每回合+1</p>
            )}
            <button
              onClick={() => setPhase("fighting")}
              className="w-full py-3 rounded-lg font-medium text-sm"
              style={{ backgroundColor: "#ef4444", color: "#fff" }}
            >
              迎战！
            </button>
          </div>
        )}

        {phase === "fighting" && (
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs" style={{ color: "#6a8878" }}>第 {currentRound + 1} / {rounds.length} 回合</span>
              <div className="flex gap-1">
                {rounds.map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: i < currentRound ? "#4ade9a" : i === currentRound ? "#e8f0ec" : "#1a2820" }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {currentRoundOptions.map((opt, i) => {
                const canAfford = !opt.cost?.lingshi || state.lingshi >= opt.cost.lingshi;
                return (
                  <button
                    key={i}
                    onClick={() => canAfford && handleOption(opt)}
                    disabled={!canAfford}
                    className="text-left px-4 py-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: canAfford ? "#1a2820" : "#0e1610",
                      border: "1px solid #2a3828",
                      color: canAfford ? "#e8f0ec" : "#4a6a58",
                      cursor: canAfford ? "pointer" : "not-allowed",
                    }}
                  >
                    <span className="mr-2" style={{ color: "#ef4444" }}>{String.fromCharCode(65 + i)}.</span>
                    {opt.text}
                    {opt.cost?.lingshi && (
                      <span className="ml-2 text-xs" style={{ color: "#6a8878" }}>（{opt.cost.lingshi}灵石）</span>
                    )}
                    <div className="text-xs mt-0.5" style={{ color: "#4a6a58" }}>{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {phase === "result" && result && (
          <div className="px-5 py-6 text-center">
            <div
              className="text-4xl font-serif font-bold mb-3"
              style={{ color: RESULT_COLORS[result] ?? "#e8f0ec" }}
            >
              {result}
            </div>
            <p className="text-sm mb-5" style={{ color: "#b8ccc2" }}>
              {totalScore >= 2 && "你以绝对优势击败了对方，对方落荒而逃。"}
              {totalScore === 1 && "你略占上风，对方受轻伤退却。"}
              {totalScore === 0 && "双方势均力敌，各受轻伤，不分胜负。"}
              {totalScore === -1 && "你稍处下风，身受轻伤。"}
              {totalScore === -2 && "你落败，身受重伤，狼狈撤退。"}
              {totalScore <= -3 && "你惨败，濒临陨落，危在旦夕。"}
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg text-sm btn-secondary"
            >
              继续
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
