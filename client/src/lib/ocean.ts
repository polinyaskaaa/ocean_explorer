export const MAX_DEPTH = 4000;

export const SCROLL_SCREENS = 20;

const DEPTH_CURVE = 2;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function progressToDepth(progress: number): number {
  return MAX_DEPTH * clamp01(progress) ** DEPTH_CURVE;
}

export function depthToProgress(depth: number): number {
  return clamp01(depth / MAX_DEPTH) ** (1 / DEPTH_CURVE);
}

export interface OceanZone {
  from: number;
  to: number;
  name: string;
  subtitle: string;
}

export const ZONES: OceanZone[] = [
  { from: 0, to: 200, name: 'Епіпелагіаль', subtitle: 'Зона світла' },
  { from: 200, to: 1000, name: 'Мезопелагіаль', subtitle: 'Сутінкова зона' },
  { from: 1000, to: 4000, name: 'Батіпелагіаль', subtitle: 'Зона опівночі' },
];

export function zoneAt(depth: number): OceanZone {
  return ZONES.find((zone) => depth < zone.to) ?? ZONES[ZONES.length - 1];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function interpolate(points: [number, number][], depth: number): number {
  if (depth <= points[0][0]) return points[0][1];

  for (let i = 1; i < points.length; i += 1) {
    const [prevDepth, prevValue] = points[i - 1];
    const [nextDepth, nextValue] = points[i];
    if (depth <= nextDepth) {
      const t = (depth - prevDepth) / (nextDepth - prevDepth);
      return lerp(prevValue, nextValue, t);
    }
  }

  return points[points.length - 1][1];
}

export function temperatureAt(depth: number): number {
  return interpolate(
    [
      [0, 24],
      [100, 19],
      [300, 11],
      [700, 6],
      [1200, 4],
      [2500, 2.6],
      [4000, 2],
    ],
    depth,
  );
}

export function pressureAt(depth: number): number {
  return 1 + depth / 10;
}

export function lightAt(depth: number): number {
  return Math.max(0, interpolate(
    [
      [0, 1],
      [50, 0.72],
      [200, 0.32],
      [600, 0.08],
      [1000, 0.015],
      [1500, 0],
    ],
    depth,
  ));
}

type Rgb = [number, number, number];

const WATER_STOPS: [number, Rgb][] = [
  [0, [96, 200, 224]],
  [60, [48, 158, 200]],
  [200, [20, 104, 158]],
  [600, [10, 58, 106]],
  [1200, [6, 30, 64]],
  [2200, [4, 16, 38]],
  [4000, [2, 7, 18]],
];

function rgb([r, g, b]: Rgb) {
  return `rgb(${r}, ${g}, ${b})`;
}

export const WATER_COLUMN_PX = 5200;

export function waterColumnGradient(): string {
  const stops = WATER_STOPS.map(
    ([depth, color]) => `${rgb(color)} ${((depth / MAX_DEPTH) * 100).toFixed(2)}%`,
  );
  return `linear-gradient(180deg, ${stops.join(', ')})`;
}

export function waterColumnOffset(depth: number, viewportHeight: number): number {
  const travel = Math.max(0, WATER_COLUMN_PX - viewportHeight);
  return -(Math.min(depth, MAX_DEPTH) / MAX_DEPTH) * travel;
}

export function formatDepth(depth: number): string {
  return `${Math.round(depth).toLocaleString('uk-UA')} м`;
}

export function formatTemperature(depth: number): string {
  return `${temperatureAt(depth).toFixed(1).replace('.', ',')} °C`;
}

export function formatPressure(depth: number): string {
  return `${pressureAt(depth).toFixed(1).replace('.', ',')} атм`;
}

export interface LayerWeights {
  surface: number;
  shallow: number;
  mid: number;
  deep: number;
}

export function layerWeights(depth: number): LayerWeights {
  return {
    surface: interpolate([[0, 1], [70, 0.8], [150, 0], [4000, 0]], depth),
    shallow: interpolate([[0, 1], [280, 0.95], [700, 0.3], [1100, 0], [4000, 0]], depth),
    mid: interpolate([[0, 0.15], [300, 0.5], [700, 1], [1500, 1], [2400, 0.4], [4000, 0.15]], depth),
    deep: interpolate([[0, 0], [900, 0], [1500, 0.4], [2400, 0.85], [3200, 1], [4000, 1]], depth),
  };
}

const MIN_LENGTH_M = 0.02;
const MAX_LENGTH_M = 18;

export function approximateLengthM(size: string): number | null {
  const normalized = size.replace(',', '.');
  const match = normalized.match(/\d+(?:\.\d+)?/);
  if (!match) return null;

  const unit = / мм(\s|,|$)/.test(normalized) ? 0.001 : / см(\s|,|$)/.test(normalized) ? 0.01 : 1;
  return Number(match[0]) * unit;
}

export function creatureWidth(size: string): string {
  const length = approximateLengthM(size);
  if (!length) return 'clamp(96px, 18vw, 260px)';

  const clamped = Math.min(MAX_LENGTH_M, Math.max(MIN_LENGTH_M, length));
  const t =
    (Math.log(clamped) - Math.log(MIN_LENGTH_M)) / (Math.log(MAX_LENGTH_M) - Math.log(MIN_LENGTH_M));

  const vw = (8 + t * 24).toFixed(1);
  const maxPx = Math.round(110 + t * 300);
  return `clamp(96px, ${vw}vw, ${maxPx}px)`;
}
