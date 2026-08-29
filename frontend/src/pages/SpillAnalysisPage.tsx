import { Broadcast, Crosshair, Drop, Gauge, MapTrifold, Radio, Target } from "../lib/icons";
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { StatusPill } from "../components/StatusPill";
import { MapPanel } from "../components/MapPanel";
import { investigation } from "../data/fixtures";
import { formatCoord, formatDate, formatKm, formatPercent } from "../data/formatters";

export function SpillAnalysisPage() {
  const inc = investigation.incident;
  const spill = investigation.spill;
  const o = investigation.originZones[0];

  return (
    <div className="page">
      <PageHeader
        eyebrow={<>INCIDENT · {inc.id}</>}
        title={<>Spill Analysis</>}
        sub="SAR segmentation, polygon geometry, predicted origin, and confidence envelopes"
        actions={<StatusPill tone="warning">High severity</StatusPill>}
      />

      <section className="grid grid--kpi" aria-label="Spill metrics">
        <KpiCard label="Spill area" value={`${spill.areaKm2.toFixed(1)} km²`} icon={<Drop weight="duotone" />} />
        <KpiCard label="Confidence" value={formatPercent(spill.confidence)} icon={<Gauge weight="duotone" />} />
        <KpiCard label="Satellite" value="Sentinel-1"           icon={<Broadcast weight="duotone" />} hint={<>SAR · IW GRDH</>} />
        <KpiCard label="Origin probability" value={formatPercent(o.probability)} icon={<Target weight="duotone" />} hint={<>Zone A</>} />
      </section>

      <Panel
        title="Geospatial view"
        icon={<MapTrifold weight="duotone" />}
        meta={<>WGS84 · zoom 9</>}
        flush
      >
        <MapPanel height={520} />
      </Panel>

      <div className="grid grid--main-side">
        <Panel
          title="Spill polygon"
          icon={<Drop weight="duotone" />}
          meta={<>U-Net segmentation</>}
          tier="data"
        >
          <dl className="stack" style={{ margin: 0 }}>
            <Row label="Centroid" value={formatCoord(spill.centroid.lng, spill.centroid.lat)} />
            <Row label="Bbox SW"  value={formatCoord(spill.bbox[0].lng, spill.bbox[0].lat)} />
            <Row label="Bbox NE"  value={formatCoord(spill.bbox[1].lng, spill.bbox[1].lat)} />
            <Row label="Area"     value={formatKm(spill.areaKm2)} />
            <Row label="Confidence" value={formatPercent(spill.confidence)} />
            <Row label="Detected" value={formatDate(spill.detectedAt)} />
            <Row label="Satellite" value={spill.satellite} />
          </dl>
        </Panel>

        <Panel
          title="Predicted origin"
          icon={<Crosshair weight="duotone" />}
          meta={<>{investigation.originZones.length} zones</>}
          tier="data"
        >
          <ol className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {investigation.originZones.map((z, i) => (
              <li key={z.id} className="row row--between" style={{ padding: "10px 0", borderBottom: i < investigation.originZones.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <div>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="text-mono" style={{ color: "var(--teal-300)" }}>{z.id.toUpperCase()}</span>
                    <span className="text-muted text-sm">{z.particleCount.toLocaleString()} particles</span>
                  </div>
                  <div className="text-mono text-sm text-muted" style={{ marginTop: 4 }}>
                    {formatCoord(z.centroid.lng, z.centroid.lat)} · r {z.radiusKm.toFixed(1)} km
                  </div>
                </div>
                <div className="text-mono" style={{ fontSize: 18, color: "var(--text-primary)" }}>
                  {(z.probability * 100).toFixed(0)}%
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel
        title="Confidence envelope"
        icon={<Radio weight="duotone" />}
        meta={"5 evidence components"}
        tier="evidence"
      >
        <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {investigation.evidence.map((e) => (
            <li key={e.key} className="evidence-row" style={{ gridTemplateColumns: "1fr 2fr 60px 80px" }}>
              <div className="evidence-row__label">{e.label}</div>
              <div className="evidence-row__bar">
                <div className="evidence-row__bar-fill" style={{ width: `${e.value}%` }} />
              </div>
              <div className="evidence-row__weight">{(e.weight * 100).toFixed(0)}% wt</div>
              <div className="evidence-row__contrib">{e.contribution.toFixed(1)}</div>
            </li>
          ))}
        </ul>
      </Panel>
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
