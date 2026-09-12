import { d as round, f as zhDate, o as finite } from "./membership-server-D3uGxw8t.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/samples-B88m3320.js
var EARTH_M = 6371e3;
function toRad(d) {
	return d * Math.PI / 180;
}
function toDeg(r) {
	return r * 180 / Math.PI;
}
function haversine(a, b) {
	const dφ = toRad(b.lat - a.lat);
	const dλ = toRad(b.lng - a.lng);
	const φ1 = toRad(a.lat);
	const φ2 = toRad(b.lat);
	const h = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
	return 2 * EARTH_M * Math.asin(Math.min(1, Math.sqrt(h)));
}
function destination(start, bearingDeg, distM) {
	const δ = distM / EARTH_M;
	const θ = toRad(bearingDeg);
	const φ1 = toRad(start.lat);
	const λ1 = toRad(start.lng);
	const sinφ2 = Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ);
	const φ2 = Math.asin(sinφ2);
	const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * sinφ2);
	return {
		lat: toDeg(φ2),
		lng: (toDeg(λ2) + 540) % 360 - 180
	};
}
function metersToLat(m) {
	return m / 111320;
}
function metersToLng(m, lat) {
	return m / (111320 * Math.max(.12, Math.cos(toRad(lat))));
}
var DIRS8 = [
	"北",
	"东北",
	"东",
	"东南",
	"南",
	"西南",
	"西",
	"西北"
];
function aspectLabel(deg) {
	const n = (finite(deg) % 360 + 360) % 360;
	return DIRS8[Math.round(n / 45) % 8];
}
function formatDist(m) {
	if (m < 1e3) return `${Math.round(m)} 米`;
	return `${round(m / 1e3, 2)} 公里`;
}
function formatElev(m) {
	return `${round(m, 0)} 米`;
}
function parseCoordinate(raw) {
	const s = raw.trim().replace(/[，]/g, ",").replace(/\s+/g, " ");
	const nums = s.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
	if (nums.length < 2) return null;
	let a = nums[0];
	let b = nums[1];
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
	if (hasE && Math.abs(a) <= 90) {}
	let lat = a;
	let lng = b;
	if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
		const t = lat;
		lat = lng;
		lng = t;
	}
	if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
	return {
		lat: round(lat, 7),
		lng: round(lng, 7)
	};
}
function serialFor(lat, lng, d = /* @__PURE__ */ new Date()) {
	return `RS-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.abs(lat).toFixed(3).replace(".", "")}-${Math.abs(lng).toFixed(3).replace(".", "")}`;
}
function polygonAreaM2(verts) {
	if (verts.length < 3) return 0;
	const lat0 = verts[0].lat;
	const mPerDegLat = 111320;
	const mPerDegLng = 111320 * Math.cos(toRad(lat0));
	let sum = 0;
	for (let i = 0; i < verts.length; i++) {
		const j = (i + 1) % verts.length;
		const xi = verts[i].lng * mPerDegLng;
		const yi = verts[i].lat * mPerDegLat;
		const xj = verts[j].lng * mPerDegLng;
		const yj = verts[j].lat * mPerDegLat;
		sum += xi * yj - xj * yi;
	}
	return Math.abs(sum) / 2;
}
function autoVertices(center, extentM) {
	const r = extentM / 2;
	return [
		{
			id: "P1",
			bearing: 42,
			scale: 1.02,
			role: "东北角"
		},
		{
			id: "P2",
			bearing: 318,
			scale: 1.08,
			role: "西北角"
		},
		{
			id: "P3",
			bearing: 228,
			scale: 1.04,
			role: "西南角"
		},
		{
			id: "P4",
			bearing: 138,
			scale: 1,
			role: "东南角"
		},
		{
			id: "P5",
			bearing: 88,
			scale: .86,
			role: "东墙中段"
		}
	].map((s) => {
		const p = destination(center, s.bearing, r * s.scale);
		return {
			id: s.id,
			lat: p.lat,
			lng: p.lng,
			role: s.role
		};
	});
}
/** 公开名录：国家级湿地 / 自然保护区 / 东亚–澳大利西亚迁飞区重要栖息地（中心点示意）。 */
var CATALOG = [
	{
		name: "鄱阳湖候鸟栖息地",
		kind: "国际重要湿地",
		lat: 29.12,
		lng: 116.28,
		radiusKm: 45,
		species: "白鹤、东方白鹳、雁鸭类"
	},
	{
		name: "洞庭湖湿地",
		kind: "国际重要湿地",
		lat: 29.35,
		lng: 112.95,
		radiusKm: 40,
		species: "候鸟、小天鹅"
	},
	{
		name: "扎龙自然保护区",
		kind: "自然保护区",
		lat: 47.2,
		lng: 124.25,
		radiusKm: 32,
		species: "丹顶鹤"
	},
	{
		name: "盐城黄海湿地",
		kind: "世界遗产/湿地",
		lat: 33.6,
		lng: 120.55,
		radiusKm: 35,
		species: "丹顶鹤、勺嘴鹬"
	},
	{
		name: "黄河三角洲湿地",
		kind: "国际重要湿地",
		lat: 37.8,
		lng: 118.98,
		radiusKm: 30,
		species: "东方白鹳、鹤类"
	},
	{
		name: "崇明东滩",
		kind: "候鸟保护区",
		lat: 31.5,
		lng: 121.96,
		radiusKm: 22,
		species: "鸻鹬、雁鸭"
	},
	{
		name: "青海湖",
		kind: "国际重要湿地",
		lat: 36.85,
		lng: 100.15,
		radiusKm: 45,
		species: "斑头雁、渔鸥"
	},
	{
		name: "若尔盖湿地",
		kind: "国际重要湿地",
		lat: 33.58,
		lng: 102.95,
		radiusKm: 35,
		species: "黑颈鹤"
	},
	{
		name: "草海",
		kind: "自然保护区",
		lat: 26.85,
		lng: 104.23,
		radiusKm: 18,
		species: "黑颈鹤"
	},
	{
		name: "闽江河口湿地",
		kind: "国家级湿地",
		lat: 26.05,
		lng: 119.63,
		radiusKm: 16,
		species: "黑嘴端凤头燕鸥、鹭类"
	},
	{
		name: "深圳福田红树林",
		kind: "自然保护区",
		lat: 22.53,
		lng: 114,
		radiusKm: 10,
		species: "鹭类、鸻鹬"
	},
	{
		name: "北戴河迁徙通道",
		kind: "迁飞通道",
		lat: 39.85,
		lng: 119.48,
		radiusKm: 22,
		species: "猛禽、雀形目"
	},
	{
		name: "东寨港红树林",
		kind: "自然保护区",
		lat: 19.95,
		lng: 110.58,
		radiusKm: 14,
		species: "鹭类、水鸟"
	},
	{
		name: "向海自然保护区",
		kind: "自然保护区",
		lat: 44.95,
		lng: 122.3,
		radiusKm: 25,
		species: "鹤类、鹳类"
	},
	{
		name: "升金湖",
		kind: "国际重要湿地",
		lat: 30.38,
		lng: 117.05,
		radiusKm: 20,
		species: "鹤类、雁鸭"
	},
	{
		name: "盘锦辽河口",
		kind: "湿地",
		lat: 40.88,
		lng: 121.85,
		radiusKm: 28,
		species: "丹顶鹤、黑嘴鸥"
	},
	{
		name: "衡水湖",
		kind: "自然保护区",
		lat: 37.6,
		lng: 115.6,
		radiusKm: 16,
		species: "鹭类、雁鸭"
	},
	{
		name: "野鸭湖",
		kind: "湿地",
		lat: 40.42,
		lng: 115.84,
		radiusKm: 12,
		species: "雁鸭、鹭类"
	},
	{
		name: "泉州湾河口湿地",
		kind: "湿地",
		lat: 24.88,
		lng: 118.68,
		radiusKm: 14,
		species: "鸻鹬、鹭类"
	},
	{
		name: "漳江口红树林",
		kind: "自然保护区",
		lat: 23.93,
		lng: 117.35,
		radiusKm: 12,
		species: "红树林水鸟"
	},
	{
		name: "杭州湾湿地",
		kind: "湿地",
		lat: 30.38,
		lng: 121.1,
		radiusKm: 18,
		species: "鸻鹬"
	},
	{
		name: "微山湖",
		kind: "湿地",
		lat: 34.65,
		lng: 117.2,
		radiusKm: 28,
		species: "雁鸭、鹭类"
	},
	{
		name: "太湖沿岸湿地",
		kind: "湖泊湿地",
		lat: 31.2,
		lng: 120.2,
		radiusKm: 30,
		species: "鹭类、雁鸭"
	},
	{
		name: "滇池",
		kind: "湖泊湿地",
		lat: 24.8,
		lng: 102.68,
		radiusKm: 16,
		species: "红嘴鸥、鹭类"
	},
	{
		name: "巢湖",
		kind: "湖泊湿地",
		lat: 31.55,
		lng: 117.55,
		radiusKm: 22,
		species: "雁鸭"
	},
	{
		name: "拉市海",
		kind: "湿地",
		lat: 26.9,
		lng: 100.15,
		radiusKm: 10,
		species: "候鸟"
	},
	{
		name: "曹妃甸湿地",
		kind: "湿地",
		lat: 39.15,
		lng: 118.4,
		radiusKm: 20,
		species: "鸻鹬"
	},
	{
		name: "北大港湿地",
		kind: "湿地",
		lat: 38.72,
		lng: 117.38,
		radiusKm: 16,
		species: "雁鸭、鹭类"
	},
	{
		name: "洪泽湖",
		kind: "湖泊湿地",
		lat: 33.3,
		lng: 118.7,
		radiusKm: 28,
		species: "雁鸭、鹭类"
	},
	{
		name: "东洞庭湖",
		kind: "国际重要湿地",
		lat: 29.45,
		lng: 113.1,
		radiusKm: 28,
		species: "候鸟"
	},
	{
		name: "厦门滨海湿地",
		kind: "滨海湿地",
		lat: 24.49,
		lng: 118.09,
		radiusKm: 12,
		species: "白鹭、鸻鹬"
	},
	{
		name: "珠江口淇澳–福田",
		kind: "红树林",
		lat: 22.42,
		lng: 113.65,
		radiusKm: 14,
		species: "鹭类、鸻鹬"
	},
	{
		name: "三江平原湿地",
		kind: "湿地群",
		lat: 47.3,
		lng: 133.5,
		radiusKm: 50,
		species: "鹤类、东方白鹳"
	},
	{
		name: "开封黄河湿地",
		kind: "湿地",
		lat: 34.85,
		lng: 114.35,
		radiusKm: 18,
		species: "雁鸭、鹭类"
	},
	{
		name: "南瓮河",
		kind: "自然保护区",
		lat: 51.2,
		lng: 125.5,
		radiusKm: 22,
		species: "水鸟"
	},
	{
		name: "东营黄河口",
		kind: "湿地",
		lat: 37.73,
		lng: 119.15,
		radiusKm: 24,
		species: "东方白鹳"
	}
];
function levelFrom(score) {
	if (score >= .78) return "high";
	if (score >= .58) return "mid-high";
	if (score >= .38) return "mid";
	if (score >= .2) return "mid-low";
	return "low";
}
function catalogHits(center) {
	const sites = [];
	let score = 0;
	for (const c of CATALOG) {
		const distKm = haversine(center, {
			lat: c.lat,
			lng: c.lng
		}) / 1e3;
		if (distKm > c.radiusKm * 1.6 && distKm > 55) continue;
		let add = 0;
		if (distKm <= c.radiusKm * .25) add = .82;
		else if (distKm <= c.radiusKm * .5) add = .58;
		else if (distKm <= c.radiusKm) add = .38;
		else if (distKm <= c.radiusKm * 1.5) add = .16;
		else add = .06;
		if (add >= .16 || distKm < 40) sites.push({
			name: c.name,
			kind: c.kind,
			lat: c.lat,
			lng: c.lng,
			distKm: round(distKm, 1),
			species: c.species,
			source: "公开湿地/保护区名录"
		});
		score += add;
	}
	return {
		sites,
		score
	};
}
function osmScore(sites) {
	let score = 0;
	for (const s of sites) if (s.distKm < 1) score += .42;
	else if (s.distKm < 3) score += .26;
	else if (s.distKm < 8) score += .14;
	else if (s.distKm < 15) score += .07;
	return score;
}
function flywayBonus(lat, lng) {
	const coastal = lng > 116.5 && lat > 18 && lat < 41 || lat < 20.5 && lng > 108;
	const inlandLake = lng > 112 && lng < 118 && lat > 28 && lat < 32 || lng > 115 && lng < 117.5 && lat > 28.5 && lat < 30;
	if (coastal) return .08;
	if (inlandLake) return .05;
	return 0;
}
function corrections$1(level, nearest, waters) {
	const recs = [];
	if (level === "low") {
		recs.push("近场未检出大型鸟类高频栖息地。常规防鸟：封堵屋檐孔洞、雨季前清理天沟枯枝，避免偶发筑巢堵塞排水。");
		return recs;
	}
	recs.push(nearest ? `场地距「${nearest.name}」约 ${nearest.distKm} 公里（${nearest.species}）。大型鸟类频繁起降、停栖时，镜面玻璃、挑檐和裸露设备是主要冲突面。` : "近场湿地/保护区有大型水鸟或猛禽活动迹象。");
	recs.push("玻璃幕墙：避免大面积镜面朝向水面或绿地；采用可见点阵、竖向密分格、紫外图案或外侧遮阳，降低撞击。参考北美鸟类友好建筑与国内幕墙防鸟击实践。");
	recs.push("构筑物：屋檐、雨棚、广告龙骨加防栖刺或防鸟斜板，封堵洞口，防止鹭、鸠、喜鹊类筑巢。鸟巢堵塞天沟会直接加重内涝，须纳入汛前巡查。");
	recs.push("金属屋面与外墙连接件注意鸟粪腐蚀；变配电、冷却塔、光伏支架加装挡鸟板，定期清扫。");
	recs.push("夜间减少朝向湿地的溢光和玻璃内透光，降低迁徙季撞窗。施工期避开当地繁殖高峰（一般 4–7 月，以当地名录为准）。");
	if (waters[0] && waters[0].distM < 800) recs.push(`近场水体「${waters[0].name}」会吸引鹭类停栖，临水立面优先做防鸟处理。`);
	return recs;
}
function assessBirds(input) {
	const cat = catalogHits(input.center);
	const merged = [...cat.sites];
	for (const s of input.osmSites) {
		if (merged.some((m) => Math.abs(m.lat - s.lat) < .008 && Math.abs(m.lng - s.lng) < .008)) continue;
		merged.push(s);
	}
	merged.sort((a, b) => a.distKm - b.distKm);
	const sites = merged.slice(0, 8);
	const score = Math.min(1, cat.score + osmScore(input.osmSites) + flywayBonus(input.center.lat, input.center.lng));
	const level = levelFrom(score);
	const nearest = sites[0];
	const summary = level === "low" ? "近场 未见大型鸟类高频栖息地，鸟击与筑巢不是主导因子。" : `近场处于大型鸟类活动区${nearest ? `（最近：${nearest.name}，${nearest.distKm} km，${nearest.species}）` : ""}。需把玻璃撞击、屋面筑巢堵排水、鸟粪腐蚀纳入围护设计与运维。`;
	return {
		level,
		score: round(score, 2),
		sites,
		summary,
		corrections: corrections$1(level, nearest, input.waters)
	};
}
function emptyBird() {
	return {
		level: "low",
		score: 0,
		sites: [],
		summary: "未检索到栖息地数据。",
		corrections: ["鸟类活动数据不足，建议现场询问是否有鹭类、雁鸭或猛禽停栖。"]
	};
}
function birdRiskRow(bird) {
	const nearest = bird.sites[0];
	return {
		id: "birds",
		type: "大型鸟类活动",
		level: bird.level,
		basis: nearest ? `最近栖息地「${nearest.name}」（${nearest.kind}）约 ${nearest.distKm} km，指示种：${nearest.species}。另有 ${Math.max(0, bird.sites.length - 1)} 处近场记录。` : "近场名录与 OSM 均未检出湿地/保护区/观鸟点",
		consequence: bird.level === "low" ? "鸟击和筑巢风险低，保持天沟清洁即可" : "玻璃撞击伤亡、屋檐筑巢堵塞雨水系统、鸟粪腐蚀金属围护、电气设备短路"
	};
}
function kindFromTags(tags) {
	if (!tags) return "地点";
	if (tags.leisure === "bird_hide" || tags.tourism === "bird_hide") return "观鸟点";
	if (tags.natural === "wetland") return "湿地";
	if (tags.leisure === "nature_reserve" || tags.boundary === "protected_area") return "自然保护区";
	if (tags.waterway) return "河道";
	if (tags.natural === "water" || tags.landuse === "reservoir") return "水体";
	if ((tags.name || "").match(/湿地|候鸟|观鸟|红树林|自然保护/)) return "栖息地";
	return tags.natural || tags.leisure || "地点";
}
function isBirdish(tags) {
	if (!tags) return false;
	if (tags.natural === "wetland") return true;
	if (tags.leisure === "nature_reserve" || tags.leisure === "bird_hide") return true;
	if (tags.tourism === "bird_hide") return true;
	if (tags.boundary === "protected_area") return true;
	const n = tags.name ?? "";
	return /湿地|候鸟|观鸟|红树林|鹭|鹤|鹳|雁/.test(n);
}
function isWaterish(tags) {
	if (!tags) return false;
	if (tags.waterway) return true;
	if (tags.natural === "water" || tags.natural === "bay") return true;
	if (tags.landuse === "reservoir") return true;
	if (tags.water) return true;
	return false;
}
var FACTOR_OPTIONS = [
	{
		id: "rain",
		name: "强降雨",
		hint: "气象、径流与内涝"
	},
	{
		id: "wind",
		name: "强风",
		hint: "对照 GB 50009"
	},
	{
		id: "birds",
		name: "大型鸟类",
		hint: "湿地与保护区"
	}
];
var DEFAULT_FACTORS = [
	"rain",
	"wind",
	"birds"
];
function normalizeFactors(raw) {
	if (!Array.isArray(raw)) return [...DEFAULT_FACTORS];
	const next = raw.filter((x) => x === "rain" || x === "wind" || x === "birds");
	return [...new Set(next)];
}
function hasFactor(factors, id) {
	return factors.includes(id);
}
function factorTitle(factors) {
	const names = FACTOR_OPTIONS.filter((f) => factors.includes(f.id)).map((f) => f.name);
	if (!names.length) return "场地高程卫星分析报告";
	return `${names.join("、")}对建筑物影响卫星分析报告`;
}
var LEVEL_ZH = {
	low: "低",
	"mid-low": "中低",
	mid: "中",
	"mid-high": "中高",
	high: "高"
};
function placeLine(p) {
	const bits = [
		p.place.state,
		p.place.city,
		p.place.district,
		p.place.suburb,
		p.place.road
	].filter((v) => Boolean(v));
	const uniq = [];
	for (const b of bits) if (!uniq.includes(b)) uniq.push(b);
	return uniq.join(" · ") || p.place.displayName;
}
function pct(ratio) {
	if (ratio == null) return "—";
	return `${Math.round(ratio * 100)}%`;
}
function fallbackReport(probe) {
	const date = zhDate(new Date(probe.analyzedAt));
	const loc = placeLine(probe);
	const ns = probe.sourceLabel;
	const out = probe.outletLabel;
	const nearest = probe.waters[0];
	const vSpan = [...probe.vertices].sort((a, b) => a.elevM - b.elevM);
	const low = vSpan[0];
	const high = vSpan[vSpan.length - 1];
	const w = probe.weather;
	const wind = probe.wind;
	const birds = probe.birds;
	const factors = normalizeFactors(probe.factors);
	const wantRain = hasFactor(factors, "rain");
	const wantWind = hasFactor(factors, "wind");
	const wantBirds = hasFactor(factors, "birds");
	const positioning = `根据交办的场地坐标（${probe.lat.toFixed(6)}°N，${probe.lng.toFixed(6)}°E）逆地理编码与卫星套合后，分析对象位于${loc}。围合按约 ${probe.extentM} 米边长取样，面积约 ${probe.areaM2} 平方米，院内按多层建筑及硬化场地情景研判。本次勾选因子：${factors.length ? factors.map((id) => ({
		rain: "强降雨",
		wind: "强风",
		birds: "大型鸟类"
	})[id]).join("、") : "仅场地高程"}。`;
	const terrainJudgement = `地势判断：近场最高约 ${formatElev(probe.maxElevM)}，最低约 ${formatElev(probe.minElevM)}，相对高差 ${formatElev(probe.reliefM)}。场地中心高程 ${formatElev(probe.siteElevM)}，坡度约 ${probe.slopePct}%，整体倾向${out}（来水主方向${ns}）。${high && low ? `围合顶点中 ${high.id}（${high.role}）相对最高，${low.id}（${low.role}）相对最低。` : ""}${probe.isDepression ? "场地接近局部洼地，内涝敏感。" : "场地并非封闭洼地，排水取决于出水口与下游通道。"}`;
	const flowLead = `结合高程网格（约 30 米）与 D8 流向，强降雨时近场水流可概括为四条路径：高位来水自${ns}侧直冲场地；侧向客水在转角收敛；南/高位墙段拦水后沿两侧绕流；${out}侧最低口为天然出水。`;
	const watershed = nearest ? `片区汇水上，分析对象卡在高位汇水与下游廊道之间。最近水体「${nearest.name}」（${nearest.kind}）距场地约 ${formatDist(nearest.distM)}${nearest.elevM != null ? `，水面高程约 ${formatElev(nearest.elevM)}` : ""}。真正需要盯住的，往往不是干流漫滩，而是坡面短时洪峰、泥沙枝叶堵塞出水口，以及院内来不及排出造成的内涝。` : `近场 2 公里未检索到可靠的 OSM 水系。研判仍以坡面径流与场地自身汇水为主，河道淹没暂不作主因。`;
	const rainLine = wantRain ? `强降雨的主要威胁是${probe.risks.find((r) => r.id === "torrent")?.level !== "low" ? "高位径流冲击围护、角落集中汇水与最低口内涝" : "场地硬化面短时积水与出水不畅"}；${probe.risks.find((r) => r.id === "river")?.level === "low" ? "干流淹没可基本排除。" : "河道水位需要一并关注。"}` : "";
	const windLine = wantWind ? `抗风方面，来风为设计值的 ${pct(wind.incomingRatio)}，历史风速为设计值的 ${pct(wind.histRatio)}，现状为${wind.status === "over" ? "超过设计值" : wind.status === "near" ? "临近设计值" : "低于设计值的八成"}。` : "";
	const birdLine = wantBirds ? `鸟类活动因子为${LEVEL_ZH[birds.level]}。` : "";
	const keyConclusion = `该建筑物${probe.reliefM > 12 && probe.slopePct > 6 ? "更像山前或坡地台地上的「拦水台阶」" : probe.isDepression ? "更接近局部低洼汇水点" : "地处相对平缓建成区"}。${rainLine}${windLine}${birdLine}`;
	const basin = nearest ? `雨水总路径可概括为：高位坡面 → 场地围护 → 沿${out}向下游 → 近场水体「${nearest.name}」所在河谷/管网。场地与最近水体平面距离约 ${formatDist(nearest.distM)}，高差${nearest.elevM != null ? `约 ${formatElev(probe.siteElevM - nearest.elevM)}` : "需现场复核"}。` : `雨水最终进入市政雨水管或更远处河道。缺少近场水系几何，流域段落只能做到定性。`;
	const weatherNarrative = !wantRain ? "" : w.source === "unavailable" ? "本次未能拉取到逐日降水预报，以下研判针对「此类强降雨再次发生时」的场地响应，而非正在过境的天气过程。" : `近场气象（${w.source}）：当前 ${w.symbol}${w.tempC != null ? `，气温 ${w.tempC}°C` : ""}${w.windMs != null ? `，风速 ${w.windMs} m/s` : ""}${w.windGustMs != null ? `（阵风 ${w.windGustMs} m/s）` : ""}。过去约 3 日累计降水 ${w.past3dMm} 毫米，未来 7 日约 ${w.next7dMm} 毫米${w.wettestDayDate ? `，最湿日 ${w.wettestDayDate} 约 ${w.wettestDayMm} 毫米` : ""}。本次分析针对场地在「强降雨再现」时的响应，预报偏弱不代表场地结构风险消失。`;
	const windStatusLine = wind.status === "over" ? "已达到或超过设计值，须按超设计事件采取加固与避险。" : wind.status === "near" ? "已临近设计值（≥80%），围护连接、屋面和临时结构处于敏感区间。" : "目前低于设计值的 80%，抗风不是本次主导风险。";
	const windNarrative = wantWind ? `抗风对照采用 GB 50009-2012 公开基本风压：${wind.designSource}，换算 10 m 基本风速约 ${wind.designV10} m/s，阵风参考 ${wind.designGust} m/s（阵风系数 1.4）。来风（预报最大${wind.incomingGustMaxMs != null ? "阵风" : "风速"}）约 ${wind.incomingGustMaxMs ?? wind.incomingMaxMs ?? "—"} m/s，为设计值的 ${pct(wind.incomingRatio)}${wind.incomingMaxDate ? `（${wind.incomingMaxDate}）` : ""}。近 ${wind.histDays || "—"} 日历史最大约 ${wind.histGustMaxMs ?? wind.histMaxMs ?? "—"} m/s，为设计值的 ${pct(wind.histRatio)}。${windStatusLine}${wind.terrainNote ? `地形：${wind.terrainNote}。` : ""}修正方案见建议条：临近或超标时复核幕墙、屋面、雨棚连接，关闭贯通开口，山脊/迎风坡计地形增大系数。` : "";
	const birdNarrative = wantBirds ? birds.summary + (birds.sites[0] ? ` 公开数据来源包括湿地/保护区名录与 OSM。大型鸟类频繁活动区对建筑物的主要影响是玻璃撞击、屋檐筑巢堵塞天沟（与内涝叠加）、以及鸟粪对金属围护的腐蚀。` : "") : "";
	const geoHazard = probe.slopePct > 12 || probe.maxElevM - probe.siteElevM > 20 ? `场地紧贴高位坡面，属于「房前屋后高陡边坡」类风险地貌。即使未列入当地年度地灾点名单，强降雨及雨后 24 小时仍应按临坡建筑加密巡查墙体裂缝、墙根积水与出水口堵塞。本段为遥感地貌判断，不能替代地质灾害详查。` : `邻域坡度中等或偏缓，崩塌滑坡不是首要情景，但雨后仍应查看散水、挡墙与排水沟。地灾结论须以当地官方隐患点名录与现场勘察为准。`;
	const recs = [
		...wantRain ? [
			`在${ns}侧围护外设置或清理截洪沟，把山体/高位客水在入墙前导向两侧，避免正冲墙段。`,
			`在${low ? `${low.id}（${low.role}）` : out + "侧最低口"}明确出水口，接通道路边沟或市政雨水管，防止「有坡无口」。`,
			`场地硬化面补设雨水口，检查电缆沟、设备房、半地下空间的挡水门槛和抽排。`,
			`强降雨及雨后 24 小时加密巡查边坡、围墙裂缝、墙根积水、出水口堵塞（枯枝落叶、泥沙、鸟巢）。`,
			nearest ? `与下游市政排水及邻近地块衔接，避免道路积水顶托回灌；关注「${nearest.name}」水位只作为背景，主战场仍在场地排水。` : `与周边地块及市政雨水衔接，避免下游顶托回灌。`
		] : [`按本次勾选因子落实现场复核，场地中心 ${probe.lat.toFixed(5)}°N，${probe.lng.toFixed(5)}°E。`],
		...wantWind ? wind.corrections.slice(0, wind.status === "ok" ? 1 : 2) : [],
		...wantBirds ? birds.corrections.slice(0, birds.level === "low" ? 1 : 2) : []
	];
	return {
		title: factorTitle(factors),
		locationTitle: loc,
		date,
		serial: serialFor(probe.lat, probe.lng, new Date(probe.analyzedAt)),
		positioning,
		terrainJudgement,
		flowLead,
		watershed,
		keyConclusion,
		basin,
		weatherNarrative,
		windNarrative,
		birdNarrative,
		geoHazard,
		conclusion: keyConclusion,
		recommendations: recs,
		limitations: "本分析为遥感快速研判，不能替代 1:500 地形图、现场排水管网测绘、岩土勘察和结构抗风计算。高程网格分辨率约 30 米。未勾选的影响因子不参与本次等级与叙述。基本风压摘自 GB 50009-2012 公开附表。鸟类栖息地来自公开名录与 OSM，非实时观测。中国大陆底图为高德（GCJ-02），分析坐标为 WGS-84。",
		ai: false
	};
}
function compactForModel(probe) {
	return {
		factors: normalizeFactors(probe.factors),
		place: probe.place,
		lat: probe.lat,
		lng: probe.lng,
		extentM: probe.extentM,
		areaM2: probe.areaM2,
		siteElevM: probe.siteElevM,
		minElevM: probe.minElevM,
		maxElevM: probe.maxElevM,
		reliefM: probe.reliefM,
		slopePct: probe.slopePct,
		aspectLabel: probe.aspectLabel,
		sourceLabel: probe.sourceLabel,
		outletLabel: probe.outletLabel,
		isDepression: probe.isDepression,
		vertices: probe.vertices,
		waters: probe.waters.slice(0, 5),
		weather: {
			source: probe.weather.source,
			symbol: probe.weather.symbol,
			tempC: probe.weather.tempC,
			windMs: probe.weather.windMs,
			windGustMs: probe.weather.windGustMs,
			past3dMm: probe.weather.past3dMm,
			next7dMm: probe.weather.next7dMm,
			wettestDayMm: probe.weather.wettestDayMm,
			wettestDayDate: probe.weather.wettestDayDate
		},
		wind: {
			designW0: probe.wind.designW0,
			designV10: probe.wind.designV10,
			designGust: probe.wind.designGust,
			designSource: probe.wind.designSource,
			incomingMaxMs: probe.wind.incomingMaxMs,
			incomingGustMaxMs: probe.wind.incomingGustMaxMs,
			incomingRatio: probe.wind.incomingRatio,
			histMaxMs: probe.wind.histMaxMs,
			histGustMaxMs: probe.wind.histGustMaxMs,
			histRatio: probe.wind.histRatio,
			status: probe.wind.status,
			terrainNote: probe.wind.terrainNote,
			corrections: probe.wind.corrections
		},
		birds: {
			level: LEVEL_ZH[probe.birds.level],
			summary: probe.birds.summary,
			sites: probe.birds.sites.slice(0, 5),
			corrections: probe.birds.corrections
		},
		discharge: probe.discharge,
		risks: probe.risks.map((r) => ({
			type: r.type,
			level: LEVEL_ZH[r.level],
			basis: r.basis
		})),
		overall: LEVEL_ZH[probe.overallLevel]
	};
}
var WMO = {
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
	99: "强雷暴冰雹"
};
function symbolFromMet(code) {
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
function dayKey(iso) {
	return iso.slice(0, 10);
}
function parseMetNo(json, now = /* @__PURE__ */ new Date()) {
	const ts = json.properties?.timeseries ?? [];
	const first = ts[0];
	const instant = first?.data.instant?.details ?? {};
	const byDay = /* @__PURE__ */ new Map();
	for (const row of ts) {
		const day = dayKey(row.time);
		const acc = byDay.get(day) ?? {
			rain: 0,
			temp: [],
			wind: [],
			gust: [],
			dir: [],
			symbol: "多云"
		};
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
		const sym = row.data.next_1_hours?.summary?.symbol_code ?? row.data.next_6_hours?.summary?.symbol_code;
		if (sym) acc.symbol = symbolFromMet(sym);
		byDay.set(day, acc);
	}
	const days = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(0, 8).map(([date, v]) => ({
		date,
		rainMm: round(v.rain, 1),
		tempC: v.temp.length ? round(v.temp.reduce((a, b) => a + b, 0) / v.temp.length, 1) : null,
		windMs: v.wind.length ? round(Math.max(...v.wind), 1) : null,
		windGustMs: v.gust.length ? round(Math.max(...v.gust), 1) : null,
		windDirDeg: v.dir.length ? round(v.dir[0], 0) : null,
		symbol: v.symbol
	}));
	const today = dayKey(now.toISOString());
	const past3dMm = days.filter((d) => d.date < today).slice(-3).reduce((s, d) => s + d.rainMm, 0);
	const future = days.filter((d) => d.date >= today);
	const next7dMm = future.slice(0, 7).reduce((s, d) => s + d.rainMm, 0);
	let wettest = future[0] ?? days[0];
	for (const d of days) if (!wettest || d.rainMm > wettest.rainMm) wettest = d;
	return {
		source: "MET Norway Locationforecast",
		asOf: json.properties?.meta?.updated_at ?? first?.time ?? now.toISOString(),
		tempC: typeof instant.air_temperature === "number" ? round(instant.air_temperature, 1) : null,
		windMs: typeof instant.wind_speed === "number" ? round(instant.wind_speed, 1) : null,
		windGustMs: typeof instant.wind_speed_of_gust === "number" ? round(instant.wind_speed_of_gust, 1) : null,
		windDirDeg: typeof instant.wind_from_direction === "number" ? round(instant.wind_from_direction, 0) : null,
		humidity: typeof instant.relative_humidity === "number" ? round(instant.relative_humidity, 0) : null,
		symbol: symbolFromMet(first?.data.next_1_hours?.summary?.symbol_code),
		precipNowMm: round(first?.data.next_1_hours?.details?.precipitation_amount ?? 0, 1),
		past3dMm: round(past3dMm, 1),
		next7dMm: round(next7dMm, 1),
		wettestDayMm: round(wettest?.rainMm ?? 0, 1),
		wettestDayDate: wettest?.date ?? null,
		days
	};
}
function parseOpenMeteo(json, now = /* @__PURE__ */ new Date()) {
	const daily = json.daily;
	const days = (daily?.time ?? []).map((date, i) => ({
		date,
		rainMm: round(daily?.precipitation_sum?.[i] ?? daily?.rain_sum?.[i] ?? 0, 1),
		tempC: daily?.temperature_2m_max?.[i] ?? null,
		windMs: daily?.wind_speed_10m_max?.[i] ?? null,
		windGustMs: daily?.wind_gusts_10m_max?.[i] ?? null,
		windDirDeg: daily?.wind_direction_10m_dominant?.[i] ?? null,
		symbol: WMO[daily?.weather_code?.[i] ?? 2] ?? "多云"
	}));
	const today = dayKey(now.toISOString());
	const past3dMm = days.filter((d) => d.date < today).slice(-3).reduce((s, d) => s + d.rainMm, 0);
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
		days
	};
}
function emptyWeather() {
	return {
		source: "unavailable",
		asOf: (/* @__PURE__ */ new Date()).toISOString(),
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
		days: []
	};
}
function parseDischarge(json) {
	const mean = json.daily?.river_discharge_mean?.find((v) => v != null) ?? null;
	const nextMax = json.daily?.river_discharge_max ? Math.max(...json.daily.river_discharge_max.filter((v) => v != null)) : json.daily?.river_discharge?.filter((v) => v != null)[0] ?? null;
	const ratio = mean && nextMax ? nextMax / Math.max(mean, .01) : null;
	return {
		available: mean != null || nextMax != null,
		meanM3s: mean != null ? round(mean, 2) : null,
		nextMaxM3s: nextMax != null ? round(nextMax, 2) : null,
		ratio: ratio != null ? round(ratio, 2) : null
	};
}
/** GB 50009-2012 附录 E：50 年一遇基本风压（kN/m²），公开规范摘录。 */
var CITY_W0 = {
	北京: .45,
	天津: .5,
	石家庄: .35,
	太原: .4,
	呼和浩特: .55,
	沈阳: .55,
	大连: .65,
	长春: .65,
	哈尔滨: .55,
	上海: .55,
	南京: .4,
	杭州: .45,
	宁波: .5,
	温州: .65,
	舟山: .7,
	合肥: .35,
	福州: .7,
	厦门: .8,
	思明: .8,
	湖里: .8,
	海沧: .8,
	集美: .8,
	同安: .75,
	翔安: .75,
	泉州: .75,
	漳州: .7,
	莆田: .7,
	宁德: .7,
	三明: .35,
	南平: .35,
	龙岩: .4,
	南昌: .45,
	济南: .45,
	青岛: .6,
	烟台: .55,
	威海: .6,
	郑州: .45,
	武汉: .35,
	长沙: .35,
	广州: .5,
	深圳: .75,
	珠海: .85,
	汕头: .8,
	湛江: .8,
	阳江: .8,
	茂名: .7,
	揭阳: .75,
	汕尾: .75,
	潮州: .7,
	佛山: .5,
	东莞: .55,
	中山: .6,
	江门: .7,
	惠州: .55,
	韶关: .35,
	梅州: .4,
	清远: .4,
	南宁: .35,
	桂林: .3,
	北海: .75,
	海口: .75,
	三亚: .85,
	文昌: .8,
	重庆: .4,
	成都: .3,
	贵阳: .3,
	昆明: .3,
	拉萨: .3,
	西安: .35,
	兰州: .3,
	西宁: .35,
	银川: .65,
	乌鲁木齐: .6,
	香港: .9,
	澳门: .85,
	台北: .7,
	高雄: .8,
	秦皇岛: .45,
	唐山: .4,
	徐州: .35,
	苏州: .45,
	无锡: .45,
	南通: .45,
	连云港: .55
};
var PROVINCE_W0 = {
	北京: .45,
	天津: .5,
	河北: .4,
	山西: .4,
	内蒙古: .55,
	辽宁: .55,
	吉林: .55,
	黑龙江: .45,
	上海: .55,
	江苏: .4,
	浙江: .5,
	安徽: .35,
	福建: .5,
	江西: .4,
	山东: .45,
	河南: .4,
	湖北: .35,
	湖南: .35,
	广东: .55,
	广西: .35,
	海南: .75,
	重庆: .4,
	四川: .3,
	贵州: .3,
	云南: .3,
	西藏: .35,
	陕西: .35,
	甘肃: .35,
	青海: .35,
	宁夏: .55,
	新疆: .55,
	香港: .9,
	澳门: .85,
	台湾: .7
};
function stripAdmin(s) {
	return s.replace(/市|省|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区|地区|盟|州|县|区$/g, "").trim();
}
function namesOf(place) {
	const raw = [
		place.city,
		place.district,
		place.suburb,
		place.state,
		place.displayName
	].filter((v) => Boolean(v)).flatMap((s) => s.split(/[·,，、/\s]+/)).map(stripAdmin).filter((s) => s.length >= 2);
	const blob = [
		place.city,
		place.district,
		place.state,
		place.displayName
	].filter(Boolean).join(" ");
	for (const key of Object.keys(CITY_W0)) if (blob.includes(key) && !raw.includes(key)) raw.push(key);
	return raw;
}
function lookupDesignWind(place, lat, lng) {
	const names = namesOf(place);
	for (const n of names) if (CITY_W0[n] != null) return {
		w0: CITY_W0[n],
		source: `GB 50009-2012 基本风压 · ${n} ${CITY_W0[n].toFixed(2)} kN/m²（50 年一遇）`,
		matched: n,
		official: true
	};
	for (const n of names) if (PROVINCE_W0[n] != null) return {
		w0: PROVINCE_W0[n],
		source: `GB 50009-2012 省域参考 · ${n} ${PROVINCE_W0[n].toFixed(2)} kN/m²（50 年一遇）`,
		matched: n,
		official: true
	};
	const cc = place.countryCode?.toLowerCase();
	if (cc === "cn" || cc === "hk" || cc === "mo" || cc === "tw") {
		const coastal = isCoastalChina(lat, lng);
		const w0 = coastal ? .7 : .4;
		return {
			w0,
			source: `未列入城市表，按${coastal ? "东南沿海" : "内陆"}默认 ${w0.toFixed(2)} kN/m²（GB 50009 量级）`,
			matched: coastal ? "沿海默认" : "内陆默认",
			official: false
		};
	}
	return {
		w0: .4,
		source: "非中国规范覆盖区，暂按 0.40 kN/m² 对照；正式设计应以当地荷载规范为准",
		matched: "缺省",
		official: false
	};
}
function isCoastalChina(lat, lng) {
	if (lat < 18 || lat > 41.5) return lng > 108 && lat < 22;
	if (lat < 20.2 && lng > 108.5) return true;
	if (lat < 25.6 && lng > 116.8) return true;
	if (lat < 28 && lng > 119.2) return true;
	if (lat < 32 && lng > 120.4) return true;
	if (lat < 36 && lng > 119.5) return true;
	if (lat < 41 && lng > 119.2) return true;
	if (lng > 120.8 && lat > 21 && lat < 41) return true;
	return false;
}
/** v0 (m/s) from basic wind pressure: v = sqrt(1600 · w0), ρ ≈ 1.25 kg/m³. */
function w0ToV10(w0) {
	return Math.sqrt(1600 * w0);
}
var GUST_FACTOR = 1.4;
function percentile(values, p) {
	if (!values.length) return null;
	const s = [...values].sort((a, b) => a - b);
	const i = (s.length - 1) * p;
	const lo = Math.floor(i);
	const hi = Math.ceil(i);
	if (lo === hi) return s[lo];
	return s[lo] * (hi - i) + s[hi] * (i - lo);
}
function summarizeWindHistory(daily, source = "Open-Meteo Archive / ERA5") {
	const speeds = (daily.wind_speed_10m_max ?? []).filter((v) => v != null && Number.isFinite(v));
	const gusts = (daily.wind_gusts_10m_max ?? []).filter((v) => v != null && Number.isFinite(v));
	return {
		days: Math.max(speeds.length, gusts.length),
		maxMs: speeds.length ? round(Math.max(...speeds), 1) : null,
		maxGustMs: gusts.length ? round(Math.max(...gusts), 1) : null,
		p95Ms: speeds.length ? round(percentile(speeds, .95) ?? 0, 1) : null,
		source
	};
}
function emptyWindHistory() {
	return {
		days: 0,
		maxMs: null,
		maxGustMs: null,
		p95Ms: null,
		source: "unavailable"
	};
}
function levelFromRatio(r) {
	if (r >= 1.15) return "high";
	if (r >= 1) return "mid-high";
	if (r >= .85) return "mid";
	if (r >= .7) return "mid-low";
	return "low";
}
function statusOf(r) {
	if (r >= 1) return "over";
	if (r >= .8) return "near";
	return "ok";
}
function terrainNote(cat, slopePct, reliefM, coastal) {
	const bits = [];
	bits.push(cat === "A" ? "地面粗糙度 A 类（海滨/空旷）" : cat === "C" ? "地面粗糙度 C 类（城市）" : cat === "D" ? "地面粗糙度 D 类（密集高层）" : "地面粗糙度 B 类（乡村/中小城镇）");
	if (coastal) bits.push("滨海，来流湍流与阵风更强");
	if (reliefM > 40 && slopePct > 12) bits.push("近场为迎风坡/台地，宜计地形增大系数 1.1–1.3");
	else if (slopePct > 18) bits.push("坡度较大，局部加速可能高于 10 m 开敞风速");
	return bits.join("；");
}
function corrections(status, ratio, coastal, hilly) {
	const recs = [];
	if (status === "ok") {
		recs.push("来风与近一年历史风速均低于设计基本风速的 80%，抗风不是本次主导风险，仍应按规范做日常屋面、幕墙连接巡检。");
		recs.push("强对流或台风季节仍应临时收整屋面杂物、广告布和脚手架，避免成为风致飞射物。");
		return recs;
	}
	if (status === "near") {
		recs.push(`来风或历史风速已达设计值的 ${Math.round(ratio * 100)}%，属临近设计工况。按 GB 50009 复核幕墙板块、屋面瓦/压型钢板、雨棚、女儿墙和广告牌的抗风连接，不足则加密压条或换更高等级五金。`);
		recs.push("台风/大风来临前关闭迎风面大面积开启扇，避免形成贯通开口导致内压骤增；临时围挡、脚手架应拉结或拆除。");
		recs.push("检查采光顶、雨棚、雨水管卡箍；清理屋面易飞物件。雨风叠加时按风驱雨检查迎风墙渗漏。");
	} else {
		recs.push(`来风或历史风速已达到/超过设计基本风速（约 ${Math.round(ratio * 100)}%）。按超设计事件对待：大风过程中人员避免紧贴大面积玻璃幕墙内侧；停止吊装与室外作业。`);
		recs.push("事后按 GB 50009 / GB 50011 思路检查：幕墙板块移位、结构连接松动、屋面防水掀起、门窗框变形。不足时应提高抗风构造（加强节点、增加抗风拉结、更换抗风压等级更高的门窗）。");
		recs.push("临时结构立即加固或拆除；广告牌、脚手架、围挡按抗风应急预案拉结。");
	}
	if (hilly) recs.push("场地有迎风坡/山脊效应，10 m 开敞风速不能直接当作用到建筑物的风。建议按规范地形系数放大，或对超限体型做风洞/CFD 复核。");
	if (coastal) recs.push("滨海场所需同时考虑盐雾腐蚀对连接件的削弱，以及台风过程的风驱雨；外墙防水和金属连接宜按海洋环境设防。");
	recs.push("本对照用 10 m 风速与 50 年一遇基本风压换算，不能替代结构专业的体型系数、高度变化系数和阵风系数完整计算。");
	return recs;
}
function assessWind(input) {
	const design = lookupDesignWind(input.place, input.lat, input.lng);
	const designV10 = round(w0ToV10(design.w0), 1);
	const designGust = round(designV10 * GUST_FACTOR, 1);
	const coastal = isCoastalChina(input.lat, input.lng);
	const hilly = input.reliefM > 40 && input.slopePct > 12;
	const urban = Boolean(input.place.road && (input.place.city || input.place.district));
	const terrainCat = coastal && !urban ? "A" : urban ? "C" : "B";
	const forecastMax = Math.max(0, input.weather.windMs ?? 0, ...input.weather.days.map((d) => d.windMs ?? 0));
	const forecastGust = Math.max(0, input.weather.windGustMs ?? 0, ...input.weather.days.map((d) => d.windGustMs ?? 0));
	const incomingMaxMs = forecastMax > 0 ? round(forecastMax, 1) : null;
	const incomingGustMaxMs = forecastGust > 0 ? round(forecastGust, 1) : null;
	let incomingMaxDate = null;
	let best = -1;
	for (const d of input.weather.days) {
		const g = Math.max(d.windGustMs ?? 0, d.windMs ?? 0);
		if (g > best) {
			best = g;
			incomingMaxDate = d.date;
		}
	}
	const terrainAmp = hilly ? 1.15 : 1;
	const inMeanR = incomingMaxMs != null ? incomingMaxMs * terrainAmp / Math.max(designV10, .1) : 0;
	const inGustR = incomingGustMaxMs != null ? incomingGustMaxMs * terrainAmp / Math.max(designGust, .1) : 0;
	const incomingRatio = Math.max(inMeanR, inGustR);
	const histMeanR = input.hist.maxMs != null ? input.hist.maxMs * terrainAmp / Math.max(designV10, .1) : 0;
	const histGustR = input.hist.maxGustMs != null ? input.hist.maxGustMs * terrainAmp / Math.max(designGust, .1) : 0;
	const histRatio = Math.max(histMeanR, histGustR);
	const governing = Math.max(incomingRatio, histRatio);
	const status = statusOf(governing);
	const dir = input.weather.windDirDeg ?? input.weather.days.find((d) => d.date === incomingMaxDate)?.windDirDeg ?? null;
	return {
		source: input.weather.source,
		nowMs: input.weather.windMs,
		nowGustMs: input.weather.windGustMs,
		directionDeg: dir,
		incomingMaxMs,
		incomingGustMaxMs,
		incomingMaxDate,
		histMaxMs: input.hist.maxMs,
		histGustMaxMs: input.hist.maxGustMs,
		histP95Ms: input.hist.p95Ms,
		histDays: input.hist.days,
		histSource: input.hist.source,
		designW0: design.w0,
		designV10,
		designGust,
		designSource: design.source,
		terrainCat,
		terrainNote: terrainNote(terrainCat, input.slopePct, input.reliefM, coastal),
		incomingRatio: incomingRatio > 0 ? round(incomingRatio, 2) : null,
		histRatio: histRatio > 0 ? round(histRatio, 2) : null,
		status,
		corrections: corrections(status, governing, coastal, hilly)
	};
}
function emptyWind() {
	return {
		source: "unavailable",
		nowMs: null,
		nowGustMs: null,
		directionDeg: null,
		incomingMaxMs: null,
		incomingGustMaxMs: null,
		incomingMaxDate: null,
		histMaxMs: null,
		histGustMaxMs: null,
		histP95Ms: null,
		histDays: 0,
		histSource: "unavailable",
		designW0: .4,
		designV10: round(w0ToV10(.4), 1),
		designGust: round(w0ToV10(.4) * GUST_FACTOR, 1),
		designSource: "缺省 0.40 kN/m²",
		terrainCat: "B",
		terrainNote: "未取得风速观测",
		incomingRatio: null,
		histRatio: null,
		status: "ok",
		corrections: ["风速数据不足，抗风结论仅按规范缺省值提示，需以当地气象站与荷载规范复核。"]
	};
}
function windRiskRow(wind) {
	const level = levelFromRatio(Math.max(wind.incomingRatio ?? 0, wind.histRatio ?? 0));
	const inPct = wind.incomingRatio != null ? `${Math.round(wind.incomingRatio * 100)}%` : "—";
	const hPct = wind.histRatio != null ? `${Math.round(wind.histRatio * 100)}%` : "—";
	const basis = `设计基本风速约 ${wind.designV10} m/s（阵风参考 ${wind.designGust} m/s，${wind.designSource}）。来风最大 ${wind.incomingGustMaxMs ?? wind.incomingMaxMs ?? "—"} m/s（${inPct}），近${wind.histDays || "—"}日历史最大阵风 ${wind.histGustMaxMs ?? wind.histMaxMs ?? "—"} m/s（${hPct}）。${wind.terrainNote}`;
	let consequence;
	if (wind.status === "over") consequence = "幕墙/屋面/雨棚可能超出原设计风压，存在板块脱落、屋面掀起、门窗破坏风险";
	else if (wind.status === "near") consequence = "接近设计风压，连接薄弱部位、临时结构和大面积玻璃为敏感点";
	else consequence = "风压总体低于设计值，风致破坏不是主因";
	return {
		id: "wind",
		type: "强风超设计值",
		level,
		basis,
		consequence
	};
}
var SAMPLE_SITES = [
	{
		id: "sanming-jiuzhong",
		name: "三明九中东侧院落",
		subtitle: "福建三明 · 原报告样例",
		lat: 26.23953,
		lng: 117.62091,
		extentM: 72,
		vertices: [
			{
				id: "P1",
				lng: 117.6212063,
				lat: 26.23970253,
				role: "东北角"
			},
			{
				id: "P2",
				lng: 117.6205898,
				lat: 26.23983583,
				role: "西北角"
			},
			{
				id: "P3",
				lng: 117.6204957,
				lat: 26.23937413,
				role: "西南角"
			},
			{
				id: "P4",
				lng: 117.6210847,
				lat: 26.23920885,
				role: "东南角"
			},
			{
				id: "P5",
				lng: 117.6211656,
				lat: 26.23953543,
				role: "东墙中段"
			}
		]
	},
	{
		id: "xiamen-coast",
		name: "厦门岛东部海岸",
		subtitle: "台风区 · 抗风设计值对照",
		lat: 24.4796,
		lng: 118.1819,
		extentM: 80
	},
	{
		id: "poyang-wucheng",
		name: "鄱阳湖吴城湿地",
		subtitle: "大型候鸟栖息地",
		lat: 29.216,
		lng: 115.98,
		extentM: 90
	},
	{
		id: "chongqing-hongyadong",
		name: "重庆洪崖洞",
		subtitle: "嘉陵江岸 · 陡坡临江",
		lat: 29.5624,
		lng: 106.5769,
		extentM: 90
	},
	{
		id: "zhengzhou-jingguang",
		name: "郑州京广路隧道北口",
		subtitle: "720 特大暴雨对照",
		lat: 34.7469,
		lng: 113.6254,
		extentM: 80
	}
];
function matchSample(lat, lng) {
	return SAMPLE_SITES.find((s) => Math.abs(s.lat - lat) < 7e-4 && Math.abs(s.lng - lng) < 7e-4);
}
//#endregion
export { polygonAreaM2 as A, metersToLat as C, parseDischarge as D, parseCoordinate as E, windRiskRow as M, parseMetNo as O, matchSample as S, normalizeFactors as T, hasFactor as _, assessBirds as a, isWaterish as b, birdRiskRow as c, emptyBird as d, emptyWeather as f, fallbackReport as g, factorTitle as h, aspectLabel as i, summarizeWindHistory as j, parseOpenMeteo as k, compactForModel as l, emptyWindHistory as m, FACTOR_OPTIONS as n, assessWind as o, emptyWind as p, SAMPLE_SITES as r, autoVertices as s, DEFAULT_FACTORS as t, destination as u, haversine as v, metersToLng as w, kindFromTags as x, isBirdish as y };
