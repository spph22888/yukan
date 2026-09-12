import { finite, round } from "@/lib/utils";
import type { LatLng } from "./types";

export const EARTH_M = 6371000;

export function toRad(d: number) {
  return (d * Math.PI) / 180;
}

export function toDeg(r: number) {
  return (r * 180) / Math.PI;
}

export function haversine(a: LatLng, b: LatLng) {
  const dφ = toRad(b.lat - a.lat);
  const dλ = toRad(b.lng - a.lng);
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const h =
    Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * EARTH_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function destination(start: LatLng, bearingDeg: number, distM: number): LatLng {
  const δ = distM / EARTH_M;
  const θ = toRad(bearingDeg);
  const φ1 = toRad(start.lat);
  const λ1 = toRad(start.lng);
  const sinφ2 =
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ);
  const φ2 = Math.asin(sinφ2);
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * sinφ2,
    );
  return { lat: toDeg(φ2), lng: ((toDeg(λ2) + 540) % 360) - 180 };
}

export function metersToLat(m: number) {
  return m / 111320;
}

export function metersToLng(m: number, lat: number) {
  return m / (111320 * Math.max(0.12, Math.cos(toRad(lat))));
}

export function bboxAround(
  lat: number,
  lng: number,
  radiusM: number,
): [number, number, number, number] {
  const dLat = metersToLat(radiusM);
  const dLng = metersToLng(radiusM, lat);
  return [lng - dLng, lat - dLat, lng + dLng, lat + dLat];
}

export function imageryUrl(
  bbox: [number, number, number, number],
  w = 960,
  h = 540,
) {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const q = new URLSearchParams({
    bbox: `${minLng},${minLat},${maxLng},${maxLat}`,
    bboxSR: "4326",
    imageSR: "4326",
    size: `${w},${h}`,
    format: "jpg",
    f: "image",
  });
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?${q}`;
}

const DIRS8 = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"] as const;

export function aspectLabel(deg: number) {
  const n = ((finite(deg) % 360) + 360) % 360;
  return DIRS8[Math.round(n / 45) % 8];
}

export function formatDist(m: number) {
  if (m < 1000) return `${Math.round(m)} 米`;
  return `${round(m / 1000, 2)} 公里`;
}

export function formatElev(m: number) {
  return `${round(m, 0)} 米`;
}

export function parseCoordinate(raw: string): LatLng | null {
  const s = raw.trim().replace(/[，]/g, ",").replace(/\s+/g, " ");
  const nums = s.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  if (nums.length < 2) return null;
  let a = nums[0]!;
  let b = nums[1]!;
  const hasN = /[nN北]/.test(s);
  const hasS = /[sS南]/.test(s);
  const hasE = /[eE东]/.test(s);
  const hasW = /[wW西]/.test(s);
  if (hasS) a = -Math.abs(a);
  if (hasW) {
    if (Math.abs(b) <= 90 && Math.abs(a) > 90) b = -Math.abs(a);
    else b = -Math.abs(b);
  }
  if (hasN && Math.abs(b) <= 90 && Math.abs(a) > 90) {
    const lat = b;
    const lng = a;
    a = lat;
    b = lng;
  }
  if (hasE && Math.abs(a) <= 90) {
    /* lat,lng already */
  }
  let lat = a;
  let lng = b;
  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
    const t = lat;
    lat = lng;
    lng = t;
  }
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat: round(lat, 7), lng: round(lng, 7) };
}

export function serialFor(lat: number, lng: number, d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const la = Math.abs(lat).toFixed(3).replace(".", "");
  const ln = Math.abs(lng).toFixed(3).replace(".", "");
  return `RS-${y}${m}${day}-${la}-${ln}`;
}

export function polygonAreaM2(verts: LatLng[]) {
  if (verts.length < 3) return 0;
  const lat0 = verts[0]!.lat;
  const mPerDegLat = 111320;
  const mPerDegLng = 111320 * Math.cos(toRad(lat0));
  let sum = 0;
  for (let i = 0; i < verts.length; i++) {
    const j = (i + 1) % verts.length;
    const xi = verts[i]!.lng * mPerDegLng;
    const yi = verts[i]!.lat * mPerDegLat;
    const xj = verts[j]!.lng * mPerDegLng;
    const yj = verts[j]!.lat * mPerDegLat;
    sum += xi * yj - xj * yi;
  }
  return Math.abs(sum) / 2;
}

export function autoVertices(center: LatLng, extentM: number): Omit<import("./types").Vertex, "elevM">[] {
  const r = extentM / 2;
  const specs: { id: string; bearing: number; scale: number; role: string }[] = [
    { id: "P1", bearing: 42, scale: 1.02, role: "东北角" },
    { id: "P2", bearing: 318, scale: 1.08, role: "西北角" },
    { id: "P3", bearing: 228, scale: 1.04, role: "西南角" },
    { id: "P4", bearing: 138, scale: 1.0, role: "东南角" },
    { id: "P5", bearing: 88, scale: 0.86, role: "东墙中段" },
  ];
  return specs.map((s) => {
    const p = destination(center, s.bearing, r * s.scale);
    return { id: s.id, lat: p.lat, lng: p.lng, role: s.role };
  });
}
