import{r as e}from"./rolldown-runtime-hePW80VL.js";import{t}from"./react-CwJFpaho.js";import{a as n,c as r}from"./site-nav-Bg5ZfDUU.js";import{t as i}from"./download-DkaVIVah.js";import{c as a,i as o,r as s}from"./index-DFSJHGwn.js";var c=s(`monitor`,[[`rect`,{width:`20`,height:`14`,x:`2`,y:`3`,rx:`2`,key:`48i651`}],[`line`,{x1:`8`,x2:`16`,y1:`21`,y2:`21`,key:`1svkeh`}],[`line`,{x1:`12`,x2:`12`,y1:`17`,y2:`21`,key:`vw1qmm`}]]),l=s(`share`,[[`path`,{d:`M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8`,key:`1b2hhj`}],[`polyline`,{points:`16 6 12 2 8 6`,key:`m901s6`}],[`line`,{x1:`12`,x2:`12`,y1:`2`,y2:`15`,key:`1p0rca`}]]),u=s(`smartphone`,[[`rect`,{width:`14`,height:`20`,x:`5`,y:`2`,rx:`2`,ry:`2`,key:`1yt0o3`}],[`path`,{d:`M12 18h.01`,key:`mhygvu`}]]),d=e(t());function f(e){let t=4294967295;for(let n=0;n<e.length;n++){t^=e[n];for(let e=0;e<8;e++)t=t>>>1^3988292384&-(t&1)}return(t^4294967295)>>>0}function p(e){let t=new Uint8Array(2);return new DataView(t.buffer).setUint16(0,e,!0),t}function m(e){let t=new Uint8Array(4);return new DataView(t.buffer).setUint32(0,e,!0),t}function h(e){let t=new Uint8Array(e.reduce((e,t)=>e+t.length,0)),n=0;for(let r of e)t.set(r,n),n+=r.length;return t}function g(e){let t=new TextEncoder,n=[],r=[],i=0;for(let a of e){let e=t.encode(a.name),o=t.encode(a.text),s=f(o),c=h([m(67324752),p(20),p(2048),p(0),p(0),p(0),m(s),m(o.length),m(o.length),p(e.length),p(0),e,o]),l=h([m(33639248),p(20),p(20),p(2048),p(0),p(0),p(0),m(s),m(o.length),m(o.length),p(e.length),p(0),p(0),p(0),p(0),m(0),m(i),e]);n.push(c),r.push(l),i+=c.length}let a=h(n),o=h(r),s=h([m(101010256),p(0),p(0),p(e.length),p(e.length),m(o.length),m(a.length),p(0)]);return new Blob([h([a,o,s])],{type:`application/zip`})}function _(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function v(e,t){let n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=e,document.body.appendChild(r),r.click(),r.remove(),window.setTimeout(()=>URL.revokeObjectURL(n),1500)}function y(e){return[{name:`雨瞰.url`,text:`[InternetShortcut]\r\nURL=${e}\r\n`},{name:`雨瞰.webloc`,text:`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>URL</key>
  <string>${_(e)}</string>
</dict>
</plist>
`},{name:`打开雨瞰.html`,text:`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=${_(e)}">
<title>雨瞰 Yukan</title>
<script>location.replace(${JSON.stringify(e)})<\/script>
</head>
<body style="margin:0;font-family:sans-serif;background:#0b100f;color:#e7eeea;padding:2rem">
<p>正在打开雨瞰…</p>
<p><a href="${_(e)}" style="color:#6fbfb2">点击进入</a></p>
</body>
</html>
`},{name:`安装说明.txt`,text:`雨瞰 Yukan 客户端

打开地址：${e}

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
`}]}function b(e){v(`雨瞰客户端.zip`,g(y(e)))}function x(e){v(`雨瞰.url`,new Blob([`[InternetShortcut]\r\nURL=${e}\r\n`],{type:`application/internet-shortcut`}))}function S(e){let t=y(e).find(e=>e.name.endsWith(`.webloc`));t&&v(`雨瞰.webloc`,new Blob([t.text],{type:`application/xml`}))}var C=a();function w(){let[e,t]=(0,d.useState)(null),[a,s]=(0,d.useState)(!1),[f,p]=(0,d.useState)(!1),[m,h]=(0,d.useState)(``);(0,d.useEffect)(()=>{h(window.location.origin);let e=window.matchMedia(`(display-mode: standalone)`).matches||`standalone`in navigator&&!!navigator.standalone;s(e);let n=e=>{e.preventDefault(),t(e)};return window.addEventListener(`beforeinstallprompt`,n),()=>window.removeEventListener(`beforeinstallprompt`,n)},[]);async function g(){if(e){p(!0);try{await e.prompt()}finally{p(!1),t(null)}}}return(0,C.jsxs)(`div`,{className:`min-h-dvh bg-bg text-fg`,children:[(0,C.jsx)(n,{}),(0,C.jsxs)(`main`,{className:`mx-auto w-full max-w-3xl px-4 py-10 sm:px-6`,children:[(0,C.jsx)(`p`,{className:`text-[11px] tracking-[0.22em] text-muted uppercase`,children:`Install Yukan`}),(0,C.jsx)(`h1`,{className:`font-display mt-2 text-3xl sm:text-4xl`,children:`安装雨瞰客户端`}),(0,C.jsx)(`p`,{className:`mt-3 max-w-xl text-sm text-muted text-pretty`,children:`把雨瞰装到电脑或手机桌面，打开方式与本地软件相同。也可以下载启动包发给同事。研判仍需联网；这不是独立的 .exe 或 App Store 安装包。`}),a?(0,C.jsxs)(`div`,{className:`mt-8 rounded-2xl bg-primary/12 px-5 py-5 ring-1 ring-primary/30`,children:[(0,C.jsx)(`p`,{className:`font-display text-xl`,children:`已经在客户端里打开`}),(0,C.jsx)(`p`,{className:`mt-1 text-sm text-muted`,children:`可直接进入工作台研判。`}),(0,C.jsx)(r,{asChild:!0,className:`mt-4`,children:(0,C.jsx)(o,{to:`/app`,children:`进入工作台`})})]}):(0,C.jsxs)(`div`,{className:`mt-8 flex flex-wrap gap-3`,children:[e?(0,C.jsxs)(r,{size:`lg`,disabled:f,onClick:()=>void g(),children:[(0,C.jsx)(i,{className:`size-4`}),f?`正在安装…`:`安装到本机`]}):null,(0,C.jsxs)(r,{size:`lg`,onClick:()=>b(m||window.location.origin),disabled:!m,children:[(0,C.jsx)(i,{className:`size-4`}),`下载客户端启动包`]}),(0,C.jsx)(r,{asChild:!0,size:`lg`,variant:`outline`,children:(0,C.jsx)(`a`,{href:`/?install=1&platform=ios`,children:`iPhone 图文步骤`})})]}),(0,C.jsxs)(`div`,{className:`mt-8 rounded-2xl bg-surface px-5 py-5 ring-1 ring-border`,children:[(0,C.jsx)(`h2`,{className:`font-display text-xl`,children:`启动包里有什么`}),(0,C.jsx)(`p`,{className:`mt-2 text-sm text-muted text-pretty`,children:`压缩包含 Windows 快捷方式、Mac 书签、一键打开页和安装说明。解压后双击即可进入雨瞰。`}),(0,C.jsxs)(`div`,{className:`mt-4 flex flex-wrap gap-2`,children:[(0,C.jsx)(r,{variant:`outline`,disabled:!m,onClick:()=>x(m||window.location.origin),children:`下载 Windows 快捷方式`}),(0,C.jsx)(r,{variant:`outline`,disabled:!m,onClick:()=>S(m||window.location.origin),children:`下载 Mac 书签`})]})]}),(0,C.jsxs)(`div`,{className:`mt-10 grid gap-3 sm:grid-cols-3`,children:[(0,C.jsxs)(`article`,{className:`rounded-2xl bg-surface px-4 py-4 ring-1 ring-border`,children:[(0,C.jsx)(c,{className:`size-4 text-primary`}),(0,C.jsx)(`h2`,{className:`font-display mt-3 text-lg`,children:`Windows / Mac`}),(0,C.jsx)(`p`,{className:`mt-2 text-sm text-muted text-pretty`,children:`用 Chrome 或 Edge 打开本站，地址栏右侧点「安装」或「应用可用」。安装后开始菜单 / 程序坞会出现「雨瞰」。`})]}),(0,C.jsxs)(`article`,{className:`rounded-2xl bg-surface px-4 py-4 ring-1 ring-border`,children:[(0,C.jsx)(u,{className:`size-4 text-primary`}),(0,C.jsx)(`h2`,{className:`font-display mt-3 text-lg`,children:`Android`}),(0,C.jsx)(`p`,{className:`mt-2 text-sm text-muted text-pretty`,children:`Chrome 菜单选择「安装应用」或「添加到主屏幕」。装好后和普通 App 一样从桌面打开。`})]}),(0,C.jsxs)(`article`,{className:`rounded-2xl bg-surface px-4 py-4 ring-1 ring-border`,children:[(0,C.jsx)(l,{className:`size-4 text-primary`}),(0,C.jsx)(`h2`,{className:`font-display mt-3 text-lg`,children:`iPhone / iPad`}),(0,C.jsx)(`p`,{className:`mt-2 text-sm text-muted text-pretty`,children:`Safari 打开本站，点底部分享，再选「添加到主屏幕」。系统不会走 App Store。`})]})]})]})]})}export{w as component};