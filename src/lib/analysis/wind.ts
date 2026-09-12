import { round } from "@/lib/utils";
import type { Place, RiskLevel, RiskRow, WeatherBlock, WindBlock, WindHistory } from "./types";

/** GB 50009-2012 附录 E：50 年一遇基本风压（kN/m²），公开规范摘录。 */
const CITY_W0: Record<string, number> = {
  北京: 0.45,
  天津: 0.5,
  石家庄: 0.35,
  太原: 0.4,
  呼和浩特: 0.55,
  沈阳: 0.55,
  大连: 0.65,
  长春: 0.65,
  哈尔滨: 0.55,
  上海: 0.55,
  南京: 0.4,
  杭州: 0.45,
  宁波: 0.5,
  温州: 0.65,
  舟山: 0.7,
  合肥: 0.35,
  福州: 0.7,
  厦门: 0.8,
  思明: 0.8,
  湖里: 0.8,
  海沧: 0.8,
  集美: 0.8,
  同安: 0.75,
  翔安: 0.75,
  泉州: 0.75,
  漳州: 0.7,
  莆田: 0.7,
  宁德: 0.7,
  三明: 0.35,
  南平: 0.35,
  龙岩: 0.4,
  南昌: 0.45,
  济南: 0.45,
  青岛: 0.6,
  烟台: 0.55,
  威海: 0.6,
  郑州: 0.45,
  武汉: 0.35,
  长沙: 0.35,
  广州: 0.5,
  深圳: 0.75,
  珠海: 0.85,
  汕头: 0.8,
  湛江: 0.8,
  阳江: 0.8,
  茂名: 0.7,
  揭阳: 0.75,
  汕尾: 0.75,
  潮州: 0.7,
  佛山: 0.5,
  东莞: 0.55,
  中山: 0.6,
  江门: 0.7,
  惠州: 0.55,
  韶关: 0.35,
  梅州: 0.4,
  清远: 0.4,
  南宁: 0.35,
  桂林: 0.3,
  北海: 0.75,
  海口: 0.75,
  三亚: 0.85,
  文昌: 0.8,
  重庆: 0.4,
  成都: 0.3,
  贵阳: 0.3,
  昆明: 0.3,
  拉萨: 0.3,
  西安: 0.35,
  兰州: 0.3,
  西宁: 0.35,
  银川: 0.65,
  乌鲁木齐: 0.6,
  香港: 0.9,
  澳门: 0.85,
  台北: 0.7,
  高雄: 0.8,
  秦皇岛: 0.45,
  唐山: 0.4,
  徐州: 0.35,
  苏州: 0.45,
  无锡: 0.45,
  南通: 0.45,
  连云港: 0.55,
};

const PROVINCE_W0: Record<string, number> = {
  北京: 0.45,
  天津: 0.5,
  河北: 0.4,
  山西: 0.4,
  内蒙古: 0.55,
  辽宁: 0.55,
  吉林: 0.55,
  黑龙江: 0.45,
  上海: 0.55,
  江苏: 0.4,
  浙江: 0.5,
  安徽: 0.35,
  福建: 0.5,
  江西: 0.4,
  山东: 0.45,
  河南: 0.4,
  湖北: 0.35,
  湖南: 0.35,
  广东: 0.55,
  广西: 0.35,
  海南: 0.75,
  重庆: 0.4,
  四川: 0.3,
  贵州: 0.3,
  云南: 0.3,
  西藏: 0.35,
  陕西: 0.35,
  甘肃: 0.35,
  青海: 0.35,
  宁夏: 0.55,
  新疆: 0.55,
  香港: 0.9,
  澳门: 0.85,
  台湾: 0.7,
};

function stripAdmin(s: string) {
  return s
    .replace(
      /市|省|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区|地区|盟|州|县|区$/g,
      "",
    )
    .trim();
}

function namesOf(place: Place) {
  const raw = [place.city, place.district, place.suburb, place.state, place.displayName]
    .filter((v): v is string => Boolean(v))
    .flatMap((s) => s.split(/[·,，、/\s]+/))
    .map(stripAdmin)
    .filter((s) => s.length >= 2);
  const blob = [place.city, place.district, place.state, place.displayName].filter(Boolean).join(" ");
  for (const key of Object.keys(CITY_W0)) {
    if (blob.includes(key) && !raw.includes(key)) raw.push(key);
  }
  return raw;
}

export function lookupDesignWind(place: Place, lat: number, lng: number) {
  const names = namesOf(place);
  for (const n of names) {
    if (CITY_W0[n] != null) {
      return {
        w0: CITY_W0[n]!,
        source: `GB 50009-2012 基本风压 · ${n} ${CITY_W0[n]!.toFixed(2)} kN/m²（50 年一遇）`,
        matched: n,
        official: true as const,
      };
    }
  }
  for (const n of names) {
    if (PROVINCE_W0[n] != null) {
      return {
        w0: PROVINCE_W0[n]!,
        source: `GB 50009-2012 省域参考 · ${n} ${PROVINCE_W0[n]!.toFixed(2)} kN/m²（50 年一遇）`,
        matched: n,
        official: true as const,
      };
    }
  }
  const cc = place.countryCode?.toLowerCase();
  if (cc === "cn" || cc === "hk" || cc === "mo" || cc === "tw") {
    const coastal = isCoastalChina(lat, lng);
    const w0 = coastal ? 0.7 : 0.4;
    return {
      w0,
      source: `未列入城市表，按${coastal ? "东南沿海" : "内陆"}默认 ${w0.toFixed(2)} kN/m²（GB 50009 量级）`,
      matched: coastal ? "沿海默认" : "内陆默认",
      official: false as const,
    };
  }
  return {
    w0: 0.4,
    source: "非中国规范覆盖区，暂按 0.40 kN/m² 对照；正式设计应以当地荷载规范为准",
    matched: "缺省",
    official: false as const,
  };
}

export function isCoastalChina(lat: number, lng: number) {
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
export function w0ToV10(w0: number) {
  return Math.sqrt(1600 * w0);
}

const GUST_FACTOR = 1.4;

function percentile(values: number[], p: number) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const i = (s.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  if (lo === hi) return s[lo]!;
  return s[lo]! * (hi - i) + s[hi]! * (i - lo);
}

export function summarizeWindHistory(
  daily: { time?: string[]; wind_speed_10m_max?: (number | null)[]; wind_gusts_10m_max?: (number | null)[] },
  source = "Open-Meteo Archive / ERA5",
): WindHistory {
  const speeds = (daily.wind_speed_10m_max ?? []).filter((v): v is number => v != null && Number.isFinite(v));
  const gusts = (daily.wind_gusts_10m_max ?? []).filter((v): v is number => v != null && Number.isFinite(v));
  return {
    days: Math.max(speeds.length, gusts.length),
    maxMs: speeds.length ? round(Math.max(...speeds), 1) : null,
    maxGustMs: gusts.length ? round(Math.max(...gusts), 1) : null,
    p95Ms: speeds.length ? round(percentile(speeds, 0.95) ?? 0, 1) : null,
    source,
  };
}

export function emptyWindHistory(): WindHistory {
  return { days: 0, maxMs: null, maxGustMs: null, p95Ms: null, source: "unavailable" };
}

function levelFromRatio(r: number): RiskLevel {
  if (r >= 1.15) return "high";
  if (r >= 1) return "mid-high";
  if (r >= 0.85) return "mid";
  if (r >= 0.7) return "mid-low";
  return "low";
}

function statusOf(r: number): WindBlock["status"] {
  if (r >= 1) return "over";
  if (r >= 0.8) return "near";
  return "ok";
}

function terrainNote(
  cat: WindBlock["terrainCat"],
  slopePct: number,
  reliefM: number,
  coastal: boolean,
) {
  const bits: string[] = [];
  bits.push(
    cat === "A"
      ? "地面粗糙度 A 类（海滨/空旷）"
      : cat === "C"
        ? "地面粗糙度 C 类（城市）"
        : cat === "D"
          ? "地面粗糙度 D 类（密集高层）"
          : "地面粗糙度 B 类（乡村/中小城镇）",
  );
  if (coastal) bits.push("滨海，来流湍流与阵风更强");
  if (reliefM > 40 && slopePct > 12) bits.push("近场为迎风坡/台地，宜计地形增大系数 1.1–1.3");
  else if (slopePct > 18) bits.push("坡度较大，局部加速可能高于 10 m 开敞风速");
  return bits.join("；");
}

function corrections(status: WindBlock["status"], ratio: number, coastal: boolean, hilly: boolean) {
  const recs: string[] = [];
  if (status === "ok") {
    recs.push("来风与近一年历史风速均低于设计基本风速的 80%，抗风不是本次主导风险，仍应按规范做日常屋面、幕墙连接巡检。");
    recs.push("强对流或台风季节仍应临时收整屋面杂物、广告布和脚手架，避免成为风致飞射物。");
    return recs;
  }
  if (status === "near") {
    recs.push(
      `来风或历史风速已达设计值的 ${Math.round(ratio * 100)}%，属临近设计工况。按 GB 50009 复核幕墙板块、屋面瓦/压型钢板、雨棚、女儿墙和广告牌的抗风连接，不足则加密压条或换更高等级五金。`,
    );
    recs.push("台风/大风来临前关闭迎风面大面积开启扇，避免形成贯通开口导致内压骤增；临时围挡、脚手架应拉结或拆除。");
    recs.push("检查采光顶、雨棚、雨水管卡箍；清理屋面易飞物件。雨风叠加时按风驱雨检查迎风墙渗漏。");
  } else {
    recs.push(
      `来风或历史风速已达到/超过设计基本风速（约 ${Math.round(ratio * 100)}%）。按超设计事件对待：大风过程中人员避免紧贴大面积玻璃幕墙内侧；停止吊装与室外作业。`,
    );
    recs.push(
      "事后按 GB 50009 / GB 50011 思路检查：幕墙板块移位、结构连接松动、屋面防水掀起、门窗框变形。不足时应提高抗风构造（加强节点、增加抗风拉结、更换抗风压等级更高的门窗）。",
    );
    recs.push("临时结构立即加固或拆除；广告牌、脚手架、围挡按抗风应急预案拉结。");
  }
  if (hilly) {
    recs.push("场地有迎风坡/山脊效应，10 m 开敞风速不能直接当作用到建筑物的风。建议按规范地形系数放大，或对超限体型做风洞/CFD 复核。");
  }
  if (coastal) {
    recs.push("滨海场所需同时考虑盐雾腐蚀对连接件的削弱，以及台风过程的风驱雨；外墙防水和金属连接宜按海洋环境设防。");
  }
  recs.push("本对照用 10 m 风速与 50 年一遇基本风压换算，不能替代结构专业的体型系数、高度变化系数和阵风系数完整计算。");
  return recs;
}

export function assessWind(input: {
  place: Place;
  lat: number;
  lng: number;
  weather: WeatherBlock;
  hist: WindHistory;
  slopePct: number;
  reliefM: number;
}): WindBlock {
  const design = lookupDesignWind(input.place, input.lat, input.lng);
  const designV10 = round(w0ToV10(design.w0), 1);
  const designGust = round(designV10 * GUST_FACTOR, 1);
  const coastal = isCoastalChina(input.lat, input.lng);
  const hilly = input.reliefM > 40 && input.slopePct > 12;
  const urban = Boolean(input.place.road && (input.place.city || input.place.district));
  const terrainCat: WindBlock["terrainCat"] = coastal && !urban ? "A" : urban ? "C" : "B";

  const forecastMax = Math.max(
    0,
    input.weather.windMs ?? 0,
    ...input.weather.days.map((d) => d.windMs ?? 0),
  );
  const forecastGust = Math.max(
    0,
    input.weather.windGustMs ?? 0,
    ...input.weather.days.map((d) => d.windGustMs ?? 0),
  );
  const incomingMaxMs = forecastMax > 0 ? round(forecastMax, 1) : null;
  const incomingGustMaxMs = forecastGust > 0 ? round(forecastGust, 1) : null;
  let incomingMaxDate: string | null = null;
  let best = -1;
  for (const d of input.weather.days) {
    const g = Math.max(d.windGustMs ?? 0, d.windMs ?? 0);
    if (g > best) {
      best = g;
      incomingMaxDate = d.date;
    }
  }

  const terrainAmp = hilly ? 1.15 : 1;
  const inMeanR = incomingMaxMs != null ? (incomingMaxMs * terrainAmp) / Math.max(designV10, 0.1) : 0;
  const inGustR =
    incomingGustMaxMs != null ? (incomingGustMaxMs * terrainAmp) / Math.max(designGust, 0.1) : 0;
  const incomingRatio = Math.max(inMeanR, inGustR);

  const histMeanR = input.hist.maxMs != null ? (input.hist.maxMs * terrainAmp) / Math.max(designV10, 0.1) : 0;
  const histGustR =
    input.hist.maxGustMs != null ? (input.hist.maxGustMs * terrainAmp) / Math.max(designGust, 0.1) : 0;
  const histRatio = Math.max(histMeanR, histGustR);

  const governing = Math.max(incomingRatio, histRatio);
  const status = statusOf(governing);
  const dir =
    input.weather.windDirDeg ??
    input.weather.days.find((d) => d.date === incomingMaxDate)?.windDirDeg ??
    null;

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
    corrections: corrections(status, governing, coastal, hilly),
  };
}

export function emptyWind(): WindBlock {
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
    designW0: 0.4,
    designV10: round(w0ToV10(0.4), 1),
    designGust: round(w0ToV10(0.4) * GUST_FACTOR, 1),
    designSource: "缺省 0.40 kN/m²",
    terrainCat: "B",
    terrainNote: "未取得风速观测",
    incomingRatio: null,
    histRatio: null,
    status: "ok",
    corrections: ["风速数据不足，抗风结论仅按规范缺省值提示，需以当地气象站与荷载规范复核。"],
  };
}

export function windRiskRow(wind: WindBlock): RiskRow {
  const r = Math.max(wind.incomingRatio ?? 0, wind.histRatio ?? 0);
  const level = levelFromRatio(r);
  const inPct = wind.incomingRatio != null ? `${Math.round(wind.incomingRatio * 100)}%` : "—";
  const hPct = wind.histRatio != null ? `${Math.round(wind.histRatio * 100)}%` : "—";
  const basis = `设计基本风速约 ${wind.designV10} m/s（阵风参考 ${wind.designGust} m/s，${wind.designSource}）。来风最大 ${wind.incomingGustMaxMs ?? wind.incomingMaxMs ?? "—"} m/s（${inPct}），近${wind.histDays || "—"}日历史最大阵风 ${wind.histGustMaxMs ?? wind.histMaxMs ?? "—"} m/s（${hPct}）。${wind.terrainNote}`;
  let consequence: string;
  if (wind.status === "over") {
    consequence = "幕墙/屋面/雨棚可能超出原设计风压，存在板块脱落、屋面掀起、门窗破坏风险";
  } else if (wind.status === "near") {
    consequence = "接近设计风压，连接薄弱部位、临时结构和大面积玻璃为敏感点";
  } else {
    consequence = "风压总体低于设计值，风致破坏不是主因";
  }
  return {
    id: "wind",
    type: "强风超设计值",
    level,
    basis,
    consequence,
  };
}
