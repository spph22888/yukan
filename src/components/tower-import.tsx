import { FileUp, Upload } from "lucide-react";
import { useMemo, useRef, useState, type DragEvent } from "react";
import {
  corridorStats,
  downloadCorridorCsv,
  downloadTowerTemplate,
  parseCoordinateFile,
  TOWER_TEMPLATE,
} from "@/lib/analysis/import-coords";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FACTOR_OPTIONS } from "@/lib/analysis/factors";
import { useApp } from "@/lib/store";
import { LEVEL_TONE, LEVEL_ZH, cn } from "@/lib/utils";

const FILE_ACCEPT = ".csv,.txt,.tsv,.kml,.gpx,.geojson,.json,.xml";

export function IntakeModeTabs({
  mode,
  onChange,
}: {
  mode: "point" | "line";
  onChange: (mode: "point" | "line") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-fg/6 p-1">
      {(
        [
          ["point", "单点坐标"],
          ["line", "线路杆塔"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "h-10 rounded-lg text-sm transition-colors",
            mode === id ? "bg-surface text-fg ring-1 ring-border" : "text-muted hover:text-fg",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function LineImportForm({ onImported }: { onImported?: () => void }) {
  const importTowers = useApp((s) => s.importTowers);
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const parsed = useMemo(() => (text.trim() ? parseCoordinateFile(text) : null), [text]);
  const preview = parsed?.ok ? parsed : null;
  const parseError = parsed && !parsed.ok ? parsed.error : error;

  function apply() {
    const res = parseCoordinateFile(text);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    importTowers(res.towers, title.trim() || res.title);
    onImported?.();
  }

  async function takeFile(file: File | undefined) {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".xlsm")) {
      setError("Excel 工作簿请另存为 CSV，或直接复制表格内容粘贴。");
      return;
    }
    const raw = await file.text();
    setText(raw);
    setError(null);
    if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ""));
    const res = parseCoordinateFile(raw, file.name);
    if (!res.ok) setError(res.error);
    else if (res.title && !title.trim()) setTitle(res.title);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    void takeFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="px-1 text-xs text-muted">线路名称（可选）</span>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如 沙县—三明 220kV"
          className="h-11"
        />
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-xl ring-1 transition-colors",
          dragging ? "ring-primary/50 bg-primary/8" : "ring-border bg-bg/50",
        )}
      >
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          spellCheck={false}
          rows={7}
          placeholder={"每行一基，可从 Excel 直接复制：\nN1,26.26321,117.63890\nN2,26.26510,117.64120"}
          className="w-full resize-y rounded-xl bg-transparent px-3 py-2.5 font-mono text-sm outline-none placeholder:text-faint"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={FILE_ACCEPT}
          className="hidden"
          onChange={(e) => {
            void takeFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <FileUp className="size-3.5" />
          选择文件
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => downloadTowerTemplate()}>
          下载 CSV 模板
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setText(TOWER_TEMPLATE);
            setTitle("示例线路 · 三明近郊 5 基");
            setError(null);
          }}
        >
          填入示例
        </Button>
      </div>
      <p className="text-xs text-faint text-pretty">
        支持 CSV / 从 Excel 复制、KML、GPX、GeoJSON。不要用投影坐标（高斯克吕格米制）。
      </p>

      {parseError ? <p className="text-sm text-risk-high">{parseError}</p> : null}
      {preview ? (
        <div className="rounded-xl bg-bg/40 px-3 py-2.5 ring-1 ring-border">
          <p className="text-sm">
            读到 {preview.towers.length} 基
            {preview.skipped ? `，跳过 ${preview.skipped} 行` : ""}
            {preview.kind !== "csv" ? ` · ${preview.kind.toUpperCase()}` : ""}
          </p>
          {preview.warning ? <p className="mt-1 text-xs text-risk-mid">{preview.warning}</p> : null}
          <ol className="mt-2 max-h-36 space-y-1 overflow-auto font-mono text-xs text-muted">
            {preview.towers.slice(0, 8).map((t) => (
              <li key={`${t.id}-${t.lat}`}>
                {t.name} · {t.lat.toFixed(5)}°N {t.lng.toFixed(5)}°E
              </li>
            ))}
            {preview.towers.length > 8 ? <li>…还有 {preview.towers.length - 8} 基</li> : null}
          </ol>
        </div>
      ) : null}

      <Button className="h-11 w-full" disabled={!preview} onClick={apply}>
        确认导入（不开始分析）
      </Button>
    </div>
  );
}

export function CorridorReview() {
  const corridor = useApp((s) => s.corridor);
  const corridorIndex = useApp((s) => s.corridorIndex);
  const corridorTitle = useApp((s) => s.corridorTitle);
  const corridorResults = useApp((s) => s.corridorResults);
  const selectTower = useApp((s) => s.selectTower);
  const clearCorridor = useApp((s) => s.clearCorridor);
  const analyze = useApp((s) => s.analyze);
  const analyzeCorridor = useApp((s) => s.analyzeCorridor);
  const stopBatch = useApp((s) => s.stopBatch);
  const batching = useApp((s) => s.batching);
  const stage = useApp((s) => s.stage);
  const setMapPick = useApp((s) => s.setMapPick);
  const factors = useApp((s) => s.factors);
  const toggleFactor = useApp((s) => s.toggleFactor);
  const error = useApp((s) => s.error);
  const [replace, setReplace] = useState(false);

  const stats = useMemo(() => corridorStats(corridor), [corridor]);
  const busy = stage === "probing" || stage === "composing" || batching;
  const current = corridor[corridorIndex];
  const done = Object.keys(corridorResults).length;

  if (replace) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">重新导入</h2>
          <button type="button" className="text-xs text-muted hover:text-fg" onClick={() => setReplace(false)}>
            返回列表
          </button>
        </div>
        <LineImportForm onImported={() => setReplace(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] tracking-[0.18em] text-muted uppercase">Transmission line</p>
        <h2 className="font-display mt-1 text-xl">{corridorTitle}</h2>
        <p className="mt-1 text-sm text-muted">
          {stats.count} 基
          {stats.lengthKm ? ` · 约 ${stats.lengthKm} km` : ""}
          {done ? ` · 已研判 ${done}/${stats.count}` : " · 尚未分析"}
        </p>
      </div>

      <div className="max-h-52 overflow-auto rounded-xl ring-1 ring-border">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-surface text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">杆塔</th>
              <th className="px-3 py-2 font-medium">纬度 N</th>
              <th className="px-3 py-2 font-medium">经度 E</th>
              <th className="px-3 py-2 font-medium">风险</th>
            </tr>
          </thead>
          <tbody>
            {corridor.map((t, i) => {
              const on = i === corridorIndex;
              const result = corridorResults[t.id];
              return (
                <tr
                  key={`${t.id}-${i}`}
                  onClick={() => selectTower(i)}
                  className={cn("cursor-pointer border-t border-border", on ? "bg-primary/12" : "hover:bg-fg/5")}
                >
                  <td className="px-3 py-2">{t.name}</td>
                  <td className="px-3 py-2 font-mono text-xs tabular-nums">{t.lat.toFixed(5)}</td>
                  <td className="px-3 py-2 font-mono text-xs tabular-nums">{t.lng.toFixed(5)}</td>
                  <td className="px-3 py-2">
                    {result ? <Badge tone={LEVEL_TONE[result.level]}>{LEVEL_ZH[result.level]}</Badge> : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <p className="px-1 text-xs text-muted">影响因子（可多选）</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {FACTOR_OPTIONS.map((f) => {
            const on = factors.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                title={f.hint}
                onClick={() => toggleFactor(f.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs transition-colors",
                  on ? "bg-primary/18 text-primary ring-1 ring-primary/40" : "bg-fg/6 text-muted ring-1 ring-border hover:text-fg",
                )}
              >
                {on ? "已选 · " : "未选 · "}
                {f.name}
              </button>
            );
          })}
        </div>
      </div>

      {error ? <p className="text-sm text-risk-high">{error}</p> : null}
      <p className="text-xs text-faint text-pretty">
        导入不会自动分析。试用按基计次，整条线路逐基研判会记 {stats.count} 次。
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          className="h-11 flex-1"
          disabled={busy || !current}
          onClick={() => current && void analyze({ lat: current.lat, lng: current.lng, query: current.name })}
        >
          {busy && !batching ? "研判中" : `研判当前基${current ? ` ${current.name}` : ""}`}
        </Button>
        {batching ? (
          <Button className="h-11" variant="outline" onClick={() => stopBatch()}>
            停止逐基
          </Button>
        ) : (
          <Button className="h-11" variant="outline" disabled={busy} onClick={() => void analyzeCorridor()}>
            从当前逐基研判
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setMapPick(true)}>
          在地图上查看线路
        </Button>
        {done ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => downloadCorridorCsv(corridorTitle, corridor, corridorResults)}
          >
            导出结果 CSV
          </Button>
        ) : null}
        <Button type="button" variant="ghost" size="sm" onClick={() => setReplace(true)}>
          重新导入
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => clearCorridor()}>
          清除线路
        </Button>
      </div>
    </div>
  );
}

export function TowerImportButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" variant="outline" className={cn("h-11", className)} onClick={() => setOpen(true)}>
        <Upload className="size-4" />
        导入杆塔
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/70 p-3 sm:items-center">
          <div
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-4 ring-1 ring-border sm:p-5"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <p className="text-[11px] tracking-[0.18em] text-muted uppercase">Import towers</p>
            <h2 className="font-display mt-1 text-xl">导入高压线路杆塔坐标</h2>
            <p className="mt-1.5 mb-3 text-sm text-pretty text-muted">
              每基一行。导入后不会自动分析，请再点「研判当前基」或「开始研判」。
            </p>
            <LineImportForm onImported={() => setOpen(false)} />
            <Button type="button" variant="ghost" className="mt-2 h-11 w-full" onClick={() => setOpen(false)}>
              取消
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function TowerStrip() {
  const corridor = useApp((s) => s.corridor);
  const corridorIndex = useApp((s) => s.corridorIndex);
  const corridorTitle = useApp((s) => s.corridorTitle);
  const corridorResults = useApp((s) => s.corridorResults);
  const selectTower = useApp((s) => s.selectTower);
  const clearCorridor = useApp((s) => s.clearCorridor);
  const analyzeCorridor = useApp((s) => s.analyzeCorridor);
  const stopBatch = useApp((s) => s.stopBatch);
  const batching = useApp((s) => s.batching);
  const stage = useApp((s) => s.stage);
  const analyze = useApp((s) => s.analyze);
  const setMapPick = useApp((s) => s.setMapPick);
  if (!corridor.length) return null;
  const busy = stage === "probing" || stage === "composing" || batching;
  const current = corridor[corridorIndex];
  const done = Object.keys(corridorResults).length;

  return (
    <div className="pointer-events-auto mx-auto w-full max-w-xl rounded-2xl bg-bg/78 p-2 shadow-[0_0_0_1px_rgba(231,238,234,0.08)] backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="min-w-0 truncate text-xs text-muted">
          {corridorTitle} · 当前 {current?.name ?? "—"}（{corridorIndex + 1}/{corridor.length}
          {done ? ` · 已研判 ${done}` : ""}）
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" className="text-[11px] text-faint hover:text-fg" onClick={() => setMapPick(false)}>
            返回列表
          </button>
          <button type="button" className="text-[11px] text-faint hover:text-fg" onClick={() => clearCorridor()}>
            清除
          </button>
        </div>
      </div>
      <div className="mt-1.5 flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {corridor.map((t, i) => {
          const result = corridorResults[t.id];
          return (
            <button
              key={`${t.id}-${i}`}
              type="button"
              onClick={() => selectTower(i)}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-xs ring-1 transition-colors",
                i === corridorIndex
                  ? "bg-primary/16 text-primary ring-primary/40"
                  : "bg-fg/6 text-muted ring-border hover:text-fg",
              )}
            >
              {t.name}
              {result ? ` · ${LEVEL_ZH[result.level]}` : ""}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={busy || !current}
          onClick={() => current && void analyze({ lat: current.lat, lng: current.lng, query: current.name })}
        >
          {busy && !batching ? "研判中" : "研判当前基"}
        </Button>
        {batching ? (
          <Button size="sm" variant="outline" onClick={() => stopBatch()}>
            停止逐基
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void analyzeCorridor()}>
            从当前逐基研判
          </Button>
        )}
        {done ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => downloadCorridorCsv(corridorTitle, corridor, corridorResults)}
          >
            导出 CSV
          </Button>
        ) : null}
      </div>
    </div>
  );
}
