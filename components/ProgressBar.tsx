interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-bamboo-500 mb-1">
        <span>第 {current} 题</span>
        <span>共 {total} 题</span>
      </div>
      <div className="w-full bg-bamboo-200 rounded-full h-2">
        <div
          className="bg-bamboo-400 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
