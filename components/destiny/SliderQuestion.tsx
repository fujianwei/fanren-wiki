"use client";

interface Props {
  text: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
  onConfirm: () => void;
  disabled?: boolean;
}

export function sliderSegment(value: number): "left" | "middle" | "right" {
  if (value <= 33) return "left";
  if (value <= 66) return "middle";
  return "right";
}

export default function SliderQuestion({ text, leftLabel, rightLabel, value, onChange, onConfirm, disabled }: Props) {
  return (
    <div
      className="rounded-2xl p-8 relative overflow-hidden card-glow"
      style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
    >
      <p className="text-xs tracking-widest mb-4" style={{ color: "#6a8878" }}>程度选择</p>
      <h2 className="font-serif text-lg leading-relaxed mb-8" style={{ color: "#e8f0ec" }}>{text}</h2>

      <div className="flex justify-between text-sm mb-4" style={{ color: "#6a8878" }}>
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
        className="jade-slider"
      />

      <div className="mt-8 text-center">
        <button
          disabled={disabled}
          onClick={onConfirm}
          className="btn-primary"
          style={{ opacity: disabled ? 0.5 : 1 }}
        >
          确认
        </button>
      </div>
    </div>
  );
}
