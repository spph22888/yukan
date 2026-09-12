import type { SampleSite } from "@/lib/analysis/types";

export const SANMING_ID = "sanming-jiuzhong";

export const SAMPLE_SITES: SampleSite[] = [
  {
    id: SANMING_ID,
    name: "三明九中东侧院落",
    subtitle: "福建三明 · 原报告样例",
    lat: 26.23953,
    lng: 117.62091,
    extentM: 72,
    vertices: [
      { id: "P1", lng: 117.6212063, lat: 26.23970253, role: "东北角" },
      { id: "P2", lng: 117.6205898, lat: 26.23983583, role: "西北角" },
      { id: "P3", lng: 117.6204957, lat: 26.23937413, role: "西南角" },
      { id: "P4", lng: 117.6210847, lat: 26.23920885, role: "东南角" },
      { id: "P5", lng: 117.6211656, lat: 26.23953543, role: "东墙中段" },
    ],
  },
  {
    id: "xiamen-coast",
    name: "厦门岛东部海岸",
    subtitle: "台风区 · 抗风设计值对照",
    lat: 24.4796,
    lng: 118.1819,
    extentM: 80,
  },
  {
    id: "poyang-wucheng",
    name: "鄱阳湖吴城湿地",
    subtitle: "大型候鸟栖息地",
    lat: 29.216,
    lng: 115.98,
    extentM: 90,
  },
  {
    id: "chongqing-hongyadong",
    name: "重庆洪崖洞",
    subtitle: "嘉陵江岸 · 陡坡临江",
    lat: 29.5624,
    lng: 106.5769,
    extentM: 90,
  },
  {
    id: "zhengzhou-jingguang",
    name: "郑州京广路隧道北口",
    subtitle: "720 特大暴雨对照",
    lat: 34.7469,
    lng: 113.6254,
    extentM: 80,
  },
];

export function matchSample(lat: number, lng: number) {
  return SAMPLE_SITES.find(
    (s) => Math.abs(s.lat - lat) < 0.0007 && Math.abs(s.lng - lng) < 0.0007,
  );
}
