import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { parseCoordinate } from "./geo";
import {
  analyzeTerrain,
  buildGrid,
  enrichWaters,
  sampleGridPoints,
  worstLevel,
} from "./hydrology";
import {
  fetchDischarge,
  fetchElevations,
  fetchMetNo,
  fetchOpenMeteoArchive,
  fetchOpenMeteoWeather,
  fetchOverpassHabitat,
  fetchRiversNominatim,
  reverseGeocode,
  searchNominatim,
} from "./fetchers";
import { assessBirds, birdRiskRow, emptyBird } from "./birds";
import { compactForModel, fallbackReport } from "./narrative";
import {
  emptyWeather,
  parseDischarge,
  parseMetNo,
  parseOpenMeteo,
} from "./weather";
import { assessWind, emptyWind, emptyWindHistory, summarizeWindHistory, windRiskRow } from "./wind";
import type { BirdSite, ProbeResult, ReportDoc, WaterFeature } from "./types";
import { matchSample } from "@/lib/samples";
import { assertMember, logRun } from "@/lib/membership-server";
import { factorTitle, hasFactor, normalizeFactors, type FactorId } from "./factors";

const GRID_N = 9;
const GRID_SPACING = 70;

export const searchPlaces = createServerFn({ method: "POST" })
  .validator((input: { q: string }) => input)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const gate = await assertMember(context.userId);
    if (!gate.ok) return { ...gate, items: [] as { lat: number; lng: number; label: string; kind: string }[] };
    const q = data.q.trim();
    if (q.length < 2) return { ok: true as const, items: [] as { lat: number; lng: number; label: string; kind: string }[] };
    const coord = parseCoordinate(q);
    if (coord) {
      return {
        ok: true as const,
        items: [{ lat: coord.lat, lng: coord.lng, label: `${coord.lat.toFixed(5)}, ${coord.lng.toFixed(5)}`, kind: "coordinate" }],
      };
    }
    try {
      const items = await searchNominatim(q);
      return { ok: true as const, items };
    } catch {
      return { ok: false as const, error: "地点检索暂时不可用", items: [] };
    }
  });

export const probeSite = createServerFn({ method: "POST" })
  .validator(
    (input: {
      lat: number;
      lng: number;
      extentM: number;
      factors?: FactorId[];
      vertices?: { id: string; lat: number; lng: number; role: string }[];
    }) => input,
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<{ ok: true; probe: ProbeResult } | { ok: false; error: string; code?: string }> => {
    const gate = await assertMember(context.userId);
    if (!gate.ok) return gate;
    const lat = Number(data.lat);
    const lng = Number(data.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return { ok: false, error: "坐标无效" };
    }
    const extentM = Math.min(180, Math.max(36, Number(data.extentM) || 70));
    const factors = normalizeFactors(data.factors);
    const wantRain = hasFactor(factors, "rain");
    const wantWind = hasFactor(factors, "wind");
    const wantBirds = hasFactor(factors, "birds");
    const wantWeather = wantRain || wantWind;
    const wantWaters = wantRain || wantBirds;
    const center = { lat, lng };
    const sample = matchSample(lat, lng);
    const vertices = data.vertices?.length ? data.vertices : sample?.vertices;

    const pts = sampleGridPoints(center, GRID_N, GRID_SPACING);
    const skip = Promise.resolve(null);

    const [placeRes, elevRes, weatherOm, weatherMet, floodRes, archiveRes, habitatRes] =
      await Promise.allSettled([
        reverseGeocode(lat, lng),
        fetchElevations(pts),
        wantWeather ? fetchOpenMeteoWeather(lat, lng) : skip,
        wantWeather ? fetchMetNo(lat, lng) : skip,
        wantRain ? fetchDischarge(lat, lng) : skip,
        wantWind ? fetchOpenMeteoArchive(lat, lng) : skip,
        wantWaters ? fetchOverpassHabitat(center) : skip,
      ]);

    if (elevRes.status !== "fulfilled" || !elevRes.value.length) {
      return { ok: false, error: "高程采样失败，请稍后重试" };
    }

    const grid = buildGrid(center, elevRes.value, GRID_N, GRID_SPACING);

    let watersRaw: WaterFeature[] = [];
    let osmBirds: BirdSite[] = [];
    if (wantWaters && habitatRes.status === "fulfilled" && habitatRes.value) {
      watersRaw = habitatRes.value.waters;
      osmBirds = wantBirds ? habitatRes.value.birds : [];
    }
    if (wantRain && !watersRaw.length) {
      try {
        watersRaw = await fetchRiversNominatim(center);
      } catch {
        watersRaw = [];
      }
    }
    const waters = enrichWaters(watersRaw, grid);

    let weather = emptyWeather();
    if (wantWeather && weatherOm.status === "fulfilled" && weatherOm.value && !(weatherOm.value as { error?: boolean }).error) {
      try {
        weather = parseOpenMeteo(weatherOm.value as Parameters<typeof parseOpenMeteo>[0]);
      } catch {
        weather = emptyWeather();
      }
    }
    if (wantWeather && (weather.source === "unavailable" || weather.days.length === 0) && weatherMet.status === "fulfilled" && weatherMet.value) {
      try {
        weather = parseMetNo(weatherMet.value as Parameters<typeof parseMetNo>[0]);
      } catch {
        /* keep */
      }
    }

    const discharge =
      wantRain && floodRes.status === "fulfilled" && floodRes.value
        ? parseDischarge(floodRes.value as Parameters<typeof parseDischarge>[0])
        : { available: false, meanM3s: null, nextMaxM3s: null, ratio: null };

    let hist = emptyWindHistory();
    if (wantWind && archiveRes.status === "fulfilled" && archiveRes.value?.daily) {
      hist = summarizeWindHistory(archiveRes.value.daily);
    } else if (wantWind) {
      const past = weather.days.filter((d) => d.date < new Date().toISOString().slice(0, 10));
      if (past.length) {
        hist = summarizeWindHistory(
          {
            time: past.map((d) => d.date),
            wind_speed_10m_max: past.map((d) => d.windMs),
            wind_gusts_10m_max: past.map((d) => d.windGustMs),
          },
          "预报回看（档案未取到）",
        );
      }
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
      downhillRoad,
    });

    const place =
      placeRes.status === "fulfilled"
        ? placeRes.value
        : {
            displayName: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            road: null,
            suburb: null,
            city: null,
            district: null,
            state: null,
            country: null,
            countryCode: null,
          };

    const wind = wantWind
      ? assessWind({
          place,
          lat,
          lng,
          weather,
          hist,
          slopePct: terrain.slopePct,
          reliefM: terrain.reliefM,
        })
      : emptyWind();
    const birds = wantBirds ? assessBirds({ center, osmSites: osmBirds, waters }) : emptyBird();
    const risks = [
      ...(wantRain ? terrain.risks : []),
      ...(wantWind ? [windRiskRow(wind)] : []),
      ...(wantBirds ? [birdRiskRow(birds)] : []),
    ];
    const overallLevel = risks.length ? worstLevel(risks.map((r) => r.level)) : "low";

    const sources: { item: string; note: string }[] = [
      { item: "位置", note: "OSM Nominatim / Open-Meteo 地理编码（服务器侧请求，不依赖终端访问谷歌）" },
      { item: "卫星底图", note: "中国大陆默认高德卫星（GCJ-02），海外可切 OSM；分析坐标一律 WGS-84" },
      { item: "高程", note: "Open-Meteo Elevation / OpenTopoData Mapzen，约 30 米；院落相对高差可信，绝对高程约 ±10 米" },
      { item: "因子", note: factors.length ? factors.map((id) => ({ rain: "强降雨", wind: "强风", birds: "大型鸟类" })[id]).join("、") : "仅场地高程定位" },
    ];
    if (wantRain) {
      sources.push(
        { item: "水系", note: "OSM Overpass 近场河道与水体；失败时回退 Nominatim" },
        { item: "天气", note: weather.source },
        { item: "河道流量", note: discharge.available ? "GloFAS / Open-Meteo Flood" : "本点无 GloFAS 网格" },
      );
    }
    if (wantWind) {
      sources.push({
        item: "风速",
        note: `${wind.source} 10 m 风速（m/s）；历史 ${hist.source}；设计值摘自 GB 50009-2012 基本风压公开表`,
      });
    }
    if (wantBirds) {
      sources.push({
        item: "鸟类栖息地",
        note: "公开湿地/保护区名录 + OSM 湿地、自然保护区、观鸟点；指示种为名录记载，非实时观测",
      });
    }

    const probe: ProbeResult = {
      ...terrain,
      factors,
      overallLevel,
      place,
      weather,
      wind,
      birds,
      discharge,
      risks,
      analyzedAt: new Date().toISOString(),
      sources,
    };

    await logRun(context.userId, lat, lng, place.displayName).catch(() => undefined);
    return { ok: true, probe };
  });

export const composeReport = createServerFn({ method: "POST" })
  .validator((input: { probe: ProbeResult }) => input)
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<{ ok: true; report: ReportDoc } | { ok: false; error: string; report: ReportDoc }> => {
    const gate = await assertMember(context.userId);
    const fallback = fallbackReport(data.probe);
    if (!gate.ok) return { ok: false, error: gate.error, report: fallback };
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: true, report: fallback };

    const compact = compactForModel(data.probe);
    const factors = normalizeFactors(data.probe.factors);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 14000);
    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.3,
          max_tokens: 1800,
          messages: [
            {
              role: "system",
              content:
                "你是水文地貌、抗风与遥感应急研判专家。根据给定的实测网格数据，用汉语写一份卫星分析报告的叙述段落。文风像专业交办件：克制、具体、带数字，不抒情，不用表情符号，不编造官方地灾点名单或未提供的管网口径。风险等级已经算好，不要改等级，只写叙述。只返回 JSON。未勾选的影响因子对应字段填空字符串，不要编造该因子内容。",
            },
            {
              role: "user",
              content: `本次标题建议：${factorTitle(factors)}。已勾选因子：${factors.join(",") || "无（仅场地高程）"}。
请根据数据填写 JSON，字段：
locationTitle, positioning, terrainJudgement, flowLead, watershed, keyConclusion, basin, weatherNarrative, windNarrative, birdNarrative, geoHazard, conclusion, recommendations (string[6-8]), limitations。
每段 80–180 字。勾选了 wind 时风段落必须对照设计基本风速与来风/历史风速是否临近或超过。勾选了 birds 时写栖息地距离与围护修正。未勾选 rain 则 weatherNarrative 留空；未勾选 wind 则 windNarrative 留空；未勾选 birds 则 birdNarrative 留空。数据：\n${JSON.stringify(compact)}`,
            },
          ],
        }),
      });
      if (!res.ok) return { ok: true, report: fallback };
      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = body.choices?.[0]?.message?.content ?? "";
      const jsonText = text.replace(/^```json\s*|\s*```$/g, "").trim();
      const parsed = JSON.parse(jsonText) as Partial<ReportDoc>;
      const recs = Array.isArray(parsed.recommendations)
        ? parsed.recommendations.map(String).filter(Boolean).slice(0, 8)
        : fallback.recommendations;
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
          ai: true,
        },
      };
    } catch {
      return { ok: true, report: fallback };
    } finally {
      clearTimeout(timer);
    }
  });
