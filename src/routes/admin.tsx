import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { PublicNav, useGatedUser } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { adminGrant, getAdminOverview, type MemberListItem } from "@/lib/membership-server";
import { emptyMembership, type MembershipState, type PlanId } from "@/lib/membership";
import { zhDate } from "@/lib/utils";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const { user, isPending } = useGatedUser();
  const [me, setMe] = useState<MembershipState | null>(null);
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

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

  useEffect(() => {
    if (isPending || !user) return;
    void load().catch(() => setError("管理台加载失败"));
  }, [isPending, user]);

  if (isPending || (user && !me && !error)) {
    return (
      <div className="min-h-dvh bg-bg text-fg">
        <PublicNav />
        <div className="mx-auto mt-16 h-40 w-[min(92%,36rem)] animate-pulse rounded-2xl bg-fg/6" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  async function grant(targetUserId: string, action: "trial" | PlanId | "revoke") {
    setBusy(`${targetUserId}:${action}`);
    try {
      const res = await adminGrant({ data: { targetUserId, action } });
      if (!res.ok) setError(res.error);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <PublicNav />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <p className="text-[11px] tracking-[0.22em] text-muted uppercase">Super admin</p>
        <h1 className="font-display mt-2 text-3xl">超级管理员</h1>
        <p className="mt-2 max-w-xl text-sm text-muted text-pretty">
          第一个打开本站的登录账户会自动成为超管，并拥有终身权限。这就是你的管理账户，没有另设密码。试用发放只对这个账户开放。
        </p>

        {error ? <p className="mt-4 text-sm text-risk-high">{error}</p> : null}

        {me?.isAdmin ? (
          <section className="mt-8 rounded-2xl bg-surface px-5 py-5 ring-1 ring-border">
            <h2 className="font-display text-xl">你的超管账户</h2>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">显示名</dt>
                <dd>{me.displayName || "未设置"}</dd>
              </div>
              <div>
                <dt className="text-muted">邮箱</dt>
                <dd className="break-all">{me.email || "（当前登录身份，无独立邮箱密码）"}</dd>
              </div>
              <div>
                <dt className="text-muted">权限</dt>
                <dd>超级管理员 · 终身</dd>
              </div>
              <div>
                <dt className="text-muted">研判次数</dt>
                <dd className="tabular-nums">{me.runsUsed}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-faint text-pretty">
              登录方式就是你现在用的这个账户。预览里会自动登录；对外给同事用邮箱注册即可走免费试用。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link to="/app">进入工作台</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/client">客户端安装页</Link>
              </Button>
            </div>
          </section>
        ) : (
          <section className="mt-8 rounded-2xl bg-surface px-5 py-5 ring-1 ring-border">
            <p className="text-sm text-muted">当前登录账户不是超级管理员。</p>
          </section>
        )}

        {me?.isAdmin ? (
          <section className="mt-8">
            <h2 className="font-display text-xl">用户与试用</h2>
            <p className="mt-1 text-sm text-muted">新注册用户自动获得 7 天 / 8 次免费试用。可在此续试用、开年度、开买断或停用。</p>
            <div className="mt-4 overflow-x-auto rounded-2xl ring-1 ring-border">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="bg-fg/4 text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">账户</th>
                    <th className="px-4 py-3 font-medium">套餐</th>
                    <th className="px-4 py-3 font-medium">次数</th>
                    <th className="px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-muted" colSpan={4}>
                        还没有其他用户。
                      </td>
                    </tr>
                  ) : (
                    members.map((m) => (
                      <tr key={m.userId} className="border-t border-border">
                        <td className="px-4 py-3">
                          <div className="truncate">{m.name || m.email || "未命名"}</div>
                          <div className="truncate text-[11px] text-faint">{m.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{m.planName}</div>
                          <div className="text-[11px] text-faint">
                            {m.expiresAt ? zhDate(new Date(m.expiresAt)) : "长期"} · {m.status}
                          </div>
                        </td>
                        <td className="px-4 py-3 tabular-nums">{m.runsUsed}</td>
                        <td className="px-4 py-3">
                          {m.role === "admin" ? (
                            <span className="text-[11px] text-muted">超管</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy !== null}
                                onClick={() => void grant(m.userId, "trial")}
                              >
                                续试用
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy !== null}
                                onClick={() => void grant(m.userId, "yearly")}
                              >
                                开年度
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy !== null}
                                onClick={() => void grant(m.userId, "lifetime")}
                              >
                                开买断
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={busy !== null}
                                onClick={() => void grant(m.userId, "revoke")}
                              >
                                停用
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
