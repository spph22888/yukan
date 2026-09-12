import { S as require_jsx_runtime, _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as formatYuan, r as SUBSCRIBE_PLANS, t as BUYOUT_PLAN } from "./membership-H9HTzc88.mjs";
import { a as Timer, h as Download, m as Droplets, n as Wind, s as Shield, y as ArrowRight } from "../_libs/lucide-react.mjs";
import { c as SiteOrigin, i as CopySiteLink, o as PublicNav, r as Button, u as useGatedUser } from "./site-nav-BJ1Cy6a8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BYxg_gZv.js
var import_jsx_runtime = require_jsx_runtime();
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicNav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.22em] text-muted uppercase",
					children: "Yukan · 雨瞰"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-3 max-w-3xl text-4xl leading-tight text-balance sm:text-5xl",
					children: "任意坐标的降雨、强风与鸟类活动研判"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-xl text-base text-muted text-pretty",
					children: "雨瞰对照规范风压、栖息地名录和高程水系，生成交办件式卫星分析报告。可导入高压输电线路每基杆塔坐标，逐基研判。潜在客户可走免费试用通道。"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroCta, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							variant: "outline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/client",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "安装客户端"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopySiteLink, {})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteOrigin, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-faint text-pretty",
						children: "此地址走海外线路，大陆运营商经常拦截。请用系统浏览器打开，不要用微信内置窗口。"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-10 grid gap-3 lg:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl bg-primary/12 px-5 py-5 ring-1 ring-primary/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] tracking-[0.18em] uppercase",
									children: "Free trial"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display mt-2 text-2xl",
								children: "免费试用通道"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted text-pretty",
								children: "邮箱注册即开通，给潜在客户先看报告再决定是否付费。不绑支付、不走 Google。"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-4 grid grid-cols-2 gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl bg-bg/40 px-3 py-3 ring-1 ring-border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted",
										children: "时长"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
										className: "font-display mt-1 text-xl tabular-nums",
										children: [7, " 天"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl bg-bg/40 px-3 py-3 ring-1 ring-border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted",
										children: "研判次数"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
										className: "font-display mt-1 text-xl tabular-nums",
										children: [8, " 次"]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrialCta, {})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl bg-surface px-5 py-5 ring-1 ring-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] tracking-[0.18em] uppercase",
									children: "Client"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display mt-2 text-2xl",
								children: "下载安装客户端"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted text-pretty",
								children: "把雨瞰装到电脑或手机桌面，打开方式与本地软件相同。也可下载启动包（Windows 快捷方式 / Mac 书签）。"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "mt-4 space-y-1.5 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Windows / Mac：Chrome、Edge 点「安装应用」" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "手机：添加到主屏幕，从桌面图标打开" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "研判仍需联网，没有独立离线安装包" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								className: "mt-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/client",
									children: "去安装 / 下载启动包"
								})
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 rounded-2xl bg-surface px-5 py-5 ring-1 ring-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl",
						children: "国内怎么用"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-3 list-decimal space-y-2 pl-5 text-sm text-muted text-pretty",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "软件中文名是「雨瞰」，拉丁名 Yukan。给同事只说这个名字即可。" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "在本页用邮箱注册，自动进入免费试用通道。不要点 Google / X。" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "复制出的链接在大陆常打不开，因为站点目前托管在海外。要让国内稳定访问，需要你自己已备案的域名做解析或反向代理；我这边无法完成备案或迁到国内云。" })
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-14 grid gap-3 sm:grid-cols-3",
					children: [
						{
							icon: Droplets,
							t: "强降雨",
							d: "高程网格、径流路径、河道淹没与内涝矩阵。"
						},
						{
							icon: Wind,
							t: "强风",
							d: "来风/历史风速对照 GB 50009 设计值，临近或超过即提示修正。"
						},
						{
							icon: Shield,
							t: "大型鸟类",
							d: "湿地与保护区名录，评估玻璃撞击与筑巢堵排水。"
						}
					].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl bg-surface px-4 py-4 ring-1 ring-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "size-4 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display mt-3 text-lg",
								children: c.t
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted text-pretty",
								children: c.d
							})
						]
					}, c.t))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display mt-16 text-2xl",
					children: "会员套餐 · 一折"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "订阅按月或按年；也可以一次买断，账户永久有效。试用不够再开通。"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 grid gap-3 sm:grid-cols-2",
					children: SUBSCRIBE_PLANS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl bg-surface px-4 py-4 ring-1 ring-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-muted",
									children: p.tag
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-full bg-fg/8 px-2 py-0.5 text-[10px] text-muted",
									children: "一折"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display mt-1 text-xl",
								children: p.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex flex-wrap items-baseline gap-x-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-2xl tabular-nums",
										children: formatYuan(p.priceYuan)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm text-muted line-through tabular-nums",
										children: formatYuan(p.listPriceYuan)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm text-muted",
										children: [
											"/ ",
											p.days,
											" 天"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 space-y-1 text-sm text-muted",
								children: p.points.map((pt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: pt }, pt))
							})
						]
					}, p.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 rounded-2xl bg-primary/12 px-5 py-5 ring-1 ring-primary/30",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] tracking-[0.18em] text-primary uppercase",
								children: "Buyout"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-primary/20 px-2 py-0.5 text-[10px] text-primary",
								children: "一次付清"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display mt-2 text-2xl",
							children: BUYOUT_PLAN.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted text-pretty",
							children: "买断当前登录账户，永久有效、不限次数，不再按月或按年续费。"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-baseline gap-x-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-3xl tabular-nums",
									children: formatYuan(BUYOUT_PLAN.priceYuan)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted line-through tabular-nums",
									children: formatYuan(BUYOUT_PLAN.listPriceYuan)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted",
									children: "原价一折"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 grid gap-1 text-sm text-muted sm:grid-cols-2",
							children: BUYOUT_PLAN.points.map((pt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: pt }, pt))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanCta, {})
			]
		})]
	});
}
function HeroCta() {
	const { user, isPending } = useGatedUser();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-12 w-44 animate-pulse rounded-xl bg-fg/8" });
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		size: "lg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/app",
			children: ["进入工作台", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		size: "lg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/login",
			children: ["免费试用", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
		})
	});
}
function TrialCta() {
	const { user, isPending } = useGatedUser();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-5 h-11 w-40 animate-pulse rounded-xl bg-fg/8" });
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		className: "mt-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/app",
			children: "进入工作台"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		className: "mt-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/login",
			children: "开始免费试用"
		})
	});
}
function PlanCta() {
	const { user, isPending } = useGatedUser();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-6 h-11 w-28 animate-pulse rounded-xl bg-fg/8" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		className: "mt-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: user ? "/membership" : "/login",
			children: user ? "去开通 / 续期" : "免费试用后再开通"
		})
	});
}
//#endregion
export { Landing as component };
