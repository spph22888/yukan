import { Link, useRouteContext } from "@tanstack/react-router";
import { Copy, Droplets } from "lucide-react";
import { useEffect, useState } from "react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState, type AppUser } from "@/lib/auth/use-current-user";
import { getMembership } from "@/lib/membership-server";
import { Button } from "@/components/ui/button";

export function useGatedUser(): { user: AppUser | null; isPending: boolean } {
  const { user, isPending } = useCurrentUserState();
  const sessionUser = useRouteContext({ from: "__root__" }).sessionUser;
  if (user) return { user, isPending: false };
  if (isPending && sessionUser) {
    return {
      user: {
        id: sessionUser.id,
        displayName: sessionUser.email,
        primaryEmail: sessionUser.email,
        profileImageUrl: null,
        isDevFallback: false,
      },
      isPending: false,
    };
  }
  return { user, isPending };
}

export function BrandMark() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Droplets className="size-4" />
      </span>
      <span className="leading-none">
        <span className="font-display block text-lg tracking-wide text-fg">雨瞰</span>
        <span className="mt-0.5 block text-[10px] tracking-[0.22em] text-muted uppercase">Yukan</span>
      </span>
    </Link>
  );
}

export function AuthSlot({ after }: { after?: "app" | "membership" } = {}) {
  const { user, isPending } = useGatedUser();
  if (isPending) {
    return <div className="h-9 w-24 animate-pulse rounded-lg bg-fg/8" />;
  }
  if (user) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <AdminLink />
        {after === "app" ? (
          <Button asChild size="sm" variant="outline">
            <Link to="/app">进入工作台</Link>
          </Button>
        ) : null}
        <UserButton />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="ghost">
        <Link to="/login">登录</Link>
      </Button>
      <Button asChild size="sm">
        <Link to="/login">免费试用</Link>
      </Button>
    </div>
  );
}

export function MemberChip() {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    void getMembership()
      .then((m) => {
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
      })
      .catch(() => setLabel(null));
  }, []);
  if (!label) {
    return <div className="hidden h-8 w-24 animate-pulse rounded-full bg-fg/8 sm:block" />;
  }
  return (
    <span className="hidden max-w-[14rem] truncate rounded-full bg-primary/12 px-2.5 py-1 text-[11px] text-primary sm:inline">
      {label}
    </span>
  );
}

export function CopySiteLink({ size = "lg" }: { size?: "sm" | "lg" }) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  function copy() {
    const url = origin || window.location.origin;
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <Button type="button" size={size} variant="outline" onClick={copy}>
      <Copy className="size-4" />
      {copied ? "已复制站点链接" : "复制站点链接"}
    </Button>
  );
}

export function SiteOrigin() {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  if (!origin) return <p className="h-4" />;
  return <p className="font-mono text-[11px] text-faint break-all">{origin}</p>;
}

export function AdminLink() {
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    void getMembership()
      .then((m) => setAdmin(m.isAdmin))
      .catch(() => setAdmin(false));
  }, []);
  if (!admin) return null;
  return (
    <Button asChild size="sm" variant="outline">
      <Link to="/admin">管理台</Link>
    </Button>
  );
}

export function PublicNav() {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 bg-bg/88 px-4 backdrop-blur-md ring-1 ring-border sm:px-6">
      <BrandMark />
      <div className="flex min-w-0 items-center gap-2">
        <Button asChild size="sm" variant="ghost">
          <Link to="/client">安装</Link>
        </Button>
        <AuthSlot after="app" />
      </div>
    </header>
  );
}
