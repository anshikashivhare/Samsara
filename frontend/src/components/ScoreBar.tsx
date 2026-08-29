interface ScoreBarProps {
  value: number;
  showValue?: boolean;
  size?: "sm" | "md";
}

export function ScoreBar({ value, showValue = true, size = "md" }: ScoreBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const tier = clamped >= 75 ? "high" : clamped >= 50 ? "medium" : "low";
  return (
    <div className="score" role="meter" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} aria-label={`Score ${clamped}`}>
      <div className="score__track" style={size === "sm" ? { height: 4 } : undefined}>
        <div
          className={`score__fill score__fill--${tier}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showValue && <span className="score__num">{clamped}</span>}
    </div>
  );
}
