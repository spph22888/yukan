import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Monitor, Share, Smartphone } from "lucide-react";
import { PublicNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { downloadClientZip, downloadMacShortcut, downloadWindowsShortcut } from "@/lib/client-package";

export const Route = createFileRoute("/client")({ component: ClientPage });

type InstallEvent = Event & { prompt: () => Promise<void> };

function ClientPage() {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    const standaloneNow =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as { standalone?: boolean }).standalone));
    setStandalone(standaloneNow);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
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

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <PublicNav />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-[11px] tracking-[0.22em] text-muted uppercase">Install Yukan</p>
        <h1 className="font-display mt-2 text-3xl sm:text-4xl">安装雨瞰客户端</h1>
        <p className="mt-3 max-w-xl text-sm text-muted text-pretty">
          把雨瞰装到电脑或手机桌面，打开方式与本地软件相同。也可以下载启动包发给同事。研判仍需联网；这不是独立的 .exe 或 App Store 安装包。
        </p>

        {standalone ? (
          <div className="mt-8 rounded-2xl bg-primary/12 px-5 py-5 ring-1 ring-primary/30">
            <p className="font-display text-xl">已经在客户端里打开</p>
            <p className="mt-1 text-sm text-muted">可直接进入工作台研判。</p>
            <Button asChild className="mt-4">
              <Link to="/app">进入工作台</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap gap-3">
            {installEvent ? (
              <Button size="lg" disabled={busy} onClick={() => void install()}>
                <Download className="size-4" />
                {busy ? "正在安装…" : "安装到本机"}
              </Button>
            ) : null}
            <Button
              size="lg"
              onClick={() => downloadClientZip(origin || window.location.origin)}
              disabled={!origin}
            >
              <Download className="size-4" />
              下载客户端启动包
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/?install=1&platform=ios">iPhone 图文步骤</a>
            </Button>
          </div>
        )}

        <div className="mt-8 rounded-2xl bg-surface px-5 py-5 ring-1 ring-border">
          <h2 className="font-display text-xl">启动包里有什么</h2>
          <p className="mt-2 text-sm text-muted text-pretty">
            压缩包含 Windows 快捷方式、Mac 书签、一键打开页和安装说明。解压后双击即可进入雨瞰。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!origin}
              onClick={() => downloadWindowsShortcut(origin || window.location.origin)}
            >
              下载 Windows 快捷方式
            </Button>
            <Button
              variant="outline"
              disabled={!origin}
              onClick={() => downloadMacShortcut(origin || window.location.origin)}
            >
              下载 Mac 书签
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl bg-surface px-4 py-4 ring-1 ring-border">
            <Monitor className="size-4 text-primary" />
            <h2 className="font-display mt-3 text-lg">Windows / Mac</h2>
            <p className="mt-2 text-sm text-muted text-pretty">
              用 Chrome 或 Edge 打开本站，地址栏右侧点「安装」或「应用可用」。安装后开始菜单 / 程序坞会出现「雨瞰」。
            </p>
          </article>
          <article className="rounded-2xl bg-surface px-4 py-4 ring-1 ring-border">
            <Smartphone className="size-4 text-primary" />
            <h2 className="font-display mt-3 text-lg">Android</h2>
            <p className="mt-2 text-sm text-muted text-pretty">
              Chrome 菜单选择「安装应用」或「添加到主屏幕」。装好后和普通 App 一样从桌面打开。
            </p>
          </article>
          <article className="rounded-2xl bg-surface px-4 py-4 ring-1 ring-border">
            <Share className="size-4 text-primary" />
            <h2 className="font-display mt-3 text-lg">iPhone / iPad</h2>
            <p className="mt-2 text-sm text-muted text-pretty">
              Safari 打开本站，点底部分享，再选「添加到主屏幕」。系统不会走 App Store。
            </p>
          </article>
        </div>
      </main>
    </div>
  );
}
