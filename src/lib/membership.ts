export type PlanId = "monthly" | "yearly" | "lifetime";
export type AccessPlan = PlanId | "trial";
export type UserRole = "user" | "admin";
export type PlanKind = "subscribe" | "buyout";

export type Plan = {
  id: PlanId;
  name: string;
  days: number | null;
  priceYuan: number;
  listPriceYuan: number;
  tag: string;
  points: string[];
  featured?: boolean;
  kind: PlanKind;
};

export const TRIAL_DAYS = 7;
export const TRIAL_RUNS = 8;

export function formatYuan(n: number) {
  const body = Number.isInteger(n) ? String(n) : n.toFixed(1);
  return `¥${body}`;
}

export const PLANS: Plan[] = [
  {
    id: "monthly",
    name: "月度会员",
    days: 30,
    listPriceYuan: 99,
    priceYuan: 9.9,
    tag: "一折 · 按月",
    kind: "subscribe",
    points: ["不限次数场地研判", "可导入整条线路杆塔逐基研判", "本机研判记录"],
  },
  {
    id: "yearly",
    name: "年度会员",
    days: 365,
    listPriceYuan: 799,
    priceYuan: 79.9,
    tag: "一折 · 按年",
    kind: "subscribe",
    points: ["含月度全部权益", "高压线路杆塔批量导入", "适合项目组全年使用"],
  },
  {
    id: "lifetime",
    name: "永久买断",
    days: null,
    listPriceYuan: 1999,
    priceYuan: 199.9,
    tag: "一次付清",
    kind: "buyout",
    featured: true,
    points: [
      "一次付清，账户永久有效",
      "不再按月或按年续费",
      "不限次数研判，含全部因子",
      "后续功能升级仍可用",
    ],
  },
];

export const SUBSCRIBE_PLANS = PLANS.filter((p) => p.kind === "subscribe");
export const BUYOUT_PLAN = PLANS.find((p) => p.kind === "buyout")!;

export function planById(id: string) {
  return PLANS.find((p) => p.id === id) ?? null;
}

export function planLabel(plan: string | null) {
  if (plan === "trial") return "免费试用";
  return planById(plan ?? "")?.name ?? plan;
}

export type MembershipState = {
  active: boolean;
  plan: AccessPlan | null;
  planName: string | null;
  expiresAt: string | null;
  remainingDays: number | null;
  role: UserRole;
  isTrial: boolean;
  isAdmin: boolean;
  runsUsed: number;
  runsLimit: number | null;
  email: string | null;
  displayName: string | null;
};

export function emptyMembership(): MembershipState {
  return {
    active: false,
    plan: null,
    planName: null,
    expiresAt: null,
    remainingDays: null,
    role: "user",
    isTrial: false,
    isAdmin: false,
    runsUsed: 0,
    runsLimit: null,
    email: null,
    displayName: null,
  };
}
