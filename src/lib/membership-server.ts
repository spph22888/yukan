import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  PLANS,
  TRIAL_DAYS,
  TRIAL_RUNS,
  emptyMembership,
  planById,
  planLabel,
  type AccessPlan,
  type MembershipState,
  type PlanId,
  type UserRole,
} from "./membership";

type MemberRow = {
  user_id: string;
  plan: string;
  status: string;
  role: string;
  started_at: string | Date;
  expires_at: string | Date | null;
};

type AuthUserRow = { email: string | null; name: string | null };

function toIso(v: string | Date | null | undefined) {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function remainingDays(expiresAt: string | null) {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

async function countRuns(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ n: number }>`
    select count(*)::int as n from analysis_runs where user_id = ${userId}
  `;
  return rows[0]?.n ?? 0;
}

let amountColReady: Promise<void> | null = null;
function ensureOrderAmountNumeric() {
  amountColReady ??= (async () => {
    const sql = await getSql();
    await sql.query(
      "alter table membership_orders alter column amount_yuan type numeric(10, 2) using amount_yuan::numeric(10, 2)",
    );
  })().catch((err) => {
    amountColReady = null;
    throw err;
  });
  return amountColReady;
}

async function readAuthUser(userId: string): Promise<AuthUserRow> {
  const sql = await getSql();
  const rows = await sql<AuthUserRow>`
    select email, name from "user" where id = ${userId} limit 1
  `;
  return rows[0] ?? { email: null, name: null };
}

export function shapeMembership(
  row: MemberRow | undefined,
  extra: { runsUsed?: number; email?: string | null; displayName?: string | null } = {},
): MembershipState {
  const runsUsed = extra.runsUsed ?? 0;
  const email = extra.email ?? null;
  const displayName = extra.displayName ?? null;
  if (!row || row.status !== "active") {
    return {
      ...emptyMembership(),
      plan: (row?.plan as AccessPlan) ?? null,
      planName: row ? planLabel(row.plan) : null,
      role: (row?.role as UserRole) === "admin" ? "admin" : "user",
      isAdmin: row?.role === "admin",
      runsUsed,
      email,
      displayName,
    };
  }
  const expiresAt = toIso(row.expires_at);
  const expired = expiresAt ? new Date(expiresAt).getTime() <= Date.now() : false;
  const isAdmin = row.role === "admin";
  const isTrial = row.plan === "trial";
  if (expired && !isAdmin) {
    return {
      active: false,
      plan: row.plan as AccessPlan,
      planName: planLabel(row.plan),
      expiresAt,
      remainingDays: 0,
      role: isAdmin ? "admin" : "user",
      isTrial,
      isAdmin,
      runsUsed,
      runsLimit: isTrial ? TRIAL_RUNS : null,
      email,
      displayName,
    };
  }
  const trialBlocked = isTrial && runsUsed >= TRIAL_RUNS;
  return {
    active: isAdmin || !trialBlocked,
    plan: row.plan as AccessPlan,
    planName: isAdmin ? "超级管理员" : planLabel(row.plan),
    expiresAt,
    remainingDays: expiresAt ? remainingDays(expiresAt) : null,
    role: isAdmin ? "admin" : "user",
    isTrial,
    isAdmin,
    runsUsed,
    runsLimit: isTrial && !isAdmin ? TRIAL_RUNS : null,
    email,
    displayName,
  };
}

async function readMembership(userId: string): Promise<MembershipState> {
  const sql = await getSql();
  const rows = await sql<MemberRow>`
    select user_id, plan, status, coalesce(role, 'user') as role, started_at, expires_at
    from memberships
    where user_id = ${userId}
    limit 1
  `;
  const auth = await readAuthUser(userId);
  const runsUsed = await countRuns(userId);
  return shapeMembership(rows[0], {
    runsUsed,
    email: auth.email,
    displayName: auth.name,
  });
}

async function adminExists() {
  const sql = await getSql();
  const rows = await sql<{ n: number }>`
    select count(*)::int as n from memberships where role = 'admin'
  `;
  return (rows[0]?.n ?? 0) > 0;
}

async function ensureAccount(userId: string): Promise<MembershipState> {
  const sql = await getSql();
  const now = new Date().toISOString();
  const firstAdmin = !(await adminExists());
  const plan = firstAdmin ? "lifetime" : "trial";
  const role = firstAdmin ? "admin" : "user";
  const expires = firstAdmin ? null : new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString();
  await sql`
    insert into memberships (user_id, plan, status, started_at, expires_at, updated_at, role)
    values (${userId}, ${plan}, 'active', ${now}, ${expires}, ${now}, ${role})
    on conflict (user_id) do nothing
  `;
  if (firstAdmin) {
    await sql`
      update memberships
      set role = 'admin',
          plan = 'lifetime',
          status = 'active',
          expires_at = null,
          updated_at = ${now}
      where user_id = ${userId}
        and not exists (
          select 1 from memberships m2
          where m2.role = 'admin' and m2.user_id <> ${userId}
        )
    `;
  }
  return readMembership(userId);
}

export const getMembership = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<MembershipState> => {
    return ensureAccount(context.userId);
  });

export const purchaseMembership = createServerFn({ method: "POST" })
  .validator((input: { plan: PlanId }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<{ ok: true; membership: MembershipState } | { ok: false; error: string }> => {
    const plan = planById(data.plan);
    if (!plan) return { ok: false, error: "套餐无效" };
    await ensureOrderAmountNumeric();
    const sql = await getSql();
    const current = await ensureAccount(context.userId);
    if (current.active && current.plan === "lifetime") {
      return { ok: false, error: "该账户已永久买断，无需再付费" };
    }
    const now = new Date();
    let expires: Date | null = null;
    if (plan.days != null) {
      const base =
        current.active && !current.isTrial && current.expiresAt && new Date(current.expiresAt) > now
          ? new Date(current.expiresAt)
          : now;
      expires = new Date(base.getTime() + plan.days * 86400000);
    }
    const paidAt = now.toISOString();
    const expiresIso = expires ? expires.toISOString() : null;
    const keepRole = current.isAdmin ? "admin" : "user";
    await sql`
      insert into membership_orders (user_id, plan, amount_yuan, status, paid_at)
      values (${context.userId}, ${plan.id}, ${plan.priceYuan}, 'paid', ${paidAt})
    `;
    await sql`
      insert into memberships (user_id, plan, status, started_at, expires_at, updated_at, role)
      values (${context.userId}, ${plan.id}, 'active', ${paidAt}, ${expiresIso}, ${paidAt}, ${keepRole})
      on conflict (user_id) do update set
        plan = excluded.plan,
        status = 'active',
        expires_at = excluded.expires_at,
        updated_at = excluded.updated_at
    `;
    return { ok: true, membership: await readMembership(context.userId) };
  });

export async function assertMember(userId: string): Promise<{ ok: true } | { ok: false; error: string; code: "membership" }> {
  const mem = await ensureAccount(userId);
  if (mem.isAdmin) return { ok: true };
  if (mem.active && !mem.isTrial) return { ok: true };
  if (mem.isTrial && mem.remainingDays === 0) {
    return { ok: false, error: "试用已到期，请开通会员", code: "membership" };
  }
  if (mem.isTrial && mem.runsLimit != null && mem.runsUsed >= mem.runsLimit) {
    return { ok: false, error: "试用次数已用完，请开通会员继续研判", code: "membership" };
  }
  if (mem.active) return { ok: true };
  return { ok: false, error: "需要有效会员或试用才能研判", code: "membership" };
}

export async function logRun(userId: string, lat: number, lng: number, title?: string) {
  const sql = await getSql();
  await sql`
    insert into analysis_runs (user_id, lat, lng, title)
    values (${userId}, ${lat}, ${lng}, ${title ?? null})
  `;
}

export type MemberListItem = {
  userId: string;
  email: string | null;
  name: string | null;
  plan: string;
  planName: string;
  status: string;
  role: string;
  expiresAt: string | null;
  runsUsed: number;
};

async function requireAdmin(userId: string) {
  const mem = await ensureAccount(userId);
  if (!mem.isAdmin) {
    return { ok: false as const, error: "需要超级管理员权限" };
  }
  return { ok: true as const, mem };
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const gate = await requireAdmin(context.userId);
    if (!gate.ok) return { ok: false as const, error: gate.error, me: emptyMembership(), members: [] as MemberListItem[] };
    const sql = await getSql();
    const members = await sql<{
      user_id: string;
      plan: string;
      status: string;
      role: string;
      expires_at: string | Date | null;
      email: string | null;
      name: string | null;
      runs: number;
    }>`
      select
        m.user_id,
        m.plan,
        m.status,
        coalesce(m.role, 'user') as role,
        m.expires_at,
        u.email,
        u.name,
        coalesce(r.n, 0)::int as runs
      from memberships m
      left join "user" u on u.id = m.user_id
      left join (
        select user_id, count(*)::int as n from analysis_runs group by user_id
      ) r on r.user_id = m.user_id
      order by m.updated_at desc
    `;
    return {
      ok: true as const,
      me: gate.mem,
      members: members.map((row) => ({
        userId: row.user_id,
        email: row.email,
        name: row.name,
        plan: row.plan,
        planName: row.role === "admin" ? "超级管理员" : planLabel(row.plan) ?? row.plan,
        status: row.status,
        role: row.role,
        expiresAt: toIso(row.expires_at),
        runsUsed: row.runs,
      })),
    };
  });

export const adminGrant = createServerFn({ method: "POST" })
  .validator((input: { targetUserId: string; action: "trial" | PlanId | "revoke" }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const gate = await requireAdmin(context.userId);
    if (!gate.ok) return { ok: false as const, error: gate.error };
    const sql = await getSql();
    const now = new Date().toISOString();
    const target = data.targetUserId;
    if (!target) return { ok: false as const, error: "账户无效" };
    if (data.action === "revoke") {
      await sql`
        update memberships
        set status = 'cancelled', updated_at = ${now}
        where user_id = ${target} and role <> 'admin'
      `;
      return { ok: true as const };
    }
    if (data.action === "trial") {
      const expires = new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString();
      await sql`
        insert into memberships (user_id, plan, status, started_at, expires_at, updated_at, role)
        values (${target}, 'trial', 'active', ${now}, ${expires}, ${now}, 'user')
        on conflict (user_id) do update set
          plan = 'trial',
          status = 'active',
          expires_at = excluded.expires_at,
          updated_at = excluded.updated_at
        where memberships.role <> 'admin'
      `;
      return { ok: true as const };
    }
    const plan = planById(data.action);
    if (!plan) return { ok: false as const, error: "套餐无效" };
    await ensureOrderAmountNumeric();
    const expiresIso = plan.days != null ? new Date(Date.now() + plan.days * 86400000).toISOString() : null;
    await sql`
      insert into memberships (user_id, plan, status, started_at, expires_at, updated_at, role)
      values (${target}, ${plan.id}, 'active', ${now}, ${expiresIso}, ${now}, 'user')
      on conflict (user_id) do update set
        plan = excluded.plan,
        status = 'active',
        expires_at = excluded.expires_at,
        updated_at = excluded.updated_at
    `;
    await sql`
      insert into membership_orders (user_id, plan, amount_yuan, status, paid_at)
      values (${target}, ${plan.id}, ${plan.priceYuan}, 'granted', ${now})
    `;
    return { ok: true as const };
  });
