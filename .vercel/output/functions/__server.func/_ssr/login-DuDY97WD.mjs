import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, _ as Link, b as useNavigate, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { t as GROK_PROVIDERS } from "./server-Bsc1O9qT.mjs";
import { n as BrandMark, r as Button, u as useGatedUser } from "./site-nav-BJ1Cy6a8.mjs";
import { t as Input } from "./input-C5_XJQtv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-DuDY97WD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { user, isPending } = useGatedUser();
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("up");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "flex h-14 items-center px-4 ring-1 ring-border sm:px-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex flex-1 items-center justify-center px-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-72 w-full max-w-sm animate-pulse rounded-2xl bg-fg/6" })
		})]
	});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app" });
	async function onEmail(e) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		try {
			if (mode === "up") {
				const res = await authClient.signUp.email({
					email: email.trim(),
					password,
					name: name.trim() || email.trim()
				});
				if (res.error) {
					setError(res.error.message || "注册失败");
					return;
				}
			} else {
				const res = await authClient.signIn.email({
					email: email.trim(),
					password
				});
				if (res.error) {
					setError(res.error.message || "登录失败");
					return;
				}
			}
			await authClient.getSession();
			await navigate({ to: "/app" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "登录失败");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "flex h-14 items-center px-4 ring-1 ring-border sm:px-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex flex-1 items-center justify-center px-4 py-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] tracking-[0.22em] text-muted uppercase",
						children: "Yukan · Trial"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-2 text-3xl",
						children: "邮箱注册，免费试用"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted text-pretty",
						children: [
							"新账户自动获得 ",
							7,
							" 天试用、共 ",
							8,
							" 次研判。大陆请用邮箱，不要使用 Google / X。"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex rounded-xl bg-surface p-1 ring-1 ring-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: `flex-1 rounded-lg py-2 text-sm ${mode === "in" ? "bg-fg/10 text-fg" : "text-muted"}`,
								onClick: () => setMode("in"),
								children: "登录"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: `flex-1 rounded-lg py-2 text-sm ${mode === "up" ? "bg-fg/10 text-fg" : "text-muted"}`,
								onClick: () => setMode("up"),
								children: "注册试用"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-4 space-y-3",
							onSubmit: (e) => void onEmail(e),
							children: [
								mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "称呼（可选）",
									value: name,
									onChange: (e) => setName(e.target.value),
									autoComplete: "name"
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "email",
									required: true,
									placeholder: "邮箱",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									autoComplete: "email"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "password",
									required: true,
									minLength: 8,
									placeholder: "密码（至少 8 位）",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									autoComplete: mode === "up" ? "new-password" : "current-password"
								}),
								error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-risk-high",
									children: error
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "w-full",
									type: "submit",
									disabled: busy,
									children: busy ? "请稍候…" : mode === "up" ? "注册并开始试用" : "登录"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "mt-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								className: "cursor-pointer text-center text-[11px] text-faint",
								children: "海外账号（Google / X，国内通常不可用）"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 space-y-2",
								children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "outline",
									className: "w-full",
									onClick: () => signIn(p.providerId, { callbackURL: "/app" }),
									children: [
										"使用 ",
										p.label,
										" 继续"
									]
								}, p.providerId))
							})]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-center text-xs text-faint",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "hover:text-muted",
							children: "返回首页"
						})
					})
				]
			})
		})]
	});
}
//#endregion
export { Login as component };
