"use client";

interface Props {
  text: string;
  leftLabel: string;
  rightLabel: string;
  value: number; // 0-100
  onChange: (value: number) => void;
  onConfirm: () => void;
  disabled?: boolean;
}

/** 将 0-100 映射到三段：left(0-33) / middle(34-66) / right(67-100) */
export function sliderSegment(value: number): "left" | "middle" | "right" {
  if (value <= 33) return "left";
  if (value <= 66) return "middle";
  return "right";
}

export default function SliderQuestion({ text, leftLabel, rightLabel, value, onChange, onConfirm, disabled }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-bamboo-200 p-8 shadow-sm">
      <p className="text-bamboo-400 text-xs tracking-widest mb-4">程度选择</p>
      <h2 className="text-bamboo-700 font-serif text-lg leading-relaxed mb-8">{text}</h2>

      <div className="flex justify-between text-bamboo-500 text-sm mb-3">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-bamboo-400 cursor-pointer disabled:opacity-50"
      />

      <div className="mt-6 text-center">
        <button
          disabled={disabled}
          onClick={onConfirm}
          className="bg-bamboo-400 text-white px-8 py-2.5 rounded-full text-sm hover:bg-bamboo-500 transition-colors disabled:opacity-50"
        >
          确认
        </button>
      </div>
    </div>
  );
}
