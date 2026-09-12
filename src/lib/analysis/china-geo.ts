import type { LatLng } from "./types";

const PI = Math.PI;
const A = 6378245;
const EE = 0.00669342162296594323;

/** Rough mainland + 港澳台 bounding box used by the GCJ-02 offset. */
export function inGcjBounds(lat: number, lng: number) {
  return lng >= 72.004 && lng <= 137.8347 && lat >= 0.8293 && lat <= 55.8271;
}

export function isMainlandChina(lat: number, lng: number, countryCode?: string | null) {
  if (countryCode && countryCode.toLowerCase() === "cn") return true;
  if (countryCode && ["hk", "mo", "tw"].includes(countryCode.toLowerCase())) return true;
  return lat >= 18.05 && lat <= 53.7 && lng >= 73.4 && lng <= 135.1;
}

function transformLat(lng: number, lat: number) {
  let ret =
    -100 +
    2 * lng +
    3 * lat +
    0.2 * lat * lat +
    0.1 * lng * lat +
    0.2 * Math.sqrt(Math.abs(lng));
  ret += ((20 * Math.sin(6 * lng * PI) + 20 * Math.sin(2 * lng * PI)) * 2) / 3;
  ret += ((20 * Math.sin(lat * PI) + 40 * Math.sin((lat / 3) * PI)) * 2) / 3;
  ret += ((160 * Math.sin((lat / 12) * PI) + 320 * Math.sin((lat * PI) / 30)) * 2) / 3;
  return ret;
}

function transformLng(lng: number, lat: number) {
  let ret =
    300 + lng + 2 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += ((20 * Math.sin(6 * lng * PI) + 20 * Math.sin(2 * lng * PI)) * 2) / 3;
  ret += ((20 * Math.sin(lng * PI) + 40 * Math.sin((lng / 3) * PI)) * 2) / 3;
  ret += ((150 * Math.sin((lng / 12) * PI) + 300 * Math.sin((lng / 30) * PI)) * 2) / 3;
  return ret;
}

/** WGS-84 → GCJ-02 (高德 / 国测局). Identity outside the offset box. */
export function wgs84ToGcj02(lat: number, lng: number): LatLng {
  if (!inGcjBounds(lat, lng)) return { lat, lng };
  const dLat = transformLat(lng - 105, lat - 35);
  const dLng = transformLng(lng - 105, lat - 35);
  const radLat = (lat / 180) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  return {
    lat: lat + (dLat * 180) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI),
    lng: lng + (dLng * 180) / ((A / sqrtMagic) * Math.cos(radLat) * PI),
  };
}

/** Approximate inverse of GCJ-02 → WGS-84. */
export function gcj02ToWgs84(lat: number, lng: number): LatLng {
  if (!inGcjBounds(lat, lng)) return { lat, lng };
  const g = wgs84ToGcj02(lat, lng);
  return { lat: lat * 2 - g.lat, lng: lng * 2 - g.lng };
}

export function latLngToTile(lat: number, lng: number, z: number) {
  const n = 2 ** z;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / PI) / 2) * n);
  return { x, y, z };
}

export function gaodeSatUrl(x: number, y: number, z: number) {
  const s = (Math.abs(x) % 4) + 1;
  return `https://webst0${s}.is.autonavi.com/appmaptile?style=6&x=${x}&y=${y}&z=${z}`;
}

export function gaodeLabelUrl(x: number, y: number, z: number) {
  const s = (Math.abs(x) % 4) + 1;
  return `https://webst0${s}.is.autonavi.com/appmaptile?style=8&x=${x}&y=${y}&z=${z}`;
}

export const GAODE_SAT =
  "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}";
export const GAODE_SAT_LABEL =
  "https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}";
export const GAODE_VEC =
  "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}";
export const OSM_TILE = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const ESRI_SAT =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
