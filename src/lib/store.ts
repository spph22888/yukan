import { create } from "zustand";
import { composeReport, probeSite } from "@/lib/analysis/server";
import { emptyBird } from "@/lib/analysis/birds";
import { DEFAULT_FACTORS, normalizeFactors, type FactorId } from "@/lib/analysis/factors";
import { fallbackReport } from "@/lib/analysis/narrative";
import { emptyWeather } from "@/lib/analysis/weather";
import { emptyWind } from "@/lib/analysis/wind";
import type { HistoryItem, ProbeResult, ReportDoc, SampleSite } from "@/lib/analysis/types";
import { SAMPLE_SITES, matchSample } from "@/lib/samples";
import type { CorridorResult, TowerPoint } from "@/lib/analysis/import-coords";

const HISTORY_KEY = "rainsight-history-v1";

function padProbe(probe: ProbeResult): ProbeResult {
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
        windDirDeg: d.windDirDeg ?? null,
      })),
    },
    wind: probe.wind ?? emptyWind(),
    birds: probe.birds ?? emptyBird(),
  };
}

function padReport(report: ReportDoc, probe: ProbeResult): ReportDoc {
  const fb = fallbackReport(probe);
  return {
    ...fb,
    ...report,
    windNarrative: report.windNarrative || fb.windNarrative,
    birdNarrative: report.birdNarrative || fb.birdNarrative,
  };
}

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw) as HistoryItem[];
    return items.map((it) => {
      const probe = padProbe(it.probe);
      return { ...it, probe, report: padReport(it.report, probe) };
    });
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 40)));
  } catch {
    /* quota */
  }
}

export type Stage = "idle" | "probing" | "composing" | "ready" | "error";

type AppState = {
  pin: { lat: number; lng: number } | null;
  extentM: number;
  query: string;
  factors: FactorId[];
  stage: Stage;
  stageLabel: string;
  probe: ProbeResult | null;
  report: ReportDoc | null;
  error: string | null;
  history: HistoryItem[];
  historyOpen: boolean;
  hydrated: boolean;
  mapPick: boolean;
  corridor: TowerPoint[];
  corridorIndex: number;
  corridorTitle: string;
  corridorResults: Record<string, CorridorResult>;
  batching: boolean;
  setQuery: (q: string) => void;
  setExtent: (m: number) => void;
  setMapPick: (on: boolean) => void;
  toggleFactor: (id: FactorId) => void;
  hydrate: () => void;
  pick: (lat: number, lng: number, opts?: { query?: string }) => void;
  clear: () => void;
  toggleHistory: (open?: boolean) => void;
  analyze: (coords?: { lat: number; lng: number; query?: string }, opts?: { skipAi?: boolean }) => Promise<void>;
  loadSample: (site: SampleSite) => void;
  loadHistoryItem: (id: string) => void;
  importTowers: (towers: TowerPoint[], title?: string) => void;
  selectTower: (index: number) => void;
  clearCorridor: () => void;
  stopBatch: () => void;
  analyzeCorridor: () => Promise<void>;
};

export const useApp = create<AppState>((set, get) => ({
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
  toggleFactor: (id) =>
    set((s) => ({
      factors: s.factors.includes(id) ? s.factors.filter((f) => f !== id) : [...s.factors, id],
    })),
  hydrate: () => {
    if (get().hydrated) return;
    set({ history: loadHistory(), hydrated: true });
  },
  pick: (lat, lng, opts) => {
    const prev = get().pin;
    const same =
      prev != null &&
      Math.abs(prev.lat - lat) < 1e-7 &&
      Math.abs(prev.lng - lng) < 1e-7;
    const sample = matchSample(lat, lng);
    const q = opts?.query ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    set({
      pin: { lat, lng },
      query: q,
      extentM: sample?.extentM ?? get().extentM,
      error: null,
      ...(same
        ? {}
        : { probe: null, report: null, stage: "idle" as const, stageLabel: "" }),
    });
  },
  clear: () =>
    set({
      probe: null,
      report: null,
      stage: "idle",
      stageLabel: "",
      error: null,
      mapPick: false,
    }),
  toggleHistory: (open) =>
    set((s) => ({ historyOpen: open ?? !s.historyOpen })),
  analyze: async (coords, opts) => {
    if (coords) get().pick(coords.lat, coords.lng, coords.query ? { query: coords.query } : undefined);
    const pin = coords ?? get().pin;
    const { extentM, factors } = get();
    if (!pin) {
      set({ error: "请先输入经纬度，或在地图上选点", stage: "error" });
      return;
    }
    const sample = matchSample(pin.lat, pin.lng);
    set({
      stage: "probing",
      stageLabel: "逆地理编码 · 高程网格 · 勾选因子",
      error: null,
      probe: null,
      report: null,
      mapPick: false,
    });
    try {
      const probed = await probeSite({
        data: {
          lat: pin.lat,
          lng: pin.lng,
          extentM,
          factors,
          vertices: sample?.vertices,
        },
      });
      if (!probed.ok) {
        set({
          stage: "error",
          error:
            probed.code === "membership"
              ? probed.error
              : probed.error || "研判失败，请重试",
          stageLabel: "",
        });
        return;
      }
      const draft = fallbackReport(probed.probe);
      const item: HistoryItem = {
        id: `${Date.now()}`,
        savedAt: Date.now(),
        title: draft.title,
        locationTitle: draft.locationTitle,
        lat: pin.lat,
        lng: pin.lng,
        overallLevel: probed.probe.overallLevel,
        probe: probed.probe,
        report: draft,
      };
      const history = [item, ...get().history.filter((h) => h.id !== item.id)].slice(0, 40);
      saveHistory(history);
      const corridorResults = { ...get().corridorResults };
      const tower = get().corridor[get().corridorIndex];
      if (
        tower &&
        Math.abs(tower.lat - pin.lat) < 1e-5 &&
        Math.abs(tower.lng - pin.lng) < 1e-5
      ) {
        corridorResults[tower.id] = { level: probed.probe.overallLevel, historyId: item.id };
      }
      set({
        probe: probed.probe,
        report: draft,
        stage: "ready",
        stageLabel: "",
        history,
        corridorResults,
      });
      if (opts?.skipAi) return;
      try {
        const composed = await composeReport({ data: { probe: probed.probe } });
        if (!composed.report.ai) return;
        const next = history.map((h) => (h.id === item.id ? { ...h, report: composed.report } : h));
        saveHistory(next);
        set({ report: composed.report, history: next });
      } catch {
        /* keep draft */
      }
    } catch (err) {
      set({
        stage: "error",
        error: failMessage(err),
        stageLabel: "",
      });
    }
  },
  loadSample: (site) => {
    set({
      pin: { lat: site.lat, lng: site.lng },
      query: site.name,
      extentM: site.extentM ?? 72,
      probe: null,
      report: null,
      error: null,
      stage: "idle",
      stageLabel: "",
      mapPick: false,
    });
  },
  loadHistoryItem: (id) => {
    const item = get().history.find((h) => h.id === id);
    if (!item) return;
    const probe = padProbe(item.probe);
    set({
      pin: { lat: item.lat, lng: item.lng },
      query: item.locationTitle,
      probe,
      report: padReport(item.report, probe),
      stage: "ready",
      historyOpen: false,
      error: null,
      extentM: item.probe.extentM,
      factors: normalizeFactors(probe.factors),
    });
  },
  importTowers: (towers, title) => {
    if (!towers.length) return;
    const first = towers[0]!;
    set({
      corridor: towers,
      corridorIndex: 0,
      corridorTitle: title?.trim() || `线路 ${towers.length} 基`,
      corridorResults: {},
      pin: { lat: first.lat, lng: first.lng },
      query: first.name,
      probe: null,
      report: null,
      error: null,
      stage: "idle",
      stageLabel: "",
      batching: false,
    });
  },
  selectTower: (index) => {
    const t = get().corridor[index];
    if (!t) return;
    set({ corridorIndex: index });
    get().pick(t.lat, t.lng, { query: t.name });
  },
  clearCorridor: () =>
    set({
      corridor: [],
      corridorIndex: 0,
      corridorTitle: "",
      corridorResults: {},
      batching: false,
    }),
  stopBatch: () => set({ batching: false }),
  analyzeCorridor: async () => {
    const list = get().corridor;
    if (!list.length) return;
    set({ batching: true });
    for (let i = get().corridorIndex; i < list.length; i++) {
      if (!get().batching) break;
      const t = list[i]!;
      set({ corridorIndex: i });
      await get().analyze({ lat: t.lat, lng: t.lng, query: t.name }, { skipAi: true });
      if (get().stage === "error") break;
    }
    set({ batching: false });
  },
}));

export { SAMPLE_SITES };

function failMessage(err: unknown) {
  const rec = err as { message?: string; status?: number };
  if (rec?.status === 401 || rec?.message === "Unauthorized") {
    return "请先登录后再研判";
  }
  if (err instanceof Error && err.message) return err.message;
  return "研判失败，请重试";
}
