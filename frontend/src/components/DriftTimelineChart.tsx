import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { investigation } from "../data/fixtures";

export function DriftTimelineChart() {
  return (
    <div className="timeline">
      <div className="timeline__chart" aria-label="Particle distribution over time">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={investigation.driftSeries} margin={{ top: 10, right: 16, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="driftFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#5fb5c3" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#5fb5c3" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(95,181,195,0.10)" strokeDasharray="2 4" />
            <XAxis
              dataKey="t"
              tickFormatter={(v) => (v === 0 ? "NOW" : v > 0 ? `+${v}h` : `${v}h`)}
              stroke="#78939a"
              tick={{ fontFamily: "Fira Code, monospace", fontSize: 11 }}
              axisLine={{ stroke: "rgba(95,181,195,0.18)" }}
              tickLine={false}
            />
            <YAxis
              stroke="#78939a"
              tick={{ fontFamily: "Fira Code, monospace", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(7,21,26,0.95)",
                border: "1px solid rgba(95,181,195,0.30)",
                borderRadius: 8,
                fontFamily: "Fira Code, monospace",
                fontSize: 12,
                color: "#e8f0f2",
              }}
              labelFormatter={(v) => (v === 0 ? "Detection (t=0)" : (v as number) > 0 ? `+${v}h` : `${v}h`)}
              formatter={(value, name) => [(value as number).toLocaleString(), name === "particles" ? "Particles" : "Mean distance (km)"]}
            />
            <Area
              type="monotone"
              dataKey="particles"
              stroke="#5fb5c3"
              strokeWidth={2}
              fill="url(#driftFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
