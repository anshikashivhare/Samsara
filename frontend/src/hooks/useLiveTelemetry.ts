import { useEffect, useRef, useState } from "react";

export interface LiveVessel {
  mmsi: number;
  name: string;
  flag: string;
  type: string;
  lat: number;
  lon: number;
  speed_knots: number;
  heading: number;
  risk: "HIGH" | "MEDIUM" | "LOW";
  score: number;
  is_dark_vessel?: boolean;
}

export interface LiveTelemetry {
  event_type: string;
  timestamp: string;
  active_vessels_count: number;
  dark_vessels_count: number;
  spill_drift_rate_knots: number;
  ocean_current_speed_ms: number;
  wind_speed_knots: number;
  vessels: LiveVessel[];
  /** true once at least one SSE/WS message was received */
  connected: boolean;
}

const INITIAL: LiveTelemetry = {
  event_type: "INITIAL",
  timestamp: new Date().toISOString(),
  active_vessels_count: 0,
  dark_vessels_count: 0,
  spill_drift_rate_knots: 0,
  ocean_current_speed_ms: 0,
  wind_speed_knots: 0,
  vessels: [],
  connected: false,
};

const API_BASE =
  (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8000/api/v1";

/**
 * Primary: Server-Sent Events  /api/v1/ais/stream
 * Fallback: WebSocket          ws://…/api/v1/ais/ws  (used if SSE fails twice)
 *
 * The hook exposes a `connected` flag the UI can use to show a live badge.
 */
export function useLiveTelemetry(): LiveTelemetry {
  const [data, setData] = useState<LiveTelemetry>(INITIAL);
  const sseRef = useRef<EventSource | null>(null);
  const wsRef  = useRef<WebSocket   | null>(null);
  const sseFails = useRef(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;

    function applyTick(raw: string) {
      try {
        const parsed = JSON.parse(raw) as Omit<LiveTelemetry, "connected">;
        if (alive.current) setData({ ...parsed, connected: true });
      } catch {/* ignore malformed frames */}
    }

    /* ── WebSocket fallback ──────────────────────────────────────── */
    function openWS() {
      if (!alive.current) return;
      const wsUrl = API_BASE.replace(/^http/, "ws") + "/ais/ws";
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onmessage = (e) => applyTick(e.data);
      ws.onerror   = () => {
        ws.close();
        if (alive.current) setTimeout(openWS, 4000);
      };
      ws.onclose   = () => {
        if (alive.current) setTimeout(openWS, 4000);
      };
    }

    /* ── SSE primary ─────────────────────────────────────────────── */
    function openSSE() {
      if (!alive.current) return;
      const es = new EventSource(API_BASE + "/ais/stream");
      sseRef.current = es;

      es.onopen    = () => { sseFails.current = 0; };
      es.onmessage = (e) => applyTick(e.data);
      es.onerror   = () => {
        es.close();
        sseFails.current += 1;
        if (!alive.current) return;
        if (sseFails.current >= 2) {
          // SSE not working — switch permanently to WS
          openWS();
        } else {
          setTimeout(openSSE, 2500);
        }
      };
    }

    openSSE();

    return () => {
      alive.current = false;
      sseRef.current?.close();
      wsRef.current?.close();
    };
  }, []);

  return data;
}

