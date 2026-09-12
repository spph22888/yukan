import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as emptyMembership } from "./membership-H9HTzc88.mjs";
import { f as zhDate, r as adminGrant, s as getAdminOverview } from "./membership-server-D3uGxw8t.mjs";
import { o as PublicNav, r as Button, s as RedirectToSignIn, u as useGatedUser } from "./site-nav-BJ1Cy6a8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-02-4JLHY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminPage() {
	const { user, isPending } = useGatedUser();
	const [me, setMe] = (0, import_react.useState)(null);
	const [members, setMembers] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(null);
	async function load() {
		const res = await getAdminOverview();
		if (!res.ok) {
			setError(res.error);
			setMe(res.me ?? emptyMembership());
			setMembers([]);
			return;
		}
		setError(null);
		setMe(res.me);
		setMembers(res.members);
	}
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		load().catch(() => setError("管理台加载失败"));
	}, [isPending, user]);
	if (isPending || user && !me && !error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicNav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-16 h-40 w-[min(92%,36rem)] animate-pulse rounded-2xl bg-fg/6" })]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	async function grant(targetUserId, action) {
		setBusy(`${targetUserId}:${action}`);
		try {
			const res = await adminGrant({ data: {
				targetUserId,
				action
			} });
			if (!res.ok) setError(res.error);
			await load();
		} catch (err) {
			setError(err instanceof Error ? err.message : "操作失败");
		} finally {
			setBusy(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicNav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto w-full max-w-5xl px-4 py-10 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.22em] text-muted uppercase",
					children: "Super admin"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-2 text-3xl",
					children: "超级管理员"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-sm text-muted text-pretty",
					children: "第一个打开本站的登录账户会自动成为超管，并拥有终身权限。这就是你的管理账户，没有另设密码。试用发放只对这个账户开放。"
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-risk-high",
					children: error
				}) : null,
				me?.isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8 rounded-2xl bg-surface px-5 py-5 ring-1 ring-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl",
							children: "你的超管账户"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-3 grid gap-2 text-sm sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "显示名"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: me.displayName || "未设置" })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "邮箱"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "break-all",
									children: me.email || "（当前登录身份，无独立邮箱密码）"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "权限"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: "超级管理员 · 终身" })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "研判次数"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "tabular-nums",
									children: me.runsUsed
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-xs text-faint text-pretty",
							children: "登录方式就是你现在用的这个账户。预览里会自动登录；对外给同事用邮箱注册即可走免费试用。"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/app",
									children: "进入工作台"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/client",
									children: "客户端安装页"
								})
							})]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "mt-8 rounded-2xl bg-surface px-5 py-5 ring-1 ring-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "当前登录账户不是超级管理员。"
					})
				}),
				me?.isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl",
							children: "用户与试用"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "新注册用户自动获得 7 天 / 8 次免费试用。可在此续试用、开年度、开买断或停用。"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 overflow-x-auto rounded-2xl ring-1 ring-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[40rem] text-left text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "bg-fg/4 text-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "账户"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "套餐"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "次数"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 font-medium",
											children: "操作"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: members.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-8 text-muted",
									colSpan: 4,
									children: "还没有其他用户。"
								}) }) : members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t border-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "truncate",
												children: m.name || m.email || "未命名"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "truncate text-[11px] text-faint",
												children: m.email
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: m.planName }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[11px] text-faint",
												children: [
													m.expiresAt ? zhDate(new Date(m.expiresAt)) : "长期",
													" · ",
													m.status
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 tabular-nums",
											children: m.runsUsed
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: m.role === "admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[11px] text-muted",
												children: "超管"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "outline",
														disabled: busy !== null,
														onClick: () => void grant(m.userId, "trial"),
														children: "续试用"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "outline",
														disabled: busy !== null,
														onClick: () => void grant(m.userId, "yearly"),
														children: "开年度"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "outline",
														disabled: busy !== null,
														onClick: () => void grant(m.userId, "lifetime"),
														children: "开买断"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "ghost",
														disabled: busy !== null,
														onClick: () => void grant(m.userId, "revoke"),
														children: "停用"
													})
												]
											})
										})
									]
								}, m.userId)) })]
							})
						})
					]
				}) : null
			]
		})]
	});
}
//#endregion
export { AdminPage as component };
