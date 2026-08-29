import { useState } from "react";
import { ChartLine, MapTrifold, Pulse, Radio, Wind } from "../lib/icons";
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { MapPanel } from "../components/MapPanel";
import { DriftTimelineChart } from "../components/DriftTimelineChart";
import { Scrubber } from "../components/Scrubber";
import { StatusPill } from "../components/StatusPill";
import { investigation } from "../data/fixtures";
import { formatCoord, formatKm } from "../data/formatters";

export function DriftPage() {
  const [t, setT] = useState(0);
  const currentPoint = investigation.driftSeries.find((d) => d.t === t) ?? investigation.driftSeries[4];
  const top = investigation.vessels[0];

  return (
    <div className="page">
      <PageHeader
        eyebrow={<>DRIFT MODEL · HYCOM + ERA5</>}
        title={<>Drift Simulation</>}
        sub="Hindcast and forecast particle distribution from the predicted origin"
        actions={<StatusPill tone="info">Model running</StatusPill>}
      />

      <section className="grid grid--kpi">
        <KpiCard label="Origin zone" value="A" icon={<Radio weight="duotone" />} hint={<>42% probability</>} />
        <KpiCard label="Particles tracked" value="9,912" icon={<Pulse weight="duotone" />} hint={<>2-day window</>} />
        <KpiCard label="Wind forcing" value="ERA5" icon={<Wind weight="duotone" />} hint={"0.25° resolution"} />
        <KpiCard label="Current model" value="HYCOM" icon={<ChartLine weight="duotone" />} hint={<>1/12° · GLBa0.08</>} />
      </section>

      <Panel
        title="Particle distribution over time"
        icon={<ChartLine weight="duotone" />}
        meta={<>9,912 particles · 0.5 km grid</>}
        tier="data"
      >
        <DriftTimelineChart />
        <div style={{ marginTop: 12 }}>
          <Scrubber
            min={-12}
            max={24}
            step={3}
            value={t}
            onChange={setT}
            formatLabel={(v) => (v === 0 ? "Detection (t = 0)" : v > 0 ? `Forecast · +${v}h` : `Hindcast · ${v}h`)}
            formatValue={(v) => (v === 0 ? "NOW" : v > 0 ? `+${v}h` : `${v}h`)}
          />
        </div>
      </Panel>

      <div className="grid grid--main-side">
        <Panel
          title="Drift map at t = 0"
          icon={<MapTrifold weight="duotone" />}
          meta={<>Particle cloud</>}
          flush
        >
          <MapPanel height={420} showStatus={false} />
        </Panel>

        <Panel
          title="Frame statistics"
          icon={<Pulse weight="duotone" />}
          tier="data"
        >
          <dl className="stack" style={{ margin: 0 }}>
            <Row label="Frame" value={t === 0 ? "t = 0 (detection)" : t > 0 ? `+${t}h` : `${t}h`} />
            <Row label="Active particles" value={currentPoint.particles.toLocaleString()} />
            <Row label="Mean drift distance" value={formatKm(currentPoint.meanDistanceKm)} />
            <Row label="Top suspect distance" value={formatKm(top.distanceKm)} />
            <Row label="Suspect bearing" value={`${top.bearingDeg.toFixed(0)}°`} />
            <Row label="Origin centroid" value={formatCoord(investigation.incident.origin.lng, investigation.incident.origin.lat)} />
          </dl>
        </Panel>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="row row--between">
      <dt className="text-muted text-sm">{label}</dt>
      <dd className="text-mono" style={{ margin: 0, color: "var(--text-primary)" }}>{value}</dd>
    </div>
  );
}
