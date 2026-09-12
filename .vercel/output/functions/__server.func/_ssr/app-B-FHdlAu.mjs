import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, _ as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { a as emptyMembership, i as authMiddleware } from "./membership-H9HTzc88.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { a as cn, c as getMembership, d as round, n as LEVEL_ZH, p as zhDateTime, t as LEVEL_TONE } from "./membership-server-D3uGxw8t.mjs";
import { _ as Clock3, f as MapPin, l as Search, p as FileUp, r as Upload, t as X, u as Printer } from "../_libs/lucide-react.mjs";
import { a as MemberChip, l as UserButton, n as BrandMark, r as Button, s as RedirectToSignIn, t as AdminLink, u as useGatedUser } from "./site-nav-BJ1Cy6a8.mjs";
import { E as parseCoordinate, S as matchSample, T as normalizeFactors, _ as hasFactor, d as emptyBird, f as emptyWeather, g as fallbackReport, n as FACTOR_OPTIONS, p as emptyWind, r as SAMPLE_SITES, t as DEFAULT_FACTORS } from "./samples-B88m3320.mjs";
import { t as Input } from "./input-C5_XJQtv.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-B-FHdlAu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PI = Math.PI;
var A = 6378245;
var EE = .006693421622965943;
/** Rough mainland + 港澳台 bounding box used by the GCJ-02 offset. */
function inGcjBounds(lat, lng) {
	return lng >= 72.004 && lng <= 137.8347 && lat >= .8293 && lat <= 55.8271;
}
function transformLat(lng, lat) {
	let ret = -100 + 2 * lng + 3 * lat + .2 * lat * lat + .1 * lng * lat + .2 * Math.sqrt(Math.abs(lng));
	ret += (20 * Math.sin(6 * lng * PI) + 20 * Math.sin(2 * lng * PI)) * 2 / 3;
	ret += (20 * Math.sin(lat * PI) + 40 * Math.sin(lat / 3 * PI)) * 2 / 3;
	ret += (160 * Math.sin(lat / 12 * PI) + 320 * Math.sin(lat * PI / 30)) * 2 / 3;
	return ret;
}
function transformLng(lng, lat) {
	let ret = 300 + lng + 2 * lat + .1 * lng * lng + .1 * lng * lat + .1 * Math.sqrt(Math.abs(lng));
	ret += (20 * Math.sin(6 * lng * PI) + 20 * Math.sin(2 * lng * PI)) * 2 / 3;
	ret += (20 * Math.sin(lng * PI) + 40 * Math.sin(lng / 3 * PI)) * 2 / 3;
	ret += (150 * Math.sin(lng / 12 * PI) + 300 * Math.sin(lng / 30 * PI)) * 2 / 3;
	return ret;
}
/** WGS-84 → GCJ-02 (高德 / 国测局). Identity outside the offset box. */
function wgs84ToGcj02(lat, lng) {
	if (!inGcjBounds(lat, lng)) return {
		lat,
		lng
	};
	const dLat = transformLat(lng - 105, lat - 35);
	const dLng = transformLng(lng - 105, lat - 35);
	const radLat = lat / 180 * PI;
	let magic = Math.sin(radLat);
	magic = 1 - EE * magic * magic;
	const sqrtMagic = Math.sqrt(magic);
	return {
		lat: lat + dLat * 180 / (A * .9933065783770341 / (magic * sqrtMagic) * PI),
		lng: lng + dLng * 180 / (A / sqrtMagic * Math.cos(radLat) * PI)
	};
}
/** Approximate inverse of GCJ-02 → WGS-84. */
function gcj02ToWgs84(lat, lng) {
	if (!inGcjBounds(lat, lng)) return {
		lat,
		lng
	};
	const g = wgs84ToGcj02(lat, lng);
	return {
		lat: lat * 2 - g.lat,
		lng: lng * 2 - g.lng
	};
}
function latLngToTile(lat, lng, z) {
	const n = 2 ** z;
	const x = Math.floor((lng + 180) / 360 * n);
	const latRad = lat * PI / 180;
	return {
		x,
		y: Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / PI) / 2 * n),
		z
	};
}
function gaodeSatUrl(x, y, z) {
	return `https://webst0${Math.abs(x) % 4 + 1}.is.autonavi.com/appmaptile?style=6&x=${x}&y=${y}&z=${z}`;
}
var GAODE_SAT = "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}";
var GAODE_VEC = "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}";
var OSM_TILE = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
var searchPlaces = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(createSsrRpc("0ec888036e6438fc5ff558885b55a2f61ca8d7304938a850fce03aec9c095e29"));
var probeSite = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(createSsrRpc("a3c6f6ea3b4ec7e4b72283e4074cab2639ca5bd8009739f60f174d52326a6213"));
var composeReport = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(createSsrRpc("bd3fef778a493450a83729ac56ca4aa268288b5573f33cfb99432a1b4e4df97d"));
var HISTORY_KEY = "rainsight-history-v1";
function padProbe(probe) {
	const weather = probe.weather ?? emptyWeather();
	return {
		...probe,
		factors: normalizeFactors(probe.factors),
		weather: {
			...emptyWeather(),
			...weather,
			windGustMs: weather.windGustMs ?? null,
			windDirDeg: weather.windDirDeg ?? null,
			days: (weather.days ?? []).map((d) => ({
				...d,
				windGustMs: d.windGustMs ?? null,
				windDirDeg: d.windDirDeg ?? null
			}))
		},
		wind: probe.wind ?? emptyWind(),
		birds: probe.birds ?? emptyBird()
	};
}
function padReport(report, probe) {
	const fb = fallbackReport(probe);
	return {
		...fb,
		...report,
		windNarrative: report.windNarrative || fb.windNarrative,
		birdNarrative: report.birdNarrative || fb.birdNarrative
	};
}
function loadHistory() {
	try {
		const raw = localStorage.getItem(HISTORY_KEY);
		if (!raw) return [];
		return JSON.parse(raw).map((it) => {
			const probe = padProbe(it.probe);
			return {
				...it,
				probe,
				report: padReport(it.report, probe)
			};
		});
	} catch {
		return [];
	}
}
function saveHistory(items) {
	try {
		localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 40)));
	} catch {}
}
var useApp = create((set, get) => ({
	pin: null,
	extentM: 72,
	query: "",
	factors: [...DEFAULT_FACTORS],
	stage: "idle",
	stageLabel: "",
	probe: null,
	report: null,
	error: null,
	history: [],
	historyOpen: false,
	hydrated: false,
	mapPick: false,
	corridor: [],
	corridorIndex: 0,
	corridorTitle: "",
	corridorResults: {},
	batching: false,
	setQuery: (q) => set({ query: q }),
	setExtent: (m) => set({ extentM: m }),
	setMapPick: (on) => set({ mapPick: on }),
	toggleFactor: (id) => set((s) => ({ factors: s.factors.includes(id) ? s.factors.filter((f) => f !== id) : [...s.factors, id] })),
	hydrate: () => {
		if (get().hydrated) return;
		set({
			history: loadHistory(),
			hydrated: true
		});
	},
	pick: (lat, lng, opts) => {
		const prev = get().pin;
		const same = prev != null && Math.abs(prev.lat - lat) < 1e-7 && Math.abs(prev.lng - lng) < 1e-7;
		const sample = matchSample(lat, lng);
		const q = opts?.query ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
		set({
			pin: {
				lat,
				lng
			},
			query: q,
			extentM: sample?.extentM ?? get().extentM,
			error: null,
			...same ? {} : {
				probe: null,
				report: null,
				stage: "idle",
				stageLabel: ""
			}
		});
	},
	clear: () => set({
		probe: null,
		report: null,
		stage: "idle",
		stageLabel: "",
		error: null,
		mapPick: false
	}),
	toggleHistory: (open) => set((s) => ({ historyOpen: open ?? !s.historyOpen })),
	analyze: async (coords, opts) => {
		if (coords) get().pick(coords.lat, coords.lng, coords.query ? { query: coords.query } : void 0);
		const pin = coords ?? get().pin;
		const { extentM, factors } = get();
		if (!pin) {
			set({
				error: "请先输入经纬度，或在地图上选点",
				stage: "error"
			});
			return;
		}
		const sample = matchSample(pin.lat, pin.lng);
		set({
			stage: "probing",
			stageLabel: "逆地理编码 · 高程网格 · 勾选因子",
			error: null,
			probe: null,
			report: null,
			mapPick: false
		});
		try {
			const probed = await probeSite({ data: {
				lat: pin.lat,
				lng: pin.lng,
				extentM,
				factors,
				vertices: sample?.vertices
			} });
			if (!probed.ok) {
				set({
					stage: "error",
					error: probed.code === "membership" ? probed.error : probed.error || "研判失败，请重试",
					stageLabel: ""
				});
				return;
			}
			const draft = fallbackReport(probed.probe);
			const item = {
				id: `${Date.now()}`,
				savedAt: Date.now(),
				title: draft.title,
				locationTitle: draft.locationTitle,
				lat: pin.lat,
				lng: pin.lng,
				overallLevel: probed.probe.overallLevel,
				probe: probed.probe,
				report: draft
			};
			const history = [item, ...get().history.filter((h) => h.id !== item.id)].slice(0, 40);
			saveHistory(history);
			const corridorResults = { ...get().corridorResults };
			const tower = get().corridor[get().corridorIndex];
			if (tower && Math.abs(tower.lat - pin.lat) < 1e-5 && Math.abs(tower.lng - pin.lng) < 1e-5) corridorResults[tower.id] = {
				level: probed.probe.overallLevel,
				historyId: item.id
			};
			set({
				probe: probed.probe,
				report: draft,
				stage: "ready",
				stageLabel: "",
				history,
				corridorResults
			});
			if (opts?.skipAi) return;
			try {
				const composed = await composeReport({ data: { probe: probed.probe } });
				if (!composed.report.ai) return;
				const next = history.map((h) => h.id === item.id ? {
					...h,
					report: composed.report
				} : h);
				saveHistory(next);
				set({
					report: composed.report,
					history: next
				});
			} catch {}
		} catch (err) {
			set({
				stage: "error",
				error: failMessage(err),
				stageLabel: ""
			});
		}
	},
	loadSample: (site) => {
		set({
			pin: {
				lat: site.lat,
				lng: site.lng
			},
			query: site.name,
			extentM: site.extentM ?? 72,
			probe: null,
			report: null,
			error: null,
			stage: "idle",
			stageLabel: "",
			mapPick: false
		});
	},
	loadHistoryItem: (id) => {
		const item = get().history.find((h) => h.id === id);
		if (!item) return;
		const probe = padProbe(item.probe);
		set({
			pin: {
				lat: item.lat,
				lng: item.lng
			},
			query: item.locationTitle,
			probe,
			report: padReport(item.report, probe),
			stage: "ready",
			historyOpen: false,
			error: null,
			extentM: item.probe.extentM,
			factors: normalizeFactors(probe.factors)
		});
	},
	importTowers: (towers, title) => {
		if (!towers.length) return;
		const first = towers[0];
		set({
			corridor: towers,
			corridorIndex: 0,
			corridorTitle: title?.trim() || `线路 ${towers.length} 基`,
			corridorResults: {},
			pin: {
				lat: first.lat,
				lng: first.lng
			},
			query: first.name,
			probe: null,
			report: null,
			error: null,
			stage: "idle",
			stageLabel: "",
			batching: false
		});
	},
	selectTower: (index) => {
		const t = get().corridor[index];
		if (!t) return;
		set({ corridorIndex: index });
		get().pick(t.lat, t.lng, { query: t.name });
	},
	clearCorridor: () => set({
		corridor: [],
		corridorIndex: 0,
		corridorTitle: "",
		corridorResults: {},
		batching: false
	}),
	stopBatch: () => set({ batching: false }),
	analyzeCorridor: async () => {
		const list = get().corridor;
		if (!list.length) return;
		set({ batching: true });
		for (let i = get().corridorIndex; i < list.length; i++) {
			if (!get().batching) break;
			const t = list[i];
			set({ corridorIndex: i });
			await get().analyze({
				lat: t.lat,
				lng: t.lng,
				query: t.name
			}, { skipAi: true });
			if (get().stage === "error") break;
		}
		set({ batching: false });
	}
}));
function failMessage(err) {
	const rec = err;
	if (rec?.status === 401 || rec?.message === "Unauthorized") return "请先登录后再研判";
	if (err instanceof Error && err.message) return err.message;
	return "研判失败，请重试";
}
var FLOW_COLOR = {
	inflow: "#6ec4e8",
	lateral: "#8eb4d4",
	bypass: "#7ecb9a",
	outlet: "#e0a36a"
};
function displayOf(lat, lng, useGcj) {
	if (!useGcj || !inGcjBounds(lat, lng)) return {
		lat,
		lng
	};
	return wgs84ToGcj02(lat, lng);
}
function heatDataUrl(probe) {
	const { n, z } = probe.grid;
	const canvas = document.createElement("canvas");
	canvas.width = n;
	canvas.height = n;
	const ctx = canvas.getContext("2d");
	if (!ctx) return "";
	let min = Infinity;
	let max = -Infinity;
	for (const row of z) for (const v of row) {
		if (v < min) min = v;
		if (v > max) max = v;
	}
	const span = max - min || 1;
	for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
		const t = (z[r][c] - min) / span;
		ctx.fillStyle = `hsl(${168 - t * 70} ${32 + t * 18}% ${28 + t * 28} / 0.22)`;
		ctx.fillRect(c, r, 1, 1);
	}
	return canvas.toDataURL();
}
function MapView() {
	const hostRef = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const layersRef = (0, import_react.useRef)([]);
	const baseRef = (0, import_react.useRef)([]);
	const Lref = (0, import_react.useRef)(null);
	const useGcjRef = (0, import_react.useRef)(true);
	const corridorKeyRef = (0, import_react.useRef)("");
	const [base, setBase] = (0, import_react.useState)("gaode-sat");
	const pin = useApp((s) => s.pin);
	const probe = useApp((s) => s.probe);
	const pick = useApp((s) => s.pick);
	const mapPick = useApp((s) => s.mapPick);
	const stage = useApp((s) => s.stage);
	const corridor = useApp((s) => s.corridor);
	const corridorIndex = useApp((s) => s.corridorIndex);
	const interactive = mapPick || Boolean(probe) || corridor.length > 0 || stage === "probing" || stage === "composing";
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const host = hostRef.current;
		if (!host) return;
		(async () => {
			const L = await import("../_libs/leaflet.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
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
				boxZoom: false
			}).setView([origin.lat, origin.lng], 7);
			map.getContainer().tabIndex = -1;
			L.control.zoom({ position: "bottomright" }).addTo(map);
			L.control.scale({
				imperial: false,
				position: "bottomleft"
			}).addTo(map);
			map.on("click", (e) => {
				const state = useApp.getState();
				if (state.corridor.length) return;
				if (!state.mapPick && !state.probe) return;
				if (useGcjRef.current && inGcjBounds(e.latlng.lat, e.latlng.lng)) {
					const wgs = gcj02ToWgs84(e.latlng.lat, e.latlng.lng);
					pick(wgs.lat, wgs.lng);
				} else pick(e.latlng.lat, e.latlng.lng);
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
	(0, import_react.useEffect)(() => {
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
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!map) return;
		if (interactive) {
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
	(0, import_react.useEffect)(() => {
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
				return [p.lat, p.lng];
			});
			map.fitBounds(bounds, {
				padding: [40, 40],
				maxZoom: 16,
				animate: true
			});
			return;
		}
		if (mapPick || stage === "probing" || stage === "composing" || corridor.length) map.flyTo([d.lat, d.lng], Math.max(map.getZoom(), 15), { duration: .45 });
	}, [
		pin,
		probe,
		mapPick,
		stage,
		corridor,
		corridorIndex
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative z-0 isolate h-full min-h-0 w-full", !interactive && "pointer-events-none"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: hostRef,
			className: "h-full w-full"
		}), interactive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute top-3 right-3 z-20 hidden size-12 items-center justify-center rounded-full bg-bg/55 text-[10px] tracking-[0.18em] text-fg/80 ring-1 ring-fg/12 sm:flex",
			children: ["N", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-2 h-3 w-px bg-fg/70" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute right-14 bottom-8 z-20 flex gap-1 rounded-full bg-bg/72 p-1 text-[11px] ring-1 ring-fg/10 backdrop-blur-sm",
			children: [
				["gaode-sat", "卫星"],
				["gaode-vec", "地图"],
				["osm", "海外"]
			].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: cn("rounded-full px-2.5 py-1 text-muted transition-colors", base === id ? "bg-fg/12 text-fg" : "hover:text-fg"),
				onClick: () => setBase(id),
				children: label
			}, id))
		})] }) : null]
	});
}
function applyBase(L, map, id, baseRef, useGcjRef, onFallback) {
	for (const layer of baseRef.current) map.removeLayer(layer);
	baseRef.current = [];
	const add = (url, extra = {}) => {
		const layer = L.tileLayer(url, {
			maxZoom: 18,
			subdomains: "1234",
			...extra
		});
		layer.addTo(map);
		baseRef.current.push(layer);
		return layer;
	};
	if (id === "osm") {
		useGcjRef.current = false;
		add(OSM_TILE, {
			subdomains: "abc",
			attribution: "© OpenStreetMap"
		});
		return;
	}
	useGcjRef.current = true;
	if (id === "gaode-vec") add(GAODE_VEC, { attribution: "高德地图" });
	else {
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
				attribution: "© OpenStreetMap"
			});
			osm.addTo(map);
			baseRef.current.push(osm);
			onFallback();
		});
	}
}
function redraw(L, map, pin, probe, corridor, corridorIndex, layersRef, useGcj) {
	for (const layer of layersRef.current) map.removeLayer(layer);
	layersRef.current = [];
	const add = (layer) => {
		layer.addTo(map);
		layersRef.current.push(layer);
	};
	const ll = (lat, lng) => {
		const d = displayOf(lat, lng, useGcj);
		return [d.lat, d.lng];
	};
	if (corridor.length > 1) add(L.polyline(corridor.map((t) => ll(t.lat, t.lng)), {
		color: "#6fbfb2",
		weight: 3,
		opacity: .85
	}));
	for (let i = 0; i < corridor.length; i++) {
		const t = corridor[i];
		const on = i === corridorIndex;
		add(L.circleMarker(ll(t.lat, t.lng), {
			radius: on ? 7 : 5,
			color: on ? "#e7eeea" : "#6fbfb2",
			weight: on ? 2 : 1,
			fillColor: on ? "#6fbfb2" : "#0b100f",
			fillOpacity: on ? 1 : .85
		}).bindTooltip(`${t.name} · ${t.lat.toFixed(5)}, ${t.lng.toFixed(5)}`, {
			direction: "top",
			opacity: .95
		}).on("click", (e) => {
			L.DomEvent.stopPropagation(e);
			useApp.getState().selectTower(i);
		}));
	}
	const pinIcon = L.divIcon({
		className: "survey-pin",
		html: `<span class="survey-pin-ring"></span><span class="survey-pin-dot"></span>`,
		iconSize: [28, 28],
		iconAnchor: [14, 14]
	});
	add(L.marker(ll(pin.lat, pin.lng), {
		icon: pinIcon,
		interactive: false
	}));
	if (!probe) return;
	const sw = ll(probe.grid.lats[probe.grid.n - 1], probe.grid.lngs[0]);
	const ne = ll(probe.grid.lats[0], probe.grid.lngs[probe.grid.n - 1]);
	const url = heatDataUrl(probe);
	if (url) add(L.imageOverlay(url, L.latLngBounds(sw, ne), {
		opacity: 1,
		interactive: false
	}));
	const ring = probe.vertices.map((v) => ll(v.lat, v.lng));
	add(L.polygon(ring, {
		color: "#e7eeea",
		weight: 2,
		fillColor: "#6fbfb2",
		fillOpacity: .12,
		opacity: .95
	}));
	for (const v of probe.vertices) add(L.circleMarker(ll(v.lat, v.lng), {
		radius: 4,
		color: "#0b100f",
		weight: 1,
		fillColor: "#e7eeea",
		fillOpacity: 1
	}).bindTooltip(`${v.id} ${v.role} · ${Math.round(v.elevM)} m`, {
		direction: "top",
		opacity: .95
	}));
	for (const path of probe.flowPaths) {
		if (path.points.length < 2) continue;
		add(L.polyline(path.points.map((p) => ll(p.lat, p.lng)), {
			color: FLOW_COLOR[path.tone],
			weight: path.tone === "outlet" ? 3 : 2.25,
			opacity: .92,
			dashArray: path.tone === "bypass" ? "6 7" : void 0
		}));
	}
	for (const w of probe.waters.slice(0, 3)) add(L.circleMarker(ll(w.lat, w.lng), {
		radius: 5,
		color: "#6ec4e8",
		fillColor: "#6ec4e8",
		fillOpacity: .8,
		weight: 1
	}).bindTooltip(`${w.name} · ${Math.round(w.distM)} m`, { direction: "top" }));
	for (const b of (probe.birds?.sites ?? []).slice(0, 5)) {
		const icon = L.divIcon({
			className: "bird-mark",
			html: `<span class="bird-mark-dot"></span>`,
			iconSize: [16, 16],
			iconAnchor: [8, 8]
		});
		add(L.marker(ll(b.lat, b.lng), {
			icon,
			interactive: true
		}).bindTooltip(`${b.name} · ${b.distKm} km · ${b.species}`, { direction: "top" }));
	}
	const dir = probe.wind?.directionDeg;
	if (dir != null) {
		const toDeg = (dir + 180) % 360;
		const icon = L.divIcon({
			className: "wind-barb",
			html: `<span class="wind-barb-arrow" style="transform:rotate(${toDeg}deg)"></span>`,
			iconSize: [28, 28],
			iconAnchor: [14, 14]
		});
		add(L.marker(ll(pin.lat, pin.lng), {
			icon,
			interactive: false
		}));
	}
	map.fitBounds(L.latLngBounds(sw, ne).pad(.18), {
		animate: true,
		maxZoom: 18
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide", {
	variants: { tone: {
		low: "bg-risk-low/15 text-risk-low",
		mid: "bg-risk-mid/15 text-risk-mid",
		high: "bg-risk-high/15 text-risk-high",
		mute: "bg-fg/8 text-muted",
		primary: "bg-primary/15 text-primary"
	} },
	defaultVariants: { tone: "mute" }
});
function Badge({ className, tone, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ tone }), className),
		...props
	});
}
function TileFigure({ lat, lng, zoom, cap }) {
	const tiles = (0, import_react.useMemo)(() => {
		const g = wgs84ToGcj02(lat, lng);
		const t = latLngToTile(g.lat, g.lng, zoom);
		const cells = [];
		for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
			const x = t.x + dx;
			const y = t.y + dy;
			cells.push({
				x,
				y,
				src: gaodeSatUrl(x, y, zoom)
			});
		}
		return cells;
	}, [
		lat,
		lng,
		zoom
	]);
	const [failed, setFailed] = (0, import_react.useState)(0);
	if (failed >= 4) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex aspect-[16/9] items-center justify-center rounded-lg bg-ink/5 text-xs text-ink-muted",
			children: "卫星切片暂不可用，请看左侧交互底图"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
			className: "mt-1.5 text-[11px] text-ink-muted",
			children: cap
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid aspect-[1/1] grid-cols-3 overflow-hidden rounded-lg bg-ink/5 outline outline-1 -outline-offset-1 outline-ink/10 sm:aspect-[16/9] sm:grid-rows-3",
			children: tiles.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: c.src,
				alt: "",
				className: "h-full w-full object-cover",
				onError: () => setFailed((n) => n + 1)
			}, `${c.x}-${c.y}`))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
			className: "mt-1.5 text-[11px] text-ink-muted",
			children: cap
		})]
	});
}
function ReliefFigure({ probe, cap }) {
	const { n, z } = probe.grid;
	const w = 360;
	const h = 200;
	let min = Infinity;
	let max = -Infinity;
	for (const row of z) for (const v of row) {
		if (v < min) min = v;
		if (v > max) max = v;
	}
	const span = max - min || 1;
	const cells = [];
	const cw = w / n;
	const ch = h / n;
	for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
		const light = 32 + (z[r][c] - min) / span * 36;
		cells.push(`<rect x="${c * cw}" y="${r * ch}" width="${cw + .4}" height="${ch + .4}" fill="hsl(158 18% ${light}%)"/>`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: `0 0 ${w} ${h}`,
			className: "w-full rounded-lg outline outline-1 -outline-offset-1 outline-ink/10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { dangerouslySetInnerHTML: { __html: cells.join("") } })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figcaption", {
			className: "mt-1.5 text-[11px] text-ink-muted",
			children: [
				cap,
				"（",
				Math.round(min),
				"–",
				Math.round(max),
				" m）"
			]
		})]
	});
}
var SECTION = [
	"一",
	"二",
	"三",
	"四",
	"五",
	"六",
	"七",
	"八",
	"九"
];
function ReportPanel({ probe, report, composing, onClose }) {
	const wind = probe.wind ?? emptyWind();
	const birds = probe.birds ?? emptyBird();
	const factors = normalizeFactors(probe.factors);
	const wantRain = hasFactor(factors, "rain");
	const wantWind = hasFactor(factors, "wind");
	const wantBirds = hasFactor(factors, "birds");
	const corridor = useApp((s) => s.corridor);
	const corridorIndex = useApp((s) => s.corridorIndex);
	const corridorTitle = useApp((s) => s.corridorTitle);
	const tower = corridor.find((t) => Math.abs(t.lat - probe.lat) < 1e-4 && Math.abs(t.lng - probe.lng) < 1e-4);
	const towerIndex = tower ? corridor.indexOf(tower) : corridorIndex;
	let section = 0;
	const next = () => section++;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		id: "report-scroll",
		className: "report-paper flex h-full min-h-0 flex-col overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "no-print flex items-center justify-between gap-2 px-4 py-3 ring-1 ring-rule/80",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-sm text-ink",
					children: "研判书"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate font-mono text-[11px] text-ink-muted",
					children: report?.serial ?? "生成中"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "text-ink hover:bg-ink/6",
					onClick: () => window.print(),
					"aria-label": "打印",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "text-ink hover:bg-ink/6",
					onClick: onClose,
					"aria-label": "关闭",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.22em] text-ink-muted uppercase",
					children: "雨瞰 · 场地风险"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-2 text-2xl leading-snug text-balance text-ink",
					children: report?.title ?? "场地风险卫星分析报告"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-ink-muted text-pretty",
					children: report?.locationTitle ?? probe.place.displayName
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 font-mono text-[11px] text-ink-muted",
					children: [
						report?.date,
						" · ",
						probe.lat.toFixed(6),
						"°N ",
						probe.lng.toFixed(6),
						"°E"
					]
				}),
				tower ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 rounded-lg bg-ink/5 px-3 py-2 text-sm text-ink",
					children: [
						corridorTitle,
						" · 第 ",
						towerIndex + 1,
						" 基 ",
						tower.name,
						" / 共 ",
						corridor.length,
						" 基"
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "场地高程",
							value: `${Math.round(probe.siteElevM)} m`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "近场高差",
							value: `${Math.round(probe.reliefM)} m`
						}),
						wantWind ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "抗风",
							value: wind.status === "over" ? "超设计" : wind.status === "near" ? "临近" : "未超",
							level: wind.status === "over" ? "high" : wind.status === "near" ? "mid" : "low"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "勾选因子",
							value: factors.length ? `${factors.length} 项` : "仅高程"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "综合风险",
							value: LEVEL_ZH[probe.overallLevel],
							level: probe.overallLevel
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex flex-wrap gap-1.5",
					children: probe.risks.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						tone: LEVEL_TONE[r.level],
						children: [
							r.type,
							" ",
							LEVEL_ZH[r.level]
						]
					}, r.id))
				}),
				wantRain ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeatherStrip, { probe }) : null,
				wantWind ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindStrip, { wind }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ElevProfile, { probe }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					n: next(),
					title: "对象定位",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: report?.positioning }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: report?.terrainJudgement }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[28rem] text-left text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-rule text-ink-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "点号"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "经度"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "纬度"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "高程"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "相对位置"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: probe.vertices.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-rule/70",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 font-mono",
											children: v.id
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 font-mono",
											children: v.lng.toFixed(7)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 font-mono",
											children: v.lat.toFixed(7)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 font-mono",
											children: Math.round(v.elevM)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2",
											children: v.role
										})
									]
								}, v.id)) })]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					n: next(),
					title: "卫星详图：围合范围与近场雨水走向",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: report?.flowLead }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-3 space-y-2 text-sm leading-relaxed",
							children: probe.flowPaths.map((fp, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mt-1.5 size-2.5 shrink-0 rounded-full", fp.tone === "inflow" && "bg-flow-in", fp.tone === "lateral" && "bg-flow-side", fp.tone === "bypass" && "bg-flow-by", fp.tone === "outlet" && "bg-flow-out") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									className: "font-medium",
									children: [
										i + 1,
										". ",
										fp.name,
										"："
									]
								}), fp.description] })]
							}, fp.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-[11px] text-ink-muted",
							children: "图1 见左侧交互卫星图（黄白线为围合，青/绿/橙为径流示意，菱形为栖息地）。底图默认高德卫星，大陆可直接加载。"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					n: next(),
					title: "片区汇水",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: report?.watershed }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: report?.keyConclusion }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileFigure, {
							lat: probe.lat,
							lng: probe.lng,
							zoom: 16,
							cap: "图2  片区卫星（高德，GCJ-02 切片）"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					n: next(),
					title: "区位与流域：雨水最终去向",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: report?.basin }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileFigure, {
							lat: probe.lat,
							lng: probe.lng,
							zoom: 14,
							cap: "图3  区位与流域（高德卫星）"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReliefFigure, {
							probe,
							cap: "图4  近场高程网格"
						})
					]
				}),
				wantRain ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					n: next(),
					title: "强降雨影响研判",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-1 text-sm font-medium",
							children: "（一）近期天气背景"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: report?.weatherNarrative }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 text-sm font-medium",
							children: "（二）风险矩阵"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[32rem] text-left text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-rule text-ink-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "风险类型"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "等级"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "主要依据"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "可能后果"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: probe.risks.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-rule/70 align-top",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2.5",
											children: r.type
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												tone: LEVEL_TONE[r.level],
												children: LEVEL_ZH[r.level]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2.5 text-pretty",
											children: r.basis
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2.5 text-pretty",
											children: r.consequence
										})
									]
								}, r.id)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 text-sm font-medium",
							children: "（三）边坡与地灾线索"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: report?.geoHazard })
					]
				}) : null,
				wantWind ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					n: next(),
					title: "强风影响研判",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: report?.windNarrative }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[28rem] text-left text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-rule text-ink-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "项目"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "风速"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "相对设计"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-rule/70",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2",
												children: "来风（预报最大阵风 / 风速）"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2 font-mono",
												children: [wind.incomingGustMaxMs ?? wind.incomingMaxMs ?? "—", " m/s"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2",
												children: pct(wind.incomingRatio)
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-rule/70",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2",
												children: [
													"历史（近 ",
													wind.histDays || "—",
													" 日最大阵风）"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2 font-mono",
												children: [wind.histGustMaxMs ?? wind.histMaxMs ?? "—", " m/s"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2",
												children: pct(wind.histRatio)
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-rule/70",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2",
												children: "设计基本风速（10 m、10 min）"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2 font-mono",
												children: [wind.designV10, " m/s"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2",
												children: [
													"w0 = ",
													wind.designW0.toFixed(2),
													" kN/m²"
												]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-rule/70",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2",
												children: "设计阵风参考（×1.4）"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "py-2 font-mono",
												children: [wind.designGust, " m/s"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-2",
												children: wind.status === "over" ? "超过" : wind.status === "near" ? "临近" : "未超"
											})
										]
									})
								] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-[11px] text-ink-muted",
							children: [
								wind.designSource,
								"。",
								wind.terrainNote
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 text-sm font-medium",
							children: "修正方案（公开规范口径）"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed",
							children: wind.corrections.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: c }, c))
						})
					]
				}) : null,
				wantBirds ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					n: next(),
					title: "大型鸟类活动因子",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: report?.birdNarrative }),
						birds.sites.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[28rem] text-left text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-rule text-ink-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "栖息地"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "类型"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "距离"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "指示种 / 来源"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: birds.sites.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-rule/70",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2",
											children: s.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2",
											children: s.kind
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-2 font-mono",
											children: [s.distKm, " km"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-2 text-pretty",
											children: [s.species, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-ink-muted",
												children: [" · ", s.source]
											})]
										})
									]
								}, `${s.name}-${s.lat}`)) })]
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-ink-muted",
							children: "近场名录与 OSM 未检出湿地、保护区或观鸟点。"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 text-sm font-medium",
							children: "围护修正"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed",
							children: birds.corrections.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: c }, c))
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					n: next(),
					title: "结论与建议",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(P, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "font-medium",
							children: "综合结论："
						}), report?.conclusion] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm",
							children: "现场可优先落实以下措施："
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed",
							children: (report?.recommendations ?? []).map((rec) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: rec }, rec))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					n: next(),
					title: "数据来源与局限",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
								className: "w-full text-left text-xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: probe.sources.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-rule/70",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 pr-3 whitespace-nowrap font-medium",
										children: s.item
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 text-pretty text-ink-muted",
										children: s.note
									})]
								}, s.item)) })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: report?.limitations }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 text-xs text-ink-muted",
							children: [report?.ai ? "叙述由模型根据实测网格撰写，等级由算法给出。" : "叙述为规则模板，等级由算法给出。", "（分析完毕）"]
						})
					]
				}),
				composing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-sm text-ink-muted",
					children: "正在润色研判书正文…"
				}) : null
			]
		})]
	});
}
function pct(ratio) {
	if (ratio == null) return "—";
	return `${Math.round(ratio * 100)}%`;
}
function Section({ n, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "font-display text-lg text-ink",
			children: [
				SECTION[n],
				"、",
				title
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children
		})]
	});
}
function P({ children }) {
	if (!children) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "h-16 animate-pulse rounded-lg bg-ink/5" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm leading-relaxed text-pretty text-ink",
		children
	});
}
function Stat({ label, value, level }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-ink/4 px-3 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] text-ink-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("mt-0.5 font-display text-lg tabular-nums", level ? LEVEL_TONE[level] === "high" ? "text-risk-high" : LEVEL_TONE[level] === "mid" ? "text-risk-mid" : "text-risk-low" : "text-ink"),
			children: value
		})]
	});
}
function WeatherStrip({ probe }) {
	const days = probe.weather.days.slice(0, 8);
	const max = Math.max(8, ...days.map((d) => d.rainMm));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5 rounded-xl bg-ink/4 px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] tracking-wide text-ink-muted",
				children: ["降水 · ", probe.weather.source]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] text-ink-muted",
				children: [
					"未来累计 ",
					probe.weather.next7dMm,
					" mm"
				]
			})]
		}), days.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 flex h-16 items-end gap-1",
			children: days.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full max-w-6 rounded-t-sm bg-primary/80",
					style: { height: `${Math.max(4, d.rainMm / max * 48)}px` },
					title: `${d.date} ${d.rainMm} mm`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[9px] text-ink-muted",
					children: d.date.slice(5)
				})]
			}, d.date))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-ink-muted",
			children: "暂无逐日降水"
		})]
	});
}
function WindStrip({ wind }) {
	const design = Math.max(wind.designGust, 1);
	const incoming = wind.incomingGustMaxMs ?? wind.incomingMaxMs ?? 0;
	const hist = wind.histGustMaxMs ?? wind.histMaxMs ?? 0;
	const top = Math.max(design, incoming, hist, 1);
	const rows = [
		{
			label: "来风",
			v: incoming,
			cls: "bg-risk-mid"
		},
		{
			label: "历史",
			v: hist,
			cls: "bg-ink/45"
		},
		{
			label: "阵风设计",
			v: design,
			cls: "bg-primary"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 rounded-xl bg-ink/4 px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-ink-muted",
				children: "风速对照 · 10 m（m/s）"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-ink-muted",
				children: wind.status === "over" ? "超过设计值" : wind.status === "near" ? "临近设计值" : "未超设计值"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 space-y-1.5",
			children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-8 shrink-0 text-[11px] text-ink-muted",
						children: r.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1.5 min-w-0 flex-1 rounded-full bg-ink/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("h-1.5 rounded-full", r.cls),
							style: { width: `${Math.min(100, r.v / top * 100)}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-10 shrink-0 text-right font-mono text-[11px]",
						children: r.v ? r.v.toFixed(1) : "—"
					})
				]
			}, r.label))
		})]
	});
}
function ElevProfile({ probe }) {
	const t = probe.transect;
	if (t.length < 2) return null;
	const w = 320;
	const h = 72;
	const zs = t.map((p) => p.elevM);
	const min = Math.min(...zs);
	const max = Math.max(...zs);
	const span = max - min || 1;
	const pts = t.map((p, i) => {
		return `${i / (t.length - 1) * w},${62 - (p.elevM - min) / span * 50}`;
	});
	const area = `0,${h} ${pts.join(" ")} ${w},${h}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 rounded-xl bg-ink/4 px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-ink-muted",
				children: "沿坡向高程剖面（上坡 → 下坡）"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-[11px] text-ink-muted",
				children: [
					Math.round(min),
					"–",
					Math.round(max),
					" m"
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: `0 0 ${w} ${h}`,
			className: "mt-1 w-full",
			"aria-hidden": true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: area,
				className: "fill-primary/20"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
				points: pts.join(" "),
				fill: "none",
				className: "stroke-primary",
				strokeWidth: "1.6"
			})]
		})]
	});
}
function haversine(a, b) {
	const r = 6371e3;
	const rad = (d) => d * Math.PI / 180;
	const dφ = rad(b.lat - a.lat);
	const dλ = rad(b.lng - a.lng);
	const φ1 = rad(a.lat);
	const φ2 = rad(b.lat);
	const h = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
	return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
}
var TOWER_TEMPLATE = `杆塔号,纬度N,经度E
N1,26.26321,117.63890
N2,26.26510,117.64120
N3,26.26740,117.64380
N4,26.26980,117.64610
N5,26.27220,117.64870
`;
function stripBom(s) {
	return s.replace(/^\uFEFF/, "");
}
function expandDms(s) {
	return s.replace(/(-?\d+)\s*[°度]\s*(\d+)\s*[′'’分]\s*([\d.]+)\s*[″"”秒]?/g, (_, d, m, sec) => {
		const sign = Number(d) < 0 || String(d).startsWith("-") ? -1 : 1;
		const mag = Math.abs(Number(d)) + Number(m) / 60 + Number(sec) / 3600;
		return String(round(sign * mag, 7));
	});
}
function splitCells(line) {
	const t = line.trim();
	if (!t) return [];
	if (t.includes("	")) return t.split("	").map((c) => c.trim());
	if (/[,，;；]/.test(t)) return t.split(/[,，;；]/).map((c) => c.trim());
	return t.split(/\s+/).map((c) => c.trim()).filter(Boolean);
}
function looksHeader(cells) {
	const blob = cells.join(" ");
	if (!/纬|经|lat|lon|lng|塔|号|name|id|北|东|坐标/i.test(blob)) return false;
	return cells.every((c) => Number.isNaN(Number(c.replace(/[°NSEW南北东西]/gi, ""))));
}
function headerMap(cells) {
	let lat = -1;
	let lng = -1;
	let name = null;
	cells.forEach((c, i) => {
		const s = c.toLowerCase();
		if (lat < 0 && (/纬|lat|北纬|^y$/.test(s) || s === "n")) lat = i;
		else if (lng < 0 && (/经|lon|lng|东经|^x$/.test(s) || s === "e")) lng = i;
		else if (name == null && /塔|号|name|id|桩|编号|杆/.test(s)) name = i;
	});
	if (lat >= 0 && lng >= 0) return {
		lat,
		lng,
		name
	};
	return null;
}
function pairFromNumbers(nums) {
	if (nums.length < 2) return null;
	let a = nums[nums.length - 2];
	let b = nums[nums.length - 1];
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
	return {
		lat: round(lat, 7),
		lng: round(lng, 7)
	};
}
function nameFromLine(line, fallback) {
	return line.replace(/-?\d+(?:\.\d+)?/g, " ").replace(/[,，;；\t]/g, " ").replace(/[°度′'’分″"”秒NSEW南北东西]/gi, " ").replace(/\s+/g, " ").trim() || fallback;
}
function xmlTag(block, tag) {
	return block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"))?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() ?? "";
}
function coordPairsFromText(raw) {
	const out = [];
	const tokens = raw.trim().split(/[\s\n]+/).filter(Boolean);
	for (const token of tokens) {
		const parts = token.split(",").map(Number);
		if (parts.length < 2) continue;
		const lng = parts[0];
		const lat = parts[1];
		if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
		if (Math.abs(lat) > 90 || Math.abs(lng) > 180) continue;
		out.push({
			lat: round(lat, 7),
			lng: round(lng, 7)
		});
	}
	return out;
}
function uniqueTowers(list) {
	const seenCoord = /* @__PURE__ */ new Set();
	const seenId = /* @__PURE__ */ new Set();
	const towers = [];
	for (const t of list) {
		if (towers.length >= 200) break;
		const key = `${round(t.lat, 6)},${round(t.lng, 6)}`;
		if (seenCoord.has(key)) continue;
		seenCoord.add(key);
		const name = t.name.slice(0, 40) || `N${towers.length + 1}`;
		let id = t.id.slice(0, 40) || name;
		if (seenId.has(id)) id = `${name}-${towers.length + 1}`;
		seenId.add(id);
		towers.push({
			id,
			name,
			lat: t.lat,
			lng: t.lng
		});
	}
	return towers;
}
function parseKml(text) {
	const title = xmlTag(text, "name") || void 0;
	const pointTowers = [];
	const lineTowers = [];
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
					lng: pair.lng
				});
			}
			continue;
		}
		const lineCoords = xmlTag(lineBlock, "coordinates");
		if (lineCoords) for (const pair of coordPairsFromText(lineCoords)) {
			const label = `N${lineTowers.length + 1}`;
			lineTowers.push({
				id: label,
				name: label,
				lat: pair.lat,
				lng: pair.lng
			});
		}
	}
	if (!pointTowers.length && !lineTowers.length) {
		const loose = text.match(/<coordinates>([\s\S]*?)<\/coordinates>/gi) ?? [];
		for (const block of loose) {
			const inner = block.replace(/<\/?coordinates>/gi, "");
			for (const pair of coordPairsFromText(inner)) {
				const label = `N${lineTowers.length + 1}`;
				lineTowers.push({
					id: label,
					name: label,
					lat: pair.lat,
					lng: pair.lng
				});
			}
		}
	}
	const source = pointTowers.length ? pointTowers : lineTowers;
	const towers = uniqueTowers(source);
	if (!towers.length) return {
		ok: false,
		error: "KML 里没有点坐标。请导出每基杆塔为 Placemark 点。"
	};
	return {
		ok: true,
		towers,
		skipped: Math.max(0, source.length - towers.length),
		title,
		kind: pointTowers.length ? "kml" : "line",
		warning: pointTowers.length ? void 0 : "未找到点状杆塔，已按线路折点导入。请核对应是杆位而不是导线顶点。"
	};
}
function parseGpx(text) {
	const title = xmlTag(text, "name") || void 0;
	const towers = [];
	const wpts = text.match(/<wpt\b[^>]*>[\s\S]*?<\/wpt>/gi) ?? [];
	for (const block of wpts) {
		const lat = Number(block.match(/\blat=["']([^"']+)["']/i)?.[1]);
		const lng = Number(block.match(/\blon=["']([^"']+)["']/i)?.[1]);
		if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
		if (Math.abs(lat) > 90 || Math.abs(lng) > 180) continue;
		const name = xmlTag(block, "name") || `N${towers.length + 1}`;
		towers.push({
			id: name,
			name,
			lat: round(lat, 7),
			lng: round(lng, 7)
		});
	}
	if (!towers.length) {
		const trkpts = text.match(/<trkpt\b[^>]*>/gi) ?? [];
		for (const tag of trkpts) {
			const lat = Number(tag.match(/\blat=["']([^"']+)["']/i)?.[1]);
			const lng = Number(tag.match(/\blon=["']([^"']+)["']/i)?.[1]);
			if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
			if (Math.abs(lat) > 90 || Math.abs(lng) > 180) continue;
			const label = `N${towers.length + 1}`;
			towers.push({
				id: label,
				name: label,
				lat: round(lat, 7),
				lng: round(lng, 7)
			});
		}
	}
	const unique = uniqueTowers(towers);
	if (!unique.length) return {
		ok: false,
		error: "GPX 里没有航点。请把每基杆塔存成航点后再导入。"
	};
	return {
		ok: true,
		towers: unique,
		skipped: Math.max(0, towers.length - unique.length),
		title,
		kind: wpts.length ? "gpx" : "line",
		warning: wpts.length ? void 0 : "未找到航点，已按轨迹折点导入。"
	};
}
function walkGeoJson(node, into, line) {
	if (!node || typeof node !== "object") return;
	const rec = node;
	const nameOf = () => {
		const props = rec.properties;
		if (props && typeof props === "object") {
			const p = props;
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
			into.push({
				id: label,
				name: label,
				lat: round(lat, 7),
				lng: round(lng, 7)
			});
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
			into.push({
				id: label,
				name: label,
				lat: round(lat, 7),
				lng: round(lng, 7)
			});
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
				line.push({
					id: label,
					name: label,
					lat: round(lat, 7),
					lng: round(lng, 7)
				});
			}
		}
	}
}
function parseGeoJson(text) {
	let data;
	try {
		data = JSON.parse(text);
	} catch {
		return {
			ok: false,
			error: "GeoJSON 无法解析"
		};
	}
	const points = [];
	const line = [];
	walkGeoJson(data, points, line);
	const source = points.length ? points : line;
	const towers = uniqueTowers(source);
	if (!towers.length) return {
		ok: false,
		error: "GeoJSON 里没有点坐标"
	};
	const title = data && typeof data === "object" && "name" in data && typeof data.name === "string" ? data.name : void 0;
	return {
		ok: true,
		towers,
		skipped: Math.max(0, source.length - towers.length),
		title,
		kind: points.length ? "geojson" : "line",
		warning: points.length ? void 0 : "未找到点要素，已按线折点导入。"
	};
}
function parseTowerList(raw) {
	const lines = expandDms(stripBom(raw)).replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("//") && !/^#\s/.test(l) && l !== "#");
	if (!lines.length) return {
		ok: false,
		error: "没有读到坐标。请粘贴或导入 CSV / KML。"
	};
	let start = 0;
	let cols = null;
	const firstCells = splitCells(lines[0]);
	if (firstCells.length && (looksHeader(firstCells) || headerMap(firstCells))) {
		cols = headerMap(firstCells);
		start = 1;
	}
	const collected = [];
	let skipped = 0;
	for (let i = start; i < lines.length; i++) {
		const line = lines[i];
		const cells = splitCells(line);
		let lat = null;
		let lng = null;
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
			const pair = pairFromNumbers((line.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number).filter(Number.isFinite));
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
		if (!name) name = cells.find((c) => {
			const n = Number(c.replace(/[°NSEW南北东西]/gi, ""));
			return Boolean(c) && Number.isNaN(n);
		}) || nameFromLine(line, fallback);
		const label = name.slice(0, 40) || fallback;
		collected.push({
			id: label,
			name: label,
			lat,
			lng
		});
	}
	const towers = uniqueTowers(collected);
	skipped += Math.max(0, collected.length - towers.length);
	if (!towers.length) return {
		ok: false,
		error: skipped ? "读到的数字不像经纬度（可能是投影坐标）。请用纬度、经度，例如 26.26321,117.63890" : "没有解析出有效坐标"
	};
	return {
		ok: true,
		towers,
		skipped,
		kind: "csv"
	};
}
function looksLikeWorkbook(raw, filename) {
	const name = (filename ?? "").toLowerCase();
	if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".xlsm")) return true;
	return raw.startsWith("PK") && raw.includes("[Content_Types].xml");
}
function parseCoordinateFile(raw, filename) {
	if (looksLikeWorkbook(raw, filename)) return {
		ok: false,
		error: "Excel 工作簿请另存为 CSV，或直接在表格里复制杆塔号、纬度、经度，粘贴到输入框。"
	};
	const text = stripBom(raw).trim();
	if (!text) return {
		ok: false,
		error: "文件是空的"
	};
	if (/<kml[\s>]|<Placemark\b/i.test(text)) return parseKml(text);
	if (/<gpx[\s>]|<wpt\b|<trkpt\b/i.test(text)) return parseGpx(text);
	if (/^\s*\{[\s\S]*"type"\s*:\s*"(FeatureCollection|Feature|Point|MultiPoint|LineString)"/i.test(text)) return parseGeoJson(text);
	return parseTowerList(text);
}
function corridorStats(towers) {
	let lengthM = 0;
	for (let i = 1; i < towers.length; i++) lengthM += haversine(towers[i - 1], towers[i]);
	return {
		count: towers.length,
		lengthM,
		lengthKm: round(lengthM / 1e3, 2)
	};
}
function towersToCsv(towers, results = {}) {
	const esc = (s) => /,|"|\n/.test(s) ? `"${s.replace(/"/g, "\"\"")}"` : s;
	const lines = ["杆塔号,纬度N,经度E,综合风险"];
	for (const t of towers) {
		const level = results[t.id]?.level;
		lines.push([
			esc(t.name),
			t.lat.toFixed(6),
			t.lng.toFixed(6),
			level ? LEVEL_ZH[level] : ""
		].join(","));
	}
	return `${lines.join("\n")}\n`;
}
function downloadText(filename, text, mime = "text/csv;charset=utf-8") {
	const blob = new Blob([text], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function downloadTowerTemplate() {
	downloadText("雨瞰-杆塔坐标模板.csv", TOWER_TEMPLATE);
}
function downloadCorridorCsv(title, towers, results) {
	downloadText(`雨瞰-${(title || "线路").replace(/[\\/:*?"<>|]/g, "-").slice(0, 40)}-杆塔研判.csv`, towersToCsv(towers, results));
}
var FILE_ACCEPT = ".csv,.txt,.tsv,.kml,.gpx,.geojson,.json,.xml";
function IntakeModeTabs({ mode, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-1 rounded-xl bg-fg/6 p-1",
		children: [["point", "单点坐标"], ["line", "线路杆塔"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(id),
			className: cn("h-10 rounded-lg text-sm transition-colors", mode === id ? "bg-surface text-fg ring-1 ring-border" : "text-muted hover:text-fg"),
			children: label
		}, id))
	});
}
function LineImportForm({ onImported }) {
	const importTowers = useApp((s) => s.importTowers);
	const fileRef = (0, import_react.useRef)(null);
	const [text, setText] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const parsed = (0, import_react.useMemo)(() => text.trim() ? parseCoordinateFile(text) : null, [text]);
	const preview = parsed?.ok ? parsed : null;
	const parseError = parsed && !parsed.ok ? parsed.error : error;
	function apply() {
		const res = parseCoordinateFile(text);
		if (!res.ok) {
			setError(res.error);
			return;
		}
		importTowers(res.towers, title.trim() || res.title);
		onImported?.();
	}
	async function takeFile(file) {
		if (!file) return;
		const name = file.name.toLowerCase();
		if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".xlsm")) {
			setError("Excel 工作簿请另存为 CSV，或直接复制表格内容粘贴。");
			return;
		}
		const raw = await file.text();
		setText(raw);
		setError(null);
		if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ""));
		const res = parseCoordinateFile(raw, file.name);
		if (!res.ok) setError(res.error);
		else if (res.title && !title.trim()) setTitle(res.title);
	}
	function onDrop(e) {
		e.preventDefault();
		setDragging(false);
		takeFile(e.dataTransfer.files?.[0]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "px-1 text-xs text-muted",
					children: "线路名称（可选）"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: title,
					onChange: (e) => setTitle(e.target.value),
					placeholder: "例如 沙县—三明 220kV",
					className: "h-11"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				onDragOver: (e) => {
					e.preventDefault();
					setDragging(true);
				},
				onDragLeave: () => setDragging(false),
				onDrop,
				className: cn("rounded-xl ring-1 transition-colors", dragging ? "ring-primary/50 bg-primary/8" : "ring-border bg-bg/50"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: text,
					onChange: (e) => {
						setText(e.target.value);
						setError(null);
					},
					spellCheck: false,
					rows: 7,
					placeholder: "每行一基，可从 Excel 直接复制：\nN1,26.26321,117.63890\nN2,26.26510,117.64120",
					className: "w-full resize-y rounded-xl bg-transparent px-3 py-2.5 font-mono text-sm outline-none placeholder:text-faint"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: FILE_ACCEPT,
						className: "hidden",
						onChange: (e) => {
							takeFile(e.target.files?.[0]);
							e.target.value = "";
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: () => fileRef.current?.click(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "size-3.5" }), "选择文件"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						onClick: () => downloadTowerTemplate(),
						children: "下载 CSV 模板"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						onClick: () => {
							setText(TOWER_TEMPLATE);
							setTitle("示例线路 · 三明近郊 5 基");
							setError(null);
						},
						children: "填入示例"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-faint text-pretty",
				children: "支持 CSV / 从 Excel 复制、KML、GPX、GeoJSON。不要用投影坐标（高斯克吕格米制）。"
			}),
			parseError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-risk-high",
				children: parseError
			}) : null,
			preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-bg/40 px-3 py-2.5 ring-1 ring-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [
							"读到 ",
							preview.towers.length,
							" 基",
							preview.skipped ? `，跳过 ${preview.skipped} 行` : "",
							preview.kind !== "csv" ? ` · ${preview.kind.toUpperCase()}` : ""
						]
					}),
					preview.warning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-risk-mid",
						children: preview.warning
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-2 max-h-36 space-y-1 overflow-auto font-mono text-xs text-muted",
						children: [preview.towers.slice(0, 8).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							t.name,
							" · ",
							t.lat.toFixed(5),
							"°N ",
							t.lng.toFixed(5),
							"°E"
						] }, `${t.id}-${t.lat}`)), preview.towers.length > 8 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"…还有 ",
							preview.towers.length - 8,
							" 基"
						] }) : null]
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "h-11 w-full",
				disabled: !preview,
				onClick: apply,
				children: "确认导入（不开始分析）"
			})
		]
	});
}
function CorridorReview() {
	const corridor = useApp((s) => s.corridor);
	const corridorIndex = useApp((s) => s.corridorIndex);
	const corridorTitle = useApp((s) => s.corridorTitle);
	const corridorResults = useApp((s) => s.corridorResults);
	const selectTower = useApp((s) => s.selectTower);
	const clearCorridor = useApp((s) => s.clearCorridor);
	const analyze = useApp((s) => s.analyze);
	const analyzeCorridor = useApp((s) => s.analyzeCorridor);
	const stopBatch = useApp((s) => s.stopBatch);
	const batching = useApp((s) => s.batching);
	const stage = useApp((s) => s.stage);
	const setMapPick = useApp((s) => s.setMapPick);
	const factors = useApp((s) => s.factors);
	const toggleFactor = useApp((s) => s.toggleFactor);
	const error = useApp((s) => s.error);
	const [replace, setReplace] = (0, import_react.useState)(false);
	const stats = (0, import_react.useMemo)(() => corridorStats(corridor), [corridor]);
	const busy = stage === "probing" || stage === "composing" || batching;
	const current = corridor[corridorIndex];
	const done = Object.keys(corridorResults).length;
	if (replace) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl",
				children: "重新导入"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-xs text-muted hover:text-fg",
				onClick: () => setReplace(false),
				children: "返回列表"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineImportForm, { onImported: () => setReplace(false) })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.18em] text-muted uppercase",
					children: "Transmission line"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display mt-1 text-xl",
					children: corridorTitle
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						stats.count,
						" 基",
						stats.lengthKm ? ` · 约 ${stats.lengthKm} km` : "",
						done ? ` · 已研判 ${done}/${stats.count}` : " · 尚未分析"
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-52 overflow-auto rounded-xl ring-1 ring-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "sticky top-0 bg-surface text-xs text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "杆塔"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "纬度 N"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "经度 E"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "风险"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: corridor.map((t, i) => {
						const on = i === corridorIndex;
						const result = corridorResults[t.id];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							onClick: () => selectTower(i),
							className: cn("cursor-pointer border-t border-border", on ? "bg-primary/12" : "hover:bg-fg/5"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: t.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 font-mono text-xs tabular-nums",
									children: t.lat.toFixed(5)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 font-mono text-xs tabular-nums",
									children: t.lng.toFixed(5)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: LEVEL_TONE[result.level],
										children: LEVEL_ZH[result.level]
									}) : "—"
								})
							]
						}, `${t.id}-${i}`);
					}) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-1 text-xs text-muted",
				children: "影响因子（可多选）"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1.5 flex flex-wrap gap-1.5",
				children: FACTOR_OPTIONS.map((f) => {
					const on = factors.includes(f.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": on,
						title: f.hint,
						onClick: () => toggleFactor(f.id),
						className: cn("rounded-full px-3 py-1.5 text-xs transition-colors", on ? "bg-primary/18 text-primary ring-1 ring-primary/40" : "bg-fg/6 text-muted ring-1 ring-border hover:text-fg"),
						children: [on ? "已选 · " : "未选 · ", f.name]
					}, f.id);
				})
			})] }),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-risk-high",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-faint text-pretty",
				children: [
					"导入不会自动分析。试用按基计次，整条线路逐基研判会记 ",
					stats.count,
					" 次。"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 sm:flex-row sm:flex-wrap",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "h-11 flex-1",
					disabled: busy || !current,
					onClick: () => current && void analyze({
						lat: current.lat,
						lng: current.lng,
						query: current.name
					}),
					children: busy && !batching ? "研判中" : `研判当前基${current ? ` ${current.name}` : ""}`
				}), batching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "h-11",
					variant: "outline",
					onClick: () => stopBatch(),
					children: "停止逐基"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "h-11",
					variant: "outline",
					disabled: busy,
					onClick: () => void analyzeCorridor(),
					children: "从当前逐基研判"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: () => setMapPick(true),
						children: "在地图上查看线路"
					}),
					done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						onClick: () => downloadCorridorCsv(corridorTitle, corridor, corridorResults),
						children: "导出结果 CSV"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						onClick: () => setReplace(true),
						children: "重新导入"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						onClick: () => clearCorridor(),
						children: "清除线路"
					})
				]
			})
		]
	});
}
function TowerImportButton({ className }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		variant: "outline",
		className: cn("h-11", className),
		onClick: () => setOpen(true),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), "导入杆塔"]
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-bg/70 p-3 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-4 ring-1 ring-border sm:p-5",
			onMouseDown: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.18em] text-muted uppercase",
					children: "Import towers"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display mt-1 text-xl",
					children: "导入高压线路杆塔坐标"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5 mb-3 text-sm text-pretty text-muted",
					children: "每基一行。导入后不会自动分析，请再点「研判当前基」或「开始研判」。"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineImportForm, { onImported: () => setOpen(false) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					className: "mt-2 h-11 w-full",
					onClick: () => setOpen(false),
					children: "取消"
				})
			]
		})
	}) : null] });
}
function TowerStrip() {
	const corridor = useApp((s) => s.corridor);
	const corridorIndex = useApp((s) => s.corridorIndex);
	const corridorTitle = useApp((s) => s.corridorTitle);
	const corridorResults = useApp((s) => s.corridorResults);
	const selectTower = useApp((s) => s.selectTower);
	const clearCorridor = useApp((s) => s.clearCorridor);
	const analyzeCorridor = useApp((s) => s.analyzeCorridor);
	const stopBatch = useApp((s) => s.stopBatch);
	const batching = useApp((s) => s.batching);
	const stage = useApp((s) => s.stage);
	const analyze = useApp((s) => s.analyze);
	const setMapPick = useApp((s) => s.setMapPick);
	if (!corridor.length) return null;
	const busy = stage === "probing" || stage === "composing" || batching;
	const current = corridor[corridorIndex];
	const done = Object.keys(corridorResults).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto mx-auto w-full max-w-xl rounded-2xl bg-bg/78 p-2 shadow-[0_0_0_1px_rgba(231,238,234,0.08)] backdrop-blur-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 px-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "min-w-0 truncate text-xs text-muted",
					children: [
						corridorTitle,
						" · 当前 ",
						current?.name ?? "—",
						"（",
						corridorIndex + 1,
						"/",
						corridor.length,
						done ? ` · 已研判 ${done}` : "",
						"）"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-[11px] text-faint hover:text-fg",
						onClick: () => setMapPick(false),
						children: "返回列表"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-[11px] text-faint hover:text-fg",
						onClick: () => clearCorridor(),
						children: "清除"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1.5 flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
				children: corridor.map((t, i) => {
					const result = corridorResults[t.id];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => selectTower(i),
						className: cn("shrink-0 rounded-full px-2.5 py-1 text-xs ring-1 transition-colors", i === corridorIndex ? "bg-primary/16 text-primary ring-primary/40" : "bg-fg/6 text-muted ring-border hover:text-fg"),
						children: [t.name, result ? ` · ${LEVEL_ZH[result.level]}` : ""]
					}, `${t.id}-${i}`);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						disabled: busy || !current,
						onClick: () => current && void analyze({
							lat: current.lat,
							lng: current.lng,
							query: current.name
						}),
						children: busy && !batching ? "研判中" : "研判当前基"
					}),
					batching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => stopBatch(),
						children: "停止逐基"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						disabled: busy,
						onClick: () => void analyzeCorridor(),
						children: "从当前逐基研判"
					}),
					done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => downloadCorridorCsv(corridorTitle, corridor, corridorResults),
						children: "导出 CSV"
					}) : null
				]
			})
		]
	});
}
function parseField(latText, lngText) {
	const lat = Number(latText.trim());
	const lng = Number(lngText.trim());
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
	if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
	return {
		lat,
		lng
	};
}
function SearchDock() {
	const query = useApp((s) => s.query);
	const setQuery = useApp((s) => s.setQuery);
	const pick = useApp((s) => s.pick);
	const analyze = useApp((s) => s.analyze);
	const loadSample = useApp((s) => s.loadSample);
	const pin = useApp((s) => s.pin);
	const probe = useApp((s) => s.probe);
	const stage = useApp((s) => s.stage);
	const extentM = useApp((s) => s.extentM);
	const setExtent = useApp((s) => s.setExtent);
	const factors = useApp((s) => s.factors);
	const toggleFactor = useApp((s) => s.toggleFactor);
	const mapPick = useApp((s) => s.mapPick);
	const setMapPick = useApp((s) => s.setMapPick);
	const error = useApp((s) => s.error);
	const corridor = useApp((s) => s.corridor);
	const [hits, setHits] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [latText, setLatText] = (0, import_react.useState)("");
	const [lngText, setLngText] = (0, import_react.useState)("");
	const [intakeMode, setIntakeMode] = (0, import_react.useState)("point");
	const timer = (0, import_react.useRef)(null);
	const latRef = (0, import_react.useRef)(null);
	const lngRef = (0, import_react.useRef)(null);
	const busy = stage === "probing" || stage === "composing";
	const intake = !probe && !busy && !mapPick;
	(0, import_react.useEffect)(() => {
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!pin) return;
		const active = document.activeElement;
		if (active === latRef.current || active === lngRef.current) return;
		setLatText(pin.lat.toFixed(5));
		setLngText(pin.lng.toFixed(5));
	}, [pin]);
	(0, import_react.useEffect)(() => {
		if (timer.current) clearTimeout(timer.current);
		const q = query.trim();
		if (q.length < 2) {
			setHits([]);
			return;
		}
		const coord = parseCoordinate(q);
		if (coord) {
			setHits([]);
			setLatText(coord.lat.toFixed(5));
			setLngText(coord.lng.toFixed(5));
			return;
		}
		timer.current = setTimeout(() => {
			searchPlaces({ data: { q } }).then((res) => {
				if (res.ok) setHits(res.items);
				else setHits([]);
			}).catch(() => setHits([]));
		}, 380);
		return () => {
			if (timer.current) clearTimeout(timer.current);
		};
	}, [query]);
	function applyCoord(lat, lng, label) {
		setLatText(lat.toFixed(5));
		setLngText(lng.toFixed(5));
		pick(lat, lng, label ? { query: label } : void 0);
		setOpen(false);
	}
	function takePaste(e) {
		const text = e.clipboardData.getData("text");
		const coord = parseCoordinate(text);
		if (!coord) return;
		e.preventDefault();
		applyCoord(coord.lat, coord.lng);
	}
	function onLatKey(e) {
		if (e.key !== "Enter") return;
		e.preventDefault();
		lngRef.current?.focus();
	}
	function onLngKey(e) {
		if (e.key !== "Enter") return;
		e.preventDefault();
		e.currentTarget.blur();
	}
	function commitFromSearch() {
		const fromQuery = parseCoordinate(query);
		if (fromQuery) {
			applyCoord(fromQuery.lat, fromQuery.lng);
			return;
		}
		const fromFields = parseField(latText, lngText);
		if (fromFields) {
			applyCoord(fromFields.lat, fromFields.lng);
			return;
		}
		const first = hits[0];
		if (first) applyCoord(first.lat, first.lng, first.label);
	}
	function runAnalyze() {
		const fromFields = parseField(latText, lngText);
		const fromQuery = parseCoordinate(query);
		const coord = fromFields ?? fromQuery ?? pin;
		if (!coord) {
			analyze();
			return;
		}
		setOpen(false);
		setMapPick(false);
		analyze(coord);
	}
	const typed = parseField(latText, lngText);
	const editing = latText.trim() !== "" || lngText.trim() !== "";
	const canRun = Boolean(typed || !editing && (pin || parseCoordinate(query))) && !busy;
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-x-0 top-0 z-30 p-3 sm:p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto h-48 max-w-lg rounded-2xl bg-bg/78 ring-1 ring-fg/8" })
	});
	const searchField = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: query,
				onChange: (e) => {
					setQuery(e.target.value);
					setOpen(true);
				},
				onFocus: () => setOpen(true),
				onPaste: takePaste,
				onKeyDown: (e) => {
					if (e.key === "Escape") setOpen(false);
					if (e.key === "Enter") {
						e.preventDefault();
						commitFromSearch();
					}
				},
				placeholder: "地名，或粘贴 26.26321, 117.63890",
				autoComplete: "off",
				autoCorrect: "off",
				spellCheck: false,
				className: "h-11 border-0 bg-transparent pl-10 ring-0 focus-visible:ring-0"
			}),
			query ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "absolute top-0 right-0 size-11",
				onClick: () => {
					setQuery("");
					setHits([]);
				},
				"aria-label": "清除",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
			}) : null
		]
	});
	const coordFields = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-2 gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "block",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "px-1 text-xs text-muted",
				children: "纬度 N"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				ref: latRef,
				value: latText,
				inputMode: "decimal",
				autoComplete: "off",
				autoCorrect: "off",
				spellCheck: false,
				placeholder: "26.26321",
				onChange: (e) => setLatText(e.target.value),
				onPaste: takePaste,
				onKeyDown: onLatKey,
				className: "h-11 font-mono",
				"aria-label": "纬度"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "block",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "px-1 text-xs text-muted",
				children: "经度 E"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				ref: lngRef,
				value: lngText,
				inputMode: "decimal",
				autoComplete: "off",
				autoCorrect: "off",
				spellCheck: false,
				placeholder: "117.63890",
				onChange: (e) => setLngText(e.target.value),
				onPaste: takePaste,
				onKeyDown: onLngKey,
				className: "h-11 font-mono",
				"aria-label": "经度"
			})]
		})]
	});
	const factorRow = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-1 text-xs text-muted",
		children: "影响因子（可多选）"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1.5 flex flex-wrap gap-1.5",
		children: FACTOR_OPTIONS.map((f) => {
			const on = factors.includes(f.id);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-pressed": on,
				title: f.hint,
				onClick: () => toggleFactor(f.id),
				className: cn("rounded-full px-3 py-1.5 text-xs transition-colors", on ? "bg-primary/18 text-primary ring-1 ring-primary/40" : "bg-fg/6 text-muted ring-1 ring-border hover:text-fg"),
				children: [on ? "已选 · " : "未选 · ", f.name]
			}, f.id);
		})
	})] });
	const hitList = open && hits.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "max-h-48 overflow-auto rounded-xl bg-surface-2 px-1 py-1 ring-1 ring-border",
		children: hits.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-fg/6",
			onClick: () => applyCoord(h.lat, h.lng, h.label),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mt-0.5 size-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-pretty text-fg",
				children: h.label
			})]
		}) }, `${h.lat}-${h.lng}-${h.label}`))
	}) : null;
	const samples = !probe ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
		children: SAMPLE_SITES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => loadSample(s),
			className: cn("shrink-0 rounded-full px-3 py-1.5 text-xs ring-1 transition-colors", pin && Math.abs(pin.lat - s.lat) < 1e-4 && Math.abs(pin.lng - s.lng) < 1e-4 ? "bg-primary/16 text-primary ring-primary/35" : "bg-fg/6 text-muted ring-border hover:text-fg"),
			children: s.name
		}, s.id))
	}) : null;
	const extentRow = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-1 rounded-full bg-fg/6 p-1 text-xs text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "px-2",
			children: "边长"
		}), [
			50,
			72,
			110
		].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setExtent(m),
			className: cn("rounded-full px-2.5 py-1 transition-colors", extentM === m ? "bg-fg/12 text-fg" : "hover:text-fg"),
			children: [m, "米"]
		}, m))]
	});
	if (intake) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 overflow-y-auto bg-bg/92 px-3 py-4 sm:px-4 sm:py-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto w-full max-w-lg",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl bg-surface p-4 ring-1 ring-border sm:p-5",
				onMouseDown: (e) => e.stopPropagation(),
				onPointerDown: (e) => e.stopPropagation(),
				children: corridor.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CorridorReview, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] tracking-[0.18em] text-muted uppercase",
						children: "Yukan · 雨瞰"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-1 text-2xl",
						children: intakeMode === "line" ? "导入线路杆塔" : "输入坐标"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-sm text-pretty text-muted",
						children: intakeMode === "line" ? "高压输电线路每基杆塔一行。支持 CSV、从 Excel 复制、KML / GPX。导入后仍要再点研判，不会自动跳到地图。" : "填写单点经纬度，或切换到「线路杆塔」批量导入。选点和导入都不会自动分析。"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntakeModeTabs, {
							mode: intakeMode,
							onChange: setIntakeMode
						})
					}),
					intakeMode === "line" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineImportForm, {})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-3",
							children: [
								coordFields,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-xl bg-bg/50 ring-1 ring-border",
									children: searchField
								}),
								hitList,
								factorRow
							]
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-risk-high",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "h-11 flex-1",
									disabled: !canRun,
									onClick: runAnalyze,
									children: "开始研判"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									className: "h-11 sm:min-w-32",
									onClick: () => {
										const coord = parseField(latText, lngText);
										if (coord) pick(coord.lat, coord.lng);
										setMapPick(true);
									},
									children: "在地图上选点"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									className: "h-11 sm:min-w-32",
									onClick: () => setIntakeMode("line"),
									children: "导入杆塔"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-2",
							children: [extentRow, samples]
						})
					] })
				] })
			})
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col gap-3 p-3 sm:p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-auto mx-auto w-full max-w-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative rounded-2xl bg-bg/78 p-2 shadow-[0_0_0_1px_rgba(231,238,234,0.08)] backdrop-blur-md",
					onMouseDown: (e) => e.stopPropagation(),
					onPointerDown: (e) => e.stopPropagation(),
					children: [
						searchField,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-[1fr_1fr_auto]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "px-1 text-[11px] text-muted",
										children: "纬度 N"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										ref: latRef,
										value: latText,
										inputMode: "decimal",
										autoComplete: "off",
										spellCheck: false,
										placeholder: "26.26321",
										onChange: (e) => setLatText(e.target.value),
										onPaste: takePaste,
										onKeyDown: onLatKey,
										className: "h-11 font-mono",
										"aria-label": "纬度"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "px-1 text-[11px] text-muted",
										children: "经度 E"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										ref: lngRef,
										value: lngText,
										inputMode: "decimal",
										autoComplete: "off",
										spellCheck: false,
										placeholder: "117.63890",
										onChange: (e) => setLngText(e.target.value),
										onPaste: takePaste,
										onKeyDown: onLngKey,
										className: "h-11 font-mono",
										"aria-label": "经度"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "col-span-2 h-11 sm:col-span-1 sm:mt-5 sm:min-w-28",
									disabled: !canRun,
									onClick: runAnalyze,
									children: busy ? "研判中" : "开始研判"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2",
							children: factorRow
						}),
						hitList
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto mx-auto flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center",
				children: [
					mapPick && !probe ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setMapPick(false),
						className: "self-start rounded-full bg-bg/70 px-3 py-1.5 text-xs text-fg ring-1 ring-fg/15 backdrop-blur-sm hover:ring-fg/30",
						children: "返回输入坐标"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TowerImportButton, { className: "h-9 rounded-full px-3 text-xs" })
					}),
					corridor.length ? null : samples,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sm:ml-auto",
						children: extentRow
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TowerStrip, {})
		]
	});
}
function AppShell() {
	const hydrate = useApp((s) => s.hydrate);
	const stage = useApp((s) => s.stage);
	const probe = useApp((s) => s.probe);
	const report = useApp((s) => s.report);
	const error = useApp((s) => s.error);
	const pin = useApp((s) => s.pin);
	const history = useApp((s) => s.history);
	const historyOpen = useApp((s) => s.historyOpen);
	const toggleHistory = useApp((s) => s.toggleHistory);
	const loadHistoryItem = useApp((s) => s.loadHistoryItem);
	const clear = useApp((s) => s.clear);
	const mapPick = useApp((s) => s.mapPick);
	const corridor = useApp((s) => s.corridor);
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	const showReport = Boolean(probe) || stage === "probing" || stage === "composing";
	const busy = stage === "probing" || stage === "composing";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
				onHistory: () => toggleHistory(true),
				count: history.length
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrialStrip, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex min-h-0 flex-1 flex-col lg:flex-row", showReport && "max-lg:grid max-lg:grid-rows-[minmax(0,42%)_minmax(0,58%)]"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "relative min-h-0 min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapView, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchDock, {}),
						mapPick && !probe && stage === "idle" && !corridor.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPickHint, { pin }) : null,
						probe ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapLegend, {}) : null,
						error && stage === "error" && (mapPick || probe) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute bottom-4 left-1/2 z-30 w-[min(92%,24rem)] -translate-x-1/2 rounded-xl bg-bg/85 px-4 py-3 text-sm text-risk-high ring-1 ring-risk-high/30 backdrop-blur-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: error }),
								error.includes("会员") || error.includes("试用") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/membership",
									className: "mt-2 inline-flex text-primary hover:underline",
									children: "去开通会员"
								}) : null,
								error.includes("登录") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/login",
									className: "mt-2 inline-flex text-primary hover:underline",
									children: "去登录"
								}) : null
							]
						}) : null,
						busy && !probe ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingMask, { stage }) : null
					]
				}), showReport && probe ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 w-full shrink-0 lg:w-[32rem] xl:w-[36rem]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportPanel, {
						probe,
						report,
						composing: stage === "composing",
						onClose: clear
					})
				}) : null]
			}),
			historyOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryOverlay, {
				items: history,
				onClose: () => toggleHistory(false),
				onOpen: loadHistoryItem
			}) : null
		]
	});
}
function TopBar({ onHistory, count }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "no-print z-40 flex h-14 shrink-0 items-center justify-between gap-3 px-4 ring-1 ring-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberChip, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLink, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: onHistory,
					className: "gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-3.5" }),
						"记录",
						count ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums text-muted",
							children: count
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 [&_span.text-sm.font-medium]:hidden lg:[&_span.text-sm.font-medium]:inline lg:[&_span.text-sm.font-medium]:max-w-[10rem] lg:[&_span.text-sm.font-medium]:truncate",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
				})
			]
		})]
	});
}
function TrialStrip() {
	const [mem, setMem] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getMembership().then(setMem).catch(() => setMem(emptyMembership()));
	}, []);
	if (!mem?.isTrial || mem.isAdmin) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "no-print flex items-center justify-between gap-3 px-4 py-2 text-sm ring-1 ring-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "min-w-0 truncate text-muted",
			children: [
				"免费试用剩余 ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums text-fg",
					children: mem.remainingDays ?? 0
				}),
				" 天 · 已用",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "tabular-nums text-fg",
					children: [
						mem.runsUsed,
						"/",
						mem.runsLimit ?? 8
					]
				}),
				" ",
				"次"
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			size: "sm",
			variant: "outline",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/membership",
				children: "开通会员"
			})
		})]
	});
}
function MapPickHint({ pin }) {
	const n = useApp((s) => s.corridor).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-x-0 bottom-8 z-20 flex justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md rounded-2xl bg-bg/72 px-5 py-3 text-center shadow-[0_0_0_1px_rgba(231,238,234,0.08)] backdrop-blur-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-pretty",
				children: n ? `已导入 ${n} 基。点塔位或列表可选基，再按「研判当前基」。导入不会自动分析。` : "在卫星图上点击落点，再按「开始研判」"
			}), pin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 font-mono text-xs text-primary",
				children: [
					pin.lat.toFixed(5),
					"°N · ",
					pin.lng.toFixed(5),
					"°E"
				]
			}) : null]
		})
	});
}
function MapLegend() {
	const factors = useApp((s) => s.factors);
	const items = [
		{
			c: "bg-flow-in",
			t: "高位来水",
			show: hasFactor(factors, "rain")
		},
		{
			c: "bg-flow-side",
			t: "侧向汇水",
			show: hasFactor(factors, "rain")
		},
		{
			c: "bg-flow-by",
			t: "沿场绕流",
			show: hasFactor(factors, "rain")
		},
		{
			c: "bg-flow-out",
			t: "最低口出水",
			show: hasFactor(factors, "rain")
		},
		{
			c: "bg-primary",
			t: "鸟类栖息地",
			show: hasFactor(factors, "birds")
		}
	].filter((i) => i.show);
	if (!items.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute bottom-8 left-3 z-20 rounded-xl bg-bg/72 px-3 py-2.5 text-xs backdrop-blur-sm ring-1 ring-fg/10",
		children: items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 py-0.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-2 rounded-full", i.c) }), i.t]
		}, i.t))
	});
}
function LoadingMask({ stage }) {
	const factors = useApp((s) => s.factors);
	const corridor = useApp((s) => s.corridor);
	const corridorIndex = useApp((s) => s.corridorIndex);
	const current = corridor[corridorIndex];
	const steps = [
		"逆地理编码",
		"高程网格采样",
		hasFactor(factors, "rain") ? "近场水系" : null,
		hasFactor(factors, "rain") || hasFactor(factors, "wind") ? "气象与规范风速" : null,
		hasFactor(factors, "birds") ? "鸟类栖息地" : null,
		"场地推演",
		"生成研判书"
	].filter((s) => Boolean(s));
	const active = stage === "composing" ? steps.length - 1 : Math.max(1, steps.length - 3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-40 flex items-center justify-center bg-bg/55 backdrop-blur-[2px]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-[min(92%,20rem)] rounded-2xl bg-surface px-5 py-5 ring-1 ring-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg",
					children: current ? `正在研判 ${current.name}` : "正在研判场地"
				}),
				corridor.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						corridorIndex + 1,
						" / ",
						corridor.length,
						" 基"
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-1.5 text-sm",
					children: steps.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("flex items-center gap-2", i <= active ? "text-fg" : "text-faint"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", i < active && "bg-primary", i === active && "bg-primary animate-pulse", i > active && "bg-faint") }), s]
					}, s))
				})
			]
		})
	});
}
function HistoryOverlay({ items, onClose, onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 bg-bg/50",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-surface ring-1 ring-border",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-14 items-center justify-between px-4 ring-1 ring-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg",
					children: "研判记录"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: onClose,
					children: "关闭"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-y-auto p-3",
				children: items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-2 py-8 text-sm text-muted",
					children: "尚无记录。完成一次研判后会留在此设备上。"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onOpen(it.id),
						className: "flex w-full flex-col items-start rounded-xl px-3 py-3 text-left ring-1 ring-border hover:bg-fg/5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex w-full items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-sm",
								children: it.locationTitle
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: LEVEL_TONE[it.overallLevel],
								children: LEVEL_ZH[it.overallLevel]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1 font-mono text-[11px] text-muted",
							children: [
								it.lat.toFixed(4),
								", ",
								it.lng.toFixed(4),
								" · ",
								zhDateTime(new Date(it.savedAt))
							]
						})]
					}) }, it.id))
				})
			})]
		})
	});
}
function AppPage() {
	const { user, isPending } = useGatedUser();
	const [gate, setGate] = (0, import_react.useState)("load");
	(0, import_react.useEffect)(() => {
		if (isPending) return;
		if (!user) {
			setGate("pay");
			return;
		}
		getMembership().then((m) => setGate(m.active ? "member" : "pay")).catch(() => setGate("pay"));
	}, [isPending, user]);
	if (isPending || gate === "load") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-dvh items-center justify-center bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-48 animate-pulse",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 rounded-lg bg-fg/8" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-24 rounded-xl bg-fg/6" })]
		})
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (gate !== "member") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/membership" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {});
}
//#endregion
export { AppPage as component };
