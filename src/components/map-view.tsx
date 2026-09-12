import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Layer, TileLayer } from "leaflet";
import {
  GAODE_SAT,
  GAODE_VEC,
  OSM_TILE,
  gcj02ToWgs84,
  inGcjBounds,
  wgs84ToGcj02,
} from "@/lib/analysis/china-geo";
import { useApp } from "@/lib/store";
import type { FlowPath, ProbeResult } from "@/lib/analysis/types";
import type { TowerPoint } from "@/lib/analysis/import-coords";
import { cn } from "@/lib/utils";

const FLOW_COLOR: Record<FlowPath["tone"], string> = {
  inflow: "#6ec4e8",
  lateral: "#8eb4d4",
  bypass: "#7ecb9a",
  outlet: "#e0a36a",
};

type BaseId = "gaode-sat" | "gaode-vec" | "osm";

function displayOf(lat: number, lng: number, useGcj: boolean) {
  if (!useGcj || !inGcjBounds(lat, lng)) return { lat, lng };
  return wgs84ToGcj02(lat, lng);
}

function heatDataUrl(probe: ProbeResult) {
  const { n, z } = probe.grid;
  const canvas = document.createElement("canvas");
  canvas.width = n;
  canvas.height = n;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  let min = Infinity;
  let max = -Infinity;
  for (const row of z) {
    for (const v of row) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  const span = max - min || 1;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const t = (z[r]![c]! - min) / span;
      const h = 168 - t * 70;
      const s = 32 + t * 18;
      const l = 28 + t * 28;
      ctx.fillStyle = `hsl(${h} ${s}% ${l} / 0.22)`;
      ctx.fillRect(c, r, 1, 1);
    }
  }
  return canvas.toDataURL();
}

export function MapView() {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layersRef = useRef<Layer[]>([]);
  const baseRef = useRef<TileLayer[]>([]);
  const Lref = useRef<typeof import("leaflet") | null>(null);
  const useGcjRef = useRef(true);
  const corridorKeyRef = useRef("");
  const [base, setBase] = useState<BaseId>("gaode-sat");
  const pin = useApp((s) => s.pin);
  const probe = useApp((s) => s.probe);
  const pick = useApp((s) => s.pick);
  const mapPick = useApp((s) => s.mapPick);
  const stage = useApp((s) => s.stage);
  const corridor = useApp((s) => s.corridor);
  const corridorIndex = useApp((s) => s.corridorIndex);
  const interactive = mapPick || Boolean(probe) || corridor.length > 0 || stage === "probing" || stage === "composing";

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return;

    void (async () => {
      const L = await import("leaflet");
      if (cancelled || !hostRef.current) return;
      Lref.current = L;
      const origin = wgs84ToGcj02(26.4, 118.2);
      const map = L.map(host, {
        zoomControl: false,
        attributionControl: true,
        minZoom: 3,
        maxZoom: 18,
        worldCopyJump: true,
        keyboard: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
      }).setView([origin.lat, origin.lng], 7);
      map.getContainer().tabIndex = -1;
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);
      map.on("click", (e) => {
        const state = useApp.getState();
        if (state.corridor.length) return;
        if (!state.mapPick && !state.probe) return;
        if (useGcjRef.current && inGcjBounds(e.latlng.lat, e.latlng.lng)) {
          const wgs = gcj02ToWgs84(e.latlng.lat, e.latlng.lng);
          pick(wgs.lat, wgs.lng);
        } else {
          pick(e.latlng.lat, e.latlng.lng);
        }
      });
      mapRef.current = map;
      applyBase(L, map, "gaode-sat", baseRef, useGcjRef, () => {
        const current = useApp.getState();
        if (current.pin) redraw(L, map, current.pin, current.probe, current.corridor, current.corridorIndex, layersRef, useGcjRef.current);
      });
      const current = useApp.getState();
      if (current.pin) {
        const d = displayOf(current.pin.lat, current.pin.lng, true);
        map.setView([d.lat, d.lng], 16, { animate: false });
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [pick]);

  useEffect(() => {
    const map = mapRef.current;
    const L = Lref.current;
    if (!map || !L) return;
    applyBase(L, map, base, baseRef, useGcjRef, () => {
      const current = useApp.getState();
      if (current.pin) redraw(L, map, current.pin, current.probe, current.corridor, current.corridorIndex, layersRef, useGcjRef.current);
    });
    const current = useApp.getState();
    if (current.pin) redraw(L, map, current.pin, current.probe, current.corridor, current.corridorIndex, layersRef, useGcjRef.current);
  }, [base]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const on = interactive;
    if (on) {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.touchZoom.enable();
      map.boxZoom.enable();
    } else {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
      map.touchZoom.disable();
      map.boxZoom.disable();
    }
    map.getContainer().tabIndex = -1;
  }, [interactive]);

  useEffect(() => {
    const map = mapRef.current;
    const L = Lref.current;
    if (!map || !L || !pin) return;
    map.invalidateSize();
    const d = displayOf(pin.lat, pin.lng, useGcjRef.current);
    redraw(L, map, pin, probe, corridor, corridorIndex, layersRef, useGcjRef.current);
    if (probe) return;
    const key = corridor.map((t) => `${t.lat},${t.lng}`).join("|");
    if (corridor.length > 1 && key !== corridorKeyRef.current) {
      corridorKeyRef.current = key;
      const bounds = corridor.map((t) => {
        const p = displayOf(t.lat, t.lng, useGcjRef.current);
        return [p.lat, p.lng] as [number, number];
      });
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true });
      return;
    }
    if (mapPick || stage === "probing" || stage === "composing" || corridor.length) {
      map.flyTo([d.lat, d.lng], Math.max(map.getZoom(), 15), { duration: 0.45 });
    }
  }, [pin, probe, mapPick, stage, corridor, corridorIndex]);

  return (
    <div className={cn("relative z-0 isolate h-full min-h-0 w-full", !interactive && "pointer-events-none")}>
      <div ref={hostRef} className="h-full w-full" />
      {interactive ? (
        <>
          <div className="pointer-events-none absolute top-3 right-3 z-20 hidden size-12 items-center justify-center rounded-full bg-bg/55 text-[10px] tracking-[0.18em] text-fg/80 ring-1 ring-fg/12 sm:flex">
            N
            <span className="absolute top-2 h-3 w-px bg-fg/70" />
          </div>
          <div className="absolute right-14 bottom-8 z-20 flex gap-1 rounded-full bg-bg/72 p-1 text-[11px] ring-1 ring-fg/10 backdrop-blur-sm">
            {(
              [
                ["gaode-sat", "卫星"],
                ["gaode-vec", "地图"],
                ["osm", "海外"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={cn(
                  "rounded-full px-2.5 py-1 text-muted transition-colors",
                  base === id ? "bg-fg/12 text-fg" : "hover:text-fg",
                )}
                onClick={() => setBase(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function applyBase(
  L: typeof import("leaflet"),
  map: LeafletMap,
  id: BaseId,
  baseRef: { current: TileLayer[] },
  useGcjRef: { current: boolean },
  onFallback: () => void,
) {
  for (const layer of baseRef.current) map.removeLayer(layer);
  baseRef.current = [];
  const add = (url: string, extra: Record<string, unknown> = {}) => {
    const layer = L.tileLayer(url, {
      maxZoom: 18,
      subdomains: "1234",
      ...extra,
    });
    layer.addTo(map);
    baseRef.current.push(layer);
    return layer;
  };

  if (id === "osm") {
    useGcjRef.current = false;
    add(OSM_TILE, {
      subdomains: "abc",
      attribution: "© OpenStreetMap",
    });
    return;
  }

  useGcjRef.current = true;
  if (id === "gaode-vec") {
    add(GAODE_VEC, { attribution: "高德地图" });
  } else {
    const sat = add(GAODE_SAT, { attribution: "高德卫星" });
    let flipped = false;
    let errors = 0;
    sat.on("tileerror", () => {
      errors += 1;
      if (flipped || errors < 6) return;
      flipped = true;
      for (const layer of baseRef.current) map.removeLayer(layer);
      baseRef.current = [];
      useGcjRef.current = false;
      const osm = L.tileLayer(OSM_TILE, {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      });
      osm.addTo(map);
      baseRef.current.push(osm);
      onFallback();
    });
  }
}

function redraw(
  L: typeof import("leaflet"),
  map: LeafletMap,
  pin: { lat: number; lng: number },
  probe: ProbeResult | null,
  corridor: TowerPoint[],
  corridorIndex: number,
  layersRef: { current: Layer[] },
  useGcj: boolean,
) {
  for (const layer of layersRef.current) {
    map.removeLayer(layer);
  }
  layersRef.current = [];
  const add = (layer: Layer) => {
    layer.addTo(map);
    layersRef.current.push(layer);
  };
  const ll = (lat: number, lng: number): [number, number] => {
    const d = displayOf(lat, lng, useGcj);
    return [d.lat, d.lng];
  };

  if (corridor.length > 1) {
    add(
      L.polyline(
        corridor.map((t) => ll(t.lat, t.lng)),
        { color: "#6fbfb2", weight: 3, opacity: 0.85 },
      ),
    );
  }
  for (let i = 0; i < corridor.length; i++) {
    const t = corridor[i]!;
    const on = i === corridorIndex;
    add(
      L.circleMarker(ll(t.lat, t.lng), {
        radius: on ? 7 : 5,
        color: on ? "#e7eeea" : "#6fbfb2",
        weight: on ? 2 : 1,
        fillColor: on ? "#6fbfb2" : "#0b100f",
        fillOpacity: on ? 1 : 0.85,
      })
        .bindTooltip(`${t.name} · ${t.lat.toFixed(5)}, ${t.lng.toFixed(5)}`, {
          direction: "top",
          opacity: 0.95,
        })
        .on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          useApp.getState().selectTower(i);
        }),
    );
  }

  const pinIcon = L.divIcon({
    className: "survey-pin",
    html: `<span class="survey-pin-ring"></span><span class="survey-pin-dot"></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
  add(L.marker(ll(pin.lat, pin.lng), { icon: pinIcon, interactive: false }));

  if (!probe) return;

  const sw = ll(probe.grid.lats[probe.grid.n - 1]!, probe.grid.lngs[0]!);
  const ne = ll(probe.grid.lats[0]!, probe.grid.lngs[probe.grid.n - 1]!);
  const url = heatDataUrl(probe);
  if (url) {
    add(L.imageOverlay(url, L.latLngBounds(sw, ne), { opacity: 1, interactive: false }));
  }

  const ring = probe.vertices.map((v) => ll(v.lat, v.lng));
  add(
    L.polygon(ring, {
      color: "#e7eeea",
      weight: 2,
      fillColor: "#6fbfb2",
      fillOpacity: 0.12,
      opacity: 0.95,
    }),
  );

  for (const v of probe.vertices) {
    add(
      L.circleMarker(ll(v.lat, v.lng), {
        radius: 4,
        color: "#0b100f",
        weight: 1,
        fillColor: "#e7eeea",
        fillOpacity: 1,
      }).bindTooltip(`${v.id} ${v.role} · ${Math.round(v.elevM)} m`, {
        direction: "top",
        opacity: 0.95,
      }),
    );
  }

  for (const path of probe.flowPaths) {
    if (path.points.length < 2) continue;
    add(
      L.polyline(
        path.points.map((p) => ll(p.lat, p.lng)),
        {
          color: FLOW_COLOR[path.tone],
          weight: path.tone === "outlet" ? 3 : 2.25,
          opacity: 0.92,
          dashArray: path.tone === "bypass" ? "6 7" : undefined,
        },
      ),
    );
  }

  for (const w of probe.waters.slice(0, 3)) {
    add(
      L.circleMarker(ll(w.lat, w.lng), {
        radius: 5,
        color: "#6ec4e8",
        fillColor: "#6ec4e8",
        fillOpacity: 0.8,
        weight: 1,
      }).bindTooltip(`${w.name} · ${Math.round(w.distM)} m`, { direction: "top" }),
    );
  }

  for (const b of (probe.birds?.sites ?? []).slice(0, 5)) {
    const icon = L.divIcon({
      className: "bird-mark",
      html: `<span class="bird-mark-dot"></span>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    add(
      L.marker(ll(b.lat, b.lng), { icon, interactive: true }).bindTooltip(
        `${b.name} · ${b.distKm} km · ${b.species}`,
        { direction: "top" },
      ),
    );
  }

  const dir = probe.wind?.directionDeg;
  if (dir != null) {
    const toDeg = (dir + 180) % 360;
    const icon = L.divIcon({
      className: "wind-barb",
      html: `<span class="wind-barb-arrow" style="transform:rotate(${toDeg}deg)"></span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    add(L.marker(ll(pin.lat, pin.lng), { icon, interactive: false }));
  }

  map.fitBounds(L.latLngBounds(sw, ne).pad(0.18), { animate: true, maxZoom: 18 });
}
