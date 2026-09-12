import { haversine } from "./geo";
import { round } from "@/lib/utils";
import type { BirdBlock, BirdSite, LatLng, RiskLevel, RiskRow, WaterFeature } from "./types";

type Catalog = {
  name: string;
  kind: string;
  lat: number;
  lng: number;
  radiusKm: number;
  species: string;
};

/** 公开名录：国家级湿地 / 自然保护区 / 东亚–澳大利西亚迁飞区重要栖息地（中心点示意）。 */
const CATALOG: Catalog[] = [
  { name: "鄱阳湖候鸟栖息地", kind: "国际重要湿地", lat: 29.12, lng: 116.28, radiusKm: 45, species: "白鹤、东方白鹳、雁鸭类" },
  { name: "洞庭湖湿地", kind: "国际重要湿地", lat: 29.35, lng: 112.95, radiusKm: 40, species: "候鸟、小天鹅" },
  { name: "扎龙自然保护区", kind: "自然保护区", lat: 47.2, lng: 124.25, radiusKm: 32, species: "丹顶鹤" },
  { name: "盐城黄海湿地", kind: "世界遗产/湿地", lat: 33.6, lng: 120.55, radiusKm: 35, species: "丹顶鹤、勺嘴鹬" },
  { name: "黄河三角洲湿地", kind: "国际重要湿地", lat: 37.8, lng: 118.98, radiusKm: 30, species: "东方白鹳、鹤类" },
  { name: "崇明东滩", kind: "候鸟保护区", lat: 31.5, lng: 121.96, radiusKm: 22, species: "鸻鹬、雁鸭" },
  { name: "青海湖", kind: "国际重要湿地", lat: 36.85, lng: 100.15, radiusKm: 45, species: "斑头雁、渔鸥" },
  { name: "若尔盖湿地", kind: "国际重要湿地", lat: 33.58, lng: 102.95, radiusKm: 35, species: "黑颈鹤" },
  { name: "草海", kind: "自然保护区", lat: 26.85, lng: 104.23, radiusKm: 18, species: "黑颈鹤" },
  { name: "闽江河口湿地", kind: "国家级湿地", lat: 26.05, lng: 119.63, radiusKm: 16, species: "黑嘴端凤头燕鸥、鹭类" },
  { name: "深圳福田红树林", kind: "自然保护区", lat: 22.53, lng: 114.0, radiusKm: 10, species: "鹭类、鸻鹬" },
  { name: "北戴河迁徙通道", kind: "迁飞通道", lat: 39.85, lng: 119.48, radiusKm: 22, species: "猛禽、雀形目" },
  { name: "东寨港红树林", kind: "自然保护区", lat: 19.95, lng: 110.58, radiusKm: 14, species: "鹭类、水鸟" },
  { name: "向海自然保护区", kind: "自然保护区", lat: 44.95, lng: 122.3, radiusKm: 25, species: "鹤类、鹳类" },
  { name: "升金湖", kind: "国际重要湿地", lat: 30.38, lng: 117.05, radiusKm: 20, species: "鹤类、雁鸭" },
  { name: "盘锦辽河口", kind: "湿地", lat: 40.88, lng: 121.85, radiusKm: 28, species: "丹顶鹤、黑嘴鸥" },
  { name: "衡水湖", kind: "自然保护区", lat: 37.6, lng: 115.6, radiusKm: 16, species: "鹭类、雁鸭" },
  { name: "野鸭湖", kind: "湿地", lat: 40.42, lng: 115.84, radiusKm: 12, species: "雁鸭、鹭类" },
  { name: "泉州湾河口湿地", kind: "湿地", lat: 24.88, lng: 118.68, radiusKm: 14, species: "鸻鹬、鹭类" },
  { name: "漳江口红树林", kind: "自然保护区", lat: 23.93, lng: 117.35, radiusKm: 12, species: "红树林水鸟" },
  { name: "杭州湾湿地", kind: "湿地", lat: 30.38, lng: 121.1, radiusKm: 18, species: "鸻鹬" },
  { name: "微山湖", kind: "湿地", lat: 34.65, lng: 117.2, radiusKm: 28, species: "雁鸭、鹭类" },
  { name: "太湖沿岸湿地", kind: "湖泊湿地", lat: 31.2, lng: 120.2, radiusKm: 30, species: "鹭类、雁鸭" },
  { name: "滇池", kind: "湖泊湿地", lat: 24.8, lng: 102.68, radiusKm: 16, species: "红嘴鸥、鹭类" },
  { name: "巢湖", kind: "湖泊湿地", lat: 31.55, lng: 117.55, radiusKm: 22, species: "雁鸭" },
  { name: "拉市海", kind: "湿地", lat: 26.9, lng: 100.15, radiusKm: 10, species: "候鸟" },
  { name: "曹妃甸湿地", kind: "湿地", lat: 39.15, lng: 118.4, radiusKm: 20, species: "鸻鹬" },
  { name: "北大港湿地", kind: "湿地", lat: 38.72, lng: 117.38, radiusKm: 16, species: "雁鸭、鹭类" },
  { name: "洪泽湖", kind: "湖泊湿地", lat: 33.3, lng: 118.7, radiusKm: 28, species: "雁鸭、鹭类" },
  { name: "东洞庭湖", kind: "国际重要湿地", lat: 29.45, lng: 113.1, radiusKm: 28, species: "候鸟" },
  { name: "厦门滨海湿地", kind: "滨海湿地", lat: 24.49, lng: 118.09, radiusKm: 12, species: "白鹭、鸻鹬" },
  { name: "珠江口淇澳–福田", kind: "红树林", lat: 22.42, lng: 113.65, radiusKm: 14, species: "鹭类、鸻鹬" },
  { name: "三江平原湿地", kind: "湿地群", lat: 47.3, lng: 133.5, radiusKm: 50, species: "鹤类、东方白鹳" },
  { name: "开封黄河湿地", kind: "湿地", lat: 34.85, lng: 114.35, radiusKm: 18, species: "雁鸭、鹭类" },
  { name: "南瓮河", kind: "自然保护区", lat: 51.2, lng: 125.5, radiusKm: 22, species: "水鸟" },
  { name: "东营黄河口", kind: "湿地", lat: 37.73, lng: 119.15, radiusKm: 24, species: "东方白鹳" },
];

function levelFrom(score: number): RiskLevel {
  if (score >= 0.78) return "high";
  if (score >= 0.58) return "mid-high";
  if (score >= 0.38) return "mid";
  if (score >= 0.2) return "mid-low";
  return "low";
}

function catalogHits(center: LatLng): { sites: BirdSite[]; score: number } {
  const sites: BirdSite[] = [];
  let score = 0;
  for (const c of CATALOG) {
    const distKm = haversine(center, { lat: c.lat, lng: c.lng }) / 1000;
    if (distKm > c.radiusKm * 1.6 && distKm > 55) continue;
    let add = 0;
    if (distKm <= c.radiusKm * 0.25) add = 0.82;
    else if (distKm <= c.radiusKm * 0.5) add = 0.58;
    else if (distKm <= c.radiusKm) add = 0.38;
    else if (distKm <= c.radiusKm * 1.5) add = 0.16;
    else add = 0.06;
    if (add >= 0.16 || distKm < 40) {
      sites.push({
        name: c.name,
        kind: c.kind,
        lat: c.lat,
        lng: c.lng,
        distKm: round(distKm, 1),
        species: c.species,
        source: "公开湿地/保护区名录",
      });
    }
    score += add;
  }
  return { sites, score };
}

function osmScore(sites: BirdSite[]) {
  let score = 0;
  for (const s of sites) {
    if (s.distKm < 1) score += 0.42;
    else if (s.distKm < 3) score += 0.26;
    else if (s.distKm < 8) score += 0.14;
    else if (s.distKm < 15) score += 0.07;
  }
  return score;
}

function flywayBonus(lat: number, lng: number) {
  const coastal =
    (lng > 116.5 && lat > 18 && lat < 41) || (lat < 20.5 && lng > 108);
  const inlandLake =
    (lng > 112 && lng < 118 && lat > 28 && lat < 32) ||
    (lng > 115 && lng < 117.5 && lat > 28.5 && lat < 30);
  if (coastal) return 0.08;
  if (inlandLake) return 0.05;
  return 0;
}

function corrections(level: RiskLevel, nearest: BirdSite | undefined, waters: WaterFeature[]) {
  const recs: string[] = [];
  if (level === "low") {
    recs.push("近场未检出大型鸟类高频栖息地。常规防鸟：封堵屋檐孔洞、雨季前清理天沟枯枝，避免偶发筑巢堵塞排水。");
    return recs;
  }
  recs.push(
    nearest
      ? `场地距「${nearest.name}」约 ${nearest.distKm} 公里（${nearest.species}）。大型鸟类频繁起降、停栖时，镜面玻璃、挑檐和裸露设备是主要冲突面。`
      : "近场湿地/保护区有大型水鸟或猛禽活动迹象。",
  );
  recs.push(
    "玻璃幕墙：避免大面积镜面朝向水面或绿地；采用可见点阵、竖向密分格、紫外图案或外侧遮阳，降低撞击。参考北美鸟类友好建筑与国内幕墙防鸟击实践。",
  );
  recs.push(
    "构筑物：屋檐、雨棚、广告龙骨加防栖刺或防鸟斜板，封堵洞口，防止鹭、鸠、喜鹊类筑巢。鸟巢堵塞天沟会直接加重内涝，须纳入汛前巡查。",
  );
  recs.push("金属屋面与外墙连接件注意鸟粪腐蚀；变配电、冷却塔、光伏支架加装挡鸟板，定期清扫。");
  recs.push("夜间减少朝向湿地的溢光和玻璃内透光，降低迁徙季撞窗。施工期避开当地繁殖高峰（一般 4–7 月，以当地名录为准）。");
  if (waters[0] && waters[0].distM < 800) {
    recs.push(`近场水体「${waters[0].name}」会吸引鹭类停栖，临水立面优先做防鸟处理。`);
  }
  return recs;
}

export function assessBirds(input: {
  center: LatLng;
  osmSites: BirdSite[];
  waters: WaterFeature[];
}): BirdBlock {
  const cat = catalogHits(input.center);
  const merged = [...cat.sites];
  for (const s of input.osmSites) {
    if (merged.some((m) => Math.abs(m.lat - s.lat) < 0.008 && Math.abs(m.lng - s.lng) < 0.008)) continue;
    merged.push(s);
  }
  merged.sort((a, b) => a.distKm - b.distKm);
  const sites = merged.slice(0, 8);
  const score = Math.min(1, cat.score + osmScore(input.osmSites) + flywayBonus(input.center.lat, input.center.lng));
  const level = levelFrom(score);
  const nearest = sites[0];
  const summary =
    level === "low"
      ? "近场 未见大型鸟类高频栖息地，鸟击与筑巢不是主导因子。"
      : `近场处于大型鸟类活动区${nearest ? `（最近：${nearest.name}，${nearest.distKm} km，${nearest.species}）` : ""}。需把玻璃撞击、屋面筑巢堵排水、鸟粪腐蚀纳入围护设计与运维。`;

  return {
    level,
    score: round(score, 2),
    sites,
    summary,
    corrections: corrections(level, nearest, input.waters),
  };
}

export function emptyBird(): BirdBlock {
  return {
    level: "low",
    score: 0,
    sites: [],
    summary: "未检索到栖息地数据。",
    corrections: ["鸟类活动数据不足，建议现场询问是否有鹭类、雁鸭或猛禽停栖。"],
  };
}

export function birdRiskRow(bird: BirdBlock): RiskRow {
  const nearest = bird.sites[0];
  return {
    id: "birds",
    type: "大型鸟类活动",
    level: bird.level,
    basis: nearest
      ? `最近栖息地「${nearest.name}」（${nearest.kind}）约 ${nearest.distKm} km，指示种：${nearest.species}。另有 ${Math.max(0, bird.sites.length - 1)} 处近场记录。`
      : "近场名录与 OSM 均未检出湿地/保护区/观鸟点",
    consequence:
      bird.level === "low"
        ? "鸟击和筑巢风险低，保持天沟清洁即可"
        : "玻璃撞击伤亡、屋檐筑巢堵塞雨水系统、鸟粪腐蚀金属围护、电气设备短路",
  };
}

export function kindFromTags(tags: Record<string, string> | undefined) {
  if (!tags) return "地点";
  if (tags.leisure === "bird_hide" || tags.tourism === "bird_hide") return "观鸟点";
  if (tags.natural === "wetland") return "湿地";
  if (tags.leisure === "nature_reserve" || tags.boundary === "protected_area") return "自然保护区";
  if (tags.waterway) return "河道";
  if (tags.natural === "water" || tags.landuse === "reservoir") return "水体";
  if ((tags.name || "").match(/湿地|候鸟|观鸟|红树林|自然保护/)) return "栖息地";
  return tags.natural || tags.leisure || "地点";
}

export function isBirdish(tags: Record<string, string> | undefined) {
  if (!tags) return false;
  if (tags.natural === "wetland") return true;
  if (tags.leisure === "nature_reserve" || tags.leisure === "bird_hide") return true;
  if (tags.tourism === "bird_hide") return true;
  if (tags.boundary === "protected_area") return true;
  const n = tags.name ?? "";
  return /湿地|候鸟|观鸟|红树林|鹭|鹤|鹳|雁/.test(n);
}

export function isWaterish(tags: Record<string, string> | undefined) {
  if (!tags) return false;
  if (tags.waterway) return true;
  if (tags.natural === "water" || tags.natural === "bay") return true;
  if (tags.landuse === "reservoir") return true;
  if (tags.water) return true;
  return false;
}
