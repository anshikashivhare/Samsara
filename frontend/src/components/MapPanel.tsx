import { useEffect, useRef } from "react";
import maplibregl, { type Map as MlMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapTrifold } from "../lib/icons";
import { investigation } from "../data/fixtures";
import type { Coordinate } from "../types/investigation";
import { useLiveTelemetry } from "../hooks/useLiveTelemetry";

const STYLE_URL = "https://demotiles.maplibre.org/style.json";

function bboxPolygon(bbox: [Coordinate, Coordinate]): GeoJSON.Feature<GeoJSON.Polygon> {
  const [a, b] = bbox;
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [[
        [a.lng, a.lat],
        [b.lng, a.lat],
        [b.lng, b.lat],
        [a.lng, b.lat],
        [a.lng, a.lat],
      ]],
    },
  };
}

function originZoneGeoJSON() {
  return {
    type: "FeatureCollection" as const,
    features: investigation.originZones.map((z) => ({
      type: "Feature" as const,
      properties: { id: z.id, probability: z.probability },
      geometry: {
        type: "Polygon" as const,
        coordinates: [Array.from({ length: 33 }, (_, i) => {
          const angle = (i / 32) * Math.PI * 2;
          return [
            z.centroid.lng + (z.radiusKm / 111) * Math.cos(angle) / Math.cos(z.centroid.lat * Math.PI / 180),
            z.centroid.lat + (z.radiusKm / 111) * Math.sin(angle),
          ];
        })],
      },
    })),
  };
}

function trackGeoJSON() {
  const top = investigation.vessels[0];
  const o = investigation.incident.origin;
  const c = investigation.incident.centroid;
  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: { kind: "origin-to-spill" },
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [o.lng, o.lat],
            [c.lng, c.lat],
          ],
        },
      },
      {
        type: "Feature" as const,
        properties: { kind: "vessel-track", mmsi: top.mmsi },
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [o.lng - 0.18, o.lat + 0.10],
            [o.lng - 0.08, o.lat + 0.04],
            [o.lng, o.lat],
          ],
        },
      },
    ],
  };
}

interface MapPanelProps {
  height?: number;
  showLegend?: boolean;
  showStatus?: boolean;
}

export function MapPanel({ height = 480, showLegend = true, showStatus = true }: MapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  // live marker instances keyed by mmsi
  const liveMarkersRef = useRef<Map<number, maplibregl.Marker>>(new Map());
  const live = useLiveTelemetry();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [investigation.incident.centroid.lng, investigation.incident.centroid.lat],
      zoom: 9.2,
      attributionControl: { compact: true },
      cooperativeGestures: false,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      map.addSource("spill", {
        type: "geojson",
        data: bboxPolygon(investigation.spill.bbox),
      });
      map.addLayer({
        id: "spill-fill",
        type: "fill",
        source: "spill",
        paint: {
          "fill-color": "#d98b61",
          "fill-opacity": 0.30,
        },
      });
      map.addLayer({
        id: "spill-outline",
        type: "line",
        source: "spill",
        paint: {
          "line-color": "#e7a079",
          "line-width": 1.5,
          "line-opacity": 0.85,
        },
      });

      map.addSource("origin-zones", { type: "geojson", data: originZoneGeoJSON() });
      map.addLayer({
        id: "origin-fill",
        type: "fill",
        source: "origin-zones",
        paint: {
          "fill-color": [
            "interpolate", ["linear"], ["get", "probability"],
            0,    "rgba(95,181,195,0.10)",
            0.20, "rgba(95,181,195,0.18)",
            0.40, "rgba(95,181,195,0.28)",
          ],
          "fill-outline-color": "#7dd7e2",
        },
      });
      map.addLayer({
        id: "origin-outline",
        type: "line",
        source: "origin-zones",
        paint: {
          "line-color": "#7dd7e2",
          "line-width": 1,
          "line-dasharray": [2, 2],
          "line-opacity": 0.7,
        },
      });

      map.addSource("tracks", { type: "geojson", data: trackGeoJSON() });
      map.addLayer({
        id: "track-line",
        type: "line",
        source: "tracks",
        paint: {
          "line-color": "#76b9c2",
          "line-width": 2,
          "line-opacity": 0.85,
        },
      });

      const top = investigation.vessels[0];
      const o = investigation.incident.origin;
      new maplibregl.Marker({ color: "#d98b61" })
        .setLngLat([investigation.incident.centroid.lng, investigation.incident.centroid.lat])
        .setPopup(new maplibregl.Popup({ closeButton: false, offset: 12 }).setHTML(
          `<div style="font-family:'Fira Code',monospace;font-size:11px;color:#e8f0f2"><strong>Spill centroid</strong><br/>${investigation.spill.areaKm2.toFixed(1)} km² · ${(investigation.spill.confidence*100).toFixed(1)}%</div>`
        ))
        .addTo(map);

      new maplibregl.Marker({ color: "#7dd7e2" })
        .setLngLat([o.lng, o.lat])
        .setPopup(new maplibregl.Popup({ closeButton: false, offset: 12 }).setHTML(
          `<div style="font-family:'Fira Code',monospace;font-size:11px;color:#e8f0f2"><strong>Predicted origin</strong><br/>${top.mmsi} · score ${top.score}</div>`
        ))
        .addTo(map);

      investigation.vessels.slice(0, 5).forEach((v) => {
        const lng = o.lng + (v.distanceKm / 80) * Math.cos((v.bearingDeg * Math.PI) / 180) / Math.cos(o.lat * Math.PI / 180);
        const lat = o.lat + (v.distanceKm / 80) * Math.sin((v.bearingDeg * Math.PI) / 180);
        new maplibregl.Marker({ color: v.score >= 75 ? "#e7a079" : v.score >= 50 ? "#d6b17a" : "#78939a" })
          .setLngLat([lng, lat])
          .setPopup(new maplibregl.Popup({ closeButton: false, offset: 10 }).setHTML(
            `<div style="font-family:'Fira Code',monospace;font-size:11px;color:#e8f0f2"><strong>${v.mmsi}</strong><br/>${v.name}<br/>score ${v.score} · ${v.anomaly}</div>`
          ))
          .addTo(map);
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  /* ── Live vessel markers (SSE / WebSocket) ─────────────────────
   * Runs every time `live.vessels` changes. Creates a marker on
   * first sight; on subsequent ticks just moves it — no flicker,
   * no layout change.
   * ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !live.connected || !live.vessels.length) return;

    live.vessels.forEach((v) => {
      const color = v.risk === "HIGH" ? "#e7a079"
                  : v.risk === "MEDIUM" ? "#d6b17a"
                  : "#78939a";
      const popupHtml = `
        <div style="font-family:'Fira Code',monospace;font-size:11px;color:#e8f0f2">
          <strong>${v.mmsi}</strong><br/>${v.name}<br/>
          score ${v.score} · ${v.risk.toLowerCase()}<br/>
          <span style="color:#aaa">${v.speed_knots.toFixed(1)} kn · ${v.heading}°</span>
          ${v.is_dark_vessel ? "<br/><span style='color:#ff3366'>⚠ dark vessel</span>" : ""}
        </div>`;

      const existing = liveMarkersRef.current.get(v.mmsi);
      if (existing) {
        // Smoothly move the existing marker to the new position
        existing.setLngLat([v.lon, v.lat]);
        existing.getPopup()?.setHTML(popupHtml);
      } else {
        // First time we see this MMSI — create a marker
        const marker = new maplibregl.Marker({ color })
          .setLngLat([v.lon, v.lat])
          .setPopup(
            new maplibregl.Popup({ closeButton: false, offset: 10 }).setHTML(popupHtml)
          )
          .addTo(map);
        liveMarkersRef.current.set(v.mmsi, marker);
      }
    });

    // Remove markers for vessels that disappeared from the feed
    liveMarkersRef.current.forEach((marker, mmsi) => {
      if (!live.vessels.find((v) => v.mmsi === mmsi)) {
        marker.remove();
        liveMarkersRef.current.delete(mmsi);
      }
    });
  }, [live.vessels, live.connected]);

  return (
    <div className="map-panel" style={{ height }} role="region" aria-label="Investigation map">
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {showLegend && (
        <div className="map-panel__legend" aria-label="Map legend">
          <div className="map-panel__legend-item">
            <span className="map-panel__legend-swatch map-panel__legend-swatch--spill" />
            <span>Spill polygon · SAR detection</span>
          </div>
          <div className="map-panel__legend-item">
            <span className="map-panel__legend-swatch map-panel__legend-swatch--origin" />
            <span>Predicted origin zone</span>
          </div>
          <div className="map-panel__legend-item">
            <span className="map-panel__legend-swatch map-panel__legend-swatch--track" />
            <span>Vessel track · origin → spill</span>
          </div>
        </div>
      )}
      {showStatus && (
        <div className="map-panel__status" aria-hidden="true">
          <span className="dot" style={{ background: live.connected ? "#00f5a0" : "var(--status-inactive)" }} />
          <span>{live.connected ? `LIVE · ${live.active_vessels_count} vessels` : "LIVE · WGS84"}</span>
          <MapTrifold size={12} weight="duotone" style={{ marginLeft: 6 }} />
        </div>
      )}
    </div>
  );
}
