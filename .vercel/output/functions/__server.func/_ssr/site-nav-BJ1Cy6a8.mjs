import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, _ as Link, v as useRouteContext, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { a as cn, c as getMembership } from "./membership-server-D3uGxw8t.mjs";
import { i as signOut, t as authClient } from "./client-B40BzJxt.mjs";
import { a as hasGateSessionMarker } from "./server-Bsc1O9qT.mjs";
import { g as Copy, m as Droplets } from "../_libs/lucide-react.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/site-nav-BJ1Cy6a8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,color,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg shadow-sm hover:opacity-90",
			invert: "bg-fg text-bg hover:opacity-90",
			ghost: "bg-transparent text-fg hover:bg-fg/8",
			outline: "bg-transparent text-fg ring-1 ring-border hover:bg-fg/6",
			paper: "bg-ink text-paper hover:opacity-90"
		},
		size: {
			sm: "h-9 rounded-lg px-3 text-sm",
			md: "h-11 rounded-xl px-4 text-sm",
			lg: "h-12 rounded-xl px-5 text-base",
			icon: "size-11 rounded-xl"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "md"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		ref,
		...props
	});
});
Button.displayName = "Button";
function useGatedUser() {
	const { user, isPending } = useCurrentUserState();
	const sessionUser = useRouteContext({ from: "__root__" }).sessionUser;
	if (user) return {
		user,
		isPending: false
	};
	if (isPending && sessionUser) return {
		user: {
			id: sessionUser.id,
			displayName: sessionUser.email,
			primaryEmail: sessionUser.email,
			profileImageUrl: null,
			isDevFallback: false
		},
		isPending: false
	};
	return {
		user,
		isPending
	};
}
function BrandMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/",
		className: "flex items-center gap-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Droplets, { className: "size-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "leading-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-display block text-lg tracking-wide text-fg",
				children: "雨瞰"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 block text-[10px] tracking-[0.22em] text-muted uppercase",
				children: "Yukan"
			})]
		})]
	});
}
function AuthSlot({ after } = {}) {
	const { user, isPending } = useGatedUser();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-9 w-24 animate-pulse rounded-lg bg-fg/8" });
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLink, {}),
			after === "app" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				variant: "outline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/app",
					children: "进入工作台"
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			size: "sm",
			variant: "ghost",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				children: "登录"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			size: "sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				children: "免费试用"
			})
		})]
	});
}
function MemberChip() {
	const [label, setLabel] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getMembership().then((m) => {
			if (m.isAdmin) {
				setLabel("超管");
				return;
			}
			if (!m.active) {
				setLabel("未开通");
				return;
			}
			if (m.isTrial) {
				setLabel(`试用 ${m.remainingDays ?? 0}天 · ${m.runsUsed}/${m.runsLimit ?? 8}`);
				return;
			}
			if (m.remainingDays == null) setLabel("已买断");
			else setLabel(`${m.planName} · ${m.remainingDays} 天`);
		}).catch(() => setLabel(null));
	}, []);
	if (!label) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden h-8 w-24 animate-pulse rounded-full bg-fg/8 sm:block" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "hidden max-w-[14rem] truncate rounded-full bg-primary/12 px-2.5 py-1 text-[11px] text-primary sm:inline",
		children: label
	});
}
function CopySiteLink({ size = "lg" }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [origin, setOrigin] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setOrigin(window.location.origin);
	}, []);
	function copy() {
		const url = origin || window.location.origin;
		navigator.clipboard.writeText(url).then(() => {
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1600);
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		size,
		variant: "outline",
		onClick: copy,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), copied ? "已复制站点链接" : "复制站点链接"]
	});
}
function SiteOrigin() {
	const [origin, setOrigin] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setOrigin(window.location.origin);
	}, []);
	if (!origin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "h-4" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "font-mono text-[11px] text-faint break-all",
		children: origin
	});
}
function AdminLink() {
	const [admin, setAdmin] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		getMembership().then((m) => setAdmin(m.isAdmin)).catch(() => setAdmin(false));
	}, []);
	if (!admin) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		size: "sm",
		variant: "outline",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/admin",
			children: "管理台"
		})
	});
}
function PublicNav() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 bg-bg/88 px-4 backdrop-blur-md ring-1 ring-border sm:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				variant: "ghost",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/client",
					children: "安装"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, { after: "app" })]
		})]
	});
}
//#endregion
export { MemberChip as a, SiteOrigin as c, CopySiteLink as i, UserButton as l, BrandMark as n, PublicNav as o, Button as r, RedirectToSignIn as s, AdminLink as t, useGatedUser as u };
