import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, _ as Link, b as useNavigate, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as emptyMembership, n as PLANS, o as formatYuan, r as SUBSCRIBE_PLANS, t as BUYOUT_PLAN } from "./membership-H9HTzc88.mjs";
import { a as cn, c as getMembership, u as purchaseMembership } from "./membership-server-D3uGxw8t.mjs";
import { v as Check } from "../_libs/lucide-react.mjs";
import { o as PublicNav, r as Button, s as RedirectToSignIn, u as useGatedUser } from "./site-nav-BJ1Cy6a8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/membership-_4tx5qLX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MembershipPage() {
	const { user, isPending } = useGatedUser();
	const navigate = useNavigate();
	const [mem, setMem] = (0, import_react.useState)(null);
	const [picked, setPicked] = (0, import_react.useState)("lifetime");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [done, setDone] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		getMembership().then(setMem).catch(() => setMem(emptyMembership()));
	}, [isPending, user]);
	if (isPending || user && !mem) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicNav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-16 h-40 w-[min(92%,36rem)] animate-pulse rounded-2xl bg-fg/6" })]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (mem?.active && !mem.isTrial && !done) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app" });
	async function buy() {
		setBusy(true);
		setError(null);
		try {
			const res = await purchaseMembership({ data: { plan: picked } });
			if (!res.ok) {
				setError(res.error);
				return;
			}
			setMem(res.membership);
			setDone(true);
			window.setTimeout(() => {
				navigate({ to: "/app" });
			}, 900);
		} catch (err) {
			setError(err instanceof Error ? err.message : "开通失败");
		} finally {
			setBusy(false);
		}
	}
	const plan = PLANS.find((p) => p.id === picked);
	const buyout = picked === "lifetime";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicNav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto w-full max-w-4xl px-4 py-10 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.22em] text-muted uppercase",
					children: "Membership"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-2 text-3xl sm:text-4xl",
					children: "一折开通，或一次买断"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 max-w-xl text-sm text-muted text-pretty",
					children: [
						"新账户自动获得 ",
						7,
						" 天试用、共 ",
						8,
						" 次研判。订阅套餐现价一折；买断一次付清，账户永久有效。"
					]
				}),
				mem?.isTrial ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 rounded-2xl bg-primary/12 px-5 py-5 ring-1 ring-primary/30",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xl",
							children: "你正在免费试用通道"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								"剩余 ",
								mem.remainingDays ?? 0,
								" 天 · 已用 ",
								mem.runsUsed,
								"/",
								mem.runsLimit ?? 8,
								" 次"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/app",
								children: "继续研判"
							})
						})
					]
				}) : null,
				done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 rounded-2xl bg-primary/12 px-5 py-6 ring-1 ring-primary/30",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-xl",
							children: [
								buyout ? "已买断" : "已开通",
								" ",
								plan.name
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "正在进入工作台…"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/app",
								children: "立即进入"
							})
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display mt-10 text-xl",
						children: "订阅套餐"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "到期后续期。现价为一折。"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: SUBSCRIBE_PLANS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanCard, {
							plan: p,
							picked: picked === p.id,
							onPick: () => setPicked(p.id)
						}, p.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display mt-10 text-xl",
						children: "永久买断"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "一次付清，不再续费。适合长期勘察与档案留存。"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanCard, {
							plan: BUYOUT_PLAN,
							picked: picked === BUYOUT_PLAN.id,
							onPick: () => setPicked(BUYOUT_PLAN.id),
							wide: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 rounded-2xl bg-surface px-5 py-5 ring-1 ring-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: buyout ? "买断确认" : "订单确认"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-display text-lg",
								children: [
									plan.name,
									" · ",
									formatYuan(plan.priceYuan),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-2 text-sm font-sans text-muted line-through",
										children: formatYuan(plan.listPriceYuan)
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-faint text-pretty",
								children: buyout ? "确认后当前登录账户永久有效，不限研判次数。没有接入微信或支付宝收款；开通以账户记录为准。" : "确认后会员权限立即写入当前登录账户。没有接入第三方收款；开通以账户记录为准，不与他人共享。"
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-risk-high",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-4",
								disabled: busy,
								onClick: () => void buy(),
								children: busy ? "开通中…" : buyout ? `确认买断 · ${formatYuan(plan.priceYuan)}` : `确认开通 · ${formatYuan(plan.priceYuan)}`
							})
						]
					})
				] })
			]
		})]
	});
}
function PlanCard({ plan, picked, onPick, wide }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onPick,
		className: cn("rounded-2xl px-4 py-4 text-left ring-1 transition-colors", picked ? "bg-primary/12 ring-primary/50" : "bg-surface ring-border hover:ring-fg/20", wide && "sm:px-6 sm:py-5"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] tracking-wide text-muted",
					children: plan.tag
				}), plan.featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-primary/20 px-2 py-0.5 text-[10px] text-primary",
					children: "买断"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-fg/8 px-2 py-0.5 text-[10px] text-muted",
					children: "一折"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-display mt-2 text-xl",
				children: plan.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-2xl tabular-nums",
						children: formatYuan(plan.priceYuan)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted line-through tabular-nums",
						children: formatYuan(plan.listPriceYuan)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted",
						children: plan.days ? ` / ${plan.days} 天` : " · 永久"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: cn("mt-3 space-y-1.5 text-sm text-muted", wide && "sm:grid sm:grid-cols-2 sm:gap-x-6 sm:space-y-0 sm:gap-y-1.5"),
				children: plan.points.map((pt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 size-3.5 shrink-0 text-primary" }), pt]
				}, pt))
			})
		]
	});
}
//#endregion
export { MembershipPage as component };
