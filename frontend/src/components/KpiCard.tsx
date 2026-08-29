import type { ReactNode } from "react";

interface KpiCardProps {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
}

export function KpiCard({ label, value, icon, hint }: KpiCardProps) {
  return (
    <article className="kpi">
      <div className="kpi__label">
        {icon}
        <span>{label}</span>
      </div>
      <div className="kpi__value">{value}</div>
      {hint && <div className="kpi__delta">{hint}</div>}
    </article>
  );
}
