import type { ReactNode } from "react";
import { Printer, X } from "lucide-react";
import type { ProbeResult, ReportDoc, RiskLevel, WindBlock } from "@/lib/analysis/types";
import { hasFactor, normalizeFactors } from "@/lib/analysis/factors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TileFigure, ReliefFigure } from "@/components/tile-figure";
import { emptyBird } from "@/lib/analysis/birds";
import { emptyWind } from "@/lib/analysis/wind";
import { LEVEL_TONE, LEVEL_ZH, cn } from "@/lib/utils";
import { useApp } from "@/lib/store";

const SECTION = ["一", "二", "三", "四", "五", "六", "七", "八", "九"] as const;

export function ReportPanel({
  probe,
  report,
  composing,
  onClose,
}: {
  probe: ProbeResult;
  report: ReportDoc | null;
  composing: boolean;
  onClose: () => void;
}) {
  const wind = probe.wind ?? emptyWind();
  const birds = probe.birds ?? emptyBird();
  const factors = normalizeFactors(probe.factors);
  const wantRain = hasFactor(factors, "rain");
  const wantWind = hasFactor(factors, "wind");
  const wantBirds = hasFactor(factors, "birds");
  const corridor = useApp((s) => s.corridor);
  const corridorIndex = useApp((s) => s.corridorIndex);
  const corridorTitle = useApp((s) => s.corridorTitle);
  const tower = corridor.find(
    (t) => Math.abs(t.lat - probe.lat) < 1e-4 && Math.abs(t.lng - probe.lng) < 1e-4,
  );
  const towerIndex = tower ? corridor.indexOf(tower) : corridorIndex;
  let section = 0;
  const next = () => section++;

  return (
    <aside
      id="report-scroll"
      className="report-paper flex h-full min-h-0 flex-col overflow-hidden"
    >
      <header className="no-print flex items-center justify-between gap-2 px-4 py-3 ring-1 ring-rule/80">
        <div className="min-w-0">
          <p className="font-display text-sm text-ink">研判书</p>
          <p className="truncate font-mono text-[11px] text-ink-muted">{report?.serial ?? "生成中"}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-ink hover:bg-ink/6"
            onClick={() => window.print()}
            aria-label="打印"
          >
            <Printer />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-ink hover:bg-ink/6"
            onClick={onClose}
            aria-label="关闭"
          >
            <X />
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        <p className="text-[11px] tracking-[0.22em] text-ink-muted uppercase">雨瞰 · 场地风险</p>
        <h1 className="font-display mt-2 text-2xl leading-snug text-balance text-ink">
          {report?.title ?? "场地风险卫星分析报告"}
        </h1>
        <p className="mt-2 text-sm text-ink-muted text-pretty">
          {report?.locationTitle ?? probe.place.displayName}
        </p>
        <p className="mt-1 font-mono text-[11px] text-ink-muted">
          {report?.date} · {probe.lat.toFixed(6)}°N {probe.lng.toFixed(6)}°E
        </p>
        {tower ? (
          <p className="mt-2 rounded-lg bg-ink/5 px-3 py-2 text-sm text-ink">
            {corridorTitle} · 第 {towerIndex + 1} 基 {tower.name} / 共 {corridor.length} 基
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="场地高程" value={`${Math.round(probe.siteElevM)} m`} />
          <Stat label="近场高差" value={`${Math.round(probe.reliefM)} m`} />
          {wantWind ? (
            <Stat
              label="抗风"
              value={wind.status === "over" ? "超设计" : wind.status === "near" ? "临近" : "未超"}
              level={wind.status === "over" ? "high" : wind.status === "near" ? "mid" : "low"}
            />
          ) : (
            <Stat label="勾选因子" value={factors.length ? `${factors.length} 项` : "仅高程"} />
          )}
          <Stat
            label="综合风险"
            value={LEVEL_ZH[probe.overallLevel]}
            level={probe.overallLevel}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {probe.risks.map((r) => (
            <Badge key={r.id} tone={LEVEL_TONE[r.level]}>
              {r.type} {LEVEL_ZH[r.level]}
            </Badge>
          ))}
        </div>

        {wantRain ? <WeatherStrip probe={probe} /> : null}
        {wantWind ? <WindStrip wind={wind} /> : null}
        <ElevProfile probe={probe} />

        <Section n={next()} title="对象定位">
          <P>{report?.positioning}</P>
          <P>{report?.terrainJudgement}</P>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-xs">
              <thead>
                <tr className="border-b border-rule text-ink-muted">
                  <th className="py-2 font-medium">点号</th>
                  <th className="py-2 font-medium">经度</th>
                  <th className="py-2 font-medium">纬度</th>
                  <th className="py-2 font-medium">高程</th>
                  <th className="py-2 font-medium">相对位置</th>
                </tr>
              </thead>
              <tbody>
                {probe.vertices.map((v) => (
                  <tr key={v.id} className="border-b border-rule/70">
                    <td className="py-2 font-mono">{v.id}</td>
                    <td className="py-2 font-mono">{v.lng.toFixed(7)}</td>
                    <td className="py-2 font-mono">{v.lat.toFixed(7)}</td>
                    <td className="py-2 font-mono">{Math.round(v.elevM)}</td>
                    <td className="py-2">{v.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section n={next()} title="卫星详图：围合范围与近场雨水走向">
          <P>{report?.flowLead}</P>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed">
            {probe.flowPaths.map((fp, i) => (
              <li key={fp.id} className="flex gap-2">
                <span
                  className={cn(
                    "mt-1.5 size-2.5 shrink-0 rounded-full",
                    fp.tone === "inflow" && "bg-flow-in",
                    fp.tone === "lateral" && "bg-flow-side",
                    fp.tone === "bypass" && "bg-flow-by",
                    fp.tone === "outlet" && "bg-flow-out",
                  )}
                />
                <span>
                  <strong className="font-medium">
                    {i + 1}. {fp.name}：
                  </strong>
                  {fp.description}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[11px] text-ink-muted">
            图1 见左侧交互卫星图（黄白线为围合，青/绿/橙为径流示意，菱形为栖息地）。底图默认高德卫星，大陆可直接加载。
          </p>
        </Section>

        <Section n={next()} title="片区汇水">
          <P>{report?.watershed}</P>
          <P>{report?.keyConclusion}</P>
          <TileFigure lat={probe.lat} lng={probe.lng} zoom={16} cap="图2  片区卫星（高德，GCJ-02 切片）" />
        </Section>

        <Section n={next()} title="区位与流域：雨水最终去向">
          <P>{report?.basin}</P>
          <TileFigure lat={probe.lat} lng={probe.lng} zoom={14} cap="图3  区位与流域（高德卫星）" />
          <ReliefFigure probe={probe} cap="图4  近场高程网格" />
        </Section>

        {wantRain ? (
        <Section n={next()} title="强降雨影响研判">
          <h3 className="mt-1 text-sm font-medium">（一）近期天气背景</h3>
          <P>{report?.weatherNarrative}</P>
          <h3 className="mt-4 text-sm font-medium">（二）风险矩阵</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-xs">
              <thead>
                <tr className="border-b border-rule text-ink-muted">
                  <th className="py-2 font-medium">风险类型</th>
                  <th className="py-2 font-medium">等级</th>
                  <th className="py-2 font-medium">主要依据</th>
                  <th className="py-2 font-medium">可能后果</th>
                </tr>
              </thead>
              <tbody>
                {probe.risks.map((r) => (
                  <tr key={r.id} className="border-b border-rule/70 align-top">
                    <td className="py-2.5">{r.type}</td>
                    <td className="py-2.5">
                      <Badge tone={LEVEL_TONE[r.level]}>{LEVEL_ZH[r.level]}</Badge>
                    </td>
                    <td className="py-2.5 text-pretty">{r.basis}</td>
                    <td className="py-2.5 text-pretty">{r.consequence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="mt-4 text-sm font-medium">（三）边坡与地灾线索</h3>
          <P>{report?.geoHazard}</P>
        </Section>
        ) : null}

        {wantWind ? (
        <Section n={next()} title="强风影响研判">
          <P>{report?.windNarrative}</P>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-xs">
              <thead>
                <tr className="border-b border-rule text-ink-muted">
                  <th className="py-2 font-medium">项目</th>
                  <th className="py-2 font-medium">风速</th>
                  <th className="py-2 font-medium">相对设计</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-rule/70">
                  <td className="py-2">来风（预报最大阵风 / 风速）</td>
                  <td className="py-2 font-mono">{wind.incomingGustMaxMs ?? wind.incomingMaxMs ?? "—"} m/s</td>
                  <td className="py-2">{pct(wind.incomingRatio)}</td>
                </tr>
                <tr className="border-b border-rule/70">
                  <td className="py-2">历史（近 {wind.histDays || "—"} 日最大阵风）</td>
                  <td className="py-2 font-mono">{wind.histGustMaxMs ?? wind.histMaxMs ?? "—"} m/s</td>
                  <td className="py-2">{pct(wind.histRatio)}</td>
                </tr>
                <tr className="border-b border-rule/70">
                  <td className="py-2">设计基本风速（10 m、10 min）</td>
                  <td className="py-2 font-mono">{wind.designV10} m/s</td>
                  <td className="py-2">w0 = {wind.designW0.toFixed(2)} kN/m²</td>
                </tr>
                <tr className="border-b border-rule/70">
                  <td className="py-2">设计阵风参考（×1.4）</td>
                  <td className="py-2 font-mono">{wind.designGust} m/s</td>
                  <td className="py-2">
                    {wind.status === "over" ? "超过" : wind.status === "near" ? "临近" : "未超"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-ink-muted">{wind.designSource}。{wind.terrainNote}</p>
          <h3 className="mt-4 text-sm font-medium">修正方案（公开规范口径）</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            {wind.corrections.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
        </Section>
        ) : null}

        {wantBirds ? (
        <Section n={next()} title="大型鸟类活动因子">
          <P>{report?.birdNarrative}</P>
          {birds.sites.length ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-xs">
                <thead>
                  <tr className="border-b border-rule text-ink-muted">
                    <th className="py-2 font-medium">栖息地</th>
                    <th className="py-2 font-medium">类型</th>
                    <th className="py-2 font-medium">距离</th>
                    <th className="py-2 font-medium">指示种 / 来源</th>
                  </tr>
                </thead>
                <tbody>
                  {birds.sites.map((s) => (
                    <tr key={`${s.name}-${s.lat}`} className="border-b border-rule/70">
                      <td className="py-2">{s.name}</td>
                      <td className="py-2">{s.kind}</td>
                      <td className="py-2 font-mono">{s.distKm} km</td>
                      <td className="py-2 text-pretty">
                        {s.species}
                        <span className="text-ink-muted"> · {s.source}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">近场名录与 OSM 未检出湿地、保护区或观鸟点。</p>
          )}
          <h3 className="mt-4 text-sm font-medium">围护修正</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            {birds.corrections.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
        </Section>
        ) : null}

        <Section n={next()} title="结论与建议">
          <P>
            <strong className="font-medium">综合结论：</strong>
            {report?.conclusion}
          </P>
          <p className="mt-3 text-sm">现场可优先落实以下措施：</p>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            {(report?.recommendations ?? []).map((rec) => (
              <li key={rec}>{rec}</li>
            ))}
          </ol>
        </Section>

        <Section n={next()} title="数据来源与局限">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <tbody>
                {probe.sources.map((s) => (
                  <tr key={s.item} className="border-b border-rule/70">
                    <td className="py-2 pr-3 whitespace-nowrap font-medium">{s.item}</td>
                    <td className="py-2 text-pretty text-ink-muted">{s.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <P>{report?.limitations}</P>
          <p className="mt-4 text-xs text-ink-muted">
            {report?.ai ? "叙述由模型根据实测网格撰写，等级由算法给出。" : "叙述为规则模板，等级由算法给出。"}
            （分析完毕）
          </p>
        </Section>

        {composing ? (
          <p className="mt-6 text-sm text-ink-muted">正在润色研判书正文…</p>
        ) : null}
      </div>
    </aside>
  );
}

function pct(ratio: number | null) {
  if (ratio == null) return "—";
  return `${Math.round(ratio * 100)}%`;
}

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg text-ink">
        {SECTION[n]}、{title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function P({ children }: { children: ReactNode }) {
  if (!children) return <p className="h-16 animate-pulse rounded-lg bg-ink/5" />;
  return <p className="text-sm leading-relaxed text-pretty text-ink">{children}</p>;
}

function Stat({
  label,
  value,
  level,
}: {
  label: string;
  value: string;
  level?: RiskLevel;
}) {
  return (
    <div className="rounded-xl bg-ink/4 px-3 py-2.5">
      <div className="text-[11px] text-ink-muted">{label}</div>
      <div
        className={cn(
          "mt-0.5 font-display text-lg tabular-nums",
          level
            ? LEVEL_TONE[level] === "high"
              ? "text-risk-high"
              : LEVEL_TONE[level] === "mid"
                ? "text-risk-mid"
                : "text-risk-low"
            : "text-ink",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function WeatherStrip({ probe }: { probe: ProbeResult }) {
  const days = probe.weather.days.slice(0, 8);
  const max = Math.max(8, ...days.map((d) => d.rainMm));
  return (
    <div className="mt-5 rounded-xl bg-ink/4 px-3 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] tracking-wide text-ink-muted">降水 · {probe.weather.source}</p>
        <p className="text-[11px] text-ink-muted">
          未来累计 {probe.weather.next7dMm} mm
        </p>
      </div>
      {days.length ? (
        <div className="mt-2 flex h-16 items-end gap-1">
          {days.map((d) => (
            <div key={d.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                className="w-full max-w-6 rounded-t-sm bg-primary/80"
                style={{ height: `${Math.max(4, (d.rainMm / max) * 48)}px` }}
                title={`${d.date} ${d.rainMm} mm`}
              />
              <span className="font-mono text-[9px] text-ink-muted">{d.date.slice(5)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-ink-muted">暂无逐日降水</p>
      )}
    </div>
  );
}

function WindStrip({ wind }: { wind: WindBlock }) {
  const design = Math.max(wind.designGust, 1);
  const incoming = wind.incomingGustMaxMs ?? wind.incomingMaxMs ?? 0;
  const hist = wind.histGustMaxMs ?? wind.histMaxMs ?? 0;
  const top = Math.max(design, incoming, hist, 1);
  const rows = [
    { label: "来风", v: incoming, cls: "bg-risk-mid" },
    { label: "历史", v: hist, cls: "bg-ink/45" },
    { label: "阵风设计", v: design, cls: "bg-primary" },
  ];
  return (
    <div className="mt-3 rounded-xl bg-ink/4 px-3 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] text-ink-muted">风速对照 · 10 m（m/s）</p>
        <p className="text-[11px] text-ink-muted">
          {wind.status === "over" ? "超过设计值" : wind.status === "near" ? "临近设计值" : "未超设计值"}
        </p>
      </div>
      <div className="mt-2 space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span className="w-8 shrink-0 text-[11px] text-ink-muted">{r.label}</span>
            <div className="h-1.5 min-w-0 flex-1 rounded-full bg-ink/10">
              <div
                className={cn("h-1.5 rounded-full", r.cls)}
                style={{ width: `${Math.min(100, (r.v / top) * 100)}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right font-mono text-[11px]">{r.v ? r.v.toFixed(1) : "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ElevProfile({ probe }: { probe: ProbeResult }) {
  const t = probe.transect;
  if (t.length < 2) return null;
  const w = 320;
  const h = 72;
  const zs = t.map((p) => p.elevM);
  const min = Math.min(...zs);
  const max = Math.max(...zs);
  const span = max - min || 1;
  const pts = t.map((p, i) => {
    const x = (i / (t.length - 1)) * w;
    const y = h - 10 - ((p.elevM - min) / span) * (h - 22);
    return `${x},${y}`;
  });
  const area = `0,${h} ${pts.join(" ")} ${w},${h}`;
  return (
    <div className="mt-3 rounded-xl bg-ink/4 px-3 py-3">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] text-ink-muted">沿坡向高程剖面（上坡 → 下坡）</p>
        <p className="font-mono text-[11px] text-ink-muted">
          {Math.round(min)}–{Math.round(max)} m
        </p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 w-full" aria-hidden>
        <polygon points={area} className="fill-primary/20" />
        <polyline points={pts.join(" ")} fill="none" className="stroke-primary" strokeWidth="1.6" />
      </svg>
    </div>
  );
}
