import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as Share, d as Monitor, h as Download, o as Smartphone } from "../_libs/lucide-react.mjs";
import { o as PublicNav, r as Button } from "./site-nav-BJ1Cy6a8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-BGMp0Onm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function crc32(data) {
	let crc = 4294967295;
	for (let i = 0; i < data.length; i++) {
		crc ^= data[i];
		for (let j = 0; j < 8; j++) crc = crc >>> 1 ^ 3988292384 & -(crc & 1);
	}
	return (crc ^ 4294967295) >>> 0;
}
function u16(n) {
	const b = /* @__PURE__ */ new Uint8Array(2);
	new DataView(b.buffer).setUint16(0, n, true);
	return b;
}
function u32(n) {
	const b = /* @__PURE__ */ new Uint8Array(4);
	new DataView(b.buffer).setUint32(0, n, true);
	return b;
}
function concat(parts) {
	const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
	let o = 0;
	for (const p of parts) {
		out.set(p, o);
		o += p.length;
	}
	return out;
}
function zipStore(files) {
	const encoder = new TextEncoder();
	const locals = [];
	const centrals = [];
	let offset = 0;
	for (const file of files) {
		const name = encoder.encode(file.name);
		const data = encoder.encode(file.text);
		const crc = crc32(data);
		const local = concat([
			u32(67324752),
			u16(20),
			u16(2048),
			u16(0),
			u16(0),
			u16(0),
			u32(crc),
			u32(data.length),
			u32(data.length),
			u16(name.length),
			u16(0),
			name,
			data
		]);
		const central = concat([
			u32(33639248),
			u16(20),
			u16(20),
			u16(2048),
			u16(0),
			u16(0),
			u16(0),
			u32(crc),
			u32(data.length),
			u32(data.length),
			u16(name.length),
			u16(0),
			u16(0),
			u16(0),
			u16(0),
			u32(0),
			u32(offset),
			name
		]);
		locals.push(local);
		centrals.push(central);
		offset += local.length;
	}
	const localBlob = concat(locals);
	const centralBlob = concat(centrals);
	const eocd = concat([
		u32(101010256),
		u16(0),
		u16(0),
		u16(files.length),
		u16(files.length),
		u32(centralBlob.length),
		u32(localBlob.length),
		u16(0)
	]);
	return new Blob([concat([
		localBlob,
		centralBlob,
		eocd
	])], { type: "application/zip" });
}
function escapeXml(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function downloadBlob(filename, blob) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function clientFiles(origin) {
	return [
		{
			name: "雨瞰.url",
			text: `[InternetShortcut]\r\nURL=${origin}\r\n`
		},
		{
			name: "雨瞰.webloc",
			text: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>URL</key>
  <string>${escapeXml(origin)}</string>
</dict>
</plist>
`
		},
		{
			name: "打开雨瞰.html",
			text: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=${escapeXml(origin)}">
<title>雨瞰 Yukan</title>
<script>location.replace(${JSON.stringify(origin)})<\/script>
</head>
<body style="margin:0;font-family:sans-serif;background:#0b100f;color:#e7eeea;padding:2rem">
<p>正在打开雨瞰…</p>
<p><a href="${escapeXml(origin)}" style="color:#6fbfb2">点击进入</a></p>
</body>
</html>
`
		},
		{
			name: "安装说明.txt",
			text: `雨瞰 Yukan 客户端

打开地址：${origin}

推荐安装方式
1. 用 Chrome 或 Edge 打开上述地址，点地址栏「安装」或「应用可用」。装好后开始菜单 / 程序坞会出现「雨瞰」。
2. iPhone / iPad：Safari 打开 → 底部分享 → 添加到主屏幕。
3. Android：Chrome 菜单 → 安装应用 / 添加到主屏幕。

本压缩包里的快捷方式
- Windows：双击「雨瞰.url」
- Mac：双击「雨瞰.webloc」
- 任意系统：用浏览器打开「打开雨瞰.html」

说明
这不是独立的 .exe 或 App Store 安装包。雨瞰是可安装到桌面的网站客户端，研判需要联网。
`
		}
	];
}
function downloadClientZip(origin) {
	downloadBlob("雨瞰客户端.zip", zipStore(clientFiles(origin)));
}
function downloadWindowsShortcut(origin) {
	downloadBlob("雨瞰.url", new Blob([`[InternetShortcut]\r\nURL=${origin}\r\n`], { type: "application/internet-shortcut" }));
}
function downloadMacShortcut(origin) {
	const file = clientFiles(origin).find((f) => f.name.endsWith(".webloc"));
	if (!file) return;
	downloadBlob("雨瞰.webloc", new Blob([file.text], { type: "application/xml" }));
}
function ClientPage() {
	const [installEvent, setInstallEvent] = (0, import_react.useState)(null);
	const [standalone, setStandalone] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [origin, setOrigin] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setOrigin(window.location.origin);
		const standaloneNow = window.matchMedia("(display-mode: standalone)").matches || "standalone" in navigator && Boolean(navigator.standalone);
		setStandalone(standaloneNow);
		const onPrompt = (event) => {
			event.preventDefault();
			setInstallEvent(event);
		};
		window.addEventListener("beforeinstallprompt", onPrompt);
		return () => window.removeEventListener("beforeinstallprompt", onPrompt);
	}, []);
	async function install() {
		if (!installEvent) return;
		setBusy(true);
		try {
			await installEvent.prompt();
		} finally {
			setBusy(false);
			setInstallEvent(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicNav, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto w-full max-w-3xl px-4 py-10 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.22em] text-muted uppercase",
					children: "Install Yukan"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-2 text-3xl sm:text-4xl",
					children: "安装雨瞰客户端"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-xl text-sm text-muted text-pretty",
					children: "把雨瞰装到电脑或手机桌面，打开方式与本地软件相同。也可以下载启动包发给同事。研判仍需联网；这不是独立的 .exe 或 App Store 安装包。"
				}),
				standalone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 rounded-2xl bg-primary/12 px-5 py-5 ring-1 ring-primary/30",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xl",
							children: "已经在客户端里打开"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "可直接进入工作台研判。"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/app",
								children: "进入工作台"
							})
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-wrap gap-3",
					children: [
						installEvent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							disabled: busy,
							onClick: () => void install(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), busy ? "正在安装…" : "安装到本机"]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							onClick: () => downloadClientZip(origin || window.location.origin),
							disabled: !origin,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "下载客户端启动包"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							variant: "outline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/?install=1&platform=ios",
								children: "iPhone 图文步骤"
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 rounded-2xl bg-surface px-5 py-5 ring-1 ring-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl",
							children: "启动包里有什么"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted text-pretty",
							children: "压缩包含 Windows 快捷方式、Mac 书签、一键打开页和安装说明。解压后双击即可进入雨瞰。"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								disabled: !origin,
								onClick: () => downloadWindowsShortcut(origin || window.location.origin),
								children: "下载 Windows 快捷方式"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								disabled: !origin,
								onClick: () => downloadMacShortcut(origin || window.location.origin),
								children: "下载 Mac 书签"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-2xl bg-surface px-4 py-4 ring-1 ring-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, { className: "size-4 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display mt-3 text-lg",
									children: "Windows / Mac"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted text-pretty",
									children: "用 Chrome 或 Edge 打开本站，地址栏右侧点「安装」或「应用可用」。安装后开始菜单 / 程序坞会出现「雨瞰」。"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-2xl bg-surface px-4 py-4 ring-1 ring-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display mt-3 text-lg",
									children: "Android"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted text-pretty",
									children: "Chrome 菜单选择「安装应用」或「添加到主屏幕」。装好后和普通 App 一样从桌面打开。"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-2xl bg-surface px-4 py-4 ring-1 ring-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share, { className: "size-4 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display mt-3 text-lg",
									children: "iPhone / iPad"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted text-pretty",
									children: "Safari 打开本站，点底部分享，再选「添加到主屏幕」。系统不会走 App Store。"
								})
							]
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { ClientPage as component };
