import { MapPin, Search, X } from "lucide-react";
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { searchPlaces } from "@/lib/analysis/server";
import { parseCoordinate } from "@/lib/analysis/geo";
import { FACTOR_OPTIONS } from "@/lib/analysis/factors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CorridorReview, IntakeModeTabs, LineImportForm, TowerImportButton, TowerStrip } from "@/components/tower-import";
import { SAMPLE_SITES, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

function parseField(latText: string, lngText: string) {
  const lat = Number(latText.trim());
  const lng = Number(lngText.trim());
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

export function SearchDock() {
  const query = useApp((s) => s.query);
  const setQuery = useApp((s) => s.setQuery);
  const pick = useApp((s) => s.pick);
  const analyze = useApp((s) => s.analyze);
  const loadSample = useApp((s) => s.loadSample);
  const pin = useApp((s) => s.pin);
  const probe = useApp((s) => s.probe);
  const stage = useApp((s) => s.stage);
  const extentM = useApp((s) => s.extentM);
  const setExtent = useApp((s) => s.setExtent);
  const factors = useApp((s) => s.factors);
  const toggleFactor = useApp((s) => s.toggleFactor);
  const mapPick = useApp((s) => s.mapPick);
  const setMapPick = useApp((s) => s.setMapPick);
  const error = useApp((s) => s.error);
  const corridor = useApp((s) => s.corridor);
  const [hits, setHits] = useState<{ lat: number; lng: number; label: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [latText, setLatText] = useState("");
  const [lngText, setLngText] = useState("");
  const [intakeMode, setIntakeMode] = useState<"point" | "line">("point");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);

  const busy = stage === "probing" || stage === "composing";
  const intake = !probe && !busy && !mapPick;

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!pin) return;
    const active = document.activeElement;
    if (active === latRef.current || active === lngRef.current) return;
    setLatText(pin.lat.toFixed(5));
    setLngText(pin.lng.toFixed(5));
  }, [pin]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    const coord = parseCoordinate(q);
    if (coord) {
      setHits([]);
      setLatText(coord.lat.toFixed(5));
      setLngText(coord.lng.toFixed(5));
      return;
    }
    timer.current = setTimeout(() => {
      void searchPlaces({ data: { q } })
        .then((res) => {
          if (res.ok) setHits(res.items);
          else setHits([]);
        })
        .catch(() => setHits([]));
    }, 380);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  function applyCoord(lat: number, lng: number, label?: string) {
    setLatText(lat.toFixed(5));
    setLngText(lng.toFixed(5));
    pick(lat, lng, label ? { query: label } : undefined);
    setOpen(false);
  }

  function takePaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");
    const coord = parseCoordinate(text);
    if (!coord) return;
    e.preventDefault();
    applyCoord(coord.lat, coord.lng);
  }

  function onLatKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    lngRef.current?.focus();
  }

  function onLngKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    (e.currentTarget as HTMLInputElement).blur();
  }

  function commitFromSearch() {
    const fromQuery = parseCoordinate(query);
    if (fromQuery) {
      applyCoord(fromQuery.lat, fromQuery.lng);
      return;
    }
    const fromFields = parseField(latText, lngText);
    if (fromFields) {
      applyCoord(fromFields.lat, fromFields.lng);
      return;
    }
    const first = hits[0];
    if (first) applyCoord(first.lat, first.lng, first.label);
  }

  function runAnalyze() {
    const fromFields = parseField(latText, lngText);
    const fromQuery = parseCoordinate(query);
    const coord = fromFields ?? fromQuery ?? pin;
    if (!coord) {
      void analyze();
      return;
    }
    setOpen(false);
    setMapPick(false);
    void analyze(coord);
  }

  const typed = parseField(latText, lngText);
  const editing = latText.trim() !== "" || lngText.trim() !== "";
  const canRun = Boolean(typed || (!editing && (pin || parseCoordinate(query)))) && !busy;

  if (!ready) {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 p-3 sm:p-4">
        <div className="mx-auto h-48 max-w-lg rounded-2xl bg-bg/78 ring-1 ring-fg/8" />
      </div>
    );
  }

  const searchField = (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onPaste={takePaste}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "Enter") {
            e.preventDefault();
            commitFromSearch();
          }
        }}
        placeholder="地名，或粘贴 26.26321, 117.63890"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="h-11 border-0 bg-transparent pl-10 ring-0 focus-visible:ring-0"
      />
      {query ? (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 size-11"
          onClick={() => {
            setQuery("");
            setHits([]);
          }}
          aria-label="清除"
        >
          <X />
        </Button>
      ) : null}
    </div>
  );

  const coordFields = (
    <div className="grid grid-cols-2 gap-2">
      <label className="block">
        <span className="px-1 text-xs text-muted">纬度 N</span>
        <Input
          ref={latRef}
          value={latText}
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="26.26321"
          onChange={(e) => setLatText(e.target.value)}
          onPaste={takePaste}
          onKeyDown={onLatKey}
          className="h-11 font-mono"
          aria-label="纬度"
        />
      </label>
      <label className="block">
        <span className="px-1 text-xs text-muted">经度 E</span>
        <Input
          ref={lngRef}
          value={lngText}
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="117.63890"
          onChange={(e) => setLngText(e.target.value)}
          onPaste={takePaste}
          onKeyDown={onLngKey}
          className="h-11 font-mono"
          aria-label="经度"
        />
      </label>
    </div>
  );

  const factorRow = (
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
  );

  const hitList =
    open && hits.length > 0 ? (
      <ul className="max-h-48 overflow-auto rounded-xl bg-surface-2 px-1 py-1 ring-1 ring-border">
        {hits.map((h) => (
          <li key={`${h.lat}-${h.lng}-${h.label}`}>
            <button
              type="button"
              className="flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-fg/6"
              onClick={() => applyCoord(h.lat, h.lng, h.label)}
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-pretty text-fg">{h.label}</span>
            </button>
          </li>
        ))}
      </ul>
    ) : null;

  const samples = !probe ? (
    <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {SAMPLE_SITES.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => loadSample(s)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs ring-1 transition-colors",
            pin && Math.abs(pin.lat - s.lat) < 1e-4 && Math.abs(pin.lng - s.lng) < 1e-4
              ? "bg-primary/16 text-primary ring-primary/35"
              : "bg-fg/6 text-muted ring-border hover:text-fg",
          )}
        >
          {s.name}
        </button>
      ))}
    </div>
  ) : null;

  const extentRow = (
    <div className="flex items-center gap-1 rounded-full bg-fg/6 p-1 text-xs text-muted">
      <span className="px-2">边长</span>
      {[50, 72, 110].map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setExtent(m)}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors",
            extentM === m ? "bg-fg/12 text-fg" : "hover:text-fg",
          )}
        >
          {m}米
        </button>
      ))}
    </div>
  );

  if (intake) {
    return (
      <div className="absolute inset-0 z-30 overflow-y-auto bg-bg/92 px-3 py-4 sm:px-4 sm:py-6">
        <div className="mx-auto w-full max-w-lg">
          <div
            className="rounded-2xl bg-surface p-4 ring-1 ring-border sm:p-5"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {corridor.length ? (
              <CorridorReview />
            ) : (
              <>
                <p className="text-[11px] tracking-[0.18em] text-muted uppercase">Yukan · 雨瞰</p>
                <h1 className="font-display mt-1 text-2xl">
                  {intakeMode === "line" ? "导入线路杆塔" : "输入坐标"}
                </h1>
                <p className="mt-1.5 text-sm text-pretty text-muted">
                  {intakeMode === "line"
                    ? "高压输电线路每基杆塔一行。支持 CSV、从 Excel 复制、KML / GPX。导入后仍要再点研判，不会自动跳到地图。"
                    : "填写单点经纬度，或切换到「线路杆塔」批量导入。选点和导入都不会自动分析。"}
                </p>

                <div className="mt-4">
                  <IntakeModeTabs mode={intakeMode} onChange={setIntakeMode} />
                </div>

                {intakeMode === "line" ? (
                  <div className="mt-4">
                    <LineImportForm />
                  </div>
                ) : (
                  <>
                    <div className="mt-4 space-y-3">
                      {coordFields}
                      <div className="rounded-xl bg-bg/50 ring-1 ring-border">{searchField}</div>
                      {hitList}
                      {factorRow}
                    </div>

                    {error ? <p className="mt-3 text-sm text-risk-high">{error}</p> : null}

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <Button className="h-11 flex-1" disabled={!canRun} onClick={runAnalyze}>
                        开始研判
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 sm:min-w-32"
                        onClick={() => {
                          const coord = parseField(latText, lngText);
                          if (coord) pick(coord.lat, coord.lng);
                          setMapPick(true);
                        }}
                      >
                        在地图上选点
                      </Button>
                      <Button type="button" variant="outline" className="h-11 sm:min-w-32" onClick={() => setIntakeMode("line")}>
                        导入杆塔
                      </Button>
                    </div>

                    <div className="mt-4 space-y-2">
                      {extentRow}
                      {samples}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col gap-3 p-3 sm:p-4">
      <div className="pointer-events-auto mx-auto w-full max-w-xl">
        <div
          className="relative rounded-2xl bg-bg/78 p-2 shadow-[0_0_0_1px_rgba(231,238,234,0.08)] backdrop-blur-md"
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {searchField}
          <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-[1fr_1fr_auto]">
            <label className="block">
              <span className="px-1 text-[11px] text-muted">纬度 N</span>
              <Input
                ref={latRef}
                value={latText}
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                placeholder="26.26321"
                onChange={(e) => setLatText(e.target.value)}
                onPaste={takePaste}
                onKeyDown={onLatKey}
                className="h-11 font-mono"
                aria-label="纬度"
              />
            </label>
            <label className="block">
              <span className="px-1 text-[11px] text-muted">经度 E</span>
              <Input
                ref={lngRef}
                value={lngText}
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                placeholder="117.63890"
                onChange={(e) => setLngText(e.target.value)}
                onPaste={takePaste}
                onKeyDown={onLngKey}
                className="h-11 font-mono"
                aria-label="经度"
              />
            </label>
            <Button
              className="col-span-2 h-11 sm:col-span-1 sm:mt-5 sm:min-w-28"
              disabled={!canRun}
              onClick={runAnalyze}
            >
              {busy ? "研判中" : "开始研判"}
            </Button>
          </div>
          <div className="mt-2">{factorRow}</div>
          {hitList}
        </div>
      </div>

      <div className="pointer-events-auto mx-auto flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {mapPick && !probe ? (
          <button
            type="button"
            onClick={() => setMapPick(false)}
            className="self-start rounded-full bg-bg/70 px-3 py-1.5 text-xs text-fg ring-1 ring-fg/15 backdrop-blur-sm hover:ring-fg/30"
          >
            返回输入坐标
          </button>
        ) : null}
        <div className="pointer-events-auto">
          <TowerImportButton className="h-9 rounded-full px-3 text-xs" />
        </div>
        {corridor.length ? null : samples}
        <div className="sm:ml-auto">{extentRow}</div>
      </div>
      <TowerStrip />
    </div>
  );
}
