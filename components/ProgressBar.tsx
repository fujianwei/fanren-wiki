interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2" style={{ fontSize: "11px", color: "#6a8878", letterSpacing: "0.1em" }}>
        <span>第 {current} 题</span>
        <span>共 {total} 题</span>
      </div>
      <div className="w-full rounded-full" style={{ backgroundColor: "#1a2820", height: "3px" }}>
        <div
          className="rounded-full transition-all duration-300"
          style={{
            width: `${percent}%`,
            height: "3px",
            background: "linear-gradient(90deg, #22c47a, #4ade9a)",
            boxShadow: "0 0 8px rgba(74,222,154,0.5)",
          }}
        />
      </div>
    </div>
  );
}
