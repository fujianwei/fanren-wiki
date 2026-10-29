"use client";

import { useGame } from "./GameProvider";

interface Props {
  onClose: () => void;
}

const SECT_OPTIONS = [
  {
    id: "zhengdao" as const,
    name: "加入正道宗门",
    desc: "灵石收入更稳定，冲关略占优势。代价是需要承担宗门事务。",
    pros: ["灵石收入+20%", "冲关成功率+5%"],
    cons: ["无额外修炼加速", "承担宗门事务"],
    color: "#4ade9a",
  },
  {
    id: "modao" as const,
    name: "加入魔道宗门",
    desc: "修炼速度更快，但寿元与心境都要付出代价。",
    pros: ["修炼速度×1.5"],
    cons: ["寿命上限-15%", "每阶段负面情绪+4"],
    color: "#ef4444",
  },
  {
    id: "sanxiu" as const,
    name: "继续散修",
    desc: "不受宗门约束，在历练战斗中更擅长把握先机。",
    pros: ["战斗每回合+1"],
    cons: ["无宗门灵石加成", "无宗门冲关加成"],
    color: "#d4a843",
  },
];

export default function SectChoiceModal({ onClose }: Props) {
  const { state, dispatch } = useGame();

  if (state.sectPath) {
    onClose();
    return null;
  }

  function handleChoose(sectId: "zhengdao" | "modao" | "sanxiu") {
    dispatch({ type: "SET_SECT_PATH", sectPath: sectId });
    // 魔道寿命上限-15%
    if (sectId === "modao") {
      dispatch({ type: "APPLY_MODAO_PENALTY" });
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820", maxHeight: "85vh", overflowY: "auto" }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid #1a2820" }}>
          <div className="font-serif font-bold text-sm mb-1" style={{ color: "#e8f0ec" }}>选择你的道路</div>
          <p className="text-xs" style={{ color: "#6a8878" }}>此选择将影响你的整个修仙历程，请慎重。</p>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {SECT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleChoose(opt.id)}
              className="text-left p-4 rounded-xl transition-all"
              style={{ backgroundColor: "#0e1610", border: `1px solid ${opt.color}33` }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${opt.color}88`}
              onMouseLeave={e => e.currentTarget.style.borderColor = `${opt.color}33`}
            >
              <div className="font-bold text-sm mb-1" style={{ color: opt.color }}>{opt.name}</div>
              <p className="text-xs mb-2" style={{ color: "#b8ccc2" }}>{opt.desc}</p>
              <div className="flex gap-3 text-xs">
                <div>
                  {opt.pros.map(p => <div key={p} style={{ color: "#4ade9a" }}>+ {p}</div>)}
                </div>
                <div>
                  {opt.cons.map(c => <div key={c} style={{ color: "#ef4444" }}>- {c}</div>)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
