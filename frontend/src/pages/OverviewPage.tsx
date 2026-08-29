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
import { useLiveTelemetry } from "../hooks/useLiveTelemetry";

export function OverviewPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const top = investigation.vessels[0];
  const inc = investigation.incident;
  // SSE live stream — updates KPIs and vessel scores every 2.5s without changing the layout
  const live = useLiveTelemetry();
  const liveScoreMap = Object.fromEntries((live.vessels ?? []).map((v) => [v.mmsi, v.score]));

  return (
    <div className="page">
      <PageHeader
        eyebrow={<>INVESTIGATION · {inc.id}</>}
        title={<>Oil Spill Investigation</>}
        sub="Satellite detection · AIS correlation · Ocean drift modelling"
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontFamily: "var(--font-mono)", fontSize: 11,
              padding: "3px 9px", borderRadius: 20,
              background: live.connected ? "rgba(0,245,160,.1)" : "rgba(255,170,0,.1)",
              color: live.connected ? "#00f5a0" : "#ffaa00",
              border: `1px solid ${live.connected ? "rgba(0,245,160,.25)" : "rgba(255,170,0,.25)"}`
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", display: "inline-block",
                background: live.connected ? "#00f5a0" : "#ffaa00" }} />
              {live.connected ? "LIVE · 2.5s" : "Connecting..."}
            </span>
            <StatusPill tone="active">Active</StatusPill>
          </div>
        }
      />

      <section className="grid grid--kpi" aria-label="Key metrics">
        <KpiCard
          label="Spill area"
          value={`${inc.spillAreaKm2.toFixed(1)} km²`}
          icon={<Drop weight="duotone" />}
          hint={<><span>↑ </span>{live.spill_drift_rate_knots ? `Drift ${live.spill_drift_rate_knots} kn` : "1.4 km² in last 6h"}</>}
        />
        <KpiCard
          label="Detection confidence"
          value={live.wind_speed_knots ? `${live.wind_speed_knots} kn wind` : formatPercent(inc.detectionConfidence)}
          icon={<Broadcast weight="duotone" />}
          hint={live.ocean_current_speed_ms ? <>Current: {live.ocean_current_speed_ms} m/s</> : <>Sentinel-1 SAR</>}
        />
        <KpiCard
          label="Candidate vessels"
          value={live.active_vessels_count ?? inc.candidateCount}
          icon={<Anchor weight="duotone" />}
          hint={live.dark_vessels_count != null ? <><span style={{color:"#ff3366",fontWeight:600}}>{live.dark_vessels_count} dark ship</span> detected</> : <>12 within 80 km</>}
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
                    <ScoreBar value={liveScoreMap[v.mmsi] ?? v.score} />
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
