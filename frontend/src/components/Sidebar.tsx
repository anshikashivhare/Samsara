import { NavLink } from "react-router-dom";
import { Anchor, Crosshair, Database, MapTrifold, Pulse, Radio, Target } from "../lib/icons";

const navItems = [
  { to: "/overview",    label: "Overview",         icon: Pulse },
  { to: "/spill",       label: "Spill Analysis",   icon: Crosshair },
  { to: "/vessels",     label: "Vessels",          icon: Anchor },
  { to: "/drift",       label: "Drift Simulation", icon: Radio },
  { to: "/evidence",    label: "Evidence",         icon: Database },
  { to: "/probability", label: "Probability",      icon: Target },
];

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar__brand">
        <span className="sidebar__brand-name">SAMSARA</span>
        <span className="sidebar__brand-sub">Maritime Intelligence</span>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="sidebar__link"
              end={item.to === "/overview"}
            >
              <Icon weight="regular" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <div className="row row--between" style={{ alignItems: "center" }}>
          <MapTrifold size={14} weight="duotone" aria-hidden="true" />
          <span>INC-2026-0142</span>
        </div>
        <div className="sidebar__meta">
          <span>v0.1.0</span>
          <span>SAR · AIS · HYCOM</span>
        </div>
      </div>
    </aside>
  );
}
