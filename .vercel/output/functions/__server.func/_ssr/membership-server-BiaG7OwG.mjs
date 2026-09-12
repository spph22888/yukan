import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { a as emptyMembership, c as planLabel, i as authMiddleware, s as planById } from "./membership-H9HTzc88.mjs";
import { r as getSql } from "./db-BfWHwC1s.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/membership-server-BiaG7OwG.js
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
var amountColReady = null;
function ensureOrderAmountNumeric() {
	amountColReady ??= (async () => {
		await (await getSql()).query("alter table membership_orders alter column amount_yuan type numeric(10, 2) using amount_yuan::numeric(10, 2)");
	})().catch((err) => {
		amountColReady = null;
		throw err;
	});
	return amountColReady;
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
var getMembership_createServerFn_handler = createServerRpc({
	id: "9f2b8a6ab6908cb63b68124cf4b170c66117a804a699c7f55e6df895bb6af0a9",
	name: "getMembership",
	filename: "src/lib/membership-server.ts"
}, (opts) => getMembership.__executeServer(opts));
var getMembership = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getMembership_createServerFn_handler, async ({ context }) => {
	return ensureAccount(context.userId);
});
var purchaseMembership_createServerFn_handler = createServerRpc({
	id: "6c33cca976270fbce0da8c8f7454ade281fcb267211451e3ae999334f893f7a2",
	name: "purchaseMembership",
	filename: "src/lib/membership-server.ts"
}, (opts) => purchaseMembership.__executeServer(opts));
var purchaseMembership = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(purchaseMembership_createServerFn_handler, async ({ context, data }) => {
	const plan = planById(data.plan);
	if (!plan) return {
		ok: false,
		error: "套餐无效"
	};
	await ensureOrderAmountNumeric();
	const sql = await getSql();
	const current = await ensureAccount(context.userId);
	if (current.active && current.plan === "lifetime") return {
		ok: false,
		error: "该账户已永久买断，无需再付费"
	};
	const now = /* @__PURE__ */ new Date();
	let expires = null;
	if (plan.days != null) {
		const base = current.active && !current.isTrial && current.expiresAt && new Date(current.expiresAt) > now ? new Date(current.expiresAt) : now;
		expires = new Date(base.getTime() + plan.days * 864e5);
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
	return {
		ok: true,
		membership: await readMembership(context.userId)
	};
});
async function requireAdmin(userId) {
	const mem = await ensureAccount(userId);
	if (!mem.isAdmin) return {
		ok: false,
		error: "需要超级管理员权限"
	};
	return {
		ok: true,
		mem
	};
}
var getAdminOverview_createServerFn_handler = createServerRpc({
	id: "777b1b3680974b6712729b11da0605e14bc742f609901f65a8bb1908ad8b719b",
	name: "getAdminOverview",
	filename: "src/lib/membership-server.ts"
}, (opts) => getAdminOverview.__executeServer(opts));
var getAdminOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getAdminOverview_createServerFn_handler, async ({ context }) => {
	const gate = await requireAdmin(context.userId);
	if (!gate.ok) return {
		ok: false,
		error: gate.error,
		me: emptyMembership(),
		members: []
	};
	const members = await (await getSql())`
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
		ok: true,
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
			runsUsed: row.runs
		}))
	};
});
var adminGrant_createServerFn_handler = createServerRpc({
	id: "d58fed9e75f93681bd505c0a2da396a0514a1dc0ac13f34f5b4a29516ede33d1",
	name: "adminGrant",
	filename: "src/lib/membership-server.ts"
}, (opts) => adminGrant.__executeServer(opts));
var adminGrant = createServerFn({ method: "POST" }).validator((input) => input).middleware([authMiddleware]).handler(adminGrant_createServerFn_handler, async ({ context, data }) => {
	const gate = await requireAdmin(context.userId);
	if (!gate.ok) return {
		ok: false,
		error: gate.error
	};
	const sql = await getSql();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const target = data.targetUserId;
	if (!target) return {
		ok: false,
		error: "账户无效"
	};
	if (data.action === "revoke") {
		await sql`
        update memberships
        set status = 'cancelled', updated_at = ${now}
        where user_id = ${target} and role <> 'admin'
      `;
		return { ok: true };
	}
	if (data.action === "trial") {
		await sql`
        insert into memberships (user_id, plan, status, started_at, expires_at, updated_at, role)
        values (${target}, 'trial', 'active', ${now}, ${new Date(Date.now() + 6048e5).toISOString()}, ${now}, 'user')
        on conflict (user_id) do update set
          plan = 'trial',
          status = 'active',
          expires_at = excluded.expires_at,
          updated_at = excluded.updated_at
        where memberships.role <> 'admin'
      `;
		return { ok: true };
	}
	const plan = planById(data.action);
	if (!plan) return {
		ok: false,
		error: "套餐无效"
	};
	await ensureOrderAmountNumeric();
	const expiresIso = plan.days != null ? new Date(Date.now() + plan.days * 864e5).toISOString() : null;
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
	return { ok: true };
});
//#endregion
export { adminGrant_createServerFn_handler, getAdminOverview_createServerFn_handler, getMembership_createServerFn_handler, purchaseMembership_createServerFn_handler };
