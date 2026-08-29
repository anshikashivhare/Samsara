import type { ReactNode } from "react";

interface StatusPillProps {
  tone?: "active" | "warning" | "danger" | "info" | "muted";
  children: ReactNode;
}

export function StatusPill({ tone = "active", children }: StatusPillProps) {
  return (
    <span className={`status-pill status-pill--${tone}`} role="status">
      {children}
    </span>
  );
}
