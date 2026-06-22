export default function DonutGauge({
  percentage,
  size = 168,
  strokeWidth = 16,
  centerLabel,
  centerSubLabel,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  centerLabel: string;
  centerSubLabel: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1E2D3" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#C2410C"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-stone-900">{centerLabel}</span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
          {centerSubLabel}
        </span>
      </div>
    </div>
  );
}
