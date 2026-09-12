import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  corridorStats,
  parseCoordinateFile,
  parseTowerList,
  towersToCsv,
  TOWER_TEMPLATE,
} from "./import-coords.ts";

describe("parseTowerList", () => {
  it("parses the CSV template", () => {
    const res = parseTowerList(TOWER_TEMPLATE);
    assert.equal(res.ok, true);
    if (!res.ok) return;
    assert.equal(res.towers.length, 5);
    assert.equal(res.towers[0]?.name, "N1");
    assert.equal(res.towers[0]?.lat, 26.26321);
    assert.equal(res.towers[4]?.name, "N5");
  });

  it("parses tab-separated paste from Excel", () => {
    const res = parseTowerList("杆塔号\t纬度\t经度\nJ1\t24.47980\t118.08940\nJ2\t24.48110\t118.09120\n");
    assert.equal(res.ok, true);
    if (!res.ok) return;
    assert.equal(res.towers.length, 2);
    assert.equal(res.towers[0]?.name, "J1");
    assert.equal(res.towers[1]?.lng, 118.0912);
  });

  it("parses space-separated rows without a header", () => {
    const res = parseTowerList("1# 26.26 117.64\n2# 26.27 117.65");
    assert.equal(res.ok, true);
    if (!res.ok) return;
    assert.equal(res.towers[0]?.name, "1#");
    assert.equal(res.towers[1]?.lat, 26.27);
  });

  it("swaps lng,lat when the first number is longitude", () => {
    const res = parseTowerList("N1,117.63890,26.26321");
    assert.equal(res.ok, true);
    if (!res.ok) return;
    assert.equal(res.towers[0]?.lat, 26.26321);
    assert.equal(res.towers[0]?.lng, 117.6389);
  });

  it("rejects projected meters", () => {
    const res = parseTowerList("N1,3948123.1,276543.8");
    assert.equal(res.ok, false);
  });

  it("skips hash-space comments but keeps #1 towers", () => {
    const res = parseTowerList("# 这是注释\n#1,26.26321,117.63890\n");
    assert.equal(res.ok, true);
    if (!res.ok) return;
    assert.equal(res.towers[0]?.name, "#1");
  });
});

describe("parseCoordinateFile", () => {
  it("reads KML placemark points as lng,lat", () => {
    const kml = `<?xml version="1.0"?>
<kml><Document><name>沙县一线</name>
<Placemark><name>N1</name><Point><coordinates>117.63890,26.26321,0</coordinates></Point></Placemark>
<Placemark><name>N2</name><Point><coordinates>117.64120,26.26510,0</coordinates></Point></Placemark>
</Document></kml>`;
    const res = parseCoordinateFile(kml, "line.kml");
    assert.equal(res.ok, true);
    if (!res.ok) return;
    assert.equal(res.kind, "kml");
    assert.equal(res.title, "沙县一线");
    assert.equal(res.towers.length, 2);
    assert.equal(res.towers[0]?.lat, 26.26321);
    assert.equal(res.towers[0]?.lng, 117.6389);
  });

  it("reads GPX waypoints", () => {
    const gpx = `<gpx><wpt lat="26.26321" lon="117.63890"><name>Z1</name></wpt>
<wpt lat="26.26510" lon="117.64120"><name>Z2</name></wpt></gpx>`;
    const res = parseCoordinateFile(gpx);
    assert.equal(res.ok, true);
    if (!res.ok) return;
    assert.equal(res.towers[0]?.name, "Z1");
    assert.equal(res.towers[1]?.lng, 117.6412);
  });

  it("reads GeoJSON points", () => {
    const json = JSON.stringify({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "T1" },
          geometry: { type: "Point", coordinates: [117.6389, 26.26321] },
        },
        {
          type: "Feature",
          properties: { name: "T2" },
          geometry: { type: "Point", coordinates: [117.6412, 26.2651] },
        },
      ],
    });
    const res = parseCoordinateFile(json, "towers.geojson");
    assert.equal(res.ok, true);
    if (!res.ok) return;
    assert.equal(res.kind, "geojson");
    assert.equal(res.towers.map((t) => t.name).join(","), "T1,T2");
  });

  it("rejects xlsx workbooks with a copy-paste hint", () => {
    const res = parseCoordinateFile("PK\x03\x04[Content_Types].xml", "towers.xlsx");
    assert.equal(res.ok, false);
    if (res.ok) return;
    assert.match(res.error, /CSV/);
  });
});

describe("corridor helpers", () => {
  it("measures line length and exports csv", () => {
    const parsed = parseTowerList(TOWER_TEMPLATE);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const stats = corridorStats(parsed.towers);
    assert.equal(stats.count, 5);
    assert.ok(stats.lengthM > 800 && stats.lengthM < 2000);
    const csv = towersToCsv(parsed.towers, { N1: { level: "high", historyId: "1" } });
    assert.match(csv, /N1,26\.263210,117\.638900,高/);
  });
});
