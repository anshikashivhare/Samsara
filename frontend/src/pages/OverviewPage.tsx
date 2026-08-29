import { useState } from "react";
import { Anchor, Broadcast, Crosshair, Database, Drop, Pulse, Radio } from "../lib/icons";
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { StatusPill } from "../components/StatusPill";
import { AnomalyBadge } from "../components/AnomalyBadge";
import { ScoreBar } from "../components/ScoreBar";
import { investigation } from "../data/fixtures";
import { formatDate, formatKm, formatPercent } from "../data/formatters";
import { Drawer } from "../components/Drawer";
import { MapPanel } from "../components/MapPanel";

export function OverviewPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const top = investigation.vessels[0];
  const inc = investigation.incident;

  return (
    <div className="page">
      <PageHeader
        eyebrow={<>INVESTIGATION · {inc.id}</>}
        title={<>Oil Spill Investigation</>}
        sub="Satellite detection · AIS correlation · Ocean drift modelling"
        actions={<StatusPill tone="active">Active</StatusPill>}
      />

      <section className="grid grid--kpi" aria-label="Key metrics">
        <KpiCard
          label="Spill area"
          value={`${inc.spillAreaKm2.toFixed(1)} km²`}
          icon={<Drop weight="duotone" />}
          hint={<><span>↑ </span>1.4 km² in last 6h</>}
        />
        <KpiCard
          label="Detection confidence"
          value={formatPercent(inc.detectionConfidence)}
          icon={<Broadcast weight="duotone" />}
          hint={<>Sentinel-1 SAR</>}
        />
        <KpiCard
          label="Candidate vessels"
          value={inc.candidateCount}
          icon={<Anchor weight="duotone" />}
          hint={<>12 within 80 km</>}
        />
        <KpiCard
          label="Top suspect"
          value={`${inc.topSuspectScore} / 100`}
          icon={<Crosshair weight="duotone" />}
          hint={<>MMSI {top.mmsi}</>}
        />
      </section>

      <Panel
        title="Situation map"
        icon={<Pulse weight="duotone" />}
        meta={<>Sentinel-1 · {formatDate(inc.detectedAt)}</>}
      >
        <MapPanel height={420} />
      </Panel>

      <Panel
        title="Top suspect vessels"
        icon={<Radio weight="duotone" />}
        meta={<>Click a row for evidence breakdown</>}
        flush
        tier="data"
      >
        <table className="table" aria-label="Top suspect vessels">
          <thead>
            <tr>
              <th scope="col">MMSI</th>
              <th scope="col">Vessel</th>
              <th scope="col">Anomaly</th>
              <th scope="col">Distance</th>
              <th scope="col">Score</th>
            </tr>
          </thead>
          <tbody>
            {investigation.vessels.slice(0, 6).map((v) => (
              <tr
                key={v.mmsi}
                tabIndex={0}
                onClick={() => setDrawerOpen(true)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDrawerOpen(true); } }}
                aria-label={`${v.mmsi} ${v.name} score ${v.score}`}
              >
                <td className="cell-mono">{v.mmsi}</td>
                <td>
                  <div>{v.name}</div>
                  <div className="text-muted text-xs">{v.flag} · {v.type}</div>
                </td>
                <td><AnomalyBadge level={v.anomaly} /></td>
                <td className="cell-mono">{formatKm(v.distanceKm)}</td>
                <td>
                  <div style={{ minWidth: 160 }}>
                    <ScoreBar value={v.score} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel
        title="Recent activity"
        icon={<Database weight="duotone" />}
        meta={<>Last 24h</>}
        tier="data"
      >
        <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {[
            { t: "04:12", msg: "Sentinel-1 SAR pass acquired · 18.7 km² spill confirmed at 92.4% confidence." },
            { t: "04:38", msg: "Hindcast started · 5 origin zones generated from 9,912 particles." },
            { t: "05:02", msg: "AIS ingestion complete · 412 vessels within 80 km, 12 candidates." },
            { t: "05:14", msg: "DBSCAN anomaly detection flagged MMSI 419001234 (score 0.94)." },
            { t: "05:31", msg: "Attribution engine ranked 12 candidates; top suspect: MV Vishva Anand." },
          ].map((e, i) => (
            <li key={i} className="row" style={{ alignItems: "flex-start", gap: 16 }}>
              <span className="text-mono text-muted" style={{ minWidth: 64 }}>{e.t}</span>
              <span style={{ color: "var(--text-secondary)" }}>{e.msg}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={top.name}
        sub={`MMSI ${top.mmsi} · ${top.flag} · ${top.type}`}
      >
        <section>
          <div className="text-eyebrow text-muted">Composite score</div>
          <div className="row" style={{ marginTop: 8 }}>
            <ScoreBar value={top.score} />
          </div>
        </section>
        <section className="stack">
          <div className="text-eyebrow text-muted">Anomaly</div>
          <AnomalyBadge level={top.anomaly} />
        </section>
        <section className="stack">
          <div className="text-eyebrow text-muted">Behavioural flags</div>
          <ul style={{ margin: 0, paddingLeft: 16, color: "var(--text-secondary)" }}>
            {top.behaviourFlags.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </section>
        <section className="stack">
          <div className="text-eyebrow text-muted">Sub-scores</div>
          {investigation.evidence.map((e) => (
            <div key={e.key} className="row" style={{ alignItems: "center", gap: 12 }}>
              <span style={{ minWidth: 140, color: "var(--text-secondary)" }}>{e.label}</span>
              <div style={{ flex: 1 }}><ScoreBar value={e.value} showValue={false} /></div>
              <span className="text-mono" style={{ minWidth: 32, textAlign: "right" }}>{e.value}</span>
            </div>
          ))}
        </section>
      </Drawer>
    </div>
  );
}
