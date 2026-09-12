import { r as createServerFn } from "./ssr.mjs";
import { a as emptyMembership, c as planLabel, i as authMiddleware } from "./membership-H9HTzc88.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { r as getSql } from "./db-BfWHwC1s.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/membership-server-D3uGxw8t.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function finite(n, fallback = 0) {
	return Number.isFinite(n) ? n : fallback;
}
function round(n, digits = 1) {
	const f = 10 ** digits;
	return Math.round(finite(n) * f) / f;
}
function zhDate(d = /* @__PURE__ */ new Date()) {
	return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
function zhDateTime(d = /* @__PURE__ */ new Date()) {
	const hh = String(d.getHours()).padStart(2, "0");
	const mm = String(d.getMinutes()).padStart(2, "0");
	return `${zhDate(d)} ${hh}:${mm}`;
}
var LEVEL_ZH = {
	low: "低",
	"mid-low": "中低",
	mid: "中",
	"mid-high": "中高",
	high: "高"
};
var LEVEL_TONE = {
	low: "low",
	"mid-low": "low",
	mid: "mid",
	"mid-high": "high",
	high: "high"
};
function toIso(v) {
	if (!v) return null;
	const d = v instanceof Date ? v : new Date(v);
	if (Number.isNaN(d.getTime())) return null;
	return d.toISOString();
}
function remainingDays(expiresAt) {
	if (!expiresAt) return null;
	const ms = new Date(expiresAt).getTime() - Date.now();
	return Math.max(0, Math.ceil(ms / 864e5));
}
async function countRuns(userId) {
	return (await (await getSql())`
    select count(*)::int as n from analysis_runs where user_id = ${userId}
  `)[0]?.n ?? 0;
}
async function readAuthUser(userId) {
	return (await (await getSql())`
    select email, name from "user" where id = ${userId} limit 1
  `)[0] ?? {
		email: null,
		name: null
	};
}
function shapeMembership(row, extra = {}) {
	const runsUsed = extra.runsUsed ?? 0;
	const email = extra.email ?? null;
	const displayName = extra.displayName ?? null;
	if (!row || row.status !== "active") return {
		...emptyMembership(),
		plan: row?.plan ?? null,
		planName: row ? planLabel(row.plan) : null,
		role: row?.role === "admin" ? "admin" : "user",
		isAdmin: row?.role === "admin",
		runsUsed,
		email,
		displayName
	};
	const expiresAt = toIso(row.expires_at);
	const expired = expiresAt ? new Date(expiresAt).getTime() <= Date.now() : false;
	const isAdmin = row.role === "admin";
	const isTrial = row.plan === "trial";
	if (expired && !isAdmin) return {
		active: false,
		plan: row.plan,
		planName: planLabel(row.plan),
		expiresAt,
		remainingDays: 0,
		role: isAdmin ? "admin" : "user",
		isTrial,
		isAdmin,
		runsUsed,
		runsLimit: isTrial ? 8 : null,
		email,
		displayName
	};
	return {
		active: isAdmin || !(isTrial && runsUsed >= 8),
		plan: row.plan,
		planName: isAdmin ? "超级管理员" : planLabel(row.plan),
		expiresAt,
		remainingDays: expiresAt ? remainingDays(expiresAt) : null,
		role: isAdmin ? "admin" : "user",
		isTrial,
		isAdmin,
		runsUsed,
		runsLimit: isTrial && !isAdmin ? 8 : null,
		email,
		displayName
	};
}
async function readMembership(userId) {
	const rows = await (await getSql())`
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
		displayName: auth.name
	});
}
async function adminExists() {
	return ((await (await getSql())`
    select count(*)::int as n from memberships where role = 'admin'
  `)[0]?.n ?? 0) > 0;
}
async function ensureAccount(userId) {
	const sql = await getSql();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const firstAdmin = !await adminExists();
	const plan = firstAdmin ? "lifetime" : "trial";
	const role = firstAdmin ? "admin" : "user";
	await sql`
    insert into memberships (user_id, plan, status, started_at, expires_at, updated_at, role)
    values (${userId}, ${plan}, 'active', ${now}, ${firstAdmin ? null : new Date(Date.now() + 6048e5).toISOString()}, ${now}, ${role})
    on conflict (user_id) do nothing
  `;
	if (firstAdmin) await sql`
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
	return readMembership(userId);
}
var getMembership = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("9f2b8a6ab6908cb63b68124cf4b170c66117a804a699c7f55e6df895bb6af0a9"));
var purchaseMembership = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(createSsrRpc("6c33cca976270fbce0da8c8f7454ade281fcb267211451e3ae999334f893f7a2"));
async function assertMember(userId) {
	const mem = await ensureAccount(userId);
	if (mem.isAdmin) return { ok: true };
	if (mem.active && !mem.isTrial) return { ok: true };
	if (mem.isTrial && mem.remainingDays === 0) return {
		ok: false,
		error: "试用已到期，请开通会员",
		code: "membership"
	};
	if (mem.isTrial && mem.runsLimit != null && mem.runsUsed >= mem.runsLimit) return {
		ok: false,
		error: "试用次数已用完，请开通会员继续研判",
		code: "membership"
	};
	if (mem.active) return { ok: true };
	return {
		ok: false,
		error: "需要有效会员或试用才能研判",
		code: "membership"
	};
}
async function logRun(userId, lat, lng, title) {
	await (await getSql())`
    insert into analysis_runs (user_id, lat, lng, title)
    values (${userId}, ${lat}, ${lng}, ${title ?? null})
  `;
}
var getAdminOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("777b1b3680974b6712729b11da0605e14bc742f609901f65a8bb1908ad8b719b"));
var adminGrant = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(createSsrRpc("d58fed9e75f93681bd505c0a2da396a0514a1dc0ac13f34f5b4a29516ede33d1"));
//#endregion
export { cn as a, getMembership as c, round as d, zhDate as f, assertMember as i, logRun as l, LEVEL_ZH as n, finite as o, zhDateTime as p, adminGrant as r, getAdminOverview as s, LEVEL_TONE as t, purchaseMembership as u };
