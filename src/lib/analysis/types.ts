import type { FactorId } from "./factors";

export type { FactorId };

export type LatLng = { lat: number; lng: number };

export type Vertex = LatLng & {
  id: string;
  role: string;
  elevM: number;
};

export type RiskLevel = "low" | "mid-low" | "mid" | "mid-high" | "high";

export type RiskRow = {
  id: string;
  type: string;
  level: RiskLevel;
  basis: string;
  consequence: string;
};

export type WaterFeature = {
  name: string;
  kind: string;
  lat: number;
  lng: number;
  distM: number;
  elevM: number | null;
};

export type FlowPath = {
  id: string;
  name: string;
  tone: "inflow" | "bypass" | "outlet" | "lateral";
  description: string;
  points: LatLng[];
};

export type WeatherDay = {
  date: string;
  rainMm: number;
  tempC: number | null;
  windMs: number | null;
  windGustMs: number | null;
  windDirDeg: number | null;
  symbol: string;
};

export type WeatherBlock = {
  source: string;
  asOf: string;
  tempC: number | null;
  windMs: number | null;
  windGustMs: number | null;
  windDirDeg: number | null;
  humidity: number | null;
  symbol: string;
  precipNowMm: number;
  past3dMm: number;
  next7dMm: number;
  wettestDayMm: number;
  wettestDayDate: string | null;
  days: WeatherDay[];
};

export type WindHistory = {
  days: number;
  maxMs: number | null;
  maxGustMs: number | null;
  p95Ms: number | null;
  source: string;
};

export type WindBlock = {
  source: string;
  nowMs: number | null;
  nowGustMs: number | null;
  directionDeg: number | null;
  incomingMaxMs: number | null;
  incomingGustMaxMs: number | null;
  incomingMaxDate: string | null;
  histMaxMs: number | null;
  histGustMaxMs: number | null;
  histP95Ms: number | null;
  histDays: number;
  histSource: string;
  designW0: number;
  designV10: number;
  designGust: number;
  designSource: string;
  terrainCat: "A" | "B" | "C" | "D";
  terrainNote: string;
  incomingRatio: number | null;
  histRatio: number | null;
  status: "ok" | "near" | "over";
  corrections: string[];
};

export type BirdSite = {
  name: string;
  kind: string;
  lat: number;
  lng: number;
  distKm: number;
  species: string;
  source: string;
};

export type BirdBlock = {
  level: RiskLevel;
  score: number;
  sites: BirdSite[];
  summary: string;
  corrections: string[];
};

export type DischargeBlock = {
  available: boolean;
  meanM3s: number | null;
  nextMaxM3s: number | null;
  ratio: number | null;
};

export type Place = {
  displayName: string;
  road: string | null;
  suburb: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
  countryCode: string | null;
};

export type TransectPt = { distM: number; elevM: number; label?: string };

export type ProbeResult = {
  lat: number;
  lng: number;
  extentM: number;
  analyzedAt: string;
  factors: FactorId[];
  place: Place;
  siteElevM: number;
  minElevM: number;
  maxElevM: number;
  reliefM: number;
  slopePct: number;
  aspectDeg: number;
  aspectLabel: string;
  outletLabel: string;
  sourceLabel: string;
  isDepression: boolean;
  areaM2: number;
  vertices: Vertex[];
  grid: {
    n: number;
    spacingM: number;
    lats: number[];
    lngs: number[];
    z: number[][];
  };
  flowPaths: FlowPath[];
  transect: TransectPt[];
  waters: WaterFeature[];
  weather: WeatherBlock;
  wind: WindBlock;
  birds: BirdBlock;
  discharge: DischargeBlock;
  risks: RiskRow[];
  overallLevel: RiskLevel;
  sources: { item: string; note: string }[];
};

export type ReportDoc = {
  title: string;
  locationTitle: string;
  date: string;
  serial: string;
  positioning: string;
  terrainJudgement: string;
  flowLead: string;
  watershed: string;
  keyConclusion: string;
  basin: string;
  weatherNarrative: string;
  windNarrative: string;
  birdNarrative: string;
  geoHazard: string;
  conclusion: string;
  recommendations: string[];
  limitations: string;
  ai: boolean;
};

export type HistoryItem = {
  id: string;
  savedAt: number;
  title: string;
  locationTitle: string;
  lat: number;
  lng: number;
  overallLevel: RiskLevel;
  probe: ProbeResult;
  report: ReportDoc;
};

export type SampleSite = {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
  extentM?: number;
  vertices?: { id: string; lat: number; lng: number; role: string }[];
};
