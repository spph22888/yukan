import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/membership-H9HTzc88.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-B40BzJxt.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-6mFysiQO.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
function formatYuan(n) {
	return `¥${Number.isInteger(n) ? String(n) : n.toFixed(1)}`;
}
var PLANS = [
	{
		id: "monthly",
		name: "月度会员",
		days: 30,
		listPriceYuan: 99,
		priceYuan: 9.9,
		tag: "一折 · 按月",
		kind: "subscribe",
		points: [
			"不限次数场地研判",
			"可导入整条线路杆塔逐基研判",
			"本机研判记录"
		]
	},
	{
		id: "yearly",
		name: "年度会员",
		days: 365,
		listPriceYuan: 799,
		priceYuan: 79.9,
		tag: "一折 · 按年",
		kind: "subscribe",
		points: [
			"含月度全部权益",
			"高压线路杆塔批量导入",
			"适合项目组全年使用"
		]
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
			"后续功能升级仍可用"
		]
	}
];
var SUBSCRIBE_PLANS = PLANS.filter((p) => p.kind === "subscribe");
var BUYOUT_PLAN = PLANS.find((p) => p.kind === "buyout");
function planById(id) {
	return PLANS.find((p) => p.id === id) ?? null;
}
function planLabel(plan) {
	if (plan === "trial") return "免费试用";
	return planById(plan ?? "")?.name ?? plan;
}
function emptyMembership() {
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
		displayName: null
	};
}
//#endregion
export { emptyMembership as a, planLabel as c, authMiddleware as i, PLANS as n, formatYuan as o, SUBSCRIBE_PLANS as r, planById as s, BUYOUT_PLAN as t };
