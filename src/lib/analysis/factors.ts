export type FactorId = "rain" | "wind" | "birds";

export const FACTOR_OPTIONS: { id: FactorId; name: string; hint: string }[] = [
  { id: "rain", name: "强降雨", hint: "气象、径流与内涝" },
  { id: "wind", name: "强风", hint: "对照 GB 50009" },
  { id: "birds", name: "大型鸟类", hint: "湿地与保护区" },
];

export const DEFAULT_FACTORS: FactorId[] = ["rain", "wind", "birds"];

export function normalizeFactors(raw: unknown): FactorId[] {
  if (!Array.isArray(raw)) return [...DEFAULT_FACTORS];
  const next = raw.filter((x): x is FactorId => x === "rain" || x === "wind" || x === "birds");
  return [...new Set(next)];
}

export function hasFactor(factors: FactorId[], id: FactorId) {
  return factors.includes(id);
}

export function factorTitle(factors: FactorId[]) {
  const names = FACTOR_OPTIONS.filter((f) => factors.includes(f.id)).map((f) => f.name);
  if (!names.length) return "场地高程卫星分析报告";
  return `${names.join("、")}对建筑物影响卫星分析报告`;
}
