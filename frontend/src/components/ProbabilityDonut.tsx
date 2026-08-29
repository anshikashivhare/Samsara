import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface ProbabilitySlice {
  mmsi: string;
  name: string;
  probability: number;
}

interface ProbabilityDonutProps {
  rows: ProbabilitySlice[];
  selectedMmsi?: string | null;
}

const PALETTE = ["#5fb5c3", "#3f8a96", "#194048", "#4f6a70", "#0d1a1f"];

export function ProbabilityDonut({ rows, selectedMmsi }: ProbabilityDonutProps) {
  const total = rows.reduce((s, r) => s + r.probability, 0);
  return (
    <div style={{ position: "relative" }}>
      <div style={{ width: "100%", height: 240 }} aria-label="Probability distribution donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="probability"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {rows.map((r, i) => (
                <Cell
                  key={r.mmsi}
                  fill={PALETTE[i % PALETTE.length]}
                  fillOpacity={selectedMmsi && selectedMmsi !== r.mmsi ? 0.35 : 1}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "rgba(7,21,26,0.95)",
                border: "1px solid rgba(95,181,195,0.30)",
                borderRadius: 8,
                fontFamily: "Fira Code, monospace",
                fontSize: 12,
                color: "#e8f0f2",
              }}
              formatter={(value, _name, item) => {
                const slice = item?.payload as ProbabilitySlice | undefined;
                const pct = typeof value === "number" ? (value * 100).toFixed(1) + "%" : String(value);
                return [pct, slice?.name ?? "Candidate"];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center" aria-hidden="true">
          <span className="donut-center__value">{(total * 100).toFixed(0)}%</span>
          <span className="donut-center__label">All candidates</span>
        </div>
      </div>
      <ul className="donut-legend" aria-label="Probability legend">
        {rows.map((r, i) => (
          <li key={r.mmsi} className="row row--between" style={{ alignItems: "center" }}>
            <span style={{ color: "var(--text-secondary)" }}>
              <span
                className="donut-legend__swatch"
                style={{ background: PALETTE[i % PALETTE.length] }}
                aria-hidden="true"
              />
              {r.name}
            </span>
            <span className="donut-legend__pct">{(r.probability * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
