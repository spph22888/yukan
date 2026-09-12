function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(n: number) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n, true);
  return b;
}

function u32(n: number) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, true);
  return b;
}

function concat(parts: Uint8Array[]) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function zipStore(files: { name: string; text: string }[]): Blob {
  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = encoder.encode(file.text);
    const crc = crc32(data);
    const local = concat([
      u32(0x04034b50),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      name,
      data,
    ]);
    const central = concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0x0800),
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
      name,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }
  const localBlob = concat(locals);
  const centralBlob = concat(centrals);
  const eocd = concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralBlob.length),
    u32(localBlob.length),
    u16(0),
  ]);
  return new Blob([concat([localBlob, centralBlob, eocd])], { type: "application/zip" });
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function clientFiles(origin: string) {
  return [
    {
      name: "雨瞰.url",
      text: `[InternetShortcut]\r\nURL=${origin}\r\n`,
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
`,
    },
    {
      name: "打开雨瞰.html",
      text: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=${escapeXml(origin)}">
<title>雨瞰 Yukan</title>
<script>location.replace(${JSON.stringify(origin)})</script>
</head>
<body style="margin:0;font-family:sans-serif;background:#0b100f;color:#e7eeea;padding:2rem">
<p>正在打开雨瞰…</p>
<p><a href="${escapeXml(origin)}" style="color:#6fbfb2">点击进入</a></p>
</body>
</html>
`,
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
`,
    },
  ];
}

export function downloadClientZip(origin: string) {
  downloadBlob("雨瞰客户端.zip", zipStore(clientFiles(origin)));
}

export function downloadWindowsShortcut(origin: string) {
  downloadBlob(
    "雨瞰.url",
    new Blob([`[InternetShortcut]\r\nURL=${origin}\r\n`], { type: "application/internet-shortcut" }),
  );
}

export function downloadMacShortcut(origin: string) {
  const file = clientFiles(origin).find((f) => f.name.endsWith(".webloc"));
  if (!file) return;
  downloadBlob("雨瞰.webloc", new Blob([file.text], { type: "application/xml" }));
}
