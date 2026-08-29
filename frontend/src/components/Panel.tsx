import type { ReactNode } from "react";

interface PanelProps {
  title?: ReactNode;
  icon?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  tier?: "default" | "data" | "evidence";
  flush?: boolean;
}

export function Panel({
  title,
  icon,
  meta,
  actions,
  children,
  tier = "default",
  flush = false,
}: PanelProps) {
  const tierClass =
    tier === "data" ? "panel--data" : tier === "evidence" ? "panel--evidence" : "";
  const cls = ["panel", tierClass, flush ? "panel--flush" : ""].filter(Boolean).join(" ");

  return (
    <section className={cls}>
      {(title || meta || actions) && (
        <header className="panel__header">
          {title ? (
            <div className="panel__title">
              {icon && <span className="panel__title-icon">{icon}</span>}
              <span>{title}</span>
            </div>
          ) : <span />}
          <div className="row" style={{ gap: 12 }}>
            {meta && <span className="panel__meta">{meta}</span>}
            {actions}
          </div>
        </header>
      )}
      <div className={flush ? "panel__body panel__body--flush" : "panel__body"}>
        {children}
      </div>
    </section>
  );
}
