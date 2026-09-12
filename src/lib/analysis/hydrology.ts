import { round } from "@/lib/utils";
import {
  aspectLabel,
  autoVertices,
  destination,
  metersToLat,
  metersToLng,
  polygonAreaM2,
} from "./geo";
import type {
  FlowPath,
  LatLng,
  ProbeResult,
  RiskLevel,
  RiskRow,
  TransectPt,
  Vertex,
  WaterFeature,
} from "./types";

const DC = [1, 1, 0, -1, -1, -1, 0, 1];
const DR = [0, 1, 1, 1, 0, -1, -1, -1];
const DIAG = Math.SQRT2;

export type ElevGrid = {
  n: number;
  spacingM: number;
  lats: number[];
  lngs: number[];
  z: number[][];
};

export function buildGrid(
  center: LatLng,
  elevations: { lat: number; lng: number; elev: number }[],
  n: number,
  spacingM: number,
): ElevGrid {
  const lats = [...new Set(elevations.map((p) => p.lat))].sort((a, b) => b - a);
  const lngs = [...new Set(elevations.map((p) => p.lng))].sort((a, b) => a - b);
  const map = new Map(elevations.map((p) => [`${p.lat.toFixed(6)},${p.lng.toFixed(6)}`, p.elev]));
  const z: number[][] = [];
  for (let r = 0; r < n; r++) {
    const row: number[] = [];
    for (let c = 0; c < n; c++) {
      const key = `${lats[r]!.toFixed(6)},${lngs[c]!.toFixed(6)}`;
      row.push(map.get(key) ?? centerElevFallback(elevations, lats[r]!, lngs[c]!));
    }
    z.push(row);
  }
  return { n, spacingM, lats, lngs, z };
}

function centerElevFallback(
  elevations: { lat: number; lng: number; elev: number }[],
  lat: number,
  lng: number,
) {
  let best = elevations[0]?.elev ?? 0;
  let bestD = Infinity;
  for (const p of elevations) {
    const d = (p.lat - lat) ** 2 + (p.lng - lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = p.elev;
    }
  }
  return best;
}

export function sampleGridPoints(center: LatLng, n: number, spacingM: number) {
  const half = (n - 1) / 2;
  const dLat = metersToLat(spacingM);
  const dLng = metersToLng(spacingM, center.lat);
  const pts: LatLng[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      pts.push({
        lat: center.lat + (half - r) * dLat,
        lng: center.lng + (c - half) * dLng,
      });
    }
  }
  return pts;
}

function bilinear(grid: ElevGrid, lat: number, lng: number) {
  const { lats, lngs, z, n } = grid;
  let r = 0;
  while (r < n - 2 && lat < lats[r + 1]!) r++;
  let c = 0;
  while (c < n - 2 && lng > lngs[c + 1]!) c++;
  const lat1 = lats[r]!;
  const lat2 = lats[Math.min(n - 1, r + 1)]!;
  const lng1 = lngs[c]!;
  const lng2 = lngs[Math.min(n - 1, c + 1)]!;
  const ty = lat1 === lat2 ? 0 : (lat1 - lat) / (lat1 - lat2);
  const tx = lng1 === lng2 ? 0 : (lng - lng1) / (lng2 - lng1);
  const z00 = z[r]![c]!;
  const z01 = z[r]![Math.min(n - 1, c + 1)]!;
  const z10 = z[Math.min(n - 1, r + 1)]![c]!;
  const z11 = z[Math.min(n - 1, r + 1)]![Math.min(n - 1, c + 1)]!;
  const a = z00 * (1 - tx) + z01 * tx;
  const b = z10 * (1 - tx) + z11 * tx;
  return a * (1 - ty) + b * ty;
}

function hornSlope(grid: ElevGrid, r: number, c: number) {
  const { z, n, spacingM } = grid;
  const clampR = (i: number) => Math.max(0, Math.min(n - 1, i));
  const clampC = (i: number) => Math.max(0, Math.min(n - 1, i));
  const A = z[clampR(r - 1)]![clampC(c - 1)]!;
  const B = z[clampR(r - 1)]![c]!;
  const C = z[clampR(r - 1)]![clampC(c + 1)]!;
  const D = z[r]![clampC(c - 1)]!;
  const F = z[r]![clampC(c + 1)]!;
  const G = z[clampR(r + 1)]![clampC(c - 1)]!;
  const H = z[clampR(r + 1)]![c]!;
  const I = z[clampR(r + 1)]![clampC(c + 1)]!;
  const dzdx = (C + 2 * F + I - (A + 2 * D + G)) / (8 * spacingM);
  const dzdy = (A + 2 * B + C - (G + 2 * H + I)) / (8 * spacingM);
  const slopePct = 100 * Math.sqrt(dzdx * dzdx + dzdy * dzdy);
  const aspectDeg = (((Math.atan2(-dzdx, -dzdy) * 180) / Math.PI + 360) % 360);
  return { slopePct, aspectDeg, dzdx, dzdy };
}

function d8Dir(grid: ElevGrid) {
  const { n, z, spacingM } = grid;
  const dir: number[][] = [];
  for (let r = 0; r < n; r++) {
    const row: number[] = [];
    for (let c = 0; c < n; c++) {
      let best = 0;
      let bestDrop = 0;
      for (let k = 0; k < 8; k++) {
        const rr = r + DR[k]!;
        const cc = c + DC[k]!;
        if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
        const dist = spacingM * (k % 2 === 1 ? DIAG : 1);
        const drop = (z[r]![c]! - z[rr]![cc]!) / dist;
        if (drop > bestDrop) {
          bestDrop = drop;
          best = k;
        }
      }
      row.push(bestDrop <= 0 ? -1 : best);
    }
    dir.push(row);
  }
  return dir;
}

function cellLatLng(grid: ElevGrid, r: number, c: number): LatLng {
  return { lat: grid.lats[r]!, lng: grid.lngs[c]! };
}

function nearestCell(grid: ElevGrid, p: LatLng) {
  let br = 0;
  let bc = 0;
  let best = Infinity;
  for (let r = 0; r < grid.n; r++) {
    for (let c = 0; c < grid.n; c++) {
      const d = (grid.lats[r]! - p.lat) ** 2 + (grid.lngs[c]! - p.lng) ** 2;
      if (d < best) {
        best = d;
        br = r;
        bc = c;
      }
    }
  }
  return { r: br, c: bc };
}

function traceDown(
  grid: ElevGrid,
  dir: number[][],
  r: number,
  c: number,
  maxSteps = 16,
): LatLng[] {
  const pts: LatLng[] = [cellLatLng(grid, r, c)];
  const seen = new Set<string>();
  for (let i = 0; i < maxSteps; i++) {
    const key = `${r},${c}`;
    if (seen.has(key)) break;
    seen.add(key);
    const d = dir[r]![c]!;
    if (d < 0) break;
    r += DR[d]!;
    c += DC[d]!;
    if (r < 0 || c < 0 || r >= grid.n || c >= grid.n) break;
    pts.push(cellLatLng(grid, r, c));
  }
  return pts;
}

function argExtrema(grid: ElevGrid) {
  let min = Infinity;
  let max = -Infinity;
  let minR = 0;
  let minC = 0;
  let maxR = 0;
  let maxC = 0;
  for (let r = 0; r < grid.n; r++) {
    for (let c = 0; c < grid.n; c++) {
      const v = grid.z[r]![c]!;
      if (v < min) {
        min = v;
        minR = r;
        minC = c;
      }
      if (v > max) {
        max = v;
        maxR = r;
        maxC = c;
      }
    }
  }
  return { min, max, minR, minC, maxR, maxC };
}

function quadrantHighs(grid: ElevGrid, sr: number, sc: number) {
  const acc = { N: -Infinity, E: -Infinity, S: -Infinity, W: -Infinity };
  for (let r = 0; r < grid.n; r++) {
    for (let c = 0; c < grid.n; c++) {
      const v = grid.z[r]![c]!;
      if (r < sr) acc.N = Math.max(acc.N, v);
      if (r > sr) acc.S = Math.max(acc.S, v);
      if (c > sc) acc.E = Math.max(acc.E, v);
      if (c < sc) acc.W = Math.max(acc.W, v);
    }
  }
  return acc;
}

function buildTransect(grid: ElevGrid, center: LatLng, aspectDeg: number): TransectPt[] {
  const pts: TransectPt[] = [];
  for (let i = -4; i <= 4; i++) {
    const dist = i * grid.spacingM;
    const p = destination(center, aspectDeg, dist);
    const elevM = bilinear(grid, p.lat, p.lng);
    const label = i === 0 ? "场地" : i === -4 ? "上坡" : i === 4 ? "下坡" : undefined;
    pts.push({ distM: dist, elevM: round(elevM, 1), label });
  }
  return pts;
}

function levelFrom(score: number): RiskLevel {
  if (score >= 0.8) return "high";
  if (score >= 0.62) return "mid-high";
  if (score >= 0.42) return "mid";
  if (score >= 0.24) return "mid-low";
  return "low";
}

const LEVEL_RANK: Record<RiskLevel, number> = {
  low: 0,
  "mid-low": 1,
  mid: 2,
  "mid-high": 3,
  high: 4,
};

export function worstLevel(levels: RiskLevel[]): RiskLevel {
  let best: RiskLevel = "low";
  for (const l of levels) if (LEVEL_RANK[l] > LEVEL_RANK[best]) best = l;
  return best;
}

export function buildRisks(input: {
  siteElev: number;
  relief: number;
  slopePct: number;
  isDepression: number;
  sourceDrop: number;
  cornerConverge: boolean;
  waters: WaterFeature[];
  maxNeighborSlope: number;
  downhillRoad: boolean;
  wettestDayMm: number;
  next7dMm: number;
  dischargeRatio: number | null;
}): RiskRow[] {
  const nearest = input.waters[0];
  const dRiver = nearest?.distM ?? 1e9;
  const dzRiver =
    nearest?.elevM != null ? input.siteElev - nearest.elevM : dRiver < 2000 ? 40 : 80;

  let riverScore = 0;
  if (dRiver < 250 && dzRiver < 6) riverScore = 0.92;
  else if (dRiver < 500 && dzRiver < 10) riverScore = 0.72;
  else if (dRiver < 900 && dzRiver < 18) riverScore = 0.48;
  else if (dRiver < 1500 && dzRiver < 30) riverScore = 0.28;
  else if (dRiver < 2500 && dzRiver < 50) riverScore = 0.12;
  if (input.dischargeRatio != null && input.dischargeRatio > 2.2) riverScore = Math.min(1, riverScore + 0.18);

  const torrentScore = Math.min(
    1,
    (input.sourceDrop / 55) * 0.55 + (input.slopePct / 28) * 0.45,
  );
  const cornerScore = input.cornerConverge ? Math.min(0.78, 0.35 + input.slopePct / 40) : 0.18;
  const pondScore = Math.min(
    1,
    input.isDepression * 0.7 + (input.slopePct < 3 ? 0.25 : 0) + (input.wettestDayMm > 60 ? 0.2 : 0),
  );
  const slideScore = Math.min(1, input.maxNeighborSlope / 45 + (input.sourceDrop > 40 ? 0.15 : 0));
  const backScore = input.downhillRoad ? 0.38 : 0.22;

  const rainBump = input.wettestDayMm > 80 || input.next7dMm > 120 ? 0.08 : 0;

  const river: RiskRow = {
    id: "river",
    type: "河道淹没",
    level: levelFrom(riverScore),
    basis: nearest
      ? `最近水体「${nearest.name}」约 ${Math.round(dRiver)} 米，场地相对水面高差约 ${dzRiver === 80 ? "—" : `${Math.round(dzRiver)} 米`}`
      : "近场 2 公里未检索到具名河道，江河淹没不是主因",
    consequence: riverScore > 0.5 ? "洪水位可能逼近一层或院门" : "江河洪水一般到不了该高程",
  };

  const torrent: RiskRow = {
    id: "torrent",
    type: "高位径流冲击围护",
    level: levelFrom(Math.min(1, torrentScore + rainBump)),
    basis: `近场相对高差 ${round(input.relief, 0)} 米，场地坡度约 ${round(input.slopePct, 1)}%，上坡来水落差 ${round(input.sourceDrop, 0)} 米`,
    consequence:
      torrentScore > 0.5
        ? "短时洪峰拍打高位墙段，基础淘刷、院门进水、泥沙入库"
        : "客水冲击有限，仍需保证散水与墙根排水",
  };

  const corner: RiskRow = {
    id: "corner",
    type: "角落集中汇水",
    level: levelFrom(cornerScore),
    basis: input.cornerConverge
      ? "两个高位象限同时高于场地，径流在转角收敛"
      : "汇水方向较单一，转角收敛不明显",
    consequence: input.cornerConverge ? "墙角积水、墙根软化" : "转角积水压力较小",
  };

  const pond: RiskRow = {
    id: "ponding",
    type: "场地低点内涝",
    level: levelFrom(pondScore),
    basis: input.isDepression > 0.5
      ? "场地接近局部洼地，硬化面汇水若雨水口不足将短时积水"
      : input.slopePct < 4
        ? "坡度平缓，排水依赖雨水管网"
        : "场地有坡可排，内涝取决于出水口是否通畅",
    consequence: "一层门口、电缆沟、地下或半地下空间受淹",
  };

  const slide: RiskRow = {
    id: "slope",
    type: "边坡滑坡崩塌",
    level: levelFrom(slideScore),
    basis: `邻域最大坡度约 ${round(input.maxNeighborSlope, 0)}%，${input.maxNeighborSlope > 18 ? "属房前屋后高陡边坡类地貌" : "边坡较缓"}`,
    consequence: slideScore > 0.4 ? "墙体变形、泥石涌入场地" : "整体失稳概率较低，雨后仍应巡查裂缝",
  };

  const back: RiskRow = {
    id: "backwater",
    type: "出水口顶托 / 回灌",
    level: levelFrom(backScore),
    basis: input.downhillRoad
      ? "出水方向邻近道路，强降雨时路面边沟可能顶托"
      : "出水依赖下游通道，路面积水回灌风险视市政排水而定",
    consequence: "路面积水回灌院门或最低口",
  };

  return [river, torrent, corner, pond, slide, back];
}

export function analyzeTerrain(opts: {
  center: LatLng;
  extentM: number;
  grid: ElevGrid;
  verticesIn?: { id: string; lat: number; lng: number; role: string }[];
  waters: WaterFeature[];
  weatherWettest: number;
  weatherNext7: number;
  dischargeRatio: number | null;
  downhillRoad: boolean;
}): Omit<
  ProbeResult,
  "place" | "weather" | "wind" | "birds" | "discharge" | "analyzedAt" | "sources" | "overallLevel" | "factors"
> & { overallLevel?: RiskLevel } {
  const { center, extentM, grid, waters } = opts;
  const site = nearestCell(grid, center);
  const siteElev = bilinear(grid, center.lat, center.lng);
  const { slopePct, aspectDeg } = hornSlope(grid, site.r, site.c);
  const ext = argExtrema(grid);
  const relief = ext.max - ext.min;
  const dir = d8Dir(grid);

  const rawVerts = opts.verticesIn?.length
    ? opts.verticesIn
    : autoVertices(center, extentM);
  const vertices: Vertex[] = rawVerts.map((v) => ({
    ...v,
    elevM: round(bilinear(grid, v.lat, v.lng), 1),
  }));
  const lowestV = [...vertices].sort((a, b) => a.elevM - b.elevM)[0]!;
  const highestV = [...vertices].sort((a, b) => b.elevM - a.elevM)[0]!;

  const q = quadrantHighs(grid, site.r, site.c);
  const highs = Object.entries(q).sort((a, b) => b[1] - a[1]);
  const sourceDrop = Math.max(0, ext.max - siteElev);
  const twoHigh =
    highs.filter(([, z]) => z - siteElev > Math.max(6, relief * 0.25)).length >= 2;

  const outletPts = traceDown(grid, dir, site.r, site.c);
  const sourcePts = traceDown(grid, dir, ext.maxR, ext.maxC);
  const bypassLeft = [
    destination(center, (aspectDeg + 70) % 360, extentM * 0.45),
    destination(center, (aspectDeg + 20) % 360, extentM * 0.9),
    destination(center, aspectDeg, extentM * 1.4),
  ];

  const sourceLabel = aspectLabel(
    (Math.atan2(
      grid.lngs[ext.maxC]! - center.lng,
      grid.lats[ext.maxR]! - center.lat,
    ) *
      180) /
      Math.PI,
  );
  const outletLabel = aspectLabel(aspectDeg);

  const n = grid.n;
  let closed = 0;
  let checked = 0;
  for (const [dr, dc] of [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ] as const) {
    const rr = site.r + dr;
    const cc = site.c + dc;
    if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
    checked++;
    if (grid.z[rr]![cc]! >= siteElev - 0.4) closed++;
  }
  const isDepression = checked ? closed / checked : 0;

  let maxNeighborSlope = slopePct;
  for (let r = 1; r < n - 1; r++) {
    for (let c = 1; c < n - 1; c++) {
      maxNeighborSlope = Math.max(maxNeighborSlope, hornSlope(grid, r, c).slopePct);
    }
  }

  const flowPaths: FlowPath[] = [
    {
      id: "inflow",
      name: "高位来水",
      tone: "inflow",
      description: `近场最高点约 ${round(ext.max, 0)} 米，位于场地${sourceLabel}侧，径流沿坡面向场地汇集，是对围护冲击最大的客水。`,
      points: sourcePts.slice(0, 10),
    },
    {
      id: "lateral",
      name: `${({ N: "北", E: "东", S: "南", W: "西" } as Record<string, string>)[highs[1]?.[0] ?? ""] ?? "侧"}向汇水`,
      tone: "lateral",
      description: twoHigh
        ? `次高象限亦明显高于场地，客水在转角处易集中。`
        : `侧向来水弱于主坡向，但仍会沿硬化边沟汇入最低口。`,
      points: [
        destination(center, (aspectDeg + 135) % 360, extentM * 1.2),
        destination(center, (aspectDeg + 90) % 360, extentM * 0.4),
        { lat: lowestV.lat, lng: lowestV.lng },
      ],
    },
    {
      id: "bypass",
      name: "沿场地绕流",
      tone: "bypass",
      description: "高位墙段拦水后，水流沿两侧通道向下游绕行，不翻墙则从侧向排泄。",
      points: bypassLeft,
    },
    {
      id: "outlet",
      name: "最低口出水",
      tone: "outlet",
      description: `${lowestV.id}（${lowestV.role}）约 ${round(lowestV.elevM, 0)} 米，为围合最低点，是天然出水口。`,
      points: outletPts.length > 1 ? outletPts : [
        { lat: lowestV.lat, lng: lowestV.lng },
        destination({ lat: lowestV.lat, lng: lowestV.lng }, aspectDeg, extentM * 1.6),
      ],
    },
  ];

  const risks = buildRisks({
    siteElev,
    relief,
    slopePct,
    isDepression,
    sourceDrop,
    cornerConverge: twoHigh,
    waters,
    maxNeighborSlope,
    downhillRoad: opts.downhillRoad,
    wettestDayMm: opts.weatherWettest,
    next7dMm: opts.weatherNext7,
    dischargeRatio: opts.dischargeRatio,
  });

  const transect = buildTransect(grid, center, aspectDeg);
  const areaM2 = polygonAreaM2(vertices);

  return {
    lat: center.lat,
    lng: center.lng,
    extentM,
    siteElevM: round(siteElev, 1),
    minElevM: round(ext.min, 1),
    maxElevM: round(ext.max, 1),
    reliefM: round(relief, 1),
    slopePct: round(slopePct, 1),
    aspectDeg: round(aspectDeg, 0),
    aspectLabel: outletLabel,
    outletLabel,
    sourceLabel,
    isDepression: isDepression > 0.74,
    areaM2: round(areaM2, 0),
    vertices,
    grid: {
      n: grid.n,
      spacingM: grid.spacingM,
      lats: grid.lats.map((v) => round(v, 6)),
      lngs: grid.lngs.map((v) => round(v, 6)),
      z: grid.z.map((row) => row.map((v) => round(v, 1))),
    },
    flowPaths,
    transect,
    waters,
    risks,
    overallLevel: worstLevel(risks.map((r) => r.level)),
  };
}

export function enrichWaters(
  waters: WaterFeature[],
  grid: ElevGrid,
): WaterFeature[] {
  return waters
    .map((w) => {
      const inside =
        w.lat <= grid.lats[0]! &&
        w.lat >= grid.lats[grid.n - 1]! &&
        w.lng >= grid.lngs[0]! &&
        w.lng <= grid.lngs[grid.n - 1]!;
      return {
        ...w,
        elevM: w.elevM ?? (inside ? round(bilinear(grid, w.lat, w.lng), 0) : null),
      };
    })
    .sort((a, b) => a.distM - b.distM);
}

export { bilinear };

