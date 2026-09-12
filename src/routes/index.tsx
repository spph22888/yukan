import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Download, Droplets, Shield, Timer, Wind } from "lucide-react";
import { CopySiteLink, PublicNav, SiteOrigin, useGatedUser } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { BUYOUT_PLAN, SUBSCRIBE_PLANS, TRIAL_DAYS, TRIAL_RUNS, formatYuan } from "@/lib/membership";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <PublicNav />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-[11px] tracking-[0.22em] text-muted uppercase">Yukan · 雨瞰</p>
        <h1 className="font-display mt-3 max-w-3xl text-4xl leading-tight text-balance sm:text-5xl">
          任意坐标的降雨、强风与鸟类活动研判
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted text-pretty">
          雨瞰对照规范风压、栖息地名录和高程水系，生成交办件式卫星分析报告。可导入高压输电线路每基杆塔坐标，逐基研判。潜在客户可走免费试用通道。
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <HeroCta />
          <Button asChild size="lg" variant="outline">
            <Link to="/client">
              <Download className="size-4" />
              安装客户端
            </Link>
          </Button>
          <CopySiteLink />
        </div>
        <div className="mt-3 space-y-1">
          <SiteOrigin />
          <p className="text-xs text-faint text-pretty">
            此地址走海外线路，大陆运营商经常拦截。请用系统浏览器打开，不要用微信内置窗口。
          </p>
        </div>

        <section className="mt-10 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl bg-primary/12 px-5 py-5 ring-1 ring-primary/30">
            <div className="flex items-center gap-2 text-primary">
              <Timer className="size-4" />
              <p className="text-[11px] tracking-[0.18em] uppercase">Free trial</p>
            </div>
            <h2 className="font-display mt-2 text-2xl">免费试用通道</h2>
            <p className="mt-2 text-sm text-muted text-pretty">
              邮箱注册即开通，给潜在客户先看报告再决定是否付费。不绑支付、不走 Google。
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-bg/40 px-3 py-3 ring-1 ring-border">
                <dt className="text-muted">时长</dt>
                <dd className="font-display mt-1 text-xl tabular-nums">{TRIAL_DAYS} 天</dd>
              </div>
              <div className="rounded-xl bg-bg/40 px-3 py-3 ring-1 ring-border">
                <dt className="text-muted">研判次数</dt>
                <dd className="font-display mt-1 text-xl tabular-nums">{TRIAL_RUNS} 次</dd>
              </div>
            </dl>
            <TrialCta />
          </div>
          <div className="rounded-2xl bg-surface px-5 py-5 ring-1 ring-border">
            <div className="flex items-center gap-2 text-primary">
              <Download className="size-4" />
              <p className="text-[11px] tracking-[0.18em] uppercase">Client</p>
            </div>
            <h2 className="font-display mt-2 text-2xl">下载安装客户端</h2>
            <p className="mt-2 text-sm text-muted text-pretty">
              把雨瞰装到电脑或手机桌面，打开方式与本地软件相同。也可下载启动包（Windows 快捷方式 / Mac 书签）。
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted">
              <li>Windows / Mac：Chrome、Edge 点「安装应用」</li>
              <li>手机：添加到主屏幕，从桌面图标打开</li>
              <li>研判仍需联网，没有独立离线安装包</li>
            </ul>
            <Button asChild className="mt-5">
              <Link to="/client">去安装 / 下载启动包</Link>
            </Button>
          </div>
        </section>

        <div className="mt-10 rounded-2xl bg-surface px-5 py-5 ring-1 ring-border">
          <h2 className="font-display text-xl">国内怎么用</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted text-pretty">
            <li>软件中文名是「雨瞰」，拉丁名 Yukan。给同事只说这个名字即可。</li>
            <li>在本页用邮箱注册，自动进入免费试用通道。不要点 Google / X。</li>
            <li>
              复制出的链接在大陆常打不开，因为站点目前托管在海外。要让国内稳定访问，需要你自己已备案的域名做解析或反向代理；我这边无法完成备案或迁到国内云。
            </li>
          </ol>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Droplets, t: "强降雨", d: "高程网格、径流路径、河道淹没与内涝矩阵。" },
            { icon: Wind, t: "强风", d: "来风/历史风速对照 GB 50009 设计值，临近或超过即提示修正。" },
            { icon: Shield, t: "大型鸟类", d: "湿地与保护区名录，评估玻璃撞击与筑巢堵排水。" },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl bg-surface px-4 py-4 ring-1 ring-border">
              <c.icon className="size-4 text-primary" />
              <h2 className="font-display mt-3 text-lg">{c.t}</h2>
              <p className="mt-1 text-sm text-muted text-pretty">{c.d}</p>
            </div>
          ))}
        </div>

        <h2 className="font-display mt-16 text-2xl">会员套餐 · 一折</h2>
        <p className="mt-1 text-sm text-muted">订阅按月或按年；也可以一次买断，账户永久有效。试用不够再开通。</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {SUBSCRIBE_PLANS.map((p) => (
            <div key={p.id} className="rounded-2xl bg-surface px-4 py-4 ring-1 ring-border">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-muted">{p.tag}</div>
                <div className="rounded-full bg-fg/8 px-2 py-0.5 text-[10px] text-muted">一折</div>
              </div>
              <div className="font-display mt-1 text-xl">{p.name}</div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
                <span className="text-2xl tabular-nums">{formatYuan(p.priceYuan)}</span>
                <span className="text-sm text-muted line-through tabular-nums">{formatYuan(p.listPriceYuan)}</span>
                <span className="text-sm text-muted">/ {p.days} 天</span>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                {p.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-2xl bg-primary/12 px-5 py-5 ring-1 ring-primary/30">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] tracking-[0.18em] text-primary uppercase">Buyout</p>
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] text-primary">一次付清</span>
          </div>
          <h3 className="font-display mt-2 text-2xl">{BUYOUT_PLAN.name}</h3>
          <p className="mt-1 text-sm text-muted text-pretty">
            买断当前登录账户，永久有效、不限次数，不再按月或按年续费。
          </p>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
            <span className="text-3xl tabular-nums">{formatYuan(BUYOUT_PLAN.priceYuan)}</span>
            <span className="text-sm text-muted line-through tabular-nums">{formatYuan(BUYOUT_PLAN.listPriceYuan)}</span>
            <span className="text-sm text-muted">原价一折</span>
          </div>
          <ul className="mt-3 grid gap-1 text-sm text-muted sm:grid-cols-2">
            {BUYOUT_PLAN.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
        </div>
        <PlanCta />
      </main>
    </div>
  );
}

function HeroCta() {
  const { user, isPending } = useGatedUser();
  if (isPending) {
    return <div className="h-12 w-44 animate-pulse rounded-xl bg-fg/8" />;
  }
  if (user) {
    return (
      <Button asChild size="lg">
        <Link to="/app">
          进入工作台
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    );
  }
  return (
    <Button asChild size="lg">
      <Link to="/login">
        免费试用
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  );
}

function TrialCta() {
  const { user, isPending } = useGatedUser();
  if (isPending) return <div className="mt-5 h-11 w-40 animate-pulse rounded-xl bg-fg/8" />;
  if (user) {
    return (
      <Button asChild className="mt-5">
        <Link to="/app">进入工作台</Link>
      </Button>
    );
  }
  return (
    <Button asChild className="mt-5">
      <Link to="/login">开始免费试用</Link>
    </Button>
  );
}

function PlanCta() {
  const { user, isPending } = useGatedUser();
  if (isPending) return <div className="mt-6 h-11 w-28 animate-pulse rounded-xl bg-fg/8" />;
  return (
    <Button asChild className="mt-6">
      <Link to={user ? "/membership" : "/login"}>{user ? "去开通 / 续期" : "免费试用后再开通"}</Link>
    </Button>
  );
}
