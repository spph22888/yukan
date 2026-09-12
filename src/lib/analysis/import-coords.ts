import type { RiskLevel } from "./types";
import { LEVEL_ZH, round } from "../utils.ts";

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dφ = rad(b.lat - a.lat);
  const dλ = rad(b.lng - a.lng);
  const φ1 = rad(a.lat);
  const φ2 = rad(b.lat);
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type TowerPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type CorridorResult = {
  level: RiskLevel;
  historyId: string;
};

export type ParseTowersOk = {
  ok: true;
  towers: TowerPoint[];
  skipped: number;
  title?: string;
  kind: "csv" | "kml" | "gpx" | "geojson" | "line";
  warning?: string;
};

export type ParseTowersFail = { ok: false; error: string };

export type ParseTowersResult = ParseTowersOk | ParseTowersFail;

export const MAX_TOWERS = 200;

export const TOWER_TEMPLATE = `杆塔号,纬度N,经度E
N1,26.26321,117.63890
N2,26.26510,117.64120
N3,26.26740,117.64380
N4,26.26980,117.64610
N5,26.27220,117.64870
`;

function stripBom(s: string) {
  return s.replace(/^\uFEFF/, "");
}

function expandDms(s: string) {
  return s.replace(
    /(-?\d+)\s*[°度]\s*(\d+)\s*[′'’分]\s*([\d.]+)\s*[″"”秒]?/g,
    (_, d, m, sec) => {
      const sign = Number(d) < 0 || String(d).startsWith("-") ? -1 : 1;
      const mag = Math.abs(Number(d)) + Number(m) / 60 + Number(sec) / 3600;
      return String(round(sign * mag, 7));
    },
  );
}

function splitCells(line: string): string[] {
  const t = line.trim();
  if (!t) return [];
  if (t.includes("\t")) return t.split("\t").map((c) => c.trim());
  if (/[,，;；]/.test(t)) return t.split(/[,，;；]/).map((c) => c.trim());
  return t.split(/\s+/).map((c) => c.trim()).filter(Boolean);
}

function looksHeader(cells: string[]) {
  const blob = cells.join(" ");
  if (!/纬|经|lat|lon|lng|塔|号|name|id|北|东|坐标/i.test(blob)) return false;
  return cells.every((c) => Number.isNaN(Number(c.replace(/[°NSEW南北东西]/gi, ""))));
}

function headerMap(cells: string[]): { lat: number; lng: number; name: number | null } | null {
  let lat = -1;
  let lng = -1;
  let name: number | null = null;
  cells.forEach((c, i) => {
    const s = c.toLowerCase();
    if (lat < 0 && (/纬|lat|北纬|^y$/.test(s) || s === "n")) lat = i;
    else if (lng < 0 && (/经|lon|lng|东经|^x$/.test(s) || s === "e")) lng = i;
    else if (name == null && /塔|号|name|id|桩|编号|杆/.test(s)) name = i;
  });
  if (lat >= 0 && lng >= 0) return { lat, lng, name };
  return null;
}

function pairFromNumbers(nums: number[]): { lat: number; lng: number } | null {
  if (nums.length < 2) return null;
  let a = nums[nums.length - 2]!;
  let b = nums[nums.length - 1]!;
  if (Math.abs(a) > 180 && Math.abs(b) > 180) return null;
  let lat = a;
  let lng = b;
  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
    lat = b;
    lng = a;
  } else if (Math.abs(a) > 90 && Math.abs(b) <= 90) {
    lat = b;
    lng = a;
  } else if (Math.abs(a) <= 90 && Math.abs(b) <= 90 && Math.abs(a) > 60 && Math.abs(b) < 60) {
    lat = b;
    lng = a;
  }
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat: round(lat, 7), lng: round(lng, 7) };
}

function nameFromLine(line: string, fallback: string) {
  const cleaned = line
    .replace(/-?\d+(?:\.\d+)?/g, " ")
    .replace(/[,，;；\t]/g, " ")
    .replace(/[°度′'’分″"”秒NSEW南北东西]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || fallback;
}

function xmlTag(block: string, tag: string) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() ?? "";
}

function coordPairsFromText(raw: string): { lat: number; lng: number }[] {
  const out: { lat: number; lng: number }[] = [];
  const tokens = raw.trim().split(/[\s\n]+/).filter(Boolean);
  for (const token of tokens) {
    const parts = token.split(",").map(Number);
    if (parts.length < 2) continue;
    const lng = parts[0]!;
    const lat = parts[1]!;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) continue;
    out.push({ lat: round(lat, 7), lng: round(lng, 7) });
  }
  return out;
}

function uniqueTowers(list: TowerPoint[]): TowerPoint[] {
  const seenCoord = new Set<string>();
  const seenId = new Set<string>();
  const towers: TowerPoint[] = [];
  for (const t of list) {
    if (towers.length >= MAX_TOWERS) break;
    const key = `${round(t.lat, 6)},${round(t.lng, 6)}`;
    if (seenCoord.has(key)) continue;
    seenCoord.add(key);
    const name = t.name.slice(0, 40) || `N${towers.length + 1}`;
    let id = t.id.slice(0, 40) || name;
    if (seenId.has(id)) id = `${name}-${towers.length + 1}`;
    seenId.add(id);
    towers.push({ id, name, lat: t.lat, lng: t.lng });
  }
  return towers;
}

function parseKml(text: string): ParseTowersResult {
  const title = xmlTag(text, "name") || undefined;
  const pointTowers: TowerPoint[] = [];
  const lineTowers: TowerPoint[] = [];
  const chunks = text.split(/<Placemark\b/i).slice(1);
  let n = 0;
  for (const chunk of chunks) {
    const block = chunk.split(/<\/Placemark>/i)[0] ?? chunk;
    const name = xmlTag(block, "name");
    const pointBlock = block.match(/<Point\b[\s\S]*?<\/Point>/i)?.[0] ?? "";
    const lineBlock = block.match(/<(?:LineString|gx:Track)\b[\s\S]*?<\/(?:LineString|gx:Track)>/i)?.[0] ?? "";
    const pointCoords = xmlTag(pointBlock, "coordinates");
    if (pointCoords) {
      const pair = coordPairsFromText(pointCoords)[0];
      if (pair) {
        n += 1;
        pointTowers.push({
          id: name || `N${n}`,
          name: name || `N${n}`,
          lat: pair.lat,
          lng: pair.lng,
        });
      }
      continue;
    }
    const lineCoords = xmlTag(lineBlock, "coordinates");
    if (lineCoords) {
      for (const pair of coordPairsFromText(lineCoords)) {
        const label = `N${lineTowers.length + 1}`;
        lineTowers.push({ id: label, name: label, lat: pair.lat, lng: pair.lng });
      }
    }
  }
  if (!pointTowers.length && !lineTowers.length) {
    const loose = text.match(/<coordinates>([\s\S]*?)<\/coordinates>/gi) ?? [];
    for (const block of loose) {
      const inner = block.replace(/<\/?coordinates>/gi, "");
      for (const pair of coordPairsFromText(inner)) {
        const label = `N${lineTowers.length + 1}`;
        lineTowers.push({ id: label, name: label, lat: pair.lat, lng: pair.lng });
      }
    }
  }
  const source = pointTowers.length ? pointTowers : lineTowers;
  const towers = uniqueTowers(source);
  if (!towers.length) return { ok: false, error: "KML 里没有点坐标。请导出每基杆塔为 Placemark 点。" };
  return {
    ok: true,
    towers,
    skipped: Math.max(0, source.length - towers.length),
    title,
    kind: pointTowers.length ? "kml" : "line",
    warning: pointTowers.length ? undefined : "未找到点状杆塔，已按线路折点导入。请核对应是杆位而不是导线顶点。",
  };
}

function parseGpx(text: string): ParseTowersResult {
  const title = xmlTag(text, "name") || undefined;
  const towers: TowerPoint[] = [];
  const wpts = text.match(/<wpt\b[^>]*>[\s\S]*?<\/wpt>/gi) ?? [];
  for (const block of wpts) {
    const lat = Number(block.match(/\blat=["']([^"']+)["']/i)?.[1]);
    const lng = Number(block.match(/\blon=["']([^"']+)["']/i)?.[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) continue;
    const name = xmlTag(block, "name") || `N${towers.length + 1}`;
    towers.push({ id: name, name, lat: round(lat, 7), lng: round(lng, 7) });
  }
  if (!towers.length) {
    const trkpts = text.match(/<trkpt\b[^>]*>/gi) ?? [];
    for (const tag of trkpts) {
      const lat = Number(tag.match(/\blat=["']([^"']+)["']/i)?.[1]);
      const lng = Number(tag.match(/\blon=["']([^"']+)["']/i)?.[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      if (Math.abs(lat) > 90 || Math.abs(lng) > 180) continue;
      const label = `N${towers.length + 1}`;
      towers.push({ id: label, name: label, lat: round(lat, 7), lng: round(lng, 7) });
    }
  }
  const unique = uniqueTowers(towers);
  if (!unique.length) return { ok: false, error: "GPX 里没有航点。请把每基杆塔存成航点后再导入。" };
  return {
    ok: true,
    towers: unique,
    skipped: Math.max(0, towers.length - unique.length),
    title,
    kind: wpts.length ? "gpx" : "line",
    warning: wpts.length ? undefined : "未找到航点，已按轨迹折点导入。",
  };
}

function walkGeoJson(node: unknown, into: TowerPoint[], line: TowerPoint[]) {
  if (!node || typeof node !== "object") return;
  const rec = node as Record<string, unknown>;
  const nameOf = () => {
    const props = rec.properties;
    if (props && typeof props === "object") {
      const p = props as Record<string, unknown>;
      const n = p.name ?? p.title ?? p.id ?? p["杆塔号"];
      if (n != null) return String(n);
    }
    if (typeof rec.name === "string") return rec.name;
    return "";
  };
  if (rec.type === "Feature") {
    walkGeoJson(rec.geometry, into, line);
    const last = into[into.length - 1] ?? line[line.length - 1];
    const n = nameOf();
    if (last && n) {
      last.id = n;
      last.name = n;
    }
    return;
  }
  if (rec.type === "FeatureCollection" && Array.isArray(rec.features)) {
    for (const f of rec.features) walkGeoJson(f, into, line);
    return;
  }
  if (rec.type === "GeometryCollection" && Array.isArray(rec.geometries)) {
    for (const g of rec.geometries) walkGeoJson(g, into, line);
    return;
  }
  if (rec.type === "Point" && Array.isArray(rec.coordinates)) {
    const lng = Number(rec.coordinates[0]);
    const lat = Number(rec.coordinates[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      const label = nameOf() || `N${into.length + 1}`;
      into.push({ id: label, name: label, lat: round(lat, 7), lng: round(lng, 7) });
    }
    return;
  }
  if (rec.type === "MultiPoint" && Array.isArray(rec.coordinates)) {
    for (const c of rec.coordinates) {
      if (!Array.isArray(c)) continue;
      const lng = Number(c[0]);
      const lat = Number(c[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const label = `N${into.length + 1}`;
      into.push({ id: label, name: label, lat: round(lat, 7), lng: round(lng, 7) });
    }
    return;
  }
  if ((rec.type === "LineString" || rec.type === "MultiLineString") && Array.isArray(rec.coordinates)) {
    const rings = rec.type === "LineString" ? [rec.coordinates] : rec.coordinates;
    for (const ring of rings) {
      if (!Array.isArray(ring)) continue;
      for (const c of ring) {
        if (!Array.isArray(c)) continue;
        const lng = Number(c[0]);
        const lat = Number(c[1]);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        const label = `N${line.length + 1}`;
        line.push({ id: label, name: label, lat: round(lat, 7), lng: round(lng, 7) });
      }
    }
  }
}

function parseGeoJson(text: string): ParseTowersResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "GeoJSON 无法解析" };
  }
  const points: TowerPoint[] = [];
  const line: TowerPoint[] = [];
  walkGeoJson(data, points, line);
  const source = points.length ? points : line;
  const towers = uniqueTowers(source);
  if (!towers.length) return { ok: false, error: "GeoJSON 里没有点坐标" };
  const title =
    data && typeof data === "object" && "name" in data && typeof (data as { name?: unknown }).name === "string"
      ? (data as { name: string }).name
      : undefined;
  return {
    ok: true,
    towers,
    skipped: Math.max(0, source.length - towers.length),
    title,
    kind: points.length ? "geojson" : "line",
    warning: points.length ? undefined : "未找到点要素，已按线折点导入。",
  };
}

export function parseTowerList(raw: string): ParseTowersResult {
  const text = expandDms(stripBom(raw)).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//") && !/^#\s/.test(l) && l !== "#");
  if (!lines.length) return { ok: false, error: "没有读到坐标。请粘贴或导入 CSV / KML。" };

  let start = 0;
  let cols: { lat: number; lng: number; name: number | null } | null = null;
  const firstCells = splitCells(lines[0]!);
  if (firstCells.length && (looksHeader(firstCells) || headerMap(firstCells))) {
    cols = headerMap(firstCells);
    start = 1;
  }

  const collected: TowerPoint[] = [];
  let skipped = 0;

  for (let i = start; i < lines.length; i++) {
    const line = lines[i]!;
    const cells = splitCells(line);
    let lat: number | null = null;
    let lng: number | null = null;
    let name = "";

    if (cols) {
      const latCell = cells[cols.lat] ?? "";
      const lngCell = cells[cols.lng] ?? "";
      const parsed = pairFromNumbers([Number(latCell), Number(lngCell)].filter(Number.isFinite));
      if (parsed) {
        lat = parsed.lat;
        lng = parsed.lng;
      }
      if (cols.name != null) name = cells[cols.name] ?? "";
    }

    if (lat == null || lng == null) {
      const nums = (line.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number).filter(Number.isFinite);
      const pair = pairFromNumbers(nums);
      if (pair) {
        lat = pair.lat;
        lng = pair.lng;
      }
    }

    if (lat == null || lng == null) {
      skipped += 1;
      continue;
    }
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      skipped += 1;
      continue;
    }

    const fallback = `N${collected.length + 1}`;
    if (!name) {
      const labelCell = cells.find((c) => {
        const n = Number(c.replace(/[°NSEW南北东西]/gi, ""));
        return Boolean(c) && Number.isNaN(n);
      });
      name = labelCell || nameFromLine(line, fallback);
    }
    const label = name.slice(0, 40) || fallback;
    collected.push({ id: label, name: label, lat, lng });
  }

  const towers = uniqueTowers(collected);
  skipped += Math.max(0, collected.length - towers.length);

  if (!towers.length) {
    return {
      ok: false,
      error: skipped
        ? "读到的数字不像经纬度（可能是投影坐标）。请用纬度、经度，例如 26.26321,117.63890"
        : "没有解析出有效坐标",
    };
  }

  return { ok: true, towers, skipped, kind: "csv" };
}

export function looksLikeWorkbook(raw: string, filename?: string) {
  const name = (filename ?? "").toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".xlsm")) return true;
  return raw.startsWith("PK") && raw.includes("[Content_Types].xml");
}

export function parseCoordinateFile(raw: string, filename?: string): ParseTowersResult {
  if (looksLikeWorkbook(raw, filename)) {
    return {
      ok: false,
      error: "Excel 工作簿请另存为 CSV，或直接在表格里复制杆塔号、纬度、经度，粘贴到输入框。",
    };
  }
  const text = stripBom(raw).trim();
  if (!text) return { ok: false, error: "文件是空的" };
  if (/<kml[\s>]|<Placemark\b/i.test(text)) return parseKml(text);
  if (/<gpx[\s>]|<wpt\b|<trkpt\b/i.test(text)) return parseGpx(text);
  if (/^\s*\{[\s\S]*"type"\s*:\s*"(FeatureCollection|Feature|Point|MultiPoint|LineString)"/i.test(text)) {
    return parseGeoJson(text);
  }
  return parseTowerList(text);
}

export function corridorStats(towers: TowerPoint[]) {
  let lengthM = 0;
  for (let i = 1; i < towers.length; i++) {
    lengthM += haversine(towers[i - 1]!, towers[i]!);
  }
  return {
    count: towers.length,
    lengthM,
    lengthKm: round(lengthM / 1000, 2),
  };
}

export function towersToCsv(
  towers: TowerPoint[],
  results: Record<string, CorridorResult> = {},
) {
  const esc = (s: string) => (/,|"|\n/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const lines = ["杆塔号,纬度N,经度E,综合风险"];
  for (const t of towers) {
    const level = results[t.id]?.level;
    lines.push(
      [esc(t.name), t.lat.toFixed(6), t.lng.toFixed(6), level ? LEVEL_ZH[level] : ""].join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

export function downloadText(filename: string, text: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadTowerTemplate() {
  downloadText("雨瞰-杆塔坐标模板.csv", TOWER_TEMPLATE);
}

export function downloadCorridorCsv(
  title: string,
  towers: TowerPoint[],
  results: Record<string, CorridorResult>,
) {
  const safe = (title || "线路").replace(/[\\/:*?"<>|]/g, "-").slice(0, 40);
  downloadText(`雨瞰-${safe}-杆塔研判.csv`, towersToCsv(towers, results));
}
