import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { i as authMiddleware } from "./membership-H9HTzc88.mjs";
import { d as round, i as assertMember, l as logRun, o as finite } from "./membership-server-D3uGxw8t.mjs";
import { A as polygonAreaM2, C as metersToLat, D as parseDischarge, E as parseCoordinate, M as windRiskRow, O as parseMetNo, S as matchSample, T as normalizeFactors, _ as hasFactor, a as assessBirds, b as isWaterish, c as birdRiskRow, d as emptyBird, f as emptyWeather, g as fallbackReport, h as factorTitle, i as aspectLabel, j as summarizeWindHistory, k as parseOpenMeteo, l as compactForModel, m as emptyWindHistory, o as assessWind, p as emptyWind, s as autoVertices, u as destination, v as haversine, w as metersToLng, x as kindFromTags, y as isBirdish } from "./samples-B88m3320.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-aFDO-aqq.js
var DC = [
	1,
	1,
	0,
	-1,
	-1,
	-1,
	0,
	1
];
var DR = [
	0,
	1,
	1,
	1,
	0,
	-1,
	-1,
	-1
];
var DIAG = Math.SQRT2;
function buildGrid(center, elevations, n, spacingM) {
	const lats = [...new Set(elevations.map((p) => p.lat))].sort((a, b) => b - a);
	const lngs = [...new Set(elevations.map((p) => p.lng))].sort((a, b) => a - b);
	const map = new Map(elevations.map((p) => [`${p.lat.toFixed(6)},${p.lng.toFixed(6)}`, p.elev]));
	const z = [];
	for (let r = 0; r < n; r++) {
		const row = [];
		for (let c = 0; c < n; c++) {
			const key = `${lats[r].toFixed(6)},${lngs[c].toFixed(6)}`;
			row.push(map.get(key) ?? centerElevFallback(elevations, lats[r], lngs[c]));
		}
		z.push(row);
	}
	return {
		n,
		spacingM,
		lats,
		lngs,
		z
	};
}
function centerElevFallback(elevations, lat, lng) {
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
function sampleGridPoints(center, n, spacingM) {
	const half = (n - 1) / 2;
	const dLat = metersToLat(spacingM);
	const dLng = metersToLng(spacingM, center.lat);
	const pts = [];
	for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) pts.push({
		lat: center.lat + (half - r) * dLat,
		lng: center.lng + (c - half) * dLng
	});
	return pts;
}
function bilinear(grid, lat, lng) {
	const { lats, lngs, z, n } = grid;
	let r = 0;
	while (r < n - 2 && lat < lats[r + 1]) r++;
	let c = 0;
	while (c < n - 2 && lng > lngs[c + 1]) c++;
	const lat1 = lats[r];
	const lat2 = lats[Math.min(n - 1, r + 1)];
	const lng1 = lngs[c];
	const lng2 = lngs[Math.min(n - 1, c + 1)];
	const ty = lat1 === lat2 ? 0 : (lat1 - lat) / (lat1 - lat2);
	const tx = lng1 === lng2 ? 0 : (lng - lng1) / (lng2 - lng1);
	const z00 = z[r][c];
	const z01 = z[r][Math.min(n - 1, c + 1)];
	const z10 = z[Math.min(n - 1, r + 1)][c];
	const z11 = z[Math.min(n - 1, r + 1)][Math.min(n - 1, c + 1)];
	const a = z00 * (1 - tx) + z01 * tx;
	const b = z10 * (1 - tx) + z11 * tx;
	return a * (1 - ty) + b * ty;
}
function hornSlope(grid, r, c) {
	const { z, n, spacingM } = grid;
	const clampR = (i) => Math.max(0, Math.min(n - 1, i));
	const clampC = (i) => Math.max(0, Math.min(n - 1, i));
	const A = z[clampR(r - 1)][clampC(c - 1)];
	const B = z[clampR(r - 1)][c];
	const C = z[clampR(r - 1)][clampC(c + 1)];
	const D = z[r][clampC(c - 1)];
	const F = z[r][clampC(c + 1)];
	const G = z[clampR(r + 1)][clampC(c - 1)];
	const H = z[clampR(r + 1)][c];
	const I = z[clampR(r + 1)][clampC(c + 1)];
	const dzdx = (C + 2 * F + I - (A + 2 * D + G)) / (8 * spacingM);
	const dzdy = (A + 2 * B + C - (G + 2 * H + I)) / (8 * spacingM);
	return {
		slopePct: 100 * Math.sqrt(dzdx * dzdx + dzdy * dzdy),
		aspectDeg: (Math.atan2(-dzdx, -dzdy) * 180 / Math.PI + 360) % 360,
		dzdx,
		dzdy
	};
}
function d8Dir(grid) {
	const { n, z, spacingM } = grid;
	const dir = [];
	for (let r = 0; r < n; r++) {
		const row = [];
		for (let c = 0; c < n; c++) {
			let best = 0;
			let bestDrop = 0;
			for (let k = 0; k < 8; k++) {
				const rr = r + DR[k];
				const cc = c + DC[k];
				if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
				const dist = spacingM * (k % 2 === 1 ? DIAG : 1);
				const drop = (z[r][c] - z[rr][cc]) / dist;
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
function cellLatLng(grid, r, c) {
	return {
		lat: grid.lats[r],
		lng: grid.lngs[c]
	};
}
function nearestCell(grid, p) {
	let br = 0;
	let bc = 0;
	let best = Infinity;
	for (let r = 0; r < grid.n; r++) for (let c = 0; c < grid.n; c++) {
		const d = (grid.lats[r] - p.lat) ** 2 + (grid.lngs[c] - p.lng) ** 2;
		if (d < best) {
			best = d;
			br = r;
			bc = c;
		}
	}
	return {
		r: br,
		c: bc
	};
}
function traceDown(grid, dir, r, c, maxSteps = 16) {
	const pts = [cellLatLng(grid, r, c)];
	const seen = /* @__PURE__ */ new Set();
	for (let i = 0; i < maxSteps; i++) {
		const key = `${r},${c}`;
		if (seen.has(key)) break;
		seen.add(key);
		const d = dir[r][c];
		if (d < 0) break;
		r += DR[d];
		c += DC[d];
		if (r < 0 || c < 0 || r >= grid.n || c >= grid.n) break;
		pts.push(cellLatLng(grid, r, c));
	}
	return pts;
}
function argExtrema(grid) {
	let min = Infinity;
	let max = -Infinity;
	let minR = 0;
	let minC = 0;
	let maxR = 0;
	let maxC = 0;
	for (let r = 0; r < grid.n; r++) for (let c = 0; c < grid.n; c++) {
		const v = grid.z[r][c];
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
	return {
		min,
		max,
		minR,
		minC,
		maxR,
		maxC
	};
}
function quadrantHighs(grid, sr, sc) {
	const acc = {
		N: -Infinity,
		E: -Infinity,
		S: -Infinity,
		W: -Infinity
	};
	for (let r = 0; r < grid.n; r++) for (let c = 0; c < grid.n; c++) {
		const v = grid.z[r][c];
		if (r < sr) acc.N = Math.max(acc.N, v);
		if (r > sr) acc.S = Math.max(acc.S, v);
		if (c > sc) acc.E = Math.max(acc.E, v);
		if (c < sc) acc.W = Math.max(acc.W, v);
	}
	return acc;
}
function buildTransect(grid, center, aspectDeg) {
	const pts = [];
	for (let i = -4; i <= 4; i++) {
		const dist = i * grid.spacingM;
		const p = destination(center, aspectDeg, dist);
		const elevM = bilinear(grid, p.lat, p.lng);
		const label = i === 0 ? "场地" : i === -4 ? "上坡" : i === 4 ? "下坡" : void 0;
		pts.push({
			distM: dist,
			elevM: round(elevM, 1),
			label
		});
	}
	return pts;
}
function levelFrom(score) {
	if (score >= .8) return "high";
	if (score >= .62) return "mid-high";
	if (score >= .42) return "mid";
	if (score >= .24) return "mid-low";
	return "low";
}
var LEVEL_RANK = {
	low: 0,
	"mid-low": 1,
	mid: 2,
	"mid-high": 3,
	high: 4
};
function worstLevel(levels) {
	let best = "low";
	for (const l of levels) if (LEVEL_RANK[l] > LEVEL_RANK[best]) best = l;
	return best;
}
function buildRisks(input) {
	const nearest = input.waters[0];
	const dRiver = nearest?.distM ?? 1e9;
	const dzRiver = nearest?.elevM != null ? input.siteElev - nearest.elevM : dRiver < 2e3 ? 40 : 80;
	let riverScore = 0;
	if (dRiver < 250 && dzRiver < 6) riverScore = .92;
	else if (dRiver < 500 && dzRiver < 10) riverScore = .72;
	else if (dRiver < 900 && dzRiver < 18) riverScore = .48;
	else if (dRiver < 1500 && dzRiver < 30) riverScore = .28;
	else if (dRiver < 2500 && dzRiver < 50) riverScore = .12;
	if (input.dischargeRatio != null && input.dischargeRatio > 2.2) riverScore = Math.min(1, riverScore + .18);
	const torrentScore = Math.min(1, input.sourceDrop / 55 * .55 + input.slopePct / 28 * .45);
	const cornerScore = input.cornerConverge ? Math.min(.78, .35 + input.slopePct / 40) : .18;
	const pondScore = Math.min(1, input.isDepression * .7 + (input.slopePct < 3 ? .25 : 0) + (input.wettestDayMm > 60 ? .2 : 0));
	const slideScore = Math.min(1, input.maxNeighborSlope / 45 + (input.sourceDrop > 40 ? .15 : 0));
	const backScore = input.downhillRoad ? .38 : .22;
	const rainBump = input.wettestDayMm > 80 || input.next7dMm > 120 ? .08 : 0;
	return [
		{
			id: "river",
			type: "河道淹没",
			level: levelFrom(riverScore),
			basis: nearest ? `最近水体「${nearest.name}」约 ${Math.round(dRiver)} 米，场地相对水面高差约 ${dzRiver === 80 ? "—" : `${Math.round(dzRiver)} 米`}` : "近场 2 公里未检索到具名河道，江河淹没不是主因",
			consequence: riverScore > .5 ? "洪水位可能逼近一层或院门" : "江河洪水一般到不了该高程"
		},
		{
			id: "torrent",
			type: "高位径流冲击围护",
			level: levelFrom(Math.min(1, torrentScore + rainBump)),
			basis: `近场相对高差 ${round(input.relief, 0)} 米，场地坡度约 ${round(input.slopePct, 1)}%，上坡来水落差 ${round(input.sourceDrop, 0)} 米`,
			consequence: torrentScore > .5 ? "短时洪峰拍打高位墙段，基础淘刷、院门进水、泥沙入库" : "客水冲击有限，仍需保证散水与墙根排水"
		},
		{
			id: "corner",
			type: "角落集中汇水",
			level: levelFrom(cornerScore),
			basis: input.cornerConverge ? "两个高位象限同时高于场地，径流在转角收敛" : "汇水方向较单一，转角收敛不明显",
			consequence: input.cornerConverge ? "墙角积水、墙根软化" : "转角积水压力较小"
		},
		{
			id: "ponding",
			type: "场地低点内涝",
			level: levelFrom(pondScore),
			basis: input.isDepression > .5 ? "场地接近局部洼地，硬化面汇水若雨水口不足将短时积水" : input.slopePct < 4 ? "坡度平缓，排水依赖雨水管网" : "场地有坡可排，内涝取决于出水口是否通畅",
			consequence: "一层门口、电缆沟、地下或半地下空间受淹"
		},
		{
			id: "slope",
			type: "边坡滑坡崩塌",
			level: levelFrom(slideScore),
			basis: `邻域最大坡度约 ${round(input.maxNeighborSlope, 0)}%，${input.maxNeighborSlope > 18 ? "属房前屋后高陡边坡类地貌" : "边坡较缓"}`,
			consequence: slideScore > .4 ? "墙体变形、泥石涌入场地" : "整体失稳概率较低，雨后仍应巡查裂缝"
		},
		{
			id: "backwater",
			type: "出水口顶托 / 回灌",
			level: levelFrom(backScore),
			basis: input.downhillRoad ? "出水方向邻近道路，强降雨时路面边沟可能顶托" : "出水依赖下游通道，路面积水回灌风险视市政排水而定",
			consequence: "路面积水回灌院门或最低口"
		}
	];
}
function analyzeTerrain(opts) {
	const { center, extentM, grid, waters } = opts;
	const site = nearestCell(grid, center);
	const siteElev = bilinear(grid, center.lat, center.lng);
	const { slopePct, aspectDeg } = hornSlope(grid, site.r, site.c);
	const ext = argExtrema(grid);
	const relief = ext.max - ext.min;
	const dir = d8Dir(grid);
	const vertices = (opts.verticesIn?.length ? opts.verticesIn : autoVertices(center, extentM)).map((v) => ({
		...v,
		elevM: round(bilinear(grid, v.lat, v.lng), 1)
	}));
	const lowestV = [...vertices].sort((a, b) => a.elevM - b.elevM)[0];
	[...vertices].sort((a, b) => b.elevM - a.elevM)[0];
	const q = quadrantHighs(grid, site.r, site.c);
	const highs = Object.entries(q).sort((a, b) => b[1] - a[1]);
	const sourceDrop = Math.max(0, ext.max - siteElev);
	const twoHigh = highs.filter(([, z]) => z - siteElev > Math.max(6, relief * .25)).length >= 2;
	const outletPts = traceDown(grid, dir, site.r, site.c);
	const sourcePts = traceDown(grid, dir, ext.maxR, ext.maxC);
	const bypassLeft = [
		destination(center, (aspectDeg + 70) % 360, extentM * .45),
		destination(center, (aspectDeg + 20) % 360, extentM * .9),
		destination(center, aspectDeg, extentM * 1.4)
	];
	const sourceLabel = aspectLabel(Math.atan2(grid.lngs[ext.maxC] - center.lng, grid.lats[ext.maxR] - center.lat) * 180 / Math.PI);
	const outletLabel = aspectLabel(aspectDeg);
	const n = grid.n;
	let closed = 0;
	let checked = 0;
	for (const [dr, dc] of [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1]
	]) {
		const rr = site.r + dr;
		const cc = site.c + dc;
		if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
		checked++;
		if (grid.z[rr][cc] >= siteElev - .4) closed++;
	}
	const isDepression = checked ? closed / checked : 0;
	let maxNeighborSlope = slopePct;
	for (let r = 1; r < n - 1; r++) for (let c = 1; c < n - 1; c++) maxNeighborSlope = Math.max(maxNeighborSlope, hornSlope(grid, r, c).slopePct);
	const flowPaths = [
		{
			id: "inflow",
			name: "高位来水",
			tone: "inflow",
			description: `近场最高点约 ${round(ext.max, 0)} 米，位于场地${sourceLabel}侧，径流沿坡面向场地汇集，是对围护冲击最大的客水。`,
			points: sourcePts.slice(0, 10)
		},
		{
			id: "lateral",
			name: `${{
				N: "北",
				E: "东",
				S: "南",
				W: "西"
			}[highs[1]?.[0] ?? ""] ?? "侧"}向汇水`,
			tone: "lateral",
			description: twoHigh ? `次高象限亦明显高于场地，客水在转角处易集中。` : `侧向来水弱于主坡向，但仍会沿硬化边沟汇入最低口。`,
			points: [
				destination(center, (aspectDeg + 135) % 360, extentM * 1.2),
				destination(center, (aspectDeg + 90) % 360, extentM * .4),
				{
					lat: lowestV.lat,
					lng: lowestV.lng
				}
			]
		},
		{
			id: "bypass",
			name: "沿场地绕流",
			tone: "bypass",
			description: "高位墙段拦水后，水流沿两侧通道向下游绕行，不翻墙则从侧向排泄。",
			points: bypassLeft
		},
		{
			id: "outlet",
			name: "最低口出水",
			tone: "outlet",
			description: `${lowestV.id}（${lowestV.role}）约 ${round(lowestV.elevM, 0)} 米，为围合最低点，是天然出水口。`,
			points: outletPts.length > 1 ? outletPts : [{
				lat: lowestV.lat,
				lng: lowestV.lng
			}, destination({
				lat: lowestV.lat,
				lng: lowestV.lng
			}, aspectDeg, extentM * 1.6)]
		}
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
		dischargeRatio: opts.dischargeRatio
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
		isDepression: isDepression > .74,
		areaM2: round(areaM2, 0),
		vertices,
		grid: {
			n: grid.n,
			spacingM: grid.spacingM,
			lats: grid.lats.map((v) => round(v, 6)),
			lngs: grid.lngs.map((v) => round(v, 6)),
			z: grid.z.map((row) => row.map((v) => round(v, 1)))
		},
		flowPaths,
		transect,
		waters,
		risks,
		overallLevel: worstLevel(risks.map((r) => r.level))
	};
}
function enrichWaters(waters, grid) {
	return waters.map((w) => {
		const inside = w.lat <= grid.lats[0] && w.lat >= grid.lats[grid.n - 1] && w.lng >= grid.lngs[0] && w.lng <= grid.lngs[grid.n - 1];
		return {
			...w,
			elevM: w.elevM ?? (inside ? round(bilinear(grid, w.lat, w.lng), 0) : null)
		};
	}).sort((a, b) => a.distM - b.distM);
}
var UA = "Yukan/1.0 (site reconnaissance; rain-sight hydrology)";
async function fetchJson(url, init = {}) {
	const { timeoutMs = 1e4, headers, ...rest } = init;
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const res = await fetch(url, {
			...rest,
			signal: ctrl.signal,
			headers: {
				"User-Agent": UA,
				Accept: "application/json",
				...headers
			}
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.json();
	} finally {
		clearTimeout(t);
	}
}
async function fetchFirstJson(urls, init = {}) {
	let last;
	for (const url of urls) try {
		return await fetchJson(url, init);
	} catch (err) {
		last = err;
	}
	throw last instanceof Error ? last : /* @__PURE__ */ new Error("all endpoints failed");
}
async function reverseGeocode(lat, lng) {
	const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1&accept-language=zh-CN,zh,en`;
	try {
		const json = await fetchJson(url, { timeoutMs: 8e3 });
		const a = json.address ?? {};
		return {
			displayName: json.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
			road: a.road ?? a.pedestrian ?? a.footway ?? null,
			suburb: a.suburb ?? a.neighbourhood ?? a.quarter ?? a.village ?? null,
			city: a.city ?? a.town ?? a.county ?? null,
			district: a.district ?? a.city_district ?? a.county ?? null,
			state: a.state ?? a.province ?? null,
			country: a.country ?? null,
			countryCode: a.country_code ?? null
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
			countryCode: null
		};
	}
}
async function searchNominatim(q) {
	const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1&accept-language=zh-CN,zh,en`;
	try {
		const json = await fetchJson(url, { timeoutMs: 8e3 });
		if (json.length) return json.map((r) => ({
			lat: Number(r.lat),
			lng: Number(r.lon),
			label: r.display_name,
			kind: r.type ?? r.class ?? "place"
		}));
	} catch {}
	return ((await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=zh&format=json`, { timeoutMs: 7e3 })).results ?? []).map((r) => ({
		lat: r.latitude,
		lng: r.longitude,
		label: [
			r.name,
			r.admin1,
			r.country
		].filter(Boolean).join(" · "),
		kind: "place"
	}));
}
var elevCache = /* @__PURE__ */ new Map();
async function fetchElevations(points) {
	const chunk = points.slice(0, 100);
	const cacheKey = chunk.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join("|");
	const hit = elevCache.get(cacheKey);
	if (hit && Date.now() - hit.at < 18e5) return hit.data;
	const loc = chunk.map((p) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join("|");
	const remember = (data) => {
		elevCache.set(cacheKey, {
			at: Date.now(),
			data
		});
		return data;
	};
	try {
		const json = await fetchJson(`https://api.open-meteo.com/v1/elevation?latitude=${chunk.map((p) => p.lat.toFixed(6)).join(",")}&longitude=${chunk.map((p) => p.lng.toFixed(6)).join(",")}`, { timeoutMs: 8e3 });
		if (json.elevation?.length === chunk.length) return remember(chunk.map((p, i) => ({
			lat: p.lat,
			lng: p.lng,
			elev: finite(json.elevation[i], 0)
		})));
	} catch {}
	try {
		const json = await fetchJson(`https://api.opentopodata.org/v1/mapzen?locations=${loc}`, { timeoutMs: 12e3 });
		if (json.results?.length) return remember(json.results.map((r, i) => ({
			lat: r.location?.lat ?? chunk[i].lat,
			lng: r.location?.lng ?? chunk[i].lng,
			elev: finite(r.elevation ?? 0, 0)
		})));
	} catch {}
	return remember(((await fetchJson("https://api.open-elevation.com/api/v1/lookup", {
		method: "POST",
		timeoutMs: 1e4,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ locations: chunk.map((p) => ({
			latitude: p.lat,
			longitude: p.lng
		})) })
	})).results ?? []).map((r) => ({
		lat: r.latitude,
		lng: r.longitude,
		elev: finite(r.elevation, 0)
	})));
}
async function fetchOpenMeteoWeather(lat, lng) {
	return fetchJson(`https://api.open-meteo.com/v1/forecast?${new URLSearchParams({
		latitude: String(lat),
		longitude: String(lng),
		current: "temperature_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,relative_humidity_2m",
		daily: "precipitation_sum,rain_sum,precipitation_probability_max,temperature_2m_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,weather_code",
		timezone: "auto",
		forecast_days: "7",
		past_days: "3",
		wind_speed_unit: "ms"
	})}`, { timeoutMs: 8e3 });
}
async function fetchOpenMeteoArchive(lat, lng) {
	const end = /* @__PURE__ */ new Date();
	end.setUTCDate(end.getUTCDate() - 1);
	const start = new Date(end);
	start.setUTCFullYear(start.getUTCFullYear() - 1);
	const iso = (d) => d.toISOString().slice(0, 10);
	return fetchJson(`https://archive-api.open-meteo.com/v1/archive?${new URLSearchParams({
		latitude: String(lat),
		longitude: String(lng),
		start_date: iso(start),
		end_date: iso(end),
		daily: "wind_speed_10m_max,wind_gusts_10m_max",
		wind_speed_unit: "ms",
		timezone: "auto"
	})}`, { timeoutMs: 12e3 });
}
async function fetchMetNo(lat, lng) {
	return fetchJson(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`, { timeoutMs: 8e3 });
}
async function fetchDischarge(lat, lng) {
	return fetchJson(`https://flood-api.open-meteo.com/v1/flood?${new URLSearchParams({
		latitude: String(lat),
		longitude: String(lng),
		daily: "river_discharge,river_discharge_mean,river_discharge_max",
		forecast_days: "7"
	})}`, { timeoutMs: 8e3 });
}
async function fetchRiversNominatim(center) {
	const d = .03;
	const viewbox = `${center.lng - d},${center.lat + d},${center.lng + d},${center.lat - d}`;
	const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent("river")}&viewbox=${viewbox}&bounded=1&limit=6&accept-language=zh-CN,zh,en`;
	try {
		return (await fetchJson(url, { timeoutMs: 8e3 })).map((r) => {
			const lat = Number(r.lat);
			const lng = Number(r.lon);
			return {
				name: r.name || r.display_name.split(",")[0] || "河道",
				kind: r.type ?? "river",
				lat,
				lng,
				distM: round(haversine(center, {
					lat,
					lng
				}), 0),
				elevM: null
			};
		});
	} catch {
		return [];
	}
}
async function fetchOverpassHabitat(center) {
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
	let json = {};
	try {
		json = await fetchFirstJson(["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"], {
			method: "POST",
			timeoutMs: 14e3,
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body
		});
	} catch {
		return {
			waters: [],
			birds: []
		};
	}
	const waters = [];
	const birds = [];
	const seenW = /* @__PURE__ */ new Set();
	const seenB = /* @__PURE__ */ new Set();
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
				distM: round(haversine(center, {
					lat,
					lng
				}), 0),
				elevM: null
			});
		}
		if (isBirdish(el.tags) && !seenB.has(key)) {
			seenB.add(key);
			birds.push({
				name,
				kind: kindFromTags(el.tags),
				lat,
				lng,
				distKm: round(haversine(center, {
					lat,
					lng
				}) / 1e3, 2),
				species: el.tags?.natural === "wetland" ? "水鸟/鹭类（湿地指示）" : "保护区/观鸟点记录",
				source: "OpenStreetMap Overpass"
			});
		}
	}
	waters.sort((a, b) => a.distM - b.distM);
	birds.sort((a, b) => a.distKm - b.distKm);
	return {
		waters: waters.slice(0, 8),
		birds: birds.slice(0, 8)
	};
}
var GRID_N = 9;
var GRID_SPACING = 70;
var searchPlaces_createServerFn_handler = createServerRpc({
	id: "0ec888036e6438fc5ff558885b55a2f61ca8d7304938a850fce03aec9c095e29",
	name: "searchPlaces",
	filename: "src/lib/analysis/server.ts"
}, (opts) => searchPlaces.__executeServer(opts));
var searchPlaces = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(searchPlaces_createServerFn_handler, async ({ data, context }) => {
	const gate = await assertMember(context.userId);
	if (!gate.ok) return {
		...gate,
		items: []
	};
	const q = data.q.trim();
	if (q.length < 2) return {
		ok: true,
		items: []
	};
	const coord = parseCoordinate(q);
	if (coord) return {
		ok: true,
		items: [{
			lat: coord.lat,
			lng: coord.lng,
			label: `${coord.lat.toFixed(5)}, ${coord.lng.toFixed(5)}`,
			kind: "coordinate"
		}]
	};
	try {
		return {
			ok: true,
			items: await searchNominatim(q)
		};
	} catch {
		return {
			ok: false,
			error: "地点检索暂时不可用",
			items: []
		};
	}
});
var probeSite_createServerFn_handler = createServerRpc({
	id: "a3c6f6ea3b4ec7e4b72283e4074cab2639ca5bd8009739f60f174d52326a6213",
	name: "probeSite",
	filename: "src/lib/analysis/server.ts"
}, (opts) => probeSite.__executeServer(opts));
var probeSite = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(probeSite_createServerFn_handler, async ({ data, context }) => {
	const gate = await assertMember(context.userId);
	if (!gate.ok) return gate;
	const lat = Number(data.lat);
	const lng = Number(data.lng);
	if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return {
		ok: false,
		error: "坐标无效"
	};
	const extentM = Math.min(180, Math.max(36, Number(data.extentM) || 70));
	const factors = normalizeFactors(data.factors);
	const wantRain = hasFactor(factors, "rain");
	const wantWind = hasFactor(factors, "wind");
	const wantBirds = hasFactor(factors, "birds");
	const wantWeather = wantRain || wantWind;
	const wantWaters = wantRain || wantBirds;
	const center = {
		lat,
		lng
	};
	const sample = matchSample(lat, lng);
	const vertices = data.vertices?.length ? data.vertices : sample?.vertices;
	const pts = sampleGridPoints(center, GRID_N, GRID_SPACING);
	const skip = Promise.resolve(null);
	const [placeRes, elevRes, weatherOm, weatherMet, floodRes, archiveRes, habitatRes] = await Promise.allSettled([
		reverseGeocode(lat, lng),
		fetchElevations(pts),
		wantWeather ? fetchOpenMeteoWeather(lat, lng) : skip,
		wantWeather ? fetchMetNo(lat, lng) : skip,
		wantRain ? fetchDischarge(lat, lng) : skip,
		wantWind ? fetchOpenMeteoArchive(lat, lng) : skip,
		wantWaters ? fetchOverpassHabitat(center) : skip
	]);
	if (elevRes.status !== "fulfilled" || !elevRes.value.length) return {
		ok: false,
		error: "高程采样失败，请稍后重试"
	};
	const grid = buildGrid(center, elevRes.value, GRID_N, GRID_SPACING);
	let watersRaw = [];
	let osmBirds = [];
	if (wantWaters && habitatRes.status === "fulfilled" && habitatRes.value) {
		watersRaw = habitatRes.value.waters;
		osmBirds = wantBirds ? habitatRes.value.birds : [];
	}
	if (wantRain && !watersRaw.length) try {
		watersRaw = await fetchRiversNominatim(center);
	} catch {
		watersRaw = [];
	}
	const waters = enrichWaters(watersRaw, grid);
	let weather = emptyWeather();
	if (wantWeather && weatherOm.status === "fulfilled" && weatherOm.value && !weatherOm.value.error) try {
		weather = parseOpenMeteo(weatherOm.value);
	} catch {
		weather = emptyWeather();
	}
	if (wantWeather && (weather.source === "unavailable" || weather.days.length === 0) && weatherMet.status === "fulfilled" && weatherMet.value) try {
		weather = parseMetNo(weatherMet.value);
	} catch {}
	const discharge = wantRain && floodRes.status === "fulfilled" && floodRes.value ? parseDischarge(floodRes.value) : {
		available: false,
		meanM3s: null,
		nextMaxM3s: null,
		ratio: null
	};
	let hist = emptyWindHistory();
	if (wantWind && archiveRes.status === "fulfilled" && archiveRes.value?.daily) hist = summarizeWindHistory(archiveRes.value.daily);
	else if (wantWind) {
		const past = weather.days.filter((d) => d.date < (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
		if (past.length) hist = summarizeWindHistory({
			time: past.map((d) => d.date),
			wind_speed_10m_max: past.map((d) => d.windMs),
			wind_gusts_10m_max: past.map((d) => d.windGustMs)
		}, "预报回看（档案未取到）");
	}
	const downhillRoad = Boolean(placeRes.status === "fulfilled" && placeRes.value.road);
	const terrain = analyzeTerrain({
		center,
		extentM,
		grid,
		verticesIn: vertices,
		waters,
		weatherWettest: wantRain ? weather.wettestDayMm : 0,
		weatherNext7: wantRain ? weather.next7dMm : 0,
		dischargeRatio: wantRain ? discharge.ratio : null,
		downhillRoad
	});
	const place = placeRes.status === "fulfilled" ? placeRes.value : {
		displayName: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
		road: null,
		suburb: null,
		city: null,
		district: null,
		state: null,
		country: null,
		countryCode: null
	};
	const wind = wantWind ? assessWind({
		place,
		lat,
		lng,
		weather,
		hist,
		slopePct: terrain.slopePct,
		reliefM: terrain.reliefM
	}) : emptyWind();
	const birds = wantBirds ? assessBirds({
		center,
		osmSites: osmBirds,
		waters
	}) : emptyBird();
	const risks = [
		...wantRain ? terrain.risks : [],
		...wantWind ? [windRiskRow(wind)] : [],
		...wantBirds ? [birdRiskRow(birds)] : []
	];
	const overallLevel = risks.length ? worstLevel(risks.map((r) => r.level)) : "low";
	const sources = [
		{
			item: "位置",
			note: "OSM Nominatim / Open-Meteo 地理编码（服务器侧请求，不依赖终端访问谷歌）"
		},
		{
			item: "卫星底图",
			note: "中国大陆默认高德卫星（GCJ-02），海外可切 OSM；分析坐标一律 WGS-84"
		},
		{
			item: "高程",
			note: "Open-Meteo Elevation / OpenTopoData Mapzen，约 30 米；院落相对高差可信，绝对高程约 ±10 米"
		},
		{
			item: "因子",
			note: factors.length ? factors.map((id) => ({
				rain: "强降雨",
				wind: "强风",
				birds: "大型鸟类"
			})[id]).join("、") : "仅场地高程定位"
		}
	];
	if (wantRain) sources.push({
		item: "水系",
		note: "OSM Overpass 近场河道与水体；失败时回退 Nominatim"
	}, {
		item: "天气",
		note: weather.source
	}, {
		item: "河道流量",
		note: discharge.available ? "GloFAS / Open-Meteo Flood" : "本点无 GloFAS 网格"
	});
	if (wantWind) sources.push({
		item: "风速",
		note: `${wind.source} 10 m 风速（m/s）；历史 ${hist.source}；设计值摘自 GB 50009-2012 基本风压公开表`
	});
	if (wantBirds) sources.push({
		item: "鸟类栖息地",
		note: "公开湿地/保护区名录 + OSM 湿地、自然保护区、观鸟点；指示种为名录记载，非实时观测"
	});
	const probe = {
		...terrain,
		factors,
		overallLevel,
		place,
		weather,
		wind,
		birds,
		discharge,
		risks,
		analyzedAt: (/* @__PURE__ */ new Date()).toISOString(),
		sources
	};
	await logRun(context.userId, lat, lng, place.displayName).catch(() => void 0);
	return {
		ok: true,
		probe
	};
});
var composeReport_createServerFn_handler = createServerRpc({
	id: "bd3fef778a493450a83729ac56ca4aa268288b5573f33cfb99432a1b4e4df97d",
	name: "composeReport",
	filename: "src/lib/analysis/server.ts"
}, (opts) => composeReport.__executeServer(opts));
var composeReport = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(composeReport_createServerFn_handler, async ({ data, context }) => {
	const gate = await assertMember(context.userId);
	const fallback = fallbackReport(data.probe);
	if (!gate.ok) return {
		ok: false,
		error: gate.error,
		report: fallback
	};
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: true,
		report: fallback
	};
	const compact = compactForModel(data.probe);
	const factors = normalizeFactors(data.probe.factors);
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 14e3);
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			signal: ctrl.signal,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				temperature: .3,
				max_tokens: 1800,
				messages: [{
					role: "system",
					content: "你是水文地貌、抗风与遥感应急研判专家。根据给定的实测网格数据，用汉语写一份卫星分析报告的叙述段落。文风像专业交办件：克制、具体、带数字，不抒情，不用表情符号，不编造官方地灾点名单或未提供的管网口径。风险等级已经算好，不要改等级，只写叙述。只返回 JSON。未勾选的影响因子对应字段填空字符串，不要编造该因子内容。"
				}, {
					role: "user",
					content: `本次标题建议：${factorTitle(factors)}。已勾选因子：${factors.join(",") || "无（仅场地高程）"}。
请根据数据填写 JSON，字段：
locationTitle, positioning, terrainJudgement, flowLead, watershed, keyConclusion, basin, weatherNarrative, windNarrative, birdNarrative, geoHazard, conclusion, recommendations (string[6-8]), limitations。
每段 80–180 字。勾选了 wind 时风段落必须对照设计基本风速与来风/历史风速是否临近或超过。勾选了 birds 时写栖息地距离与围护修正。未勾选 rain 则 weatherNarrative 留空；未勾选 wind 则 windNarrative 留空；未勾选 birds 则 birdNarrative 留空。数据：\n${JSON.stringify(compact)}`
				}]
			})
		});
		if (!res.ok) return {
			ok: true,
			report: fallback
		};
		const jsonText = ((await res.json()).choices?.[0]?.message?.content ?? "").replace(/^```json\s*|\s*```$/g, "").trim();
		const parsed = JSON.parse(jsonText);
		const recs = Array.isArray(parsed.recommendations) ? parsed.recommendations.map(String).filter(Boolean).slice(0, 8) : fallback.recommendations;
		const wantRain = hasFactor(factors, "rain");
		const wantWind = hasFactor(factors, "wind");
		const wantBirds = hasFactor(factors, "birds");
		return {
			ok: true,
			report: {
				...fallback,
				locationTitle: parsed.locationTitle || fallback.locationTitle,
				positioning: parsed.positioning || fallback.positioning,
				terrainJudgement: parsed.terrainJudgement || fallback.terrainJudgement,
				flowLead: parsed.flowLead || fallback.flowLead,
				watershed: parsed.watershed || fallback.watershed,
				keyConclusion: parsed.keyConclusion || fallback.keyConclusion,
				basin: parsed.basin || fallback.basin,
				weatherNarrative: wantRain ? parsed.weatherNarrative || fallback.weatherNarrative : "",
				windNarrative: wantWind ? parsed.windNarrative || fallback.windNarrative : "",
				birdNarrative: wantBirds ? parsed.birdNarrative || fallback.birdNarrative : "",
				geoHazard: parsed.geoHazard || fallback.geoHazard,
				conclusion: parsed.conclusion || fallback.conclusion,
				recommendations: recs.length ? recs : fallback.recommendations,
				limitations: parsed.limitations || fallback.limitations,
				ai: true
			}
		};
	} catch {
		return {
			ok: true,
			report: fallback
		};
	} finally {
		clearTimeout(timer);
	}
});
//#endregion
export { composeReport_createServerFn_handler, probeSite_createServerFn_handler, searchPlaces_createServerFn_handler };
