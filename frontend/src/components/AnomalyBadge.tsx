import type { AnomalyLevel } from "../types/investigation";

const labels: Record<AnomalyLevel, string> = {
  high: "High anomaly",
  medium: "Medium anomaly",
  low: "Low anomaly",
  none: "No anomaly",
};

interface AnomalyBadgeProps {
  level: AnomalyLevel;
}

export function AnomalyBadge({ level }: AnomalyBadgeProps) {
  return (
    <span className={`anomaly anomaly--${level}`} aria-label={labels[level]}>
      {labels[level]}
    </span>
  );
}
