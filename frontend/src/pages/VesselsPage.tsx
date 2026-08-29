import { useMemo, useState } from "react";
import { Anchor, MagnifyingGlass, Warning } from "../lib/icons";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { AnomalyBadge } from "../components/AnomalyBadge";
import { ScoreBar } from "../components/ScoreBar";
import { Drawer } from "../components/Drawer";
import { investigation } from "../data/fixtures";
import { formatBearing, formatDate, formatKm, formatSpeedKn } from "../data/formatters";
import type { Vessel } from "../types/investigation";

type SortKey = "score" | "distance" | "mmsi" | "anomaly";

export function VesselsPage() {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [selected, setSelected] = useState<Vessel | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? investigation.vessels.filter(
          (v) =>
            v.mmsi.includes(q) ||
            v.name.toLowerCase().includes(q) ||
            v.flag.toLowerCase().includes(q) ||
            v.type.toLowerCase().includes(q)
        )
      : investigation.vessels;
    return [...filtered].sort((a, b) => {
      if (sortKey === "score") return b.score - a.score;
      if (sortKey === "distance") return a.distanceKm - b.distanceKm;
      if (sortKey === "mmsi") return a.mmsi.localeCompare(b.mmsi);
      const order = { high: 0, medium: 1, low: 2, none: 3 } as const;
      return order[a.anomaly] - order[b.anomaly];
    });
  }, [query, sortKey]);

  return (
    <div className="page">
      <PageHeader
        eyebrow={<>CANDIDATE FLEET · {investigation.vessels.length} vessels</>}
        title={<>Vessel Ranking</>}
        sub="AI-assisted attribution across spatial, temporal, trajectory, behaviour and drift evidence"
        actions={
          <div className="row" style={{ gap: 8 }}>
            <div className="row" style={{
              background: "var(--panel-data)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "6px 12px",
              gap: 8,
            }}>
              <MagnifyingGlass size={16} weight="regular" aria-hidden="true" style={{ color: "var(--text-muted)" }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="MMSI · name · flag · type"
                aria-label="Filter vessels"
                style={{
                  background: "transparent",
                  border: 0,
                  outline: 0,
                  color: "var(--text-primary)",
                  minWidth: 220,
                  fontSize: "var(--fs-body)",
                }}
              />
            </div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              aria-label="Sort by"
              style={{
                background: "var(--panel-data)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                padding: "8px 12px",
                fontSize: "var(--fs-body)",
              }}
            >
              <option value="score">Sort: Score</option>
              <option value="distance">Sort: Distance</option>
              <option value="mmsi">Sort: MMSI</option>
              <option value="anomaly">Sort: Anomaly</option>
            </select>
          </div>
        }
      />

      <Panel
        title={<>Ranked candidates</>}
        icon={<Anchor weight="duotone" />}
        meta={<>{rows.length} of {investigation.vessels.length} shown</>}
        tier="data"
        flush
      >
        <table className="table" aria-label="Vessel ranking table">
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">MMSI</th>
              <th scope="col">Vessel</th>
              <th scope="col">Anomaly</th>
              <th scope="col">Distance</th>
              <th scope="col">Bearing</th>
              <th scope="col">Speed</th>
              <th scope="col">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v, i) => (
              <tr
                key={v.mmsi}
                tabIndex={0}
                onClick={() => setSelected(v)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(v); } }}
                aria-selected={selected?.mmsi === v.mmsi}
                aria-label={`${v.mmsi} ${v.name} score ${v.score}`}
              >
                <td className="cell-num">{String(i + 1).padStart(2, "0")}</td>
                <td className="cell-mono">{v.mmsi}</td>
                <td>
                  <div>{v.name}</div>
                  <div className="text-muted text-xs">{v.flag} · {v.type}</div>
                </td>
                <td><AnomalyBadge level={v.anomaly} /></td>
                <td className="cell-mono">{formatKm(v.distanceKm)}</td>
                <td className="cell-mono">{formatBearing(v.bearingDeg)}</td>
                <td className="cell-mono">{formatSpeedKn(v.speedKn)}</td>
                <td>
                  <div style={{ minWidth: 160 }}>
                    <ScoreBar value={v.score} />
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="state">
                    <MagnifyingGlass size={28} weight="duotone" aria-hidden="true" />
                    <p>No vessels match the current filter.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Panel>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        sub={selected ? `MMSI ${selected.mmsi} · ${selected.flag} · ${selected.type}` : undefined}
      >
        {selected && (
          <>
            <section>
              <div className="text-eyebrow text-muted">Composite score</div>
              <div className="row" style={{ marginTop: 8 }}>
                <ScoreBar value={selected.score} />
              </div>
            </section>
            <section className="stack">
              <div className="text-eyebrow text-muted">Anomaly</div>
              <AnomalyBadge level={selected.anomaly} />
              {selected.behaviourFlags.length === 0 ? (
                <p className="text-muted text-sm">No behavioural flags raised by DBSCAN.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 16, color: "var(--text-secondary)" }}>
                  {selected.behaviourFlags.map((f) => (
                    <li key={f} className="row" style={{ gap: 8 }}>
                      <Warning size={14} weight="duotone" aria-hidden="true" style={{ color: "var(--status-warning)" }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="stack">
              <div className="text-eyebrow text-muted">Position</div>
              <Row label="Distance from origin" value={formatKm(selected.distanceKm)} />
              <Row label="Bearing" value={formatBearing(selected.bearingDeg)} />
              <Row label="Speed" value={formatSpeedKn(selected.speedKn)} />
              <Row label="Course" value={`${selected.courseDeg.toFixed(0)}°`} />
              <Row label="Last seen" value={formatDate(selected.lastSeen)} />
            </section>
            <section className="stack">
              <div className="text-eyebrow text-muted">Sub-scores</div>
              {investigation.evidence.map((e) => (
                <SubScore key={e.key} label={e.label} value={selected[e.key + "Score" as keyof Vessel] as number} />
              ))}
            </section>
          </>
        )}
      </Drawer>
    </div>
  );
}

function SubScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="row" style={{ alignItems: "center", gap: 12 }}>
      <span style={{ minWidth: 160, color: "var(--text-secondary)" }}>{label}</span>
      <div style={{ flex: 1 }}><ScoreBar value={value} showValue={false} size="sm" /></div>
      <span className="text-mono" style={{ minWidth: 32, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="row row--between">
      <span className="text-muted text-sm">{label}</span>
      <span className="text-mono" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}
