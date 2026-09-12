import { useMemo, useState } from "react";
import { gaodeSatUrl, latLngToTile, wgs84ToGcj02 } from "@/lib/analysis/china-geo";
import type { ProbeResult } from "@/lib/analysis/types";

export function TileFigure({
  lat,
  lng,
  zoom,
  cap,
}: {
  lat: number;
  lng: number;
  zoom: number;
  cap: string;
}) {
  const tiles = useMemo(() => {
    const g = wgs84ToGcj02(lat, lng);
    const t = latLngToTile(g.lat, g.lng, zoom);
    const cells: { x: number; y: number; src: string }[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = t.x + dx;
        const y = t.y + dy;
        cells.push({ x, y, src: gaodeSatUrl(x, y, zoom) });
      }
    }
    return cells;
  }, [lat, lng, zoom]);
  const [failed, setFailed] = useState(0);

  if (failed >= 4) {
    return (
      <figure className="mt-3">
        <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-ink/5 text-xs text-ink-muted">
          卫星切片暂不可用，请看左侧交互底图
        </div>
        <figcaption className="mt-1.5 text-[11px] text-ink-muted">{cap}</figcaption>
      </figure>
    );
  }

  return (
    <figure className="mt-3">
      <div className="grid aspect-[1/1] grid-cols-3 overflow-hidden rounded-lg bg-ink/5 outline outline-1 -outline-offset-1 outline-ink/10 sm:aspect-[16/9] sm:grid-rows-3">
        {tiles.map((c) => (
          <img
            key={`${c.x}-${c.y}`}
            src={c.src}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setFailed((n) => n + 1)}
          />
        ))}
      </div>
      <figcaption className="mt-1.5 text-[11px] text-ink-muted">{cap}</figcaption>
    </figure>
  );
}

export function ReliefFigure({ probe, cap }: { probe: ProbeResult; cap: string }) {
  const { n, z } = probe.grid;
  const w = 360;
  const h = 200;
  let min = Infinity;
  let max = -Infinity;
  for (const row of z) {
    for (const v of row) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  const span = max - min || 1;
  const cells: string[] = [];
  const cw = w / n;
  const ch = h / n;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const t = (z[r]![c]! - min) / span;
      const light = 32 + t * 36;
      cells.push(
        `<rect x="${c * cw}" y="${r * ch}" width="${cw + 0.4}" height="${ch + 0.4}" fill="hsl(158 18% ${light}%)"/>`,
      );
    }
  }
  return (
    <figure className="mt-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full rounded-lg outline outline-1 -outline-offset-1 outline-ink/10">
        <g dangerouslySetInnerHTML={{ __html: cells.join("") }} />
      </svg>
      <figcaption className="mt-1.5 text-[11px] text-ink-muted">
        {cap}（{Math.round(min)}–{Math.round(max)} m）
      </figcaption>
    </figure>
  );
}
