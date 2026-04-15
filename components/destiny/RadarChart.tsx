// 纯 SVG 雷达图，无外部依赖

interface Dimension {
  label: string;
  value: number; // 0-100
}

interface Props {
  dimensions: Dimension[];
  size?: number;
}

export default function RadarChart({ dimensions, size = 200 }: Props) {
  const center = size / 2;
  const radius = size * 0.38;
  const n = dimensions.length;

  function angleOf(i: number) {
    return (Math.PI * 2 * i) / n - Math.PI / 2;
  }

  function pointAt(i: number, r: number) {
    const a = angleOf(i);
    return { x: center + r * Math.cos(a), y: center + r * Math.sin(a) };
  }

  const gridLevels = [0.33, 0.66, 1.0];

  const dataPoints = dimensions.map((d, i) => pointAt(i, (d.value / 100) * radius));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* 网格 */}
      {gridLevels.map((level, li) => {
        const pts = Array.from({ length: n }, (_, i) => pointAt(i, radius * level));
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
        return <path key={li} d={path} fill="none" stroke="#d4e0cc" strokeWidth="1" />;
      })}

      {/* 轴线 */}
      {Array.from({ length: n }, (_, i) => {
        const p = pointAt(i, radius);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#d4e0cc" strokeWidth="1" />;
      })}

      {/* 数据面积 */}
      <path d={dataPath} fill="#7a9e72" fillOpacity="0.3" stroke="#5a7e52" strokeWidth="2" />

      {/* 数据点 */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#5a7e52" />
      ))}

      {/* 标签 */}
      {dimensions.map((d, i) => {
        const p = pointAt(i, radius + 18);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill="#3a5c32"
            fontFamily="serif"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
