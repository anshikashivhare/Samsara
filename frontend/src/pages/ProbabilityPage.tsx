import { useMemo, useState } from "react";
import { ChartBar, Info, Shield, Target } from "../lib/icons";
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { ScoreBar } from "../components/ScoreBar";
import { StatusPill } from "../components/StatusPill";
import { ProbabilityDonut, type ProbabilitySlice } from "../components/ProbabilityDonut";
import { investigation, vesselProbabilities } from "../data/fixtures";
import type { RankedCandidate, Vessel } from "../types/investigation";

const PRIORITY_TONE = {
  high: "warning",
  medium: "info",
  low: "muted",
} as const;

const PRIORITY_LABEL = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
} as const;

const FILL_CLASS = ["--1", "--2", "--n", "--n", "--n"] as const;

function joinRanking(): RankedCandidate[] {
  const byMmsi = new Map<string, Vessel>();
  for (const v of investigation.vessels) byMmsi.set(v.mmsi, v);
  const merged = vesselProbabilities
    .map((p) => {
      const vessel = byMmsi.get(p.mmsi);
      return vessel ? { vessel, probability: p } : null;
    })
    .filter((r): r is RankedCandidate => r !== null)
    .sort((a, b) => b.probability.probability - a.probability.probability);
  return merged.map((r, i) => ({ ...r, rank: i + 1 }));
}

function pct(n: number, digits = 1) {
  return `${(n * 100).toFixed(digits)}%`;
}

function priorityLabel(p: "high" | "medium" | "low") {
  if (p === "high") return "HIGH LIKELIHOOD";
  if (p === "medium") return "MODERATE LIKELIHOOD";
  return "LOW LIKELIHOOD";
}

export function ProbabilityPage() {
  const ranked = useMemo(joinRanking, []);
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(
    () => ranked[0]?.vessel.mmsi ?? null
  );

  const selected = useMemo(
    () => ranked.find((r) => r.vessel.mmsi === selectedMmsi) ?? ranked[0],
    [ranked, selectedMmsi]
  );

  const top = ranked[0];
  const second = ranked[1];
  const third = ranked[2];
  const remaining = ranked.slice(3).reduce((s, r) => s + r.probability.probability, 0);

  const donutRows: ProbabilitySlice[] = ranked.map((r) => ({
    mmsi: r.vessel.mmsi,
    name: r.vessel.name,
    probability: r.probability.probability,
  }));

  return (
    <div className="page">
      <PageHeader
        eyebrow={<>ATTRIBUTION ENGINE</>}
        title={<>Probability of Vessel Association</>}
        sub="Analytical likelihood of candidate vessels being associated with the detected oil spill event."
      />

      <section className="grid grid--kpi" aria-label="Probability summary">
        <KpiCard
          label={<>RANK 01 · TOP CANDIDATE</>}
          value={pct(top.probability.probability, 0)}
          icon={<Target weight="duotone" />}
          hint={<>{top.vessel.name} · MMSI {top.vessel.mmsi}</>}
        />
        <KpiCard
          label={<>SECOND CANDIDATE</>}
          value={pct(second.probability.probability, 0)}
          icon={<Target weight="duotone" />}
          hint={<>{second.vessel.name} · MMSI {second.vessel.mmsi}</>}
        />
        <KpiCard
          label={<>THIRD CANDIDATE</>}
          value={pct(third.probability.probability, 0)}
          icon={<Target weight="duotone" />}
          hint={<>{third.vessel.name} · MMSI {third.vessel.mmsi}</>}
        />
        <KpiCard
          label={<>REMAINING CANDIDATES</>}
          value={pct(remaining, 0)}
          icon={<ChartBar weight="duotone" />}
          hint={<>Other vessels · {ranked.length - 3} entries</>}
        />
      </section>

      <div className="grid grid--main-side">
        <Panel
          title="Probability ranking"
          icon={<ChartBar weight="duotone" />}
          meta={<>{ranked.length} candidate vessels</>}
          tier="data"
          flush
        >
          <table className="table" aria-label="Probability ranking table">
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Vessel</th>
                <th scope="col">MMSI</th>
                <th scope="col">Probability</th>
                <th scope="col">Confidence (±)</th>
                <th scope="col">Investigation priority</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((r, i) => {
                const v = r.vessel;
                const p = r.probability;
                const isSelected = selected?.vessel.mmsi === v.mmsi;
                const fillClass = FILL_CLASS[Math.min(i, FILL_CLASS.length - 1)];
                return (
                  <tr
                    key={v.mmsi}
                    tabIndex={0}
                    onClick={() => setSelectedMmsi(v.mmsi)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedMmsi(v.mmsi);
                      }
                    }}
                    aria-selected={isSelected}
                    aria-label={`Rank ${r.rank} ${v.name} probability ${(p.probability * 100).toFixed(0)} percent`}
                    className={isSelected ? "candidate-row candidate-row--selected" : "candidate-row"}
                  >
                    <td className="cell-num">{String(r.rank).padStart(2, "0")}</td>
                    <td>
                      <div>{v.name}</div>
                      <div className="text-muted text-xs">{v.flag} · {v.type}</div>
                    </td>
                    <td className="cell-mono">{v.mmsi}</td>
                    <td>
                      <div className="probability-bar">
                        <div className="probability-bar__track">
                          <div
                            className={`probability-bar__fill probability-bar__fill${fillClass}`}
                            style={{ width: `${p.probability * 100}%` }}
                          />
                        </div>
                        <span className="probability-bar__num">{(p.probability * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="cell-mono">±{p.confidencePct}%</td>
                    <td>
                      <StatusPill tone={PRIORITY_TONE[p.priority]}>
                        {priorityLabel(p.priority)}
                      </StatusPill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        <Panel
          title="Probability distribution"
          icon={<Target weight="duotone" />}
          meta={<>Relative share across candidates</>}
        >
          <ProbabilityDonut rows={donutRows} selectedMmsi={selectedMmsi} />
        </Panel>
      </div>

      {selected && (
        <Panel
          title="Why this candidate?"
          icon={<Info weight="duotone" />}
          meta={<>{selected.vessel.name} · rank {String(selected.rank).padStart(2, "0")}</>}
          tier="evidence"
        >
          <div className="grid grid--main-side" style={{ alignItems: "start" }}>
            <div className="stack stack--lg">
              <div className="stack">
                <div className="text-eyebrow text-muted">Association probability</div>
                <div className="probability-bar" style={{ minWidth: 0 }}>
                  <div className="probability-bar__track">
                    <div
                      className="probability-bar__fill probability-bar__fill--1"
                      style={{ width: `${selected.probability.probability * 100}%` }}
                    />
                  </div>
                  <span className="probability-bar__num">
                    {(selected.probability.probability * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="row" style={{ gap: 24 }}>
                <div className="stack" style={{ gap: 4 }}>
                  <span className="text-eyebrow text-muted">Confidence range</span>
                  <span className="text-mono" style={{ color: "var(--text-primary)" }}>
                    ±{selected.probability.confidencePct}%
                  </span>
                </div>
                <div className="stack" style={{ gap: 4 }}>
                  <span className="text-eyebrow text-muted">Investigation priority</span>
                  <span>
                    <StatusPill tone={PRIORITY_TONE[selected.probability.priority]}>
                      {PRIORITY_LABEL[selected.probability.priority]}
                    </StatusPill>
                  </span>
                </div>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-body)" }}>
                {selected.probability.rationale}
              </p>
            </div>
            <div className="stack">
              <div className="text-eyebrow text-muted">Evidence strength</div>
              {investigation.evidence.map((e) => {
                const sub = selected.vessel[`${e.key}Score` as keyof Vessel] as number;
                return (
                  <div
                    key={e.key}
                    className="row"
                    style={{ alignItems: "center", gap: 12 }}
                  >
                    <span style={{ minWidth: 160, color: "var(--text-secondary)" }}>
                      {e.label}
                    </span>
                    <div style={{ flex: 1 }}>
                      <ScoreBar value={sub} showValue={false} size="sm" />
                    </div>
                    <span className="text-mono" style={{ minWidth: 32, textAlign: "right" }}>
                      {sub}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>
      )}

      <div className="grid grid--main-side">
        <Panel
          title="How to interpret"
          icon={<Info weight="duotone" />}
          tier="evidence"
        >
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-body)", margin: 0 }}>
            Higher probability indicates stronger analytical correlation with the
            estimated spill origin and time based on available evidence.
          </p>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "var(--fs-body-sm)",
              margin: "var(--space-3) 0 0",
            }}
          >
            This is an analytical estimate and not a legal determination.
          </p>
        </Panel>
        <Panel
          title="Important note"
          icon={<Shield weight="duotone" />}
          tier="evidence"
        >
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-body)", margin: 0 }}>
            These probabilities represent analytical likelihood based on available
            data and modelling. They do not imply guilt, legal responsibility, or
            liability.
          </p>
        </Panel>
      </div>
    </div>
  );
}
