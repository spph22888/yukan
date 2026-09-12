import { Clock3 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapView } from "@/components/map-view";
import { ReportPanel } from "@/components/report-panel";
import { SearchDock } from "@/components/search-dock";
import { AdminLink, BrandMark, MemberChip } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserButton } from "@/lib/auth/gates";
import { getMembership } from "@/lib/membership-server";
import { emptyMembership, type MembershipState } from "@/lib/membership";
import { useApp } from "@/lib/store";
import { hasFactor } from "@/lib/analysis/factors";
import { LEVEL_TONE, LEVEL_ZH, cn, zhDateTime } from "@/lib/utils";

export function AppShell() {
  const hydrate = useApp((s) => s.hydrate);
  const stage = useApp((s) => s.stage);
  const probe = useApp((s) => s.probe);
  const report = useApp((s) => s.report);
  const error = useApp((s) => s.error);
  const pin = useApp((s) => s.pin);
  const history = useApp((s) => s.history);
  const historyOpen = useApp((s) => s.historyOpen);
  const toggleHistory = useApp((s) => s.toggleHistory);
  const loadHistoryItem = useApp((s) => s.loadHistoryItem);
  const clear = useApp((s) => s.clear);
  const mapPick = useApp((s) => s.mapPick);
  const corridor = useApp((s) => s.corridor);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const showReport = Boolean(probe) || stage === "probing" || stage === "composing";
  const busy = stage === "probing" || stage === "composing";

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      <TopBar onHistory={() => toggleHistory(true)} count={history.length} />
      <TrialStrip />

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col lg:flex-row",
          showReport && "max-lg:grid max-lg:grid-rows-[minmax(0,42%)_minmax(0,58%)]",
        )}
      >
        <section className="relative min-h-0 min-w-0 flex-1">
          <MapView />
          <SearchDock />
          {mapPick && !probe && stage === "idle" && !corridor.length ? <MapPickHint pin={pin} /> : null}
          {probe ? <MapLegend /> : null}
          {error && stage === "error" && (mapPick || probe) ? (
            <div className="absolute bottom-4 left-1/2 z-30 w-[min(92%,24rem)] -translate-x-1/2 rounded-xl bg-bg/85 px-4 py-3 text-sm text-risk-high ring-1 ring-risk-high/30 backdrop-blur-sm">
              <p>{error}</p>
              {error.includes("会员") || error.includes("试用") ? (
                <Link to="/membership" className="mt-2 inline-flex text-primary hover:underline">
                  去开通会员
                </Link>
              ) : null}
              {error.includes("登录") ? (
                <Link to="/login" className="mt-2 inline-flex text-primary hover:underline">
                  去登录
                </Link>
              ) : null}
            </div>
          ) : null}
          {busy && !probe ? <LoadingMask stage={stage} /> : null}
        </section>

        {showReport && probe ? (
          <div className="min-h-0 w-full shrink-0 lg:w-[32rem] xl:w-[36rem]">
            <ReportPanel
              probe={probe}
              report={report}
              composing={stage === "composing"}
              onClose={clear}
            />
          </div>
        ) : null}
      </div>

      {historyOpen ? (
        <HistoryOverlay
          items={history}
          onClose={() => toggleHistory(false)}
          onOpen={loadHistoryItem}
        />
      ) : null}
    </div>
  );
}

function TopBar({ onHistory, count }: { onHistory: () => void; count: number }) {
  return (
    <header className="no-print z-40 flex h-14 shrink-0 items-center justify-between gap-3 px-4 ring-1 ring-border">
      <BrandMark />
      <div className="flex min-w-0 items-center gap-2">
        <MemberChip />
        <AdminLink />
        <Button variant="outline" size="sm" onClick={onHistory} className="gap-1.5">
          <Clock3 className="size-3.5" />
          记录
          {count ? <span className="tabular-nums text-muted">{count}</span> : null}
        </Button>
        <div className="min-w-0 [&_span.text-sm.font-medium]:hidden lg:[&_span.text-sm.font-medium]:inline lg:[&_span.text-sm.font-medium]:max-w-[10rem] lg:[&_span.text-sm.font-medium]:truncate">
          <UserButton />
        </div>
      </div>
    </header>
  );
}

function TrialStrip() {
  const [mem, setMem] = useState<MembershipState | null>(null);
  useEffect(() => {
    void getMembership()
      .then(setMem)
      .catch(() => setMem(emptyMembership()));
  }, []);
  if (!mem?.isTrial || mem.isAdmin) return null;
  return (
    <div className="no-print flex items-center justify-between gap-3 px-4 py-2 text-sm ring-1 ring-border">
      <p className="min-w-0 truncate text-muted">
        免费试用剩余 <span className="tabular-nums text-fg">{mem.remainingDays ?? 0}</span> 天 · 已用{" "}
        <span className="tabular-nums text-fg">
          {mem.runsUsed}/{mem.runsLimit ?? 8}
        </span>{" "}
        次
      </p>
      <Button asChild size="sm" variant="outline">
        <Link to="/membership">开通会员</Link>
      </Button>
    </div>
  );
}

function MapPickHint({ pin }: { pin: { lat: number; lng: number } | null }) {
  const corridor = useApp((s) => s.corridor);
  const n = corridor.length;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex justify-center px-4">
      <div className="max-w-md rounded-2xl bg-bg/72 px-5 py-3 text-center shadow-[0_0_0_1px_rgba(231,238,234,0.08)] backdrop-blur-md">
        <p className="text-sm text-pretty">
          {n
            ? `已导入 ${n} 基。点塔位或列表可选基，再按「研判当前基」。导入不会自动分析。`
            : "在卫星图上点击落点，再按「开始研判」"}
        </p>
        {pin ? (
          <p className="mt-1 font-mono text-xs text-primary">
            {pin.lat.toFixed(5)}°N · {pin.lng.toFixed(5)}°E
          </p>
        ) : null}
      </div>
    </div>
  );
}

function MapLegend() {
  const factors = useApp((s) => s.factors);
  const items = [
    { c: "bg-flow-in", t: "高位来水", show: hasFactor(factors, "rain") },
    { c: "bg-flow-side", t: "侧向汇水", show: hasFactor(factors, "rain") },
    { c: "bg-flow-by", t: "沿场绕流", show: hasFactor(factors, "rain") },
    { c: "bg-flow-out", t: "最低口出水", show: hasFactor(factors, "rain") },
    { c: "bg-primary", t: "鸟类栖息地", show: hasFactor(factors, "birds") },
  ].filter((i) => i.show);
  if (!items.length) return null;
  return (
    <div className="pointer-events-none absolute bottom-8 left-3 z-20 rounded-xl bg-bg/72 px-3 py-2.5 text-xs backdrop-blur-sm ring-1 ring-fg/10">
      {items.map((i) => (
        <div key={i.t} className="flex items-center gap-2 py-0.5">
          <span className={cn("size-2 rounded-full", i.c)} />
          {i.t}
        </div>
      ))}
    </div>
  );
}

function LoadingMask({ stage }: { stage: string }) {
  const factors = useApp((s) => s.factors);
  const corridor = useApp((s) => s.corridor);
  const corridorIndex = useApp((s) => s.corridorIndex);
  const current = corridor[corridorIndex];
  const steps = [
    "逆地理编码",
    "高程网格采样",
    hasFactor(factors, "rain") ? "近场水系" : null,
    hasFactor(factors, "rain") || hasFactor(factors, "wind") ? "气象与规范风速" : null,
    hasFactor(factors, "birds") ? "鸟类栖息地" : null,
    "场地推演",
    "生成研判书",
  ].filter((s): s is string => Boolean(s));
  const active = stage === "composing" ? steps.length - 1 : Math.max(1, steps.length - 3);
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-bg/55 backdrop-blur-[2px]">
      <div className="w-[min(92%,20rem)] rounded-2xl bg-surface px-5 py-5 ring-1 ring-border">
        <p className="font-display text-lg">
          {current ? `正在研判 ${current.name}` : "正在研判场地"}
        </p>
        {corridor.length ? (
          <p className="mt-1 text-sm text-muted">
            {corridorIndex + 1} / {corridor.length} 基
          </p>
        ) : null}
        <ul className="mt-3 space-y-1.5 text-sm">
          {steps.map((s, i) => (
            <li
              key={s}
              className={cn(
                "flex items-center gap-2",
                i <= active ? "text-fg" : "text-faint",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  i < active && "bg-primary",
                  i === active && "bg-primary animate-pulse",
                  i > active && "bg-faint",
                )}
              />
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function HistoryOverlay({
  items,
  onClose,
  onOpen,
}: {
  items: { id: string; locationTitle: string; savedAt: number; overallLevel: keyof typeof LEVEL_ZH; lat: number; lng: number }[];
  onClose: () => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-bg/50" onClick={onClose}>
      <div
        className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-surface ring-1 ring-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-14 items-center justify-between px-4 ring-1 ring-border">
          <p className="font-display text-lg">研判记录</p>
          <Button variant="ghost" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {items.length === 0 ? (
            <p className="px-2 py-8 text-sm text-muted">尚无记录。完成一次研判后会留在此设备上。</p>
          ) : (
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(it.id)}
                    className="flex w-full flex-col items-start rounded-xl px-3 py-3 text-left ring-1 ring-border hover:bg-fg/5"
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="truncate text-sm">{it.locationTitle}</span>
                      <Badge tone={LEVEL_TONE[it.overallLevel]}>{LEVEL_ZH[it.overallLevel]}</Badge>
                    </span>
                    <span className="mt-1 font-mono text-[11px] text-muted">
                      {it.lat.toFixed(4)}, {it.lng.toFixed(4)} · {zhDateTime(new Date(it.savedAt))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
