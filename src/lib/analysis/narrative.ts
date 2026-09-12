import { formatDist, formatElev, serialFor } from "./geo";
import { factorTitle, hasFactor, normalizeFactors } from "./factors";
import type { ProbeResult, ReportDoc, RiskLevel } from "./types";
import { zhDate } from "@/lib/utils";

const LEVEL_ZH: Record<RiskLevel, string> = {
  low: "低",
  "mid-low": "中低",
  mid: "中",
  "mid-high": "中高",
  high: "高",
};

function placeLine(p: ProbeResult) {
  const bits = [p.place.state, p.place.city, p.place.district, p.place.suburb, p.place.road].filter(
    (v): v is string => Boolean(v),
  );
  const uniq: string[] = [];
  for (const b of bits) if (!uniq.includes(b)) uniq.push(b);
  return uniq.join(" · ") || p.place.displayName;
}

function pct(ratio: number | null) {
  if (ratio == null) return "—";
  return `${Math.round(ratio * 100)}%`;
}

export function fallbackReport(probe: ProbeResult): ReportDoc {
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

  const positioning = `根据交办的场地坐标（${probe.lat.toFixed(6)}°N，${probe.lng.toFixed(6)}°E）逆地理编码与卫星套合后，分析对象位于${loc}。围合按约 ${probe.extentM} 米边长取样，面积约 ${probe.areaM2} 平方米，院内按多层建筑及硬化场地情景研判。本次勾选因子：${factors.length ? factors.map((id) => ({ rain: "强降雨", wind: "强风", birds: "大型鸟类" })[id]).join("、") : "仅场地高程"}。`;

  const terrainJudgement = `地势判断：近场最高约 ${formatElev(probe.maxElevM)}，最低约 ${formatElev(probe.minElevM)}，相对高差 ${formatElev(probe.reliefM)}。场地中心高程 ${formatElev(probe.siteElevM)}，坡度约 ${probe.slopePct}%，整体倾向${out}（来水主方向${ns}）。${high && low ? `围合顶点中 ${high.id}（${high.role}）相对最高，${low.id}（${low.role}）相对最低。` : ""}${probe.isDepression ? "场地接近局部洼地，内涝敏感。" : "场地并非封闭洼地，排水取决于出水口与下游通道。"}`;

  const flowLead = `结合高程网格（约 30 米）与 D8 流向，强降雨时近场水流可概括为四条路径：高位来水自${ns}侧直冲场地；侧向客水在转角收敛；南/高位墙段拦水后沿两侧绕流；${out}侧最低口为天然出水。`;

  const watershed = nearest
    ? `片区汇水上，分析对象卡在高位汇水与下游廊道之间。最近水体「${nearest.name}」（${nearest.kind}）距场地约 ${formatDist(nearest.distM)}${nearest.elevM != null ? `，水面高程约 ${formatElev(nearest.elevM)}` : ""}。真正需要盯住的，往往不是干流漫滩，而是坡面短时洪峰、泥沙枝叶堵塞出水口，以及院内来不及排出造成的内涝。`
    : `近场 2 公里未检索到可靠的 OSM 水系。研判仍以坡面径流与场地自身汇水为主，河道淹没暂不作主因。`;

  const rainLine = wantRain
    ? `强降雨的主要威胁是${probe.risks.find((r) => r.id === "torrent")?.level !== "low" ? "高位径流冲击围护、角落集中汇水与最低口内涝" : "场地硬化面短时积水与出水不畅"}；${probe.risks.find((r) => r.id === "river")?.level === "low" ? "干流淹没可基本排除。" : "河道水位需要一并关注。"}`
    : "";
  const windLine = wantWind
    ? `抗风方面，来风为设计值的 ${pct(wind.incomingRatio)}，历史风速为设计值的 ${pct(wind.histRatio)}，现状为${wind.status === "over" ? "超过设计值" : wind.status === "near" ? "临近设计值" : "低于设计值的八成"}。`
    : "";
  const birdLine = wantBirds ? `鸟类活动因子为${LEVEL_ZH[birds.level]}。` : "";
  const keyConclusion = `该建筑物${probe.reliefM > 12 && probe.slopePct > 6 ? "更像山前或坡地台地上的「拦水台阶」" : probe.isDepression ? "更接近局部低洼汇水点" : "地处相对平缓建成区"}。${rainLine}${windLine}${birdLine}`;

  const basin = nearest
    ? `雨水总路径可概括为：高位坡面 → 场地围护 → 沿${out}向下游 → 近场水体「${nearest.name}」所在河谷/管网。场地与最近水体平面距离约 ${formatDist(nearest.distM)}，高差${nearest.elevM != null ? `约 ${formatElev(probe.siteElevM - nearest.elevM)}` : "需现场复核"}。`
    : `雨水最终进入市政雨水管或更远处河道。缺少近场水系几何，流域段落只能做到定性。`;

  const weatherNarrative = !wantRain
    ? ""
    : w.source === "unavailable"
      ? "本次未能拉取到逐日降水预报，以下研判针对「此类强降雨再次发生时」的场地响应，而非正在过境的天气过程。"
      : `近场气象（${w.source}）：当前 ${w.symbol}${w.tempC != null ? `，气温 ${w.tempC}°C` : ""}${w.windMs != null ? `，风速 ${w.windMs} m/s` : ""}${w.windGustMs != null ? `（阵风 ${w.windGustMs} m/s）` : ""}。过去约 3 日累计降水 ${w.past3dMm} 毫米，未来 7 日约 ${w.next7dMm} 毫米${w.wettestDayDate ? `，最湿日 ${w.wettestDayDate} 约 ${w.wettestDayMm} 毫米` : ""}。本次分析针对场地在「强降雨再现」时的响应，预报偏弱不代表场地结构风险消失。`;

  const windStatusLine =
    wind.status === "over"
      ? "已达到或超过设计值，须按超设计事件采取加固与避险。"
      : wind.status === "near"
        ? "已临近设计值（≥80%），围护连接、屋面和临时结构处于敏感区间。"
        : "目前低于设计值的 80%，抗风不是本次主导风险。";

  const windNarrative = wantWind
    ? `抗风对照采用 GB 50009-2012 公开基本风压：${wind.designSource}，换算 10 m 基本风速约 ${wind.designV10} m/s，阵风参考 ${wind.designGust} m/s（阵风系数 1.4）。来风（预报最大${wind.incomingGustMaxMs != null ? "阵风" : "风速"}）约 ${wind.incomingGustMaxMs ?? wind.incomingMaxMs ?? "—"} m/s，为设计值的 ${pct(wind.incomingRatio)}${wind.incomingMaxDate ? `（${wind.incomingMaxDate}）` : ""}。近 ${wind.histDays || "—"} 日历史最大约 ${wind.histGustMaxMs ?? wind.histMaxMs ?? "—"} m/s，为设计值的 ${pct(wind.histRatio)}。${windStatusLine}${wind.terrainNote ? `地形：${wind.terrainNote}。` : ""}修正方案见建议条：临近或超标时复核幕墙、屋面、雨棚连接，关闭贯通开口，山脊/迎风坡计地形增大系数。`
    : "";

  const birdNarrative = wantBirds
    ? birds.summary +
      (birds.sites[0]
        ? ` 公开数据来源包括湿地/保护区名录与 OSM。大型鸟类频繁活动区对建筑物的主要影响是玻璃撞击、屋檐筑巢堵塞天沟（与内涝叠加）、以及鸟粪对金属围护的腐蚀。`
        : "")
    : "";

  const geoHazard = probe.slopePct > 12 || probe.maxElevM - probe.siteElevM > 20
    ? `场地紧贴高位坡面，属于「房前屋后高陡边坡」类风险地貌。即使未列入当地年度地灾点名单，强降雨及雨后 24 小时仍应按临坡建筑加密巡查墙体裂缝、墙根积水与出水口堵塞。本段为遥感地貌判断，不能替代地质灾害详查。`
    : `邻域坡度中等或偏缓，崩塌滑坡不是首要情景，但雨后仍应查看散水、挡墙与排水沟。地灾结论须以当地官方隐患点名录与现场勘察为准。`;

  const recs = [
    ...(wantRain
      ? [
          `在${ns}侧围护外设置或清理截洪沟，把山体/高位客水在入墙前导向两侧，避免正冲墙段。`,
          `在${low ? `${low.id}（${low.role}）` : out + "侧最低口"}明确出水口，接通道路边沟或市政雨水管，防止「有坡无口」。`,
          `场地硬化面补设雨水口，检查电缆沟、设备房、半地下空间的挡水门槛和抽排。`,
          `强降雨及雨后 24 小时加密巡查边坡、围墙裂缝、墙根积水、出水口堵塞（枯枝落叶、泥沙、鸟巢）。`,
          nearest
            ? `与下游市政排水及邻近地块衔接，避免道路积水顶托回灌；关注「${nearest.name}」水位只作为背景，主战场仍在场地排水。`
            : `与周边地块及市政雨水衔接，避免下游顶托回灌。`,
        ]
      : [`按本次勾选因子落实现场复核，场地中心 ${probe.lat.toFixed(5)}°N，${probe.lng.toFixed(5)}°E。`]),
    ...(wantWind ? wind.corrections.slice(0, wind.status === "ok" ? 1 : 2) : []),
    ...(wantBirds ? birds.corrections.slice(0, birds.level === "low" ? 1 : 2) : []),
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
    limitations:
      "本分析为遥感快速研判，不能替代 1:500 地形图、现场排水管网测绘、岩土勘察和结构抗风计算。高程网格分辨率约 30 米。未勾选的影响因子不参与本次等级与叙述。基本风压摘自 GB 50009-2012 公开附表。鸟类栖息地来自公开名录与 OSM，非实时观测。中国大陆底图为高德（GCJ-02），分析坐标为 WGS-84。",
    ai: false,
  };
}

export function compactForModel(probe: ProbeResult) {
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
      wettestDayDate: probe.weather.wettestDayDate,
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
      corrections: probe.wind.corrections,
    },
    birds: {
      level: LEVEL_ZH[probe.birds.level],
      summary: probe.birds.summary,
      sites: probe.birds.sites.slice(0, 5),
      corrections: probe.birds.corrections,
    },
    discharge: probe.discharge,
    risks: probe.risks.map((r) => ({
      type: r.type,
      level: LEVEL_ZH[r.level],
      basis: r.basis,
    })),
    overall: LEVEL_ZH[probe.overallLevel],
  };
}
