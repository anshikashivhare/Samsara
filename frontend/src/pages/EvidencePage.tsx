import { ChartBar, Database, Info, Shield } from "../lib/icons";
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { investigation } from "../data/fixtures";
import { ScoreBar } from "../components/ScoreBar";

const totalWeight = investigation.evidence.reduce((s, e) => s + e.weight, 0);
const totalContribution = investigation.evidence.reduce((s, e) => s + e.contribution, 0);
const topSuspect = investigation.vessels[0];

export function EvidencePage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow={<>ATTRIBUTION ENGINE</>}
        title={<>Evidence Matrix</>}
        sub="Explainable scoring across spatial, temporal, trajectory, behaviour, and drift dimensions"
      />

      <section className="grid grid--kpi">
        <KpiCard
          label="Top suspect"
          value={`${topSuspect.score} / 100`}
          icon={<Shield weight="duotone" />}
          hint={<>MMSI {topSuspect.mmsi}</>}
        />
        <KpiCard
          label="Weight sum"
          value={(totalWeight * 100).toFixed(0) + "%"}
          icon={<ChartBar weight="duotone" />}
          hint={<>5 components</>}
        />
        <KpiCard
          label="Score contribution"
          value={totalContribution.toFixed(1)}
          icon={<Database weight="duotone" />}
          hint={<>out of 100</>}
        />
        <KpiCard
          label="Confidence"
          value="HIGH"
          icon={<Info weight="duotone" />}
          hint={"3 of 5 evidence > 90"}
        />
      </section>

      <Panel
        title="Evidence components"
        icon={<ChartBar weight="duotone" />}
        meta={<>Weighted contribution</>}
        tier="evidence"
      >
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {investigation.evidence.map((e) => (
            <li key={e.key} className="evidence-row">
              <div>
                <div className="evidence-row__label">{e.label}</div>
                <div className="text-muted text-sm" style={{ marginTop: 4 }}>{e.description}</div>
              </div>
              <div className="evidence-row__bar" aria-label={`${e.label} value ${e.value}`}>
                <div className="evidence-row__bar-fill" style={{ width: `${e.value}%` }} />
              </div>
              <div className="evidence-row__weight">{`w = ${(e.weight * 100).toFixed(0)}%`}</div>
              <div className="evidence-row__contrib">{e.contribution.toFixed(1)}</div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Why this vessel?"
        icon={<Info weight="duotone" />}
        tier="evidence"
      >
        <div className="stack stack--lg">
          {investigation.evidence.map((e) => (
            <div key={e.key} className="row" style={{ alignItems: "flex-start", gap: 16 }}>
              <div style={{ minWidth: 200, color: "var(--text-primary)", fontWeight: 500 }}>{e.label}</div>
              <div className="stack" style={{ flex: 1 }}>
                <div className="row" style={{ gap: 12 }}>
                  <div style={{ flex: 1, maxWidth: 320 }}><ScoreBar value={e.value} showValue={false} size="sm" /></div>
                  <span className="text-mono text-muted text-sm">value {e.value}</span>
                  <span className="text-mono text-muted text-sm">· +{e.contribution.toFixed(1)} pts</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-body-sm)" }}>{e.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
