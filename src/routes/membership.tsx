import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { getMembership, purchaseMembership } from "@/lib/membership-server";
import {
  BUYOUT_PLAN,
  PLANS,
  SUBSCRIBE_PLANS,
  TRIAL_DAYS,
  TRIAL_RUNS,
  emptyMembership,
  formatYuan,
  type MembershipState,
  type Plan,
  type PlanId,
} from "@/lib/membership";
import { PublicNav, useGatedUser } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/membership")({ component: MembershipPage });

function MembershipPage() {
  const { user, isPending } = useGatedUser();
  const navigate = useNavigate();
  const [mem, setMem] = useState<MembershipState | null>(null);
  const [picked, setPicked] = useState<PlanId>("lifetime");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isPending || !user) return;
    void getMembership()
      .then(setMem)
      .catch(() => setMem(emptyMembership()));
  }, [isPending, user]);

  if (isPending || (user && !mem)) {
    return (
      <div className="min-h-dvh bg-bg text-fg">
        <PublicNav />
        <div className="mx-auto mt-16 h-40 w-[min(92%,36rem)] animate-pulse rounded-2xl bg-fg/6" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (mem?.active && !mem.isTrial && !done) return <Navigate to="/app" />;

  async function buy() {
    setBusy(true);
    setError(null);
    try {
      const res = await purchaseMembership({ data: { plan: picked } });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMem(res.membership);
      setDone(true);
      window.setTimeout(() => {
        void navigate({ to: "/app" });
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "开通失败");
    } finally {
      setBusy(false);
    }
  }

  const plan = PLANS.find((p) => p.id === picked)!;
  const buyout = picked === "lifetime";

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <PublicNav />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-[11px] tracking-[0.22em] text-muted uppercase">Membership</p>
        <h1 className="font-display mt-2 text-3xl sm:text-4xl">一折开通，或一次买断</h1>
        <p className="mt-2 max-w-xl text-sm text-muted text-pretty">
          新账户自动获得 {TRIAL_DAYS} 天试用、共 {TRIAL_RUNS} 次研判。订阅套餐现价一折；买断一次付清，账户永久有效。
        </p>

        {mem?.isTrial ? (
          <div className="mt-6 rounded-2xl bg-primary/12 px-5 py-5 ring-1 ring-primary/30">
            <p className="font-display text-xl">你正在免费试用通道</p>
            <p className="mt-1 text-sm text-muted">
              剩余 {mem.remainingDays ?? 0} 天 · 已用 {mem.runsUsed}/{mem.runsLimit ?? TRIAL_RUNS} 次
            </p>
            <Button asChild className="mt-4">
              <Link to="/app">继续研判</Link>
            </Button>
          </div>
        ) : null}

        {done ? (
          <div className="mt-10 rounded-2xl bg-primary/12 px-5 py-6 ring-1 ring-primary/30">
            <p className="font-display text-xl">{buyout ? "已买断" : "已开通"} {plan.name}</p>
            <p className="mt-1 text-sm text-muted">正在进入工作台…</p>
            <Button asChild className="mt-4">
              <Link to="/app">立即进入</Link>
            </Button>
          </div>
        ) : (
          <>
            <h2 className="font-display mt-10 text-xl">订阅套餐</h2>
            <p className="mt-1 text-sm text-muted">到期后续期。现价为一折。</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {SUBSCRIBE_PLANS.map((p) => (
                <PlanCard key={p.id} plan={p} picked={picked === p.id} onPick={() => setPicked(p.id)} />
              ))}
            </div>

            <h2 className="font-display mt-10 text-xl">永久买断</h2>
            <p className="mt-1 text-sm text-muted">一次付清，不再续费。适合长期勘察与档案留存。</p>
            <div className="mt-4">
              <PlanCard
                plan={BUYOUT_PLAN}
                picked={picked === BUYOUT_PLAN.id}
                onPick={() => setPicked(BUYOUT_PLAN.id)}
                wide
              />
            </div>

            <div className="mt-8 rounded-2xl bg-surface px-5 py-5 ring-1 ring-border">
              <p className="text-sm text-muted">{buyout ? "买断确认" : "订单确认"}</p>
              <p className="mt-1 font-display text-lg">
                {plan.name} · {formatYuan(plan.priceYuan)}
                <span className="ml-2 text-sm font-sans text-muted line-through">{formatYuan(plan.listPriceYuan)}</span>
              </p>
              <p className="mt-2 text-xs text-faint text-pretty">
                {buyout
                  ? "确认后当前登录账户永久有效，不限研判次数。没有接入微信或支付宝收款；开通以账户记录为准。"
                  : "确认后会员权限立即写入当前登录账户。没有接入第三方收款；开通以账户记录为准，不与他人共享。"}
              </p>
              {error ? <p className="mt-3 text-sm text-risk-high">{error}</p> : null}
              <Button className="mt-4" disabled={busy} onClick={() => void buy()}>
                {busy ? "开通中…" : buyout ? `确认买断 · ${formatYuan(plan.priceYuan)}` : `确认开通 · ${formatYuan(plan.priceYuan)}`}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function PlanCard({
  plan,
  picked,
  onPick,
  wide,
}: {
  plan: Plan;
  picked: boolean;
  onPick: () => void;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "rounded-2xl px-4 py-4 text-left ring-1 transition-colors",
        picked ? "bg-primary/12 ring-primary/50" : "bg-surface ring-border hover:ring-fg/20",
        wide && "sm:px-6 sm:py-5",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] tracking-wide text-muted">{plan.tag}</span>
        {plan.featured ? (
          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] text-primary">买断</span>
        ) : (
          <span className="rounded-full bg-fg/8 px-2 py-0.5 text-[10px] text-muted">一折</span>
        )}
      </div>
      <div className="font-display mt-2 text-xl">{plan.name}</div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-2xl tabular-nums">{formatYuan(plan.priceYuan)}</span>
        <span className="text-sm text-muted line-through tabular-nums">{formatYuan(plan.listPriceYuan)}</span>
        <span className="text-sm text-muted">{plan.days ? ` / ${plan.days} 天` : " · 永久"}</span>
      </div>
      <ul className={cn("mt-3 space-y-1.5 text-sm text-muted", wide && "sm:grid sm:grid-cols-2 sm:gap-x-6 sm:space-y-0 sm:gap-y-1.5")}>
        {plan.points.map((pt) => (
          <li key={pt} className="flex gap-2">
            <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
            {pt}
          </li>
        ))}
      </ul>
    </button>
  );
}
