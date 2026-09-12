import { round } from "@/lib/utils";
import type { DischargeBlock, WeatherBlock, WeatherDay } from "./types";

type MetNo = {
  properties?: {
    meta?: { updated_at?: string };
    timeseries?: {
      time: string;
      data: {
        instant?: { details?: Record<string, number> };
        next_1_hours?: {
          summary?: { symbol_code?: string };
          details?: { precipitation_amount?: number };
        };
        next_6_hours?: {
          summary?: { symbol_code?: string };
          details?: { precipitation_amount?: number };
        };
      };
    }[];
  };
};

type OpenMeteoForecast = {
  timezone?: string;
  current?: {
    time?: string;
    temperature_2m?: number;
    precipitation?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    wind_gusts_10m?: number;
    wind_direction_10m?: number;
    relative_humidity_2m?: number;
  };
  daily?: {
    time?: string[];
    precipitation_sum?: number[];
    rain_sum?: number[];
    precipitation_probability_max?: number[];
    temperature_2m_max?: number[];
    wind_speed_10m_max?: number[];
    wind_gusts_10m_max?: number[];
    wind_direction_10m_dominant?: number[];
    weather_code?: number[];
  };
};

const WMO: Record<number, string> = {
  0: "晴",
  1: "晴间多云",
  2: "多云",
  3: "阴",
  45: "雾",
  48: "雾",
  51: "小毛毛雨",
  53: "毛毛雨",
  55: "大毛毛雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  80: "阵雨",
  81: "强阵雨",
  82: "暴雨阵雨",
  95: "雷暴",
  96: "雷暴冰雹",
  99: "强雷暴冰雹",
};

function symbolFromMet(code: string | undefined) {
  if (!code) return "多云";
  if (code.includes("thunder")) return "雷暴";
  if (code.includes("heavyrain")) return "大雨";
  if (code.includes("rain")) return "雨";
  if (code.includes("sleet")) return "雨夹雪";
  if (code.includes("snow")) return "雪";
  if (code.includes("fog")) return "雾";
  if (code.includes("cloudy")) return "阴";
  if (code.includes("fair") || code.includes("clear")) return "晴";
  if (code.includes("partly")) return "多云";
  return "多云";
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export function parseMetNo(json: MetNo, now = new Date()): WeatherBlock {
  const ts = json.properties?.timeseries ?? [];
  const first = ts[0];
  const instant = first?.data.instant?.details ?? {};
  const byDay = new Map<
    string,
    { rain: number; temp: number[]; wind: number[]; gust: number[]; dir: number[]; symbol: string }
  >();

  for (const row of ts) {
    const day = dayKey(row.time);
    const acc = byDay.get(day) ?? { rain: 0, temp: [], wind: [], gust: [], dir: [], symbol: "多云" };
    const p1 = row.data.next_1_hours?.details?.precipitation_amount;
    const p6 = row.data.next_6_hours?.details?.precipitation_amount;
    if (typeof p1 === "number") acc.rain += p1;
    else if (typeof p6 === "number") acc.rain += p6;
    const t = row.data.instant?.details?.air_temperature;
    const w = row.data.instant?.details?.wind_speed;
    const g = row.data.instant?.details?.wind_speed_of_gust;
    const d = row.data.instant?.details?.wind_from_direction;
    if (typeof t === "number") acc.temp.push(t);
    if (typeof w === "number") acc.wind.push(w);
    if (typeof g === "number") acc.gust.push(g);
    if (typeof d === "number") acc.dir.push(d);
    const sym =
      row.data.next_1_hours?.summary?.symbol_code ??
      row.data.next_6_hours?.summary?.symbol_code;
    if (sym) acc.symbol = symbolFromMet(sym);
    byDay.set(day, acc);
  }

  const days: WeatherDay[] = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 8)
    .map(([date, v]) => ({
      date,
      rainMm: round(v.rain, 1),
      tempC: v.temp.length ? round(v.temp.reduce((a, b) => a + b, 0) / v.temp.length, 1) : null,
      windMs: v.wind.length ? round(Math.max(...v.wind), 1) : null,
      windGustMs: v.gust.length ? round(Math.max(...v.gust), 1) : null,
      windDirDeg: v.dir.length ? round(v.dir[0]!, 0) : null,
      symbol: v.symbol,
    }));

  const today = dayKey(now.toISOString());
  const past3dMm = days
    .filter((d) => d.date < today)
    .slice(-3)
    .reduce((s, d) => s + d.rainMm, 0);
  const future = days.filter((d) => d.date >= today);
  const next7dMm = future.slice(0, 7).reduce((s, d) => s + d.rainMm, 0);
  let wettest = future[0] ?? days[0];
  for (const d of days) if (!wettest || d.rainMm > wettest.rainMm) wettest = d;

  return {
    source: "MET Norway Locationforecast",
    asOf: json.properties?.meta?.updated_at ?? first?.time ?? now.toISOString(),
    tempC: typeof instant.air_temperature === "number" ? round(instant.air_temperature, 1) : null,
    windMs: typeof instant.wind_speed === "number" ? round(instant.wind_speed, 1) : null,
    windGustMs:
      typeof instant.wind_speed_of_gust === "number" ? round(instant.wind_speed_of_gust, 1) : null,
    windDirDeg:
      typeof instant.wind_from_direction === "number" ? round(instant.wind_from_direction, 0) : null,
    humidity: typeof instant.relative_humidity === "number" ? round(instant.relative_humidity, 0) : null,
    symbol: symbolFromMet(first?.data.next_1_hours?.summary?.symbol_code),
    precipNowMm: round(first?.data.next_1_hours?.details?.precipitation_amount ?? 0, 1),
    past3dMm: round(past3dMm, 1),
    next7dMm: round(next7dMm, 1),
    wettestDayMm: round(wettest?.rainMm ?? 0, 1),
    wettestDayDate: wettest?.date ?? null,
    days,
  };
}

export function parseOpenMeteo(json: OpenMeteoForecast, now = new Date()): WeatherBlock {
  const daily = json.daily;
  const days: WeatherDay[] = (daily?.time ?? []).map((date, i) => ({
    date,
    rainMm: round((daily?.precipitation_sum?.[i] ?? daily?.rain_sum?.[i] ?? 0) as number, 1),
    tempC: daily?.temperature_2m_max?.[i] ?? null,
    windMs: daily?.wind_speed_10m_max?.[i] ?? null,
    windGustMs: daily?.wind_gusts_10m_max?.[i] ?? null,
    windDirDeg: daily?.wind_direction_10m_dominant?.[i] ?? null,
    symbol: WMO[daily?.weather_code?.[i] ?? 2] ?? "多云",
  }));
  const today = dayKey(now.toISOString());
  const past3dMm = days
    .filter((d) => d.date < today)
    .slice(-3)
    .reduce((s, d) => s + d.rainMm, 0);
  const future = days.filter((d) => d.date >= today);
  const next7dMm = future.slice(0, 7).reduce((s, d) => s + d.rainMm, 0);
  let wettest = future[0] ?? days[0];
  for (const d of days) if (!wettest || d.rainMm > wettest.rainMm) wettest = d;
  const cur = json.current ?? {};
  return {
    source: "Open-Meteo",
    asOf: cur.time ?? now.toISOString(),
    tempC: cur.temperature_2m ?? null,
    windMs: cur.wind_speed_10m ?? null,
    windGustMs: cur.wind_gusts_10m ?? null,
    windDirDeg: cur.wind_direction_10m ?? null,
    humidity: cur.relative_humidity_2m ?? null,
    symbol: WMO[cur.weather_code ?? 2] ?? "多云",
    precipNowMm: round(cur.precipitation ?? 0, 1),
    past3dMm: round(past3dMm, 1),
    next7dMm: round(next7dMm, 1),
    wettestDayMm: round(wettest?.rainMm ?? 0, 1),
    wettestDayDate: wettest?.date ?? null,
    days,
  };
}

export function emptyWeather(): WeatherBlock {
  return {
    source: "unavailable",
    asOf: new Date().toISOString(),
    tempC: null,
    windMs: null,
    windGustMs: null,
    windDirDeg: null,
    humidity: null,
    symbol: "未知",
    precipNowMm: 0,
    past3dMm: 0,
    next7dMm: 0,
    wettestDayMm: 0,
    wettestDayDate: null,
    days: [],
  };
}

export function parseDischarge(json: {
  daily?: {
    river_discharge?: (number | null)[];
    river_discharge_mean?: (number | null)[];
    river_discharge_max?: (number | null)[];
  };
}): DischargeBlock {
  const mean = json.daily?.river_discharge_mean?.find((v) => v != null) ?? null;
  const nextMax = json.daily?.river_discharge_max
    ? Math.max(...json.daily.river_discharge_max.filter((v): v is number => v != null))
    : (json.daily?.river_discharge?.filter((v): v is number => v != null)[0] ?? null);
  const ratio = mean && nextMax ? nextMax / Math.max(mean, 0.01) : null;
  return {
    available: mean != null || nextMax != null,
    meanM3s: mean != null ? round(mean, 2) : null,
    nextMaxM3s: nextMax != null ? round(nextMax, 2) : null,
    ratio: ratio != null ? round(ratio, 2) : null,
  };
}
