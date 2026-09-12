import { haversine } from "@/lib/analysis/geo";
import { isBirdish, isWaterish, kindFromTags } from "./birds";
import { finite, round } from "@/lib/utils";
import type { BirdSite, LatLng, Place, WaterFeature } from "./types";

const UA = "Yukan/1.0 (site reconnaissance; rain-sight hydrology)";

export async function fetchJson<T>(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  const { timeoutMs = 10000, headers, ...rest } = init;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...rest,
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "application/json", ...headers },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

async function fetchFirstJson<T>(
  urls: string[],
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  let last: unknown;
  for (const url of urls) {
    try {
      return await fetchJson<T>(url, init);
    } catch (err) {
      last = err;
    }
  }
  throw last instanceof Error ? last : new Error("all endpoints failed");
}

export async function reverseGeocode(lat: number, lng: number): Promise<Place> {
  type Nom = {
    display_name?: string;
    address?: Record<string, string>;
  };
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1&accept-language=zh-CN,zh,en`;
  try {
    const json = await fetchJson<Nom>(url, { timeoutMs: 8000 });
    const a = json.address ?? {};
    return {
      displayName: json.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      road: a.road ?? a.pedestrian ?? a.footway ?? null,
      suburb: a.suburb ?? a.neighbourhood ?? a.quarter ?? a.village ?? null,
      city: a.city ?? a.town ?? a.county ?? null,
      district: a.district ?? a.city_district ?? a.county ?? null,
      state: a.state ?? a.province ?? null,
      country: a.country ?? null,
      countryCode: a.country_code ?? null,
    };
  } catch {
    return {
      displayName: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      road: null,
      suburb: null,
      city: null,
      district: null,
      state: null,
      country: null,
      countryCode: null,
    };
  }
}

export async function searchNominatim(q: string) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1&accept-language=zh-CN,zh,en`;
  try {
    const json = await fetchJson<
      { lat: string; lon: string; display_name: string; type?: string; class?: string }[]
    >(url, { timeoutMs: 8000 });
    if (json.length) {
      return json.map((r) => ({
        lat: Number(r.lat),
        lng: Number(r.lon),
        label: r.display_name,
        kind: r.type ?? r.class ?? "place",
      }));
    }
  } catch {
    /* fallback */
  }
  const om = await fetchJson<{
    results?: {
      name: string;
      latitude: number;
      longitude: number;
      admin1?: string;
      country?: string;
    }[];
  }>(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=zh&format=json`,
    { timeoutMs: 7000 },
  );
  return (om.results ?? []).map((r) => ({
    lat: r.latitude,
    lng: r.longitude,
    label: [r.name, r.admin1, r.country].filter(Boolean).join(" · "),
    kind: "place",
  }));
}

const elevCache = new Map<string, { at: number; data: { lat: number; lng: number; elev: number }[] }>();

export async function fetchElevations(
  points: LatLng[],
): Promise<{ lat: number; lng: number; elev: number }[]> {
  const chunk = points.slice(0, 100);
  const cacheKey = chunk.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join("|");
  const hit = elevCache.get(cacheKey);
  if (hit && Date.now() - hit.at < 30 * 60_000) return hit.data;

  const loc = chunk.map((p) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join("|");
  const remember = (data: { lat: number; lng: number; elev: number }[]) => {
    elevCache.set(cacheKey, { at: Date.now(), data });
    return data;
  };
  try {
    const lats = chunk.map((p) => p.lat.toFixed(6)).join(",");
    const lngs = chunk.map((p) => p.lng.toFixed(6)).join(",");
    const json = await fetchJson<{ elevation?: number[] }>(
      `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`,
      { timeoutMs: 8000 },
    );
    if (json.elevation?.length === chunk.length) {
      return remember(chunk.map((p, i) => ({ lat: p.lat, lng: p.lng, elev: finite(json.elevation![i], 0) })));
    }
  } catch {
    /* fall through */
  }
  try {
    const json = await fetchJson<{
      status?: string;
      results?: { elevation: number | null; location: { lat: number; lng: number } }[];
    }>(`https://api.opentopodata.org/v1/mapzen?locations=${loc}`, { timeoutMs: 12000 });
    if (json.results?.length) {
      return remember(
        json.results.map((r, i) => ({
          lat: r.location?.lat ?? chunk[i]!.lat,
          lng: r.location?.lng ?? chunk[i]!.lng,
          elev: finite(r.elevation ?? 0, 0),
        })),
      );
    }
  } catch {
    /* fall through */
  }
  const json = await fetchJson<{ results?: { latitude: number; longitude: number; elevation: number }[] }>(
    "https://api.open-elevation.com/api/v1/lookup",
    {
      method: "POST",
      timeoutMs: 10000,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locations: chunk.map((p) => ({ latitude: p.lat, longitude: p.lng })),
      }),
    },
  );
  return remember(
    (json.results ?? []).map((r) => ({
      lat: r.latitude,
      lng: r.longitude,
      elev: finite(r.elevation, 0),
    })),
  );
}

export async function fetchOpenMeteoWeather(lat: number, lng: number) {
  const q = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current:
      "temperature_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,relative_humidity_2m",
    daily:
      "precipitation_sum,rain_sum,precipitation_probability_max,temperature_2m_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,weather_code",
    timezone: "auto",
    forecast_days: "7",
    past_days: "3",
    wind_speed_unit: "ms",
  });
  return fetchJson<Record<string, unknown>>(
    `https://api.open-meteo.com/v1/forecast?${q}`,
    { timeoutMs: 8000 },
  );
}

export async function fetchOpenMeteoArchive(lat: number, lng: number) {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCFullYear(start.getUTCFullYear() - 1);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const q = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    start_date: iso(start),
    end_date: iso(end),
    daily: "wind_speed_10m_max,wind_gusts_10m_max",
    wind_speed_unit: "ms",
    timezone: "auto",
  });
  return fetchJson<{
    daily?: {
      time?: string[];
      wind_speed_10m_max?: (number | null)[];
      wind_gusts_10m_max?: (number | null)[];
    };
  }>(`https://archive-api.open-meteo.com/v1/archive?${q}`, { timeoutMs: 12000 });
}

export async function fetchMetNo(lat: number, lng: number) {
  return fetchJson<Record<string, unknown>>(
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`,
    { timeoutMs: 8000 },
  );
}

export async function fetchDischarge(lat: number, lng: number) {
  const q = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    daily: "river_discharge,river_discharge_mean,river_discharge_max",
    forecast_days: "7",
  });
  return fetchJson<Record<string, unknown>>(
    `https://flood-api.open-meteo.com/v1/flood?${q}`,
    { timeoutMs: 8000 },
  );
}

export async function fetchRiversNominatim(center: LatLng): Promise<WaterFeature[]> {
  const d = 0.03;
  const viewbox = `${center.lng - d},${center.lat + d},${center.lng + d},${center.lat - d}`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent("river")}&viewbox=${viewbox}&bounded=1&limit=6&accept-language=zh-CN,zh,en`;
  try {
    const json = await fetchJson<
      { lat: string; lon: string; name?: string; display_name: string; type?: string; class?: string }[]
    >(url, { timeoutMs: 8000 });
    return json.map((r) => {
      const lat = Number(r.lat);
      const lng = Number(r.lon);
      const name = r.name || r.display_name.split(",")[0] || "河道";
      return {
        name,
        kind: r.type ?? "river",
        lat,
        lng,
        distM: round(haversine(center, { lat, lng }), 0),
        elevM: null,
      };
    });
  } catch {
    return [];
  }
}

type OverpassElem = {
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

export async function fetchOverpassHabitat(center: LatLng): Promise<{
  waters: WaterFeature[];
  birds: BirdSite[];
}> {
  const q = `
[out:json][timeout:12];
(
  nwr["waterway"~"river|stream|canal"](around:2500,${center.lat},${center.lng});
  nwr["natural"="water"](around:2500,${center.lat},${center.lng});
  nwr["natural"="wetland"](around:12000,${center.lat},${center.lng});
  nwr["leisure"="nature_reserve"](around:12000,${center.lat},${center.lng});
  nwr["leisure"="bird_hide"](around:12000,${center.lat},${center.lng});
  nwr["boundary"="protected_area"](around:12000,${center.lat},${center.lng});
  nwr["name"~"湿地|候鸟|观鸟|红树林|自然保护"](around:10000,${center.lat},${center.lng});
);
out center 40;
`.trim();
  const body = `data=${encodeURIComponent(q)}`;
  let json: { elements?: OverpassElem[] } = {};
  try {
    json = await fetchFirstJson<{ elements?: OverpassElem[] }>(
      [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
      ],
      {
        method: "POST",
        timeoutMs: 14000,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );
  } catch {
    return { waters: [], birds: [] };
  }
  const waters: WaterFeature[] = [];
  const birds: BirdSite[] = [];
  const seenW = new Set<string>();
  const seenB = new Set<string>();
  for (const el of json.elements ?? []) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat == null || lng == null) continue;
    const name = el.tags?.name || el.tags?.["name:zh"] || kindFromTags(el.tags);
    const key = `${name}-${lat.toFixed(4)}-${lng.toFixed(4)}`;
    if (isWaterish(el.tags) && !seenW.has(key)) {
      seenW.add(key);
      waters.push({
        name,
        kind: kindFromTags(el.tags),
        lat,
        lng,
        distM: round(haversine(center, { lat, lng }), 0),
        elevM: null,
      });
    }
    if (isBirdish(el.tags) && !seenB.has(key)) {
      seenB.add(key);
      birds.push({
        name,
        kind: kindFromTags(el.tags),
        lat,
        lng,
        distKm: round(haversine(center, { lat, lng }) / 1000, 2),
        species: el.tags?.natural === "wetland" ? "水鸟/鹭类（湿地指示）" : "保护区/观鸟点记录",
        source: "OpenStreetMap Overpass",
      });
    }
  }
  waters.sort((a, b) => a.distM - b.distM);
  birds.sort((a, b) => a.distKm - b.distKm);
  return { waters: waters.slice(0, 8), birds: birds.slice(0, 8) };
}
