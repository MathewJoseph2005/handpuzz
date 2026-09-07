import { midpoint, type Point3D, type Rect } from './landmarks';

export type FrameSmoother = {
  value: Rect | null;
};

export function createFrameSmoother(): FrameSmoother {
  return { value: null };
}

export function computeDualHandFrame(centers: Point3D[], smoother: FrameSmoother): Rect | null {
  if (centers.length < 2) {
    smoother.value = null;
    return null;
  }

  const left = centers[0];
  const right = centers[1];
  const center = midpoint(left, right);
  const squareSize = Math.min(Math.max(Math.abs(right.x - left.x) * 1.35, 0.14), 0.82);
  const raw: Rect = {
    x: clamp(center.x - squareSize / 2),
    y: clamp(center.y - squareSize / 2),
    width: squareSize,
    height: squareSize,
  };

  if (!smoother.value) {
    smoother.value = raw;
    return raw;
  }

  const smoothing = 0.2;
  smoother.value = {
    x: lerp(smoother.value.x, raw.x, smoothing),
    y: lerp(smoother.value.y, raw.y, smoothing),
    width: lerp(smoother.value.width, raw.width, smoothing),
    height: lerp(smoother.value.height, raw.height, smoothing),
  };
  return smoother.value;
}

function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0.02), 0.98);
}
