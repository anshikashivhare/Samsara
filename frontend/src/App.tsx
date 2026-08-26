import { useState } from "react";

const vessels = [
  { mmsi: "419001234", score: 92, anomaly: "High", distance: "14.2 km" },
  { mmsi: "419005678", score: 78, anomaly: "Medium", distance: "27.8 km" },
  { mmsi: "419009876", score: 64, anomaly: "Medium", distance: "41.5 km" },
];

export default function App() {
  const [active, setActive] = useState("Overview");

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">SAMSARA</div>
        <div className="subtitle">Maritime Intelligence</div>
        <nav>
          {["Overview", "Spill Analysis", "Vessels", "Drift Simulation", "Evidence"].map((item) => (
            <button className={active === item ? "nav active" : "nav"} onClick={() => setActive(item)} key={item}>
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <section className="content">
        <header>
          <div>
            <p className="eyebrow">INVESTIGATION / 001</p>
            <h1>Oil Spill Investigation</h1>
            <p className="muted">Satellite detection · AIS correlation · Ocean drift modelling</p>
          </div>
          <span className="status">● ACTIVE</span>
        </header>

        <section className="map-card">
          <div className="map-placeholder">
            <div className="grid-lines" />
            <div className="spill-zone">SPILL DETECTION</div>
            <div className="origin-zone">PREDICTED ORIGIN</div>
            <div className="track track-one" />
            <div className="track track-two" />
          </div>
        </section>

        <div className="stats">
          <article><span>Spill area</span><strong>18.7 km²</strong></article>
          <article><span>Detection confidence</span><strong>94.2%</strong></article>
          <article><span>Candidate vessels</span><strong>17</strong></article>
          <article><span>Top suspect</span><strong>92 / 100</strong></article>
        </div>

        <section className="panel">
          <div className="panel-title"><h2>Vessel Ranking</h2><span>AI-assisted score</span></div>
          {vessels.map((vessel) => (
            <div className="vessel" key={vessel.mmsi}>
              <div><strong>{vessel.mmsi}</strong><small>{vessel.distance} from predicted origin</small></div>
              <span className="anomaly">{vessel.anomaly}</span>
              <strong className="score">{vessel.score}</strong>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}
